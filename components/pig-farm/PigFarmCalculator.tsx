'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  calculateFromPorkCount,
  porkFromMinutes,
  porkFromMoney,
  porkFromPacks,
  porkFromPens,
  porkFromRice,
  referenceRow,
  type CalcResult,
} from '@/lib/calculator';
import { REFERENCE_RICE_PRESETS, RUNTOWN_CONFIG as config, type InputSource } from '@/lib/config';
import { fmt, fmtPrecise, inputDisplayValue, numForInput } from '@/lib/format';

type InputKey = 'rice' | 'pen' | 'pork' | 'pack' | 'money' | 'minutes';

type InputState = Record<InputKey, string>;

const EMPTY_INPUTS: InputState = {
  rice: '',
  pen: '',
  pork: '',
  pack: '',
  money: '',
  minutes: '',
};

function mergeInputsFromCalc(calc: CalcResult, source: InputSource, current: InputState): InputState {
  return {
    rice: source === 'rice' ? current.rice : inputDisplayValue(numForInput(calc.rice)),
    pen: source === 'pen' ? current.pen : inputDisplayValue(numForInput(calc.pens)),
    pork: source === 'pork' ? current.pork : inputDisplayValue(numForInput(calc.pork)),
    pack: source === 'pack' ? current.pack : inputDisplayValue(numForInput(calc.packs)),
    money: source === 'money' ? current.money : inputDisplayValue(numForInput(Math.round(calc.grossAvg))),
    minutes:
      source === 'minutes'
        ? current.minutes
        : inputDisplayValue(numForInput(Number(calc.totalMin.toFixed(1)))),
  };
}

