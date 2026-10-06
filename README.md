# RUNTOWN Pig Farm Calculator

เว็บคำนวณสายการผลิตฟาร์มหมูสำหรับ **RUNTOWN FiveM Roleplay** — สร้างด้วย **Next.js** + **TypeScript**

## โครงสร้าง

```
├── app/                      # App Router (layout, page, globals.css)
├── components/pig-farm/      # UI คำนวณฟาร์มหมู
├── lib/                      # config, calculator, format
├── public/images/
│   ├── banners/              # แบนเนอร์หน้าเว็บ
│   ├── branding/             # โลโก้ / mascot
│   └── products/             # รูปไอเทมใน UI
└── scripts/start-dev.bat     # เปิด dev server (Windows)
```

## คำสั่ง

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```

## Deploy บน Vercel

1. Push โปรเจกต์ขึ้น Git
2. Import ที่ [vercel.com/new](https://vercel.com/new) — Vercel จะ detect **Next.js** อัตโนมัติ
3. ไม่ต้องตั้ง build command พิเศษ (`next build` ใช้ค่า default)
