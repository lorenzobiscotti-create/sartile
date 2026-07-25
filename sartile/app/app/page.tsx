import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'

export default async function AppPage(props: {
  searchParams: Promise<{ brand?: string; view?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!brands || brands.length === 0) redirect('/onboarding')

  const activeBrand = (searchParams.brand
    ? brands.find(b => b.id === searchParams.brand)
    : null) ?? brands[0]

  const { data: messages } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('user_id', user.id)
    .eq('brand_id', activeBrand.id)
    .order('created_at', { ascending: true })
    .limit(50)

  return (
    <AppShell
      key={activeBrand.id}
      user={{ id: user.id, email: user.email ?? '', name: user.user_metadata?.full_name ?? '' }}
      brand={activeBrand}
      brands={brands}
      initialMessages={messages ?? []}
      view={searchParams.view ?? 'chat'}
    />
  )
}
