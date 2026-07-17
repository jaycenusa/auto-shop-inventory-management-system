export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export type InventoryCategory = 'Tires' | 'Air Filter' | 'Car Parts'

export const inventoryCategories: InventoryCategory[] = [
  'Tires',
  'Air Filter',
  'Car Parts',
]

export type InventoryPart = {
  id: string
  carPart: string
  brand: string
  price: number
  quantity: number
  category: InventoryCategory
  availabilityStatus: AvailabilityStatus
  imageUrl: string
}

export function getPartImageUrl(
  part: Pick<InventoryPart, 'imageUrl' | 'id'>,
): string {
  return part.imageUrl || `https://picsum.photos/seed/part-${part.id}/96/96`
}

export const inventoryParts: InventoryPart[] = [
  {
    id: '1',
    carPart: 'Ceramic Brake Pads (Front)',
    brand: 'Brembo',
    price: 89.99,
    quantity: 48,
    category: 'Car Parts',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    carPart: 'Synthetic Motor Oil 5W-30 (5 qt)',
    brand: 'Mobil 1',
    price: 32.49,
    quantity: 120,
    category: 'Car Parts',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1632826427450-ef9a5b5d6961?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    carPart: 'Air Filter',
    brand: 'K&N',
    price: 54.99,
    quantity: 8,
    category: 'Air Filter',
    availabilityStatus: 'Low Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1625047509168-a7026a36d04e?w=200&h=200&fit=crop',
  },
  {
    id: '4',
    carPart: 'Alternator',
    brand: 'Denso',
    price: 219.0,
    quantity: 15,
    category: 'Car Parts',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1487754180451-f45cc0478b12?w=200&h=200&fit=crop',
  },
  {
    id: '5',
    carPart: 'Spark Plug Set (4)',
    brand: 'NGK',
    price: 28.75,
    quantity: 64,
    category: 'Car Parts',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1619642751034-765df43d7749?w=200&h=200&fit=crop',
  },
  {
    id: '6',
    carPart: 'Radiator Hose (Upper)',
    brand: 'Gates',
    price: 24.99,
    quantity: 0,
    category: 'Car Parts',
    availabilityStatus: 'Out of Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop',
  },
  {
    id: '7',
    carPart: 'Shock Absorber (Rear)',
    brand: 'Monroe',
    price: 78.5,
    quantity: 6,
    category: 'Car Parts',
    availabilityStatus: 'Low Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&fit=crop',
  },
  {
    id: '8',
    carPart: 'Windshield Wiper Blades (22")',
    brand: 'Bosch',
    price: 18.99,
    quantity: 90,
    category: 'Car Parts',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=200&fit=crop',
  },
  {
    id: '9',
    carPart: 'Timing Belt Kit',
    brand: 'Gates',
    price: 145.0,
    quantity: 12,
    category: 'Car Parts',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200&h=200&fit=crop',
  },
  {
    id: '10',
    carPart: 'Battery 12V 65Ah',
    brand: 'Optima',
    price: 189.99,
    quantity: 4,
    category: 'Car Parts',
    availabilityStatus: 'Low Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&h=200&fit=crop',
  },
  {
    id: '11',
    carPart: 'All-Season Tire 215/55R17',
    brand: 'Michelin',
    price: 159.99,
    quantity: 24,
    category: 'Tires',
    availabilityStatus: 'In Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=200&h=200&fit=crop',
  },
  {
    id: '12',
    carPart: 'Winter Tire 205/60R16',
    brand: 'Bridgestone',
    price: 142.5,
    quantity: 10,
    category: 'Tires',
    availabilityStatus: 'Low Stock',
    imageUrl:
      'https://images.unsplash.com/photo-1619767886555-ef245f2d550d?w=200&h=200&fit=crop',
  },
]

export const availabilityOptions: AvailabilityStatus[] = [
  'In Stock',
  'Low Stock',
  'Out of Stock',
]
