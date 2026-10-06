/** พื้นหลังแบบ static — ไม่ใช้ canvas / animation เพื่อไม่แย่ง GPU กับแท็บอื่น (เช่น YouTube บน Chrome) */
export default function BackgroundAtmosphere() {
  return (
    <div className="bg-atmosphere" aria-hidden="true">
      <div className="bg-glow-wash" />
      <div className="bg-top-accent-line" />
      <div className="bg-cyber-grid" />
      <div className="bg-vignette-overlay" />
    </div>
  );
}
