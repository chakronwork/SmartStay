'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([]) // เอาไว้ใส่ Dropdown เลือกโรงแรม
  const [loading, setLoading] = useState(true)

  // State สำหรับฟอร์มเพิ่มห้อง
  const [formData, setFormData] = useState({
    hotel_id: '',
    name: '',
    price: '',
    capacity: '2',
    image_url: '',
    facilities: '' // รับเป็นข้อความ คั่นด้วยคอมม่า
  })

  // 1. ดึงข้อมูลห้องและโรงแรมทั้งหมด
  const fetchData = async () => {
    setLoading(true)
    
    // ดึงห้องพัก
    const { data: roomsData } = await supabase
      .from('rooms')
      .select('*, hotels(name)')
      .order('id', { ascending: false })
    
    // ดึงรายชื่อโรงแรม (เอามาใส่ตัวเลือก Dropdown)
    const { data: hotelsData } = await supabase
      .from('hotels')
      .select('id, name')

    if (roomsData) setRooms(roomsData)
    if (hotelsData) setHotels(hotelsData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. ฟังก์ชันเพิ่มห้อง (Create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.hotel_id) return alert('กรุณาเลือกโรงแรมก่อนครับ')

    // แปลงสิ่งอำนวยความสะดวกจาก String "Wifi, Pool" -> Array ["Wifi", "Pool"]
    const facilitiesArray = formData.facilities.split(',').map(item => item.trim()).filter(item => item !== '')

    const { error } = await supabase.from('rooms').insert({
      hotel_id: Number(formData.hotel_id),
      name: formData.name,
      price_per_night: Number(formData.price),
      capacity: Number(formData.capacity),
      image_url: formData.image_url,
      facilities: facilitiesArray,
      is_available: true
    })

    if (error) {
      alert('เพิ่มห้องไม่สำเร็จ: ' + error.message)
    } else {
      alert('✅ เพิ่มห้องพักเรียบร้อย!')
      // รีเซ็ตฟอร์ม
      setFormData({ ...formData, name: '', price: '', image_url: '', facilities: '' })
      fetchData() // ดึงข้อมูลใหม่
    }
  }

  // 3. ฟังก์ชันลบห้อง (Delete)
  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันที่จะลบห้องนี้? (เอาคืนไม่ได้นะ)')) return

    const { error } = await supabase.from('rooms').delete().eq('id', id)
    
    if (error) alert('ลบไม่ได้: ' + error.message)
    else fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛠️ จัดการห้องพัก</h1>
          <div className="space-x-4">
            <Link href="/admin" className="text-gray-600 hover:text-purple-600 font-medium">
              ← กลับหน้า Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- ฝั่งซ้าย: ฟอร์มเพิ่มห้อง --- */}
          <div className="bg-white p-6 rounded-xl shadow-md h-fit">
            <h2 className="text-xl font-bold mb-4 text-purple-700">เพิ่มห้องใหม่</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* เลือกโรงแรม */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">โรงแรม</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={formData.hotel_id}
                  onChange={e => setFormData({...formData, hotel_id: e.target.value})}
                  required
                >
                  <option value="">-- เลือกโรงแรม --</option>
                  {hotels.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* ชื่อห้อง */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อห้องพัก</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="เช่น Deluxe Sea View"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* ราคา & จำนวนคน */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคา/คืน</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="2500"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">พักได้ (คน)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
              </div>

              {/* รูปภาพ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL รูปภาพ</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                />
              </div>

              {/* สิ่งอำนวยความสะดวก */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สิ่งอำนวยความสะดวก (คั่นด้วย ,)</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Wifi, แอร์, อาหารเช้า, อ่างอาบน้ำ"
                  value={formData.facilities}
                  onChange={e => setFormData({...formData, facilities: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                + เพิ่มห้องพัก
              </button>
            </form>
          </div>

          {/* --- ฝั่งขวา: ตารางรายการห้อง --- */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
              รายชื่อห้องทั้งหมด ({rooms.length})
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-sm font-medium text-gray-500">ID</th>
                    <th className="p-4 text-sm font-medium text-gray-500">ห้อง / โรงแรม</th>
                    <th className="p-4 text-sm font-medium text-gray-500">ราคา</th>
                    <th className="p-4 text-sm font-medium text-gray-500 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-400">#{room.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{room.name}</div>
                        <div className="text-xs text-gray-500">{room.hotels?.name}</div>
                        {/* โชว์ facilities เล็กๆ */}
                        <div className="flex gap-1 mt-1">
                          {room.facilities?.map((f: string, i: number) => (
                            <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded">{f}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-green-600">฿{room.price_per_night.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(room.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rooms.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-400">ยังไม่มีข้อมูลห้องพัก</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}