'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MyBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      // 1. เช็ค User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 2. ดึงข้อมูลการจอง + ข้อมูลห้อง + ข้อมูลโรงแรม (Join 3 ต่อ)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (
            name,
            image_url,
            hotels (
              name,
              location
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) // เอาอันใหม่สุดขึ้นก่อน

      if (error) {
        console.error('Error fetching bookings:', error)
      } else {
        setBookings(data || [])
      }
      setLoading(false)
    }

    fetchBookings()
  }, [router])

  if (loading) return <div className="p-10 text-center text-gray-500">กำลังโหลดรายการจอง...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📂 การจองของฉัน</h1>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow"
              >
                {/* รูปห้อง/โรงแรม */}
                <div className="md:w-48 h-40 md:h-auto bg-gray-200 relative">
                   <img 
                    src={booking.rooms?.image_url || 'https://via.placeholder.com/200'} 
                    alt="Room Image"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>

                {/* รายละเอียด */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-purple-700">
                        {booking.rooms?.hotels?.name || 'ไม่พบชื่อโรงแรม'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status === 'paid' ? 'ชำระเงินแล้ว' : booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">
                      🛏️ {booking.rooms?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      📅 เข้าพัก: {new Date(booking.check_in_date).toLocaleDateString('th-TH')} - {new Date(booking.check_out_date).toLocaleDateString('th-TH')}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
                    <span className="text-sm text-gray-400">ราคารวมทั้งสิ้น</span>
                    <span className="text-2xl font-bold text-gray-800">
                      ฿{booking.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-5xl mb-4">🧳</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">คุณยังไม่มีการจอง</h3>
            <p className="text-gray-500 mb-6">ไปหาที่พักสวยๆ พักผ่อนกันเถอะ!</p>
            <Link 
              href="/" 
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              ค้นหาที่พัก
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}