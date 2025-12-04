'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/utils/supabase'

// ต้องแยก Component เนื้อหาออกมาเพื่อใส่ Suspense (กฎของ Next.js เวลาใช้ useSearchParams)
function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. รับค่าที่ส่งมาจากหน้าโรงแรม
  const hotelId = searchParams.get('hotelId')
  const roomId = searchParams.get('roomId')
  const pricePerNight = Number(searchParams.get('price'))
  const roomName = searchParams.get('roomName')

  // 2. State สำหรับฟอร์ม
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [totalPrice, setTotalPrice] = useState(pricePerNight)
  const [loading, setLoading] = useState(false)

  // 3. คำนวณราคาเมื่อวันที่เปลี่ยน
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 0) {
        setTotalPrice(diffDays * pricePerNight)
      } else {
        setTotalPrice(pricePerNight) // กัน error กรณีเลือกวันเดียวกัน
      }
    }
  }, [checkIn, checkOut, pricePerNight])

  // 4. ฟังก์ชันกดยืนยันการจอง
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // เช็คว่าล็อกอินยัง?
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนจองครับเพื่อน!')
      router.push('/login')
      return
    }

    // บันทึกลง Database
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      room_id: Number(roomId),
      check_in_date: checkIn,
      check_out_date: checkOut,
      total_price: totalPrice,
      status: 'paid' // สมมติว่าจ่ายตังแล้ว (Mock)
    })

    if (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการจอง')
      setLoading(false)
    } else {
      alert('🎉 จองสำเร็จ! ขอบคุณที่ใช้บริการ')
      router.push('/bookings/my-bookings')
    }
  }

  // กรณีเข้ามาแบบไม่มีข้อมูล (กัน Error)
  if (!hotelId || !roomId) {
    return <div className="p-10 text-center">ไม่พบข้อมูลการจอง กรุณาเลือกห้องพักใหม่</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-purple-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">ยืนยันการจองห้องพัก</h1>
          <p className="opacity-90">อีกนิดเดียวก็ได้ที่พักแล้ว!</p>
        </div>

        <div className="p-8">
          {/* ข้อมูลห้องพัก */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <h3 className="font-bold text-gray-700 text-lg">{roomName}</h3>
            <p className="text-gray-500">ราคาต่อคืน: <span className="text-purple-600 font-bold">฿{pricePerNight.toLocaleString()}</span></p>
          </div>

          {/* ฟอร์มเลือกวันที่ */}
          <form onSubmit={handleBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เช็คอิน (Check-in)</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เช็คเอาท์ (Check-out)</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {/* สรุปราคา */}
            <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mt-4">
              <span className="text-gray-600 font-medium">ราคารวมทั้งหมด:</span>
              <span className="text-3xl font-bold text-purple-600">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>

            {/* ปุ่มยืนยัน */}
            <button 
              type="submit" 
              disabled={loading || !checkIn || !checkOut}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังดำเนินการ...' : '💳 ยืนยันและชำระเงิน (จำลอง)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Main Page Component (ต้องครอบด้วย Suspense)
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">กำลังโหลดข้อมูลการจอง...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}