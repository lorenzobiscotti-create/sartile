import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DAILY_LIMITS: Record<string, { messages: number; images: number }> = {
  student: { messages: 5, images: 0 },
  founder: { messages: 15, images: 0 },
  partner: { messages: 50, images: 5 },
  label: { messages: 150, images: 30 },
  absent: { messages: 0, images: 0 },
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, history, imageData, imageMimeType, brandId } = await request.json()

    let brandQuery = supabase
      .from('brands')
      .select('stage, description, audience_report, roadmap, marketing_plan, plan')
      .eq('user_id', user.id)
    if (brandId) brandQuery = brandQuery.eq('id', brandId)
    const { data: brand } = await brandQuery.single()

    const plan = (brand?.plan ?? 'student') as string
    const limits = DAILY_LIMITS[plan] ?? DAILY_LIMITS.student

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', today.toISOString())

    const used = todayCount ?? 0

    if (used >= limits.messages) {
      const upgradeMsg = plan === 'absent'
        ? "You don't have an active plan. Pick a plan to start chatting with sarti."
        : plan === 'student'
        ? `You've used all ${limits.messages} free messages today. Come back tomorrow, or upgrade to Founder for 15 a day.`
        : plan === 'founder'
        ? `You've used all ${limits.messages} messages today. Come back tomorrow, or upgrade to Partner for 50 a day.`
        : plan === 'partner'
        ? `You've used all ${limits.messages} messages today. Come back tomorrow, or upgrade to Label for 150 a day.`
        : `You've used all ${limits.messages} messages today. Come back tomorrow.`
      return NextResponse.json({ error: 'question_limit', message: upgradeMsg }, { status: 429 })
    }

    type TextBlock = { type: 'text'; text: string }
    type ImageBlock = { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
    type ContentBlock = TextBlock | ImageBlock

    const userContent: ContentBlock[] = []
    if (imageData && plan === 'partner') {
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: imageMimeType ?? 'image/jpeg', data: imageData },
      })
    }
    userContent.push({ type: 'text', text: message })

    const systemPrompt = `You are sarti — the founder's co-partner. You've built brands before. You know what works and what's a waste of time. You talk like a real person, not a chatbot.

Their brand:
- Stage: ${brand?.stage}
- Description: ${brand?.description}
${brand?.audience_report ? `- Audience: ${JSON.stringify(brand.audience_report)}` : ''}
${brand?.roadmap ? `- Roadmap: ${JSON.stringify(brand.roadmap)}` : ''}

How you talk:
- Casual, direct, like texting a friend who knows their stuff
- Short paragraphs. Get to the point.
- When they update you on progress, react like a real person — hype them up if they did something, call it out if something's off
- Always move them to the next concrete step. Drop real URLs when tools are involved.
- Never use bullet points in responses. Never say "certainly", "absolutely", "I'd be happy to", "great question", or anything like that.
- If they ask something outside the brand — just answer it normally, don't redirect everything back to the brand
- You know their brand inside out. Every answer is specific to them.`

    type HistoryMsg = { role: string; content: string }
    const messages = [
      ...(history ?? []).map((m: HistoryMsg) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userContent },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    await supabase.from('messages').insert([
      { user_id: user.id, brand_id: brandId ?? null, role: 'user', content: message },
      { user_id: user.id, brand_id: brandId ?? null, role: 'assistant', content: assistantMessage },
    ])

    const remaining = Math.max(0, limits.messages - used - 1)
    return NextResponse.json({ message: assistantMessage, remaining, limit: limits.messages })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
