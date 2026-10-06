# RUNTOWN Pig Farm Calculator

เว็บคำนวณสายการผลิตฟาร์มหมูสำหรับ **RUNTOWN FiveM Roleplay** — **Next.js** + **TypeScript**

## ติดตั้งและรัน

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

บน Windows สามารถรัน dev server ด้วย `scripts/start-dev.bat`

## โครงสร้างโปรเจกต์

```
app/                          layout, หน้าแรก, สไตล์ global
components/pig-farm/          UI หลัก (PigFarmCalculator.tsx)
lib/
  calculator.ts               สูตรคำนวณสายการผลิต
  config.ts                   ค่าคงที่จากเซิร์ฟ (ราคา, เวลา, น้ำหนัก)
  format.ts                   จัดรูปแบบตัวเลข
public/images/
  banners/                    แบนเนอร์ hero
  branding/                   mascot
  products/                   รูปไอเทมใน UI
scripts/start-dev.bat
```

## แก้ข้อความ / ค่าในเกม

| ต้องการแก้ | ไฟล์ |
|-----------|------|
| ชื่อแท็บเบราว์เซอร์ | `app/layout.tsx` |
| ข้อความแบนเนอร์, เมนูบน | `components/pig-farm/PigFarmCalculator.tsx` |
| ราคา Pack, เวลาโพเซส, อัตราแลกเปลี่ยนข้าว–หมู | `lib/config.ts` |
| สไตล์ สี ฟอนต์ | `app/globals.css` |
