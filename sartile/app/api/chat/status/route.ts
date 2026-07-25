import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DAILY_LIMITS: Record<string, { messages: number; images: number }> = {
  student: { messages: 5, images: 0 },
  founder: { messages: 15, images: 0 },
  partner: { messages: 50, images: 5 },
  label: { messages: 150, images: 30 },
  absent: { messages: 0, images: 0 },
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    let brandQuery = supabase.from('brands').select('plan').eq('user_id', user.id)
    if (brandId) brandQuery = brandQuery.eq('id', brandId)
    const { data: brand } = await brandQuery.single()
    const plan = (brand?.plan ?? 'student') as string
    const limits = DAILY_LIMITS[plan] ?? DAILY_LIMITS.student

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', today.toISOString())

    const used = msgCount ?? 0

    return NextResponse.json({
      plan,
      used,
      limit: limits.messages,
      remaining: Math.max(0, limits.messages - used),
      imageLimit: limits.images,
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