export default function PigFarmCalculator() {
  const [inputs, setInputs] = useState<InputState>(EMPTY_INPUTS);
  const [calc, setCalc] = useState<CalcResult>(() => calculateFromPorkCount(0));
  const [activeSource, setActiveSource] = useState<InputSource>('init');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const referenceRows = useMemo(() => REFERENCE_RICE_PRESETS.map((r) => referenceRow(r)), []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  useEffect(() => {
    if (!toastVisible) return;
    const t = window.setTimeout(() => setToastVisible(false), 2500);
    return () => window.clearTimeout(t);
  }, [toastVisible]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  }, [theme]);

  const handleInput =
    (key: InputKey, porkResolver: (n: number) => number) => (value: string) => {
      setActiveSource(key);
      const nextInputs = { ...inputs, [key]: value };
      const n = parseFloat(value) || 0;
      const pork = porkResolver(n);
      const nextCalc = calculateFromPorkCount(pork);
      setCalc(nextCalc);
      setInputs(mergeInputsFromCalc(nextCalc, key, nextInputs));
    };

  const stepValue = (key: InputKey, delta: number, porkResolver: (n: number) => number) => {
    let cur = parseFloat(inputs[key]) || 0;
    let next = Math.max(0, cur + delta);
    if (key === 'minutes') {
      next = Math.round(next);
    } else if (!Number.isInteger(next)) {
      next = Math.round(next * 10) / 10;
    }
    const value = next === 0 ? '' : String(next);
    handleInput(key, porkResolver)(value);
  };

  const applyPreset = (type: 'rice' | 'pork' | 'pack' | 'money', val: number) => {
    const keyMap = { rice: 'rice', pork: 'pork', pack: 'pack', money: 'money' } as const;
    const resolverMap = {
      rice: porkFromRice,
      pork: (n: number) => n,
      pack: porkFromPacks,
      money: porkFromMoney,
    } as const;
    const key = keyMap[type];
    handleInput(key, resolverMap[type])(String(val));
    showToast(`โหลดค่าตัวอย่าง ${type.toUpperCase()}: ${fmt(val)} เรียบร้อย`);
  };

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const fullHours = Math.floor(calc.totalMin / 60);
  const remainingMinutes = Math.round(calc.totalMin % 60);

  const inputClass = (key: InputKey) =>
    `input-box${activeSource === key ? ' active-source' : ''}`;

  return (
    <>
      <div className="container">
        <div className="top-nav">
          <div className="nav-left">
            <Image src="/images/branding/runtown_mascot.png" alt="RUNTOWN" className="nav-logo-img" width={44} height={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="brand-title">RUNTOWN</span>
                <span className="server-tag">RUNTOWN Roleplay</span>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ระบบคำนวณฟาร์มหมู
              </span>
            </div>
          </div>
          <div className="nav-actions">
            <button type="button" className="btn" onClick={toggleTheme} title="สลับโหมดสบายตา สว่าง/มืด">
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>{' '}
              <span>{theme === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}</span>
            </button>
          </div>
        </div>

        <div className="fivem-farm-banner">
          <div className="banner-left-wrap">
            <div className="banner-mascot-badge">
              <Image src="/images/branding/runtown_mascot.png" alt="RUNTOWN Pig Farm Mascot" width={74} height={74} />
            </div>
            <div>
              <div className="banner-subhead">
                <span>🌱</span> ฟาร์มหมู • RUNTOWN
              </div>
              <div className="banner-title">ฟาร์มหมู RUNTOWN</div>
              <div className="banner-desc">

              </div>
            </div>
          </div>
          <div className="banner-price-box">
            <div className="price-tag-title">ราคาสูงสุด / Pack</div>
            <div className="price-tag-val">${config.maxPrice}</div>
          </div>
        </div>

        <div className="stream-strip">
          <div className="stream-item">
            <span>🌾 ข้าว:</span>
            <strong style={{ color: '#facc15' }}>
              {fmtPrecise(calc.rice)} ({fmt(calc.wRice, 1)} kg)
            </strong>
            <span>ต้น</span>
          </div>
          <div className="stream-sep">➔</div>
          <div className="stream-item">
            <span>🐷 หมู:</span>
            <strong style={{ color: '#fb923c' }}>
              {fmtPrecise(calc.pens)} ({calc.batches} รอบ)
            </strong>
            <span>ตัว</span>
          </div>
          <div className="stream-sep">➔</div>
          <div className="stream-item">
            <span>🥩 หมูดิบ/โพ:</span>
            <strong style={{ color: '#fb7185' }}>{fmtPrecise(calc.pork)}</strong>
            <span>ชิ้น</span>
          </div>
          <div className="stream-sep">➔</div>
          <div className="stream-item">
            <span>📦 แพค:</span>
            <strong style={{ color: '#a78bfa' }}>{fmtPrecise(calc.packs)}</strong>
            <span>Pack</span>
          </div>
          <div className="stream-sep">➔</div>
          <div className="stream-item">
            <span>💰 กำไรสุทธิ:</span>
            <strong style={{ color: '#34d399' }}>฿{fmt(calc.netProfitAvg)}</strong>
          </div>
        </div>

        <div className="dashboard-grid">
          <div>
            <div className="glass-card">
              <div className="card-title-bar">
                <div className="card-title-text">
                  <span>⚡</span>
                  <span>ระบุจำนวนที่ต้องการ (พิมพ์ หรือกดปุ่ม + - ได้เลย)</span>
                </div>
              </div>

              <div className="presets-row">
                <button type="button" className="preset-btn" onClick={() => applyPreset('rice', 12)}>
                  🌾 ข้าว 12 ต้น (1 คอก 6 ตัว)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('rice', 60)}>
                  🌾 ข้าว 60 ต้น (30 ตัว)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('rice', 120)}>
                  🌾 ข้าว 120 ต้น (60 ตัว)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('pork', 60)}>
                  🥩 หมู 60 ชิ้น (6 ตัว)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('pork', 300)}>
                  🥩 หมู 300 ชิ้น (30 ตัว)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('pork', 600)}>
                  🥩 หมู 600 ชิ้น (60 ตัว)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('pack', 100)}>
                  📦 100 Pack
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPreset('money', 100000)}>
                  💰 100,000 ฿
                </button>
              </div>

              <div className="input-matrix">
                {(
                  [
                    {
                      key: 'rice' as const,
                      label: '🌾 จำนวนข้าวที่ปลูก',
                      pill: '0.5 kg / ต้น',
                      unit: 'ต้น',
                      step: [2, -2] as const,
                      resolver: porkFromRice,
                    },
                    {
                      key: 'pen' as const,
                      label: '🐷 จำนวนหมูที่เลี้ยง',
                      pill: 'ซื้อตัวละ 200฿',
                      unit: 'ตัว',
                      step: [1, -1] as const,
                      resolver: porkFromPens,
                    },
                    {
                      key: 'pork' as const,
                      label: '🥩 เนื้อหมูที่จะได้รับ',
                      pill: '1 ตัว = 10 ชิ้น',
                      unit: 'ชิ้น',
                      step: [10, -10] as const,
                      resolver: (n: number) => n,
                    },
                    {
                      key: 'pack' as const,
                      label: '📦 จำนวนแพคหมูที่ได้',
                      pill: '2 ชิ้น = 1 Pack',
                      unit: 'Pack',
                      step: [5, -5] as const,
                      resolver: porkFromPacks,
                    },
                    {
                      key: 'money' as const,
                      label: '💰 รายได้เป้าหมาย',
                      pill: '~423.5 ฿/Pack',
                      unit: 'บาท',
                      step: [10000, -10000] as const,
                      resolver: porkFromMoney,
                    },
                    {
                      key: 'minutes' as const,
                      label: '⏱️ เวลาฟาร์มที่ต้องการ',
                      pill: 'เลี้ยง + โพ + แพค',
                      unit: 'นาที',
                      step: [15, -15] as const,
                      resolver: porkFromMinutes,
                    },
                  ] as const
                ).map(({ key, label, pill, unit, step, resolver }) => (
                  <div className={inputClass(key)} id={`group-${key}`} key={key}>
                    <div className="input-box-top">
                      <label className="input-label-clean" htmlFor={`in-${key}`}>
                        {label}
                      </label>
                      <span className="input-sub-pill">{pill}</span>
                    </div>
                    <div className="input-flex">
                      <input
                        type="number"
                        id={`in-${key}`}
                        className="num-input"
                        placeholder="0"
                        min={0}
                        step={key === 'minutes' ? 1 : key === 'money' ? 1000 : 'any'}
                        value={inputs[key]}
                        onChange={(e) => handleInput(key, resolver)(e.target.value)}
                      />
                      <span className="unit-tag">
                        {unit}
                        {key === 'minutes' && (parseFloat(inputs.minutes) || calc.totalMin) > 0
                          ? ` (~${((parseFloat(inputs.minutes) || calc.totalMin) / 60).toFixed(2)} ชม.)`
                          : ''}
                      </span>
                      <div className="stepper-btn-group">
                        <button type="button" className="btn-step" onClick={() => stepValue(key, step[0], resolver)}>
                          +
                        </button>
                        <button type="button" className="btn-step" onClick={() => stepValue(key, step[1], resolver)}>
                          −
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#34d399',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>🔗</span>
                  <span>สายการผลิตในเกม (In-Game Production Chain)</span>
                </div>
                <div className="timeline-pipeline">
                  {/* timeline steps - abbreviated structure with same content as original */}
                  <TimelineStep
                    icon="🛍️"
                    phase="เลี้ยงและเก็บเกี่ยว"
                    name="ฟาร์มหมู"
                    tags={['ซื้อตัวละ 200฿', '🔪 ใช้มีดเชือด']}
                    desc="ซื้อหมู (สูงสุด 6 ตัว/รอบ) รอเฟสแรก 5 นาที ให้ข้าว 2 ต้น/ตัว แล้วรอเฟสสอง 10 นาที ใช้มีดเชือดเพื่อรับเนื้อหมูดิบ 10 ชิ้น/ตัว"
                    itemName="Raw Pork"
                    price="$108"
                    weight="0.5 kg/ชิ้น"
                    amount={`${fmtPrecise(calc.pork)} ชิ้น`}
                    sub={`น้ำหนัก ${fmt(calc.wRaw, 1)} kg`}
                  />
                  <TimelineStep
                    icon="🔄"
                    phase="แปรรูป"
                    name="โรงแปรรูปเนื้อหมู"
                    tags={['สายการผลิต']}
                    desc="นำเนื้อหมูดิบมาแปรรูปเพื่อเพิ่มมูลค่า (อัตรา 1:1 @ 6 วินาที/ชิ้น)"
                    itemName="Processed Pork"
                    price="$203"
                    weight="0.5 kg/ชิ้น"
                    amount={`${fmtPrecise(calc.pork)} ชิ้น`}
                    sub={`น้ำหนัก ${fmt(calc.wProc, 1)} kg`}
                  />
                  <TimelineStep
                    icon="📦"
                    phase="บรรจุ"
                    name="จุดบรรจุเนื้อหมู"
                    tags={['สายการผลิต']}
                    desc="ใช้เนื้อหมูแปรรูป 2 ชิ้น บรรจุเป็นสินค้า 1 แพ็กพร้อมส่ง (6 วินาที/Pack)"
                    itemName="Packed Pork"
                    price="$422"
                    weight="1.0 kg/Pack"
                    img="/images/products/packed_pork.jpg"
                    amount={`${fmtPrecise(calc.packs)} Pack`}
                    sub={`น้ำหนัก ${fmt(calc.wPack, 1)} kg`}
                  />
                  <TimelineStep
                    icon="🏷️"
                    phase="ขาย"
                    name="จุดรับซื้อสินค้า"
                    tags={['หาดเวลพูชซี']}
                    desc="นำเนื้อหมูแพ็กมาขายที่จุดรับซื้อสินค้าในเมือง RUNTOWN (ราคา 422 - 425 บาท)"
                    itemName="Packed Pork"
                    price="$422 - $425"
                    img="/images/products/packed_pork.jpg"
                    amount={`฿${fmt(calc.grossAvg)}`}
                    sub={`กำไรสุทธิ ฿${fmt(calc.netProfitAvg)}`}
                    chipLabel="ขายได้:"
                    amountStyle={{ color: '#34d399' }}
                    subStyle={{ color: '#a7f3d0' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="glass-card">
              <div className="card-title-bar">
                <div className="card-title-text">
                  <span>📊</span>
                  <span>สรุปผลการขาย & หักต้นทุนสุทธิ</span>
                </div>
              </div>

              <div className="hero-revenue-box">
                <div className="hero-revenue-head">
                  <span>💰 กำไรสุทธิ (Net Profit)</span>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      color: '#34d399',
                    }}
                  >
                    ROI {fmt(calc.roi, 1)}%
                  </span>
                </div>
                <div className="hero-net-profit">฿ {fmt(calc.netProfitAvg)}</div>
                <div style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
                  ขั้นต่ำ ฿{fmt(calc.netProfitMin)} | สูงสุด ฿{fmt(calc.netProfitMax)} (กำไร ฿
                  {fmt(calc.netProfitPerPig, 1)}/ตัว)
                </div>
                <div className="financial-statement-card">
                  <div className="statement-row">
                    <span className="statement-label">💵 ยอดขายรวม (Gross Sales):</span>
                    <span className="statement-val" style={{ color: '#67e8f9' }}>
                      ฿{fmt(calc.grossAvg)} ({fmtPrecise(calc.packs)} Pack @ ${config.minPrice}-${config.maxPrice})
                    </span>
                  </div>
                  <div className="statement-row">
                    <span className="statement-label">🏷️ หักต้นทุนซื้อหมู (200฿/ตัว):</span>
                    <span className="statement-val" style={{ color: '#fb7185' }}>
                      - ฿{fmt(calc.totalPigCost)} ({fmtPrecise(calc.pens)} ตัว @ {config.pigCost}฿)
                    </span>
                  </div>
                  <div className="statement-row" style={{ paddingTop: 8 }}>
                    <span className="statement-label" style={{ color: '#34d399', fontWeight: 700 }}>
                      ✨ กำไรสุทธิที่ได้รับจริง:
                    </span>
                    <span className="statement-val" style={{ color: '#34d399', fontSize: '1.1rem' }}>
                      ฿{fmt(calc.netProfitAvg)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="weight-card-box">
                <div className="weight-card-head">
                  <span>🎒 คำนวณน้ำหนักกระเป๋า (Inventory Weight)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>1 คอก 6 ตัว = หมู 30 kg</span>
                </div>
                <div className="weight-items-grid">
                  <div className="weight-tile">
                    <span>🌾 ข้าวที่ต้องใช้:</span>
                    <span className="weight-tile-val">{fmt(calc.wRice, 1)} kg</span>
                  </div>
                  <div className="weight-tile">
                    <span>🥩 หมูดิบที่ได้:</span>
                    <span className="weight-tile-val">{fmt(calc.wRaw, 1)} kg</span>
                  </div>
                  <div className="weight-tile">
                    <span>🥓 หมูโพแปรรูป:</span>
                    <span className="weight-tile-val">{fmt(calc.wProc, 1)} kg</span>
                  </div>
                  <div className="weight-tile">
                    <span>📦 แพคพร้อมขาย:</span>
                    <span className="weight-tile-val">{fmt(calc.wPack, 1)} kg</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                ⏱️ การวิเคราะห์เวลาทำงานทั้งหมด (Time Breakdown)
              </div>
              <div className="time-grid-clean">
                <div className="time-card-tile">
                  <div className="time-tile-head">
                    <span>🐷</span> เวลาเลี้ยงหมู ({calc.batches} รอบ)
                  </div>
                  <div className="time-tile-amount">{fmtPrecise(calc.breedTimeMin)} นาที</div>
                  <div className="time-tile-desc">
                    {(calc.breedTimeMin / 60).toFixed(2)} ชม. ({calc.batches} รอบเลี้ยง)
                  </div>
                </div>
                <div className="time-card-tile">
                  <div className="time-tile-head">
                    <span>🥩</span> เวลาโพเซสหมู
                  </div>
                  <div className="time-tile-amount">{fmtPrecise(calc.procTimeMin)} นาที</div>
                  <div className="time-tile-desc">
                    {(calc.procTimeMin / 60).toFixed(2)} ชั่วโมง ({(calc.procTimeMin * 60).toFixed(0)} วิ)
                  </div>
                </div>
                <div className="time-card-tile">
                  <div className="time-tile-head">
                    <span>📦</span> เวลาแพคหมู
                  </div>
                  <div className="time-tile-amount">{fmtPrecise(calc.packTimeMin)} นาที</div>
                  <div className="time-tile-desc">
                    {(calc.packTimeMin / 60).toFixed(2)} ชั่วโมง ({(calc.packTimeMin * 60).toFixed(0)} วิ)
                  </div>
                </div>
                <div className="time-card-tile">
                  <div className="time-tile-head">
                    <span>📈</span> อัตรากำไร / ชม.
                  </div>
                  <div className="time-tile-amount" style={{ color: '#34d399', fontSize: '1.15rem' }}>
                    ฿{fmt(calc.hourlyRate)} / ชม.
                  </div>
                  <div className="time-tile-desc" style={{ color: '#facc15' }}>
                    ฿{fmt(calc.riceValue, 1)} / ต้นข้าว
                  </div>
                </div>
                <div className="time-card-tile full-width">
                  <div className="time-tile-head" style={{ color: '#a7f3d0' }}>
                    <span>⏳</span> เวลารวมทั้งระบบ (เลี้ยง 15m + โพเซส + แพค)
                  </div>
                  <div className="time-tile-amount">{fmtPrecise(calc.totalMin)} นาที</div>
                  <div className="time-tile-desc" style={{ color: '#c7d2fe' }}>
                    {fullHours} ชั่วโมง {remainingMinutes} นาที ({calc.totalHours.toFixed(2)} ชม.)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-section">
          <div className="glass-card">
            <div className="card-title-bar">
              <div className="card-title-text">
                <span>📝</span>
                <span>ตารางเปรียบเทียบมาตรฐาน (Quick Reference Table)</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>คลิกแถวเพื่อดึงค่ามาคำนวณ</span>
            </div>
            <div className="table-responsive">
              <table className="data-table-clean">
                <thead>
                  <tr>
                    <th>จำนวนข้าว (ต้น)</th>
                    <th>จำนวนหมู (ตัว)</th>
                    <th>รอบเลี้ยง (6 ตัว/รอบ)</th>
                    <th>ต้นทุนซื้อหมู (200฿)</th>
                    <th>เนื้อหมูโพ (ชิ้น)</th>
                    <th>จำนวนแพค (Pack)</th>
                    <th>ยอดขายรวม</th>
                    <th>เวลารวมทั้งหมด</th>
                    <th>กำไรสุทธิที่ได้รับ</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceRows.map((row) => (
                    <tr
                      key={row.rice}
                      onClick={() => {
                        applyPreset('rice', row.rice);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <td>
                        <strong>{fmt(row.rice)}</strong>
                      </td>
                      <td>{fmtPrecise(row.pens)}</td>
                      <td>
                        <span
                          style={{
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: '#38bdf8',
                            padding: '2px 7px',
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          {row.batches} รอบ
                        </span>
                      </td>
                      <td style={{ color: '#fb7185' }}>- ฿{fmt(row.pigCost)}</td>
                      <td>
                        <span
                          style={{
                            background: 'var(--accent-pork-bg)',
                            color: 'var(--accent-pork)',
                            padding: '2px 7px',
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          {fmt(row.pork)}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--accent-pack-bg)',
                            color: 'var(--accent-pack)',
                            padding: '2px 7px',
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          {fmt(row.pack)}
                        </span>
                      </td>
                      <td style={{ color: '#67e8f9' }}>฿{fmt(row.grossAvg)}</td>
                      <td>
                        <strong>{(row.totalMin / 60).toFixed(2)} ชม.</strong>
                      </td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>฿{fmt(row.netProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className={`toast-popup${toastVisible ? ' show' : ''}`}>
        <span>✅</span>
        <span>{toastMsg}</span>
      </div>
    </>
  );
}

function TimelineStep({
  icon,
  phase,
  name,
  tags,
  desc,
  itemName,
  price,
  weight,
  img = '/images/products/raw_pork.jpg',
  chipLabel = 'ได้รับ:',
  amount,
  sub,
  amountStyle,
  subStyle,
}: {
  icon: string;
  phase: string;
  name: string;
  tags: string[];
  desc: string;
  itemName: string;
  price: string;
  weight?: string;
  img?: string;
  chipLabel?: string;
  amount: string;
  sub: string;
  amountStyle?: CSSProperties;
  subStyle?: CSSProperties;
}) {
  return (
    <div className="timeline-step-item">
      <div className="step-icon-badge">{icon}</div>
      <div className="step-content-card">
        <div className="step-left-info">
          <div className="step-title-line">
            <span className="step-phase-label">{phase}</span>
            <span className="step-name">{name}</span>
            {tags.map((t) => (
              <span
                key={t}
                className="step-tag-badge"
                style={
                  t.includes('🔪')
                    ? { color: '#facc15', borderColor: 'rgba(250, 204, 21, 0.3)' }
                    : undefined
                }
              >
                {t}
              </span>
            ))}
          </div>
          <div className="step-description-text">{desc}</div>
          <div className="step-output-chip">
            <span style={{ color: 'var(--text-dim)' }}>{chipLabel}</span>
            <Image src={img} alt={itemName} className="item-thumbnail" width={24} height={24} />
            <span className="item-chip-name">{itemName}</span>
            <span className="item-chip-price">{price}</span>
            {weight ? <span className="item-chip-weight">{weight}</span> : null}
          </div>
        </div>
        <div className="step-right-action">
          <div className="step-calc-amount" style={amountStyle}>
            {amount}
          </div>
          <div className="step-calc-sub" style={subStyle}>
            {sub}
          </div>
        </div>
      </div>
    </div>
  );
}
