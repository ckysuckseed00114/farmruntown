import { RUNTOWN_CONFIG as config } from './config';

export type CalcResult = {
  rice: number;
  pens: number;
  pork: number;
  packs: number;
  batches: number;
  breedTimeMin: number;
  procTimeMin: number;
  packTimeMin: number;
  totalMin: number;
  totalHours: number;
  grossMin: number;
  grossMax: number;
  grossAvg: number;
  totalPigCost: number;
  netProfitMin: number;
  netProfitMax: number;
  netProfitAvg: number;
  netProfitPerPig: number;
  roi: number;
  wRice: number;
  wRaw: number;
  wProc: number;
  wPack: number;
  hourlyRate: number;
  riceValue: number;
};

export function calculateFromPorkCount(porkCount: number): CalcResult {
  const pork = porkCount < 0 || Number.isNaN(porkCount) ? 0 : porkCount;
  const pens = pork / config.porkPerPen;
  const rice = pens * config.ricePerPen;
  const packs = pork / config.porkPerPack;
  const batches = pens > 0 ? Math.ceil(pens / config.penMaxSlots) : 0;

  const breedTimeMin = batches * (config.phase1Min + config.phase2Min);
  const procTimeMin = (pork * config.procSec) / 60;
  const packTimeMin = (packs * config.packSec) / 60;
  const totalMin = breedTimeMin + procTimeMin + packTimeMin;
  const totalHours = totalMin / 60;

  const grossMin = packs * config.minPrice;
  const grossMax = packs * config.maxPrice;
  const grossAvg = (grossMin + grossMax) / 2;
  const totalPigCost = pens * config.pigCost;
  const netProfitMin = grossMin - totalPigCost;
  const netProfitMax = grossMax - totalPigCost;
  const netProfitAvg = grossAvg - totalPigCost;
  const netProfitPerPig = pens > 0 ? netProfitAvg / pens : 0;
  const roi = totalPigCost > 0 ? (netProfitAvg / totalPigCost) * 100 : 0;

  const wRice = rice * config.weightRice;
  const wRaw = pork * config.weightRawPork;
  const wProc = pork * config.weightProcPork;
  const wPack = packs * config.weightPack;

  const hourlyRate = totalHours > 0 ? netProfitAvg / totalHours : 0;
  const riceValue = rice > 0 ? netProfitAvg / rice : 0;

  return {
    rice,
    pens,
    pork,
    packs,
    batches,
    breedTimeMin,
    procTimeMin,
    packTimeMin,
    totalMin,
    totalHours,
    grossMin,
    grossMax,
    grossAvg,
    totalPigCost,
    netProfitMin,
    netProfitMax,
    netProfitAvg,
    netProfitPerPig,
    roi,
    wRice,
    wRaw,
    wProc,
    wPack,
    hourlyRate,
    riceValue,
  };
}

export function porkFromRice(rice: number): number {
  const pens = rice / config.ricePerPen;
  return pens * config.porkPerPen;
}

export function porkFromPens(pens: number): number {
  return pens * config.porkPerPen;
}

export function porkFromPacks(packs: number): number {
  return packs * config.porkPerPack;
}

export function porkFromMoney(targetMoney: number): number {
  const avgPrice = (config.minPrice + config.maxPrice) / 2;
  const packs = avgPrice > 0 ? targetMoney / avgPrice : 0;
  return packs * config.porkPerPack;
}

export function porkFromHours(hours: number): number {
  const totalSec = hours * 3600;
  const secPerPork =
    (15 * 60) / (config.penMaxSlots * config.porkPerPen) +
    config.procSec +
    config.packSec / config.porkPerPack;
  return secPerPork > 0 ? totalSec / secPerPork : 0;
}

export function referenceRow(rice: number) {
  const pens = rice / config.ricePerPen;
  const batches = Math.ceil(pens / config.penMaxSlots);
  const pork = pens * config.porkPerPen;
  const pack = pork / config.porkPerPack;
  const breedMin = batches * (config.phase1Min + config.phase2Min);
  const procMin = (pork * config.procSec) / 60;
  const packMin = (pack * config.packSec) / 60;
  const totalMin = breedMin + procMin + packMin;
  const pigCost = pens * config.pigCost;
  const grossAvg = pack * ((config.minPrice + config.maxPrice) / 2);
  const netProfit = grossAvg - pigCost;
  return { rice, pens, batches, pork, pack, totalMin, pigCost, grossAvg, netProfit };
}
