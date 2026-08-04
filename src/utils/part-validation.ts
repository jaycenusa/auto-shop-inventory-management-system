import {
  inventoryCategories,
  type InventoryCategory,
} from '../database/InventoryData'

export const carPartRules = {
  required: 'Car part is required.',
  validate: (value: string) =>
    (typeof value === 'string' && value.trim() !== '') ||
    'Car part is required.',
}

export const brandRules = {
  required: 'Brand is required.',
  validate: (value: string) =>
    (typeof value === 'string' && value.trim() !== '') || 'Brand is required.',
}

export const categoryRules = {
  required: 'Category is required.',
  validate: (value: InventoryCategory) =>
    inventoryCategories.includes(value) || 'Category is required.',
}

export const priceStringRules = {
  required: 'Price is required.',
  validate: (value: string) => {
    const price = parseFloat(value)
    return (
      (value.trim() !== '' && !Number.isNaN(price) && price >= 0) ||
      'Price is required.'
    )
  },
}

export const priceNumberRules = {
  required: 'Price is required.',
  valueAsNumber: true,
  validate: (value: number) =>
    (!Number.isNaN(value) && value >= 0) || 'Price is required.',
}

export const imageUrlRules = {
  required: 'Part picture is required.',
  validate: (value: string) =>
    (typeof value === 'string' && value.trim() !== '') ||
    'Part picture is required.',
}

export const quantityRules = {
  required: 'Quantity is required.',
  validate: (value: string) => {
    const quantity = parseInt(value, 10)
    return (
      (!Number.isNaN(quantity) && quantity >= 0) || 'Enter a valid quantity.'
    )
  },
}

export const quantityNumberRules = {
  required: 'Quantity is required.',
  valueAsNumber: true,
  validate: (value: number) =>
    (!Number.isNaN(value) && value >= 0) || 'Enter a valid quantity.',
}

export function countInvalidpartRows(partsErrors: unknown): number {
  if (!Array.isArray(partsErrors)) return 0
  return partsErrors.filter(
    (rowErrors) =>
      rowErrors &&
      typeof rowErrors === 'object' &&
      Object.keys(rowErrors as object).length > 0,
  ).length
}

export function modifypartsValidationMessage(invalidCount: number): string {
  return `Complete all required fields (car part, brand, category, price, and picture) for ${invalidCount} part${invalidCount === 1 ? '' : 's'} before continuing.`
}
