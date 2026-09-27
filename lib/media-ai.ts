// Server-only helpers: image generation (Abacus RouteLLM), text-to-speech (OpenAI), FFmpeg API.

const ABACUS = 'https://apps.abacus.ai'

export async function generateImage(prompt: string): Promise<Buffer> {
  const res = await fetch(`${ABACUS}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gemini-3.1-flash-image',
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image'],
      image_config: { aspect_ratio: '16:9', num_images: 1 },
    }),
  })
  if (!res.ok) throw new Error(`Image generation failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const url: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url
  if (!url?.startsWith('data:')) throw new Error('Image generation returned no image')
  return Buffer.from(url.split(',')[1] ?? '', 'base64')
}

// ---------- Text to speech (OpenAI) ----------

export function isTtsConfigured() {
  return Boolean(process.env.OPENAI_API_KEY)
}

interface Wav { header: Buffer; pcm: Buffer; byteRate: number }

function parseWav(buf: Buffer): Wav {
  if (buf.toString('ascii', 0, 4) !== 'RIFF') throw new Error('TTS did not return WAV audio')
  let offset = 12
  let fmt: Buffer | null = null
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4)
    let size = buf.readUInt32LE(offset + 4)
    const start = offset + 8
    if (id === 'fmt ') fmt = buf.subarray(start, start + size)
    if (id === 'data') {
      // Streaming encoders may write 0/0xFFFFFFFF as size; fall back to the rest of the file.
      if (size === 0 || start + size > buf.length) size = buf.length - start
      if (!fmt) throw new Error('WAV missing fmt chunk')
      return { header: fmt, pcm: buf.subarray(start, start + size), byteRate: fmt.readUInt32LE(8) }
    }
    offset = start + size + (size % 2)
  }
  throw new Error('WAV missing data chunk')
}

function buildWav(fmt: Buffer, pcm: Buffer): Buffer {
  const head = Buffer.alloc(12 + 8 + fmt.length + 8)
  head.write('RIFF', 0, 'ascii')
  head.writeUInt32LE(head.length - 8 + pcm.length, 4)
  head.write('WAVE', 8, 'ascii')
  head.write('fmt ', 12, 'ascii')
  head.writeUInt32LE(fmt.length, 16)
  fmt.copy(head, 20)
  const d = 20 + fmt.length
  head.write('data', d, 'ascii')
  head.writeUInt32LE(pcm.length, d + 4)
  return Buffer.concat([head, pcm])
}

function splitText(text: string, max = 3800): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*|[^.!?]+$/g) ?? [text]
  const parts: string[] = []
  let cur = ''
  for (const s of sentences) {
    if ((cur + s).length > max && cur) { parts.push(cur.trim()); cur = '' }
    cur += s
  }
  if (cur.trim()) parts.push(cur.trim())
  return parts
}

/** Returns WAV audio and its exact duration in seconds. */
export async function synthesizeSpeech(text: string): Promise<{ audio: Buffer; duration: number }> {
  if (!isTtsConfigured()) throw new Error('Voiceover is not configured: add OPENAI_API_KEY')
  const chunks: Wav[] = []
  for (const part of splitText(text)) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: process.env.TTS_VOICE || 'onyx',
        input: part,
        instructions: 'Confident, upbeat tech YouTuber. Clear articulation, natural pacing, friendly energy.',
        response_format: 'wav',
      }),
    })
    if (!res.ok) throw new Error(`Voiceover failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
    chunks.push(parseWav(Buffer.from(await res.arrayBuffer())))
  }
  const pcm = Buffer.concat(chunks.map((c) => c.pcm))
  return { audio: buildWav(chunks[0].header, pcm), duration: pcm.length / chunks[0].byteRate }
}

// ---------- FFmpeg API ----------

export async function createFfmpegJob(input_files: Record<string, string>, output_files: Record<string, string>, ffmpeg_command: string): Promise<string> {
  const res = await fetch(`${ABACUS}/api/createRunFfmpegCommandRequest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
    body: JSON.stringify({ input_files, output_files, ffmpeg_command, max_command_run_seconds: 1500, vcpu_count: 16 }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.request_id) throw new Error(`Render request failed: ${data?.error ?? res.status}`)
  return data.request_id as string
}

export async function getFfmpegJob(request_id: string): Promise<{ status: 'PROCESSING' | 'SUCCESS' | 'FAILED'; outputs?: Record<string, string>; error?: string }> {
  const res = await fetch(`${ABACUS}/api/getRunFfmpegCommandStatus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
    body: JSON.stringify({ request_id }),
  })
  const data = await res.json().catch(() => ({}))
  const status = data?.status ?? 'FAILED'
  if (status === 'SUCCESS') return { status, outputs: data?.result?.result ?? {} }
  if (status === 'FAILED') return { status, error: data?.result?.error ?? 'Render failed' }
  return { status: 'PROCESSING' }
}
