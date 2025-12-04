'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) // true = โหมดสมัครสมาชิก
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // อีเมลแอดมิน (ต้องตรงกับที่ใช้ใน Navbar และ Admin Page)
  const ADMIN_EMAIL = 'admin@test.com'

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      if (isSignUp) {
        // --- โหมดสมัครสมาชิก ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: 'สมาชิก', // ตั้งชื่อเริ่มต้นให้ก่อน
              last_name: 'ใหม่',
            }
          }
        })
        if (error) throw error
        alert('สมัครสมาชิกเรียบร้อย! ระบบจะล็อกอินให้ทันที')
      } else {
        // --- โหมดเข้าสู่ระบบ ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }

      // --- 🔥 เช็คว่าใครล็อกอิน แล้วดีดไปให้ถูกที่ ---
      if (email === ADMIN_EMAIL) {
        router.push('/admin') // ถ้าเป็นแอดมิน ไปห้องบัญชาการ
      } else {
        router.push('/') // ถ้าคนทั่วไป ไปหน้าแรก
      }
      
      router.refresh() // รีเฟรชให้ Navbar รู้ตัวว่ามีคนเข้าแล้ว

    } catch (error: any) {
      console.error(error)
      setErrorMsg(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">🏨 SmartStay</h1>
          <p className="text-gray-500 font-medium">
            {isSignUp ? 'สมัครสมาชิกใหม่' : 'เข้าสู่ระบบเพื่อจัดการการจอง'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email {isSignUp && '(ใช้เมลปลอมได้เลย)'}
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? 'กำลังโหลด...' : (isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชีใช่ไหม?'}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMsg(null) // เคลียร์ error ตอนสลับโหมด
            }}
            className="ml-2 text-purple-600 font-bold hover:underline"
          >
            {isSignUp ? 'เข้าสู่ระบบเลย' : 'สมัครใหม่ฟรี'}
          </button>
        </div>

      </div>
    </div>
  )
}