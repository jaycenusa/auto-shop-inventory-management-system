/** Brand → models used for customer vehicle dropdowns (SUVs, vans, and other body styles). */
export const CAR_BRAND_MODELS: Record<string, readonly string[]> = {
  Toyota: [
    '4Runner',
    'bZ4X',
    'C-HR',
    'Camry',
    'Corolla',
    'Corolla Cross',
    'Grand Highlander',
    'Highlander',
    'Land Cruiser',
    'RAV4',
    'Sequoia',
    'Sienna',
    'Tacoma',
    'Tundra',
    'Venza',
  ],
  Honda: [
    'Accord',
    'Civic',
    'CR-V',
    'HR-V',
    'Odyssey',
    'Passport',
    'Pilot',
    'Prologue',
    'Ridgeline',
  ],
  Ford: [
    'Bronco',
    'Bronco Sport',
    'E-Transit',
    'Edge',
    'Escape',
    'Expedition',
    'Explorer',
    'F-150',
    'Mach-E',
    'Mustang',
    'Ranger',
    'Transit',
    'Transit Connect',
  ],
  Chevrolet: [
    'Blazer',
    'Colorado',
    'Equinox',
    'Express',
    'Malibu',
    'Silverado',
    'Suburban',
    'Tahoe',
    'Trailblazer',
    'Traverse',
    'Trax',
  ],
  Nissan: [
    'Altima',
    'Armada',
    'Ariya',
    'Frontier',
    'Kicks',
    'Murano',
    'NV Cargo',
    'NV Passenger',
    'NV200',
    'Pathfinder',
    'Rogue',
    'Sentra',
    'Titan',
  ],
  Hyundai: [
    'Elantra',
    'Ioniq 5',
    'Kona',
    'Palisade',
    'Santa Cruz',
    'Santa Fe',
    'Sonata',
    'Staria',
    'Tucson',
    'Venue',
  ],
  Kia: [
    'Carnival',
    'EV6',
    'Forte',
    'K5',
    'Niro',
    'Seltos',
    'Soul',
    'Sorento',
    'Sportage',
    'Telluride',
  ],
  BMW: [
    '3 Series',
    '5 Series',
    'iX',
    'X1',
    'X2',
    'X3',
    'X4',
    'X5',
    'X6',
    'X7',
  ],
  'Mercedes-Benz': [
    'C-Class',
    'E-Class',
    'EQE SUV',
    'EQS SUV',
    'G-Class',
    'GLA',
    'GLB',
    'GLC',
    'GLE',
    'GLS',
    'Metris',
    'Sprinter',
  ],
  Volkswagen: [
    'Atlas',
    'Atlas Cross Sport',
    'Golf',
    'ID. Buzz',
    'ID.4',
    'Jetta',
    'Multivan',
    'Taos',
    'Tiguan',
  ],
  Dodge: [
    'Challenger',
    'Charger',
    'Durango',
    'Hornet',
    'ProMaster',
    'ProMaster City',
    'Ram 1500',
  ],
  Jeep: [
    'Cherokee',
    'Compass',
    'Gladiator',
    'Grand Cherokee',
    'Grand Wagoneer',
    'Renegade',
    'Wagoneer',
    'Wrangler',
  ],
  Ram: ['ProMaster', 'ProMaster City'],
}

export function getCarBrands(): string[] {
  return Object.keys(CAR_BRAND_MODELS).sort()
}

export function getCarModelsForBrand(brand: string): string[] {
  if (!brand) return []
  const models = CAR_BRAND_MODELS[brand]
  return models ? [...models] : []
}

export function isKnownCarBrand(brand: string): boolean {
  return brand in CAR_BRAND_MODELS
}

export const CAR_YEAR_MIN = 2000

/** Current calendar year from the system clock (via `Date`). */
export function getCurrentCarYear(): number {
  return new Date().getFullYear()
}

export function getCarYearOptions(): number[] {
  const maxYear = getCurrentCarYear()
  const years: number[] = []

  for (let year = maxYear; year >= CAR_YEAR_MIN; year -= 1) {
    years.push(year)
  }

  return years
}

export function isValidCarYear(year: number): boolean {
  const maxYear = getCurrentCarYear()
  return Number.isInteger(year) && year >= CAR_YEAR_MIN && year <= maxYear
}
