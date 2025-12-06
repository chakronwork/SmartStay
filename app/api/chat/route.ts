import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // --- Logic: สร้างบริบทให้ AI รู้ว่าเป็นใคร ---
    // ตรงนี้สำคัญมาก คือการ "Training" เบื้องต้นให้บอทฉลาด
    const prompt = `
      บทบาท: คุณคือ "SmartBot" ผู้ช่วยอัจฉริยะประจำเว็บไซต์ SmartStay (ระบบจองโรงแรม)
      
      ข้อมูลพื้นฐานของ SmartStay:
      - เป็นเว็บจองที่พักสำหรับนักศึกษาและบุคคลทั่วไป
      - เมนูที่มี: หน้าแรก, ค้นหาโรงแรม, เช็คอิน/เช็คเอาท์, ดูประวัติการจอง
      - เบอร์ติดต่อ: 02-123-4567, อีเมล: contact@smartstay.com
      - สถานที่ตั้ง: อาคารเทคโนโลยีสารสนเทศ
      
      คำสั่ง:
      - ตอบคำถามลูกค้าด้วยภาษาไทยที่สุภาพ เป็นกันเอง และกระชับ (สไตล์คนรุ่นใหม่)
      - ถ้าลูกค้าถามเรื่องนอกเหนือจากการจองที่พักหรือข้อมูลโรงแรม ให้ตอบเลี่ยงๆ อย่างสุภาพว่าตอบไม่ได้
      - ห้ามแต่งเรื่องเอง ถ้าไม่รู้ให้บอกว่าให้ติดต่อเจ้าหน้าที่
      
      คำถามจากลูกค้า: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "คุยกับ AI ไม่รู้เรื่องชั่วคราว" }, { status: 500 });
  }
}