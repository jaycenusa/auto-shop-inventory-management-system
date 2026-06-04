import {
  CAR_YEAR_MIN,
  getCurrentCarYear,
  isValidCarYear,
} from '../Database/CarCatalog'

export const customerFullNameRules = {
  required: 'Full name is required',
  minLength: { value: 2, message: 'Enter at least 2 characters' },
}

export const customerPhoneRules = {
  required: 'Phone number is required',
  minLength: { value: 7, message: 'Enter a valid phone number' },
}

export const customerCarBrandRules = {
  required: 'Car brand is required',
}

export const customerCarModelRules = {
  required: 'Car model is required',
}

export const customerCarYearRules = {
  required: 'Car year is required',
  validate: (value: string) => {
    if (!value) return 'Car year is required'
    const year = Number(value)
    if (!isValidCarYear(year)) {
      return `Select a year between ${CAR_YEAR_MIN} and ${getCurrentCarYear()}`
    }
    return true
  },
}

export const VIN_MAX_LENGTH = 17

export const customerVinRules = {
  required: 'VIN is required',
  minLength: {
    value: 11,
    message: 'VIN must be at least 11 characters',
  },
  maxLength: {
    value: VIN_MAX_LENGTH,
    message: `VIN must be at most ${VIN_MAX_LENGTH} characters`,
  },
}
