import { supabase } from '@/utils/supabase'
import { Hotel } from '@/types/database' // import type ที่สร้างตะกี้
import Link from 'next/link'

// ฟังก์ชันดึงข้อมูล (รันบน Server)
async function getHotels() {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .order('id', { ascending: true }) // เรียงตาม ID

  if (error) {
    console.error('Error fetching hotels:', error)
    return []
  }
  return data as Hotel[]
}

export default async function Home() {
  // เรียกใช้ฟังก์ชันดึงข้อมูล
  const hotels = await getHotels()

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Hero Section (จำลองจากรูป UI) */}
      <div className="relative h-[400px] w-full bg-blue-900 flex items-center justify-center text-white">
        <h1 className="text-4xl font-bold">SmartStay - จองที่พักง่ายๆ แค่ปลายนิ้ว</h1>
      </div>

      {/* Hotel Listing Section */}
      <div className="container mx-auto px-4 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">โรงแรมแนะนำยอดฮิต</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Link href={`/hotels/${hotel.id}`} key={hotel.id} className="group">
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                {/* รูปภาพ */}
                <div className="relative h-48 w-full bg-gray-200">
                  {/* (ของจริงควรใช้ next/image แต่แบบนี้ง่ายกว่าสำหรับเริ่ม) */}
                  <img 
                    src={hotel.image_url || 'https://via.placeholder.com/400x300'} 
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-bold shadow-sm">
                    ⭐ {hotel.rating}
                  </div>
                </div>

                {/* รายละเอียด */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{hotel.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{hotel.location}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {hotel.description || 'คำอธิบายโรงแรม...'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-purple-600 font-bold text-lg">
                      ฿{(hotel.starting_price || 0).toLocaleString()} 
                      <span className="text-xs text-gray-400 font-normal"> / คืน</span>
                    </span>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-purple-700 transition-colors">
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* กรณีไม่มีข้อมูล */}
        {hotels.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            ยังไม่มีข้อมูลโรงแรมในระบบ (ลองเพิ่มข้อมูลใน Supabase ดูสิเพื่อน)
          </div>
        )}
      </div>
    </main>
  )
}