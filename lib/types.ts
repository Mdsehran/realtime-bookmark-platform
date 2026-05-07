export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  favicon_url: string | null
  created_at: string
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error'
}
