import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { brandId, answers } = await request.json().catch(() => ({}))

    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json({ error: 'No brand' }, { status: 400 })

    const answerContext = answers?.length
      ? `Platform: ${answers[0]} | Production: ${answers[1]} | Audience: ${answers[2]} | Content: ${answers[3]} | Designs: ${answers[4]}`
      : 'Just getting started'

    const prompt = `You are sarti — a co-partner who's walked founders through building clothing brands before. You talk like a real person, not a bot.

BRAND: ${brand.description}
STAGE: ${brand.stage}
FOUNDER'S ANSWERS: ${answerContext}
ROADMAP PHASE 1: ${JSON.stringify(brand.roadmap?.[0])}

Give them their first move. Rules:
- Reference something specific from their brand or answers — show you were actually paying attention
- Give ONE action. Not a list. One thing to do right now.
- If it needs a tool, drop the real URL and tell them exactly what to do there in a sentence
- End casual — like "let me know when you're done and we'll get into the next thing" type energy
- Short. 3 paragraphs max.
- No bullets. No headers. No "certainly" or "I'd be happy to". Talk like a person.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''

    const userSummary = `My setup: ${answerContext}`
    await supabase.from('messages').insert([
      { user_id: user.id, brand_id: brandId, role: 'user', content: userSummary },
      { user_id: user.id, brand_id: brandId, role: 'assistant', content },
    ])

    return NextResponse.json({ message: content })
  } catch (error) {
    console.error('Chat start error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
