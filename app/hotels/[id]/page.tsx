import { supabase } from '@/utils/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// --- Types Definition ---
interface Hotel {
  id: number
  name: string
  description: string
  location: string
  address: string
  image_url: string
  starting_price: number
  rating: number
}

interface Room {
  id: number
  name: string
  price_per_night: number
  capacity: number
  image_url: string
  facilities: string[] | null
  is_available: boolean
}

// --- Data Fetching Functions ---
async function getHotel(id: string) {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) return null
  return data as Hotel
}

async function getRooms(hotelId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('is_available', true)
    .order('price_per_night', { ascending: true })

  if (error) return []
  return data as Room[]
}

// --- Main Page Component ---
export default async function HotelDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Await params ตามกฎ Next.js 15+
  const { id } = await params

  // 2. ดึงข้อมูลโรงแรมและห้องพักพร้อมกัน
  const hotelData = getHotel(id)
  const roomsData = getRooms(id)

  const [hotel, rooms] = await Promise.all([hotelData, roomsData])

  if (!hotel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* --- Header Image --- */}
      <div className="relative h-[50vh] w-full">
        <img 
          src={hotel.image_url || 'https://via.placeholder.com/1200x600?text=Hotel+Image'} 
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-10 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-md">{hotel.name}</h1>
            <p className="text-lg opacity-90 flex items-center gap-2 font-medium">
              📍 {hotel.location} | ⭐ {hotel.rating} คะแนน
            </p>
          </div>
        </div>
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-white transition-all flex items-center gap-2 font-medium"
        >
          ← ย้อนกลับ
        </Link>
      </div>

      <div className="container mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* --- Left Column: Details & Rooms --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hotel Description */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">เกี่ยวกับที่พัก</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {hotel.description || "ที่พักนี้ยังไม่มีคำอธิบายเพิ่มเติม"}
            </p>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-start gap-2 text-gray-500">
              <span className="text-xl">🗺️</span>
              <p>{hotel.address || "กรุงเทพมหานคร ประเทศไทย"}</p>
            </div>
          </section>

          {/* Room List */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🛏️ เลือกห้องพัก
            </h2>
            
            <div className="space-y-6">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row hover:shadow-lg transition-all duration-300">
                    {/* Room Image */}
                    <div className="md:w-2/5 h-56 md:h-auto bg-gray-200 relative">
                       <img 
                        src={room.image_url || 'https://via.placeholder.com/400x300?text=Room+Image'} 
                        alt={room.name}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    </div>
                    
                    {/* Room Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-100">
                            👥 {room.capacity} ท่าน
                          </span>
                          {room.facilities?.map((fac, index) => (
                            <span key={index} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">ราคาต่อคืน</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ฿{room.price_per_night.toLocaleString()}
                          </p>
                        </div>
                        
                        {/* 🔥 ปุ่มจอง: ลิงก์ไปหน้า Checkout พร้อมส่งค่าไปด้วย */}
                        <Link 
                          href={`/bookings/checkout?roomId=${room.id}&hotelId=${hotel.id}&price=${room.price_per_night}&roomName=${encodeURIComponent(room.name)}`}
                          className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-purple-200"
                        >
                          จองห้องนี้
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-4xl mb-2">🚫</p>
                  <p className="text-gray-500 font-medium">ขณะนี้ไม่มีห้องว่าง</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* --- Right Column: Sidebar --- */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h3 className="font-bold text-lg mb-4 text-gray-800">สิ่งอำนวยความสะดวก</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> ฟรี Wi-Fi</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> แผนกต้อนรับ 24 ชม.</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> ที่จอดรถ</li>
              </ul>
            </div>
            
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 text-center">
              <p className="text-purple-800 font-bold">🔥 ดีลพิเศษ!</p>
              <p className="text-sm text-gray-600 mt-1">จองเลยวันนี้ ยกเลิกฟรี</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}