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

export const customerVinRules = {
  required: 'VIN is required',
  minLength: { value: 11, message: 'VIN must be at least 11 characters' },
  maxLength: { value: 17, message: 'VIN must be at most 17 characters' },
}
