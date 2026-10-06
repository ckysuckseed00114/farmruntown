export const RUNTOWN_CONFIG = {
  minPrice: 422,
  maxPrice: 425,
  procSec: 6,
  packSec: 6,
  ricePerPen: 2,
  porkPerPen: 10,
  porkPerPack: 2,
  pigCost: 200,
  penMaxSlots: 6,
  phase1Min: 5,
  phase2Min: 10,
  weightRice: 0.5,
  weightRawPork: 0.5,
  weightProcPork: 0.5,
  weightPack: 1.0,
} as const;

export const REFERENCE_RICE_PRESETS = [12, 24, 60, 120, 240, 480, 600, 1200] as const;

export type InputSource =
  | 'rice'
  | 'pen'
  | 'pork'
  | 'pack'
  | 'money'
  | 'minutes'
  | 'init';
