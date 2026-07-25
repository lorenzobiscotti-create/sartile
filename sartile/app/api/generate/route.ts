import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DAILY_GEN_LIMIT = 5

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, brandId } = await request.json()
    if (!prompt?.trim()) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    // Only Label tier can generate
    const { data: brand } = await supabase.from('brands').select('plan').eq('id', brandId).eq('user_id', user.id).single()
    if (brand?.plan !== 'label') {
      return NextResponse.json({ error: 'Image generation is a Label tier feature.' }, { status: 403 })
    }

    // Check daily generation count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'assistant')
      .like('content', '[GENERATED]%')
      .gte('created_at', today.toISOString())

    if ((count ?? 0) >= DAILY_GEN_LIMIT) {
      return NextResponse.json({ error: `You've used all ${DAILY_GEN_LIMIT} image generations today. Come back tomorrow.` }, { status: 429 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Image generation not configured.' }, { status: 500 })

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Clothing brand design concept: ${prompt}. Clean product visualization, professional photography style, white or minimal background.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('DALL-E error:', err)
      return NextResponse.json({ error: 'Image generation failed. Try again.' }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl = data.data?.[0]?.url
    if (!imageUrl) return NextResponse.json({ error: 'No image returned.' }, { status: 500 })

    // Track the generation (stored with [GENERATED] prefix so we can count daily usage)
    await supabase.from('messages').insert([
      { user_id: user.id, brand_id: brandId, role: 'user', content: `Generate: ${prompt}` },
      { user_id: user.id, brand_id: brandId, role: 'assistant', content: `[GENERATED] ${imageUrl}` },
    ])

    const remaining = Math.max(0, DAILY_GEN_LIMIT - (count ?? 0) - 1)
    return NextResponse.json({ imageUrl, remaining, limit: DAILY_GEN_LIMIT })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
