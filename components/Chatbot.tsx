'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'bot'
  text: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'สวัสดีครับ! 🤖 มีอะไรให้ SmartBot ช่วยเรื่องที่พักไหมครับ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // เลื่อนลงล่างสุดเสมอเมื่อมีข้อความใหม่
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    // 1. เพิ่มข้อความ User
    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      // 2. ยิงไปหา API ที่เราสร้าง
      const res = await fetch('/app/api/chat' /* แก้ path ให้ถูกตาม production */ , { 
        // หมายเหตุ: ใน Next.js App Router เรียก /api/chat ได้เลย (ไม่ต้องมี /app)
        // เดี๋ยวพี่แก้ URL ในโค้ดจริงข้างล่างให้ครับ
      })
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })

      const data = await response.json()
      
      // 3. เพิ่มข้อความ Bot
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
      } else {
        throw new Error('No reply')
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'ขออภัยครับ ระบบขัดข้องนิดหน่อย ลองใหม่นะ 😅' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* --- ตัวหน้าต่างแชท (แสดงเมื่อ isOpen = true) --- */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-fade-in-up">
          {/* Header */}
          <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-sm">SmartBot AI</h3>
                <p className="text-[10px] text-purple-200">พร้อมช่วยเหลือ 24 ชม.</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-purple-700 p-1 rounded">
              ✖
            </button>
          </div>

          {/* Chat Area */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 rounded-xl rounded-bl-none px-4 py-2 text-xs animate-pulse">
                  กำลังพิมพ์...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="สอบถามข้อมูล..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            >
              🚀
            </button>
          </form>
        </div>
      )}

      {/* --- ปุ่มลอย (Floating Button) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-300 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg shadow-purple-300 flex items-center justify-center`}
      >
        <span className="text-3xl">💬</span>
      </button>

    </div>
  )
}