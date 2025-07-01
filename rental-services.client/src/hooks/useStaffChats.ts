import { useEffect, useState } from 'react'
import type { ChatDTO } from '../lib/types'

const API = import.meta.env.VITE_API_BASE_URL;
/*const API = "http://localhost:5000";*/

export function useStaffChats(token: string) {
  const [chats, setChats] = useState<ChatDTO[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setChats)
      .finally(() => setLoading(false))
  }, [token])
  return { chats, loading }
}
