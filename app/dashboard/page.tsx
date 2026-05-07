import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookmarkManager from '@/components/BookmarkManager'
import type { Bookmark } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <BookmarkManager
      user={{
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.full_name ?? user.email ?? 'User',
        avatar: user.user_metadata?.avatar_url ?? null,
      }}
      initialBookmarks={(bookmarks ?? []) as Bookmark[]}
    />
  )
}
