import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              🏨 SmartStay
            </h3>
            <p className="text-sm text-gray-400">
              แพลตฟอร์มจองที่พักที่ดีที่สุดสำหรับนักศึกษาและบุคคลทั่วไป ใช้งานง่าย สะดวก รวดเร็ว
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">เมนูลัด</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-purple-400 transition-colors">หน้าแรก</Link></li>
              <li><Link href="/login" className="hover:text-purple-400 transition-colors">เข้าสู่ระบบ</Link></li>
              <li><Link href="/bookings/my-bookings" className="hover:text-purple-400 transition-colors">ตรวจสอบสถานะการจอง</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact (Mockup) */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 02-123-4567</li>
              <li>📧 contact@smartstay.com</li>
              <li>📍 อาคารเทคโนโลยีสารสนเทศ, กรุงเทพฯ</li>
            </ul>
          </div>

          {/* Column 4: Newsletter (Mockup) */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">ติดตามข่าวสาร</h4>
            <div className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="กรอกอีเมลของคุณ" 
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                ติดตาม
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © 2024 SmartStay Project. สงวนลิขสิทธิ์ (โปรเจกต์เพื่อการศึกษา)
        </div>
      </div>
    </footer>
  )
}