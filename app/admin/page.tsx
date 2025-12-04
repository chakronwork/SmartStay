'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      // 1. เช็คว่าเป็น Admin ตัวจริงไหม?
      const { data: { user } } = await supabase.auth.getUser()
      
      // ถ้าไม่ใช่ admin (แก้เมลตรงนี้ได้ตามใจชอบ)
      if (!user || user.email !== 'admin@test.com') {
        alert('หน้านี้สำหรับผู้ดูแลระบบเท่านั้นจ้า! 🚫')
        router.push('/')
        return
      }

      // 2. ดึงข้อมูลการจองทั้งหมด (ของทุกคนในโลก)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles (first_name, email),
          rooms (
            name,
            hotels (name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setBookings(data || [])
      
      setLoading(false)
    }

    checkAdminAndFetch()
  }, [router])

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูลลับสุดยอด...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">😎 Admin Dashboard</h1>
          <Link 
              href="/admin/rooms" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
            + จัดการห้องพัก
          </Link>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            รายการจองทั้งหมด: <span className="font-bold text-purple-600">{bookings.length}</span> รายการ
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">ID</th>
                <th className="p-4 font-semibold text-gray-600">ลูกค้า</th>
                <th className="p-4 font-semibold text-gray-600">โรงแรม / ห้อง</th>
                <th className="p-4 font-semibold text-gray-600">วันที่เข้าพัก</th>
                <th className="p-4 font-semibold text-gray-600">ยอดเงิน</th>
                <th className="p-4 font-semibold text-gray-600">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">#{item.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{item.profiles?.first_name || 'ไม่ระบุชื่อ'}</div>
                    <div className="text-xs text-gray-500">{item.profiles?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{item.rooms?.hotels?.name}</div>
                    <div className="text-sm text-gray-500">{item.rooms?.name}</div>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(item.check_in_date).toLocaleDateString('th-TH')} <br/>
                    ถึง {new Date(item.check_out_date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="p-4 font-bold text-purple-600">
                    ฿{item.total_price.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {bookings.length === 0 && (
            <div className="p-10 text-center text-gray-400">ยังไม่มีใครหลงมาจองเลยเพื่อน...</div>
          )}
        </div>
      </div>
    </div>
  )
}