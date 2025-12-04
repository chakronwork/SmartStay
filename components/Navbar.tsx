'use client'

import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // เมลแอดมินตัวจริง (แก้ตรงนี้ได้ถ้าอยากเปลี่ยนเมล)
  const ADMIN_EMAIL = 'admin@test.com'

  useEffect(() => {
    setMounted(true)
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  if (!mounted) return <nav className="bg-white border-b border-gray-200 h-16 shadow-sm"></nav>

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/" className="text-2xl font-bold text-purple-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
          🏨 SmartStay
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4 animate-fade-in">
              
              {/* 🔥 เช็คด่านตรวจ: ถ้าเป็น Admin ให้โชว์ปุ่มนี้ */}
              {user.email === ADMIN_EMAIL ? (
                <Link 
                  href="/admin"
                  className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-all shadow-md flex items-center gap-1"
                >
                  👑 แดชบอร์ด
                </Link>
              ) : (
                // ถ้าเป็น User ธรรมดา ให้โชว์ปุ่มการจองของฉัน
                <Link 
                  href="/bookings/my-bookings"
                  className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors hidden md:block px-3 py-2 rounded-lg hover:bg-purple-50"
                >
                  📂 การจองของฉัน
                </Link>
              )}

              <div className="h-5 w-[1px] bg-gray-200 hidden md:block"></div>

              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-gray-800">
                  {user.user_metadata?.first_name || 'สมาชิก'} 
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {user.email}
                </span>
              </div>
              
              <button 
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUser(null)
                  router.push('/')
                  router.refresh()
                }}
                className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 p-2 rounded-full transition-all border border-gray-200"
                title="ออกจากระบบ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-purple-200 active:scale-95"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}