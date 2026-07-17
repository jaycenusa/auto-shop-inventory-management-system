import type { Lang } from './translations'

/** Part display names keyed by SKU. Falls back to the stored English name for unknown/custom parts. */
const PART_NAMES: Record<Lang, Record<string, string>> = {
  en: {
    'ENG-OIL-001': 'Oil Filter',
    'ENG-AIR-002': 'Air Filter',
    'ENG-SPK-003': 'Spark Plug Set (4)',
    'ENG-TIM-004': 'Timing Belt',
    'BRK-PAD-005': 'Brake Pads (Front)',
    'BRK-ROT-006': 'Brake Rotor (Front)',
    'BRK-FLD-007': 'Brake Fluid DOT4',
    'SUS-SHK-008': 'Shock Absorber (F)',
    'SUS-ARM-009': 'Control Arm (F-L)',
    'ELC-ALT-010': 'Alternator 90A',
    'ELC-BAT-011': 'Car Battery 60Ah',
    'ELC-STR-012': 'Starter Motor',
    'TRN-FLD-013': 'Trans. Fluid ATF',
    'TRN-CLT-014': 'Clutch Kit',
    'ENG-WTP-015': 'Water Pump',
    'ENG-THS-016': 'Thermostat',
    'BRK-CAL-017': 'Brake Caliper (F-L)',
    'SUS-BLJ-018': 'Ball Joint (Front)',
    'ELC-FUS-019': 'Fuse Box Kit',
    'ENG-GKT-020': 'Head Gasket Set',
  },
  'zh-TW': {
    'ENG-OIL-001': '機油濾清器',
    'ENG-AIR-002': '空氣濾清器',
    'ENG-SPK-003': '火星塞組（4支）',
    'ENG-TIM-004': '正時皮帶',
    'BRK-PAD-005': '煞車來令片（前）',
    'BRK-ROT-006': '煞車碟盤（前）',
    'BRK-FLD-007': '煞車油 DOT4',
    'SUS-SHK-008': '避震器（前）',
    'SUS-ARM-009': '控制臂（前左）',
    'ELC-ALT-010': '發電機 90A',
    'ELC-BAT-011': '汽車電瓶 60Ah',
    'ELC-STR-012': '啟動馬達',
    'TRN-FLD-013': '變速箱油 ATF',
    'TRN-CLT-014': '離合器套件',
    'ENG-WTP-015': '水泵',
    'ENG-THS-016': '節溫器',
    'BRK-CAL-017': '煞車卡鉗（前左）',
    'SUS-BLJ-018': '球頭（前）',
    'ELC-FUS-019': '保險絲盒套件',
    'ENG-GKT-020': '汽缸床墊片組',
  },
  'zh-CN': {
    'ENG-OIL-001': '机油滤清器',
    'ENG-AIR-002': '空气滤清器',
    'ENG-SPK-003': '火花塞组（4支）',
    'ENG-TIM-004': '正时皮带',
    'BRK-PAD-005': '刹车片（前）',
    'BRK-ROT-006': '刹车盘（前）',
    'BRK-FLD-007': '刹车油 DOT4',
    'SUS-SHK-008': '减震器（前）',
    'SUS-ARM-009': '控制臂（前左）',
    'ELC-ALT-010': '发电机 90A',
    'ELC-BAT-011': '汽车电瓶 60Ah',
    'ELC-STR-012': '启动机',
    'TRN-FLD-013': '变速箱油 ATF',
    'TRN-CLT-014': '离合器套件',
    'ENG-WTP-015': '水泵',
    'ENG-THS-016': '节温器',
    'BRK-CAL-017': '刹车卡钳（前左）',
    'SUS-BLJ-018': '球头（前）',
    'ELC-FUS-019': '保险丝盒套件',
    'ENG-GKT-020': '气缸垫组',
  },
  es: {
    'ENG-OIL-001': 'Filtro de aceite',
    'ENG-AIR-002': 'Filtro de aire',
    'ENG-SPK-003': 'Juego de bujías (4)',
    'ENG-TIM-004': 'Correa de distribución',
    'BRK-PAD-005': 'Pastillas de freno (delanteras)',
    'BRK-ROT-006': 'Disco de freno (delantero)',
    'BRK-FLD-007': 'Líquido de frenos DOT4',
    'SUS-SHK-008': 'Amortiguador (del.)',
    'SUS-ARM-009': 'Brazo de control (del. izq.)',
    'ELC-ALT-010': 'Alternador 90A',
    'ELC-BAT-011': 'Batería 60Ah',
    'ELC-STR-012': 'Motor de arranque',
    'TRN-FLD-013': 'Aceite de transmisión ATF',
    'TRN-CLT-014': 'Kit de embrague',
    'ENG-WTP-015': 'Bomba de agua',
    'ENG-THS-016': 'Termostato',
    'BRK-CAL-017': 'Pinza de freno (del. izq.)',
    'SUS-BLJ-018': 'Rótula (delantera)',
    'ELC-FUS-019': 'Kit de caja de fusibles',
    'ENG-GKT-020': 'Juego de junta de culata',
  },
}

export function getPartName(sku: string, fallback: string, lang: Lang): string {
  return PART_NAMES[lang]?.[sku] ?? PART_NAMES.en[sku] ?? fallback
}

/** All known name variants for a SKU (used for search across languages). */
export function getPartNameSearchTerms(sku: string, fallback: string): string[] {
  const names = new Set<string>([fallback.toLowerCase()])
  for (const lang of Object.keys(PART_NAMES) as Lang[]) {
    const n = PART_NAMES[lang][sku]
    if (n) names.add(n.toLowerCase())
  }
  return [...names]
}
