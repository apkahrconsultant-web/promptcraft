// src/app/api/generate/route.js
// Server-side API route — keeps your Anthropic API key secure

export async function POST(request) {
  try {
    const body = await request.json()
    const { idea, goal, tone, format, length } = body

    if (!idea || !idea.trim()) {
      return Response.json({ error: 'Idea is required' }, { status: 400 })
    }

    const SYSTEM_PROMPT = `You are a world-class Prompt Engineer.
Transform the user's raw idea into a highly optimized, structured, and detailed AI prompt.
Ensure the prompt:
- Defines role clearly
- Specifies output format
- Sets constraints
- Includes tone and style
- Adds examples if useful
- Is optimized for large language models
Return exactly three versions labeled Basic, Advanced, and Expert.`

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // Fallback to local generation if no API key configured
      return Response.json({ fallback: true })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Transform this idea into 3 optimized prompts:
Idea: ${idea}
Goal: ${goal || 'Write'}
Tone: ${tone || 'Professional'}
Format: ${format || 'Article'}
Length: ${length || 'Medium'}

Return your response in this exact format:
BASIC:
[basic prompt here]

ADVANCED:
[advanced prompt here]

EXPERT:
[expert prompt here]`,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return Response.json({ fallback: true })
    }

    const text = data.content?.[0]?.text || ''
    const basicMatch = text.match(/BASIC:\n([\s\S]*?)(?=\nADVANCED:|$)/)
    const advancedMatch = text.match(/ADVANCED:\n([\s\S]*?)(?=\nEXPERT:|$)/)
    const expertMatch = text.match(/EXPERT:\n([\s\S]*?)$/)

    return Response.json({
      basic: basicMatch?.[1]?.trim() || text,
      advanced: advancedMatch?.[1]?.trim() || text,
      expert: expertMatch?.[1]?.trim() || text,
    })
  } catch (error) {
    console.error('Generate route error:', error)
    return Response.json({ fallback: true })
  }
}
