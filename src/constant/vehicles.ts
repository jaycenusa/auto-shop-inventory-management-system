/** Part categories offered by the shop, as shown in the inventory filters. */
export const CATEGORIES = [
  'Engine',
  'Brakes',
  'Suspension',
  'Electrical',
  'Transmission',
] as const

/** Brands offered for manual vehicle entry when a VIN is unavailable. */
export const CAR_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'BMW M', 'Mercedes-Benz',
  'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Audi', 'Mazda', 'Subaru', 'Jeep',
  'Ram', 'Dodge', 'Chrysler', 'Buick', 'Cadillac', 'GMC', 'Land Rover',
  'Jaguar', 'Unknown',
] as const

export const CAR_MODELS: Record<string, string[]> = {
  Toyota: ['Camry','Corolla','RAV4','Highlander','Tacoma','Tundra','4Runner','Prius','Sienna','Avalon','C-HR','Venza','Sequoia','Land Cruiser','GR86','Supra'],
  Honda: ['Civic','Accord','CR-V','Pilot','HR-V','Passport','Ridgeline','Odyssey','Fit','Insight'],
  Ford: ['F-150','Mustang','Explorer','Escape','Edge','Expedition','Ranger','Bronco','Maverick','EcoSport','Transit','Transit Connect','Focus','Fusion'],
  Chevrolet: ['Silverado','Equinox','Traverse','Malibu','Blazer','Trailblazer','Colorado','Tahoe','Suburban','Camaro','Corvette','Spark','Trax','Express'],
  BMW: ['3 Series','5 Series','7 Series','X1','X3','X5','X7','2 Series','4 Series','6 Series','8 Series','Z4','M2','M3','M4','M5','i4','iX'],
  'BMW M': ['M2','M3','M4','M5','M8','X3 M','X4 M','X5 M','X6 M'],
  'Mercedes-Benz': ['C-Class','E-Class','S-Class','GLC','GLE','GLS','A-Class','CLA','CLS','G-Class','GLA','GLB','AMG GT','EQC','EQS'],
  Volkswagen: ['Jetta','Passat','Tiguan','Atlas','Golf','ID.4','Taos','Arteon','GTI','Golf R'],
  Nissan: ['Altima','Sentra','Rogue','Pathfinder','Murano','Frontier','Titan','Armada','Maxima','Kicks','Versa','370Z','GT-R','LEAF','Ariya'],
  Hyundai: ['Elantra','Sonata','Tucson','Santa Fe','Palisade','Kona','Ioniq','Ioniq 5','Ioniq 6','Venue','Santa Cruz','Nexo'],
  Kia: ['Sportage','Seltos','Telluride','Sorento','Soul','Forte','K5','Stinger','Carnival','EV6','Niro'],
  Audi: ['A3','A4','A5','A6','A7','A8','Q3','Q5','Q7','Q8','TT','R8','e-tron','e-tron GT','RS3','RS5','RS7','S3','S4','S5'],
  Mazda: ['Mazda3','Mazda6','CX-3','CX-30','CX-5','CX-50','CX-9','MX-5 Miata','MX-30'],
  Subaru: ['Impreza','Legacy','Outback','Forester','Crosstrek','Ascent','WRX','BRZ','Solterra'],
  Jeep: ['Wrangler','Grand Cherokee','Cherokee','Compass','Renegade','Gladiator','Grand Wagoneer'],
  Ram: ['1500','2500','3500','ProMaster','ProMaster City'],
  Dodge: ['Charger','Challenger','Durango','Journey','Grand Caravan','Dart'],
  Chrysler: ['300','Pacifica','Voyager'],
  Buick: ['Encore','Encore GX','Envision','Enclave','LaCrosse','Regal'],
  Cadillac: ['CT4','CT5','XT4','XT5','XT6','Escalade','LYRIQ'],
  GMC: ['Sierra 1500','Sierra 2500','Sierra 3500','Canyon','Terrain','Acadia','Yukon','Yukon XL','Savana','Envoy'],
  'Land Rover': ['Range Rover','Range Rover Sport','Range Rover Velar','Range Rover Evoque','Discovery','Discovery Sport','Defender'],
  Jaguar: ['XE','XF','XJ','F-Type','E-Pace','F-Pace','I-Pace'],
  Unknown: [],
}

/** Model years offered for manual entry, newest first back to 2000. */
export function vehicleYears(now: Date = new Date()): string[] {
  const current = now.getFullYear()
  return Array.from({ length: current - 1999 }, (_, i) => String(current - i))
}

/** How many decoded vehicles to keep in the recent-lookup list. */
export const MAX_RECENT_VINS = 5

/** Sample VINs offered on the empty VIN Lookup state. */
export const SAMPLE_VINS = [
  { vin: '1HGBH41JXMN109186', label: '2019 Honda Civic (example)' },
  { vin: '2T1BURHE0JC019482', label: '2018 Toyota Corolla (example)' },
  { vin: '1FTFW1ET5DFC10312', label: '2013 Ford F-150 (example)' },
] as const
