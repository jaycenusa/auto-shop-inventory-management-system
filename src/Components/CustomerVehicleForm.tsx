import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getCarModelsForBrand } from '../Database/CarCatalog'
import type { CustomerVehicle } from '../Database/CustomerData'
import Button from '../Shared/Button'
import {
  customerCarBrandRules,
  customerCarModelRules,
  customerCarYearRules,
  customerVinRules,
  VIN_MAX_LENGTH,
} from '../Utils/CustomerValidation'

type VehicleFormValues = {
  carBrand: string
  carModel: string
  carYear: string
  vin: string
}

type CustomerVehicleFormProps = {
  draft: CustomerVehicle
  isEditing: boolean
  carBrands: string[]
  carYearOptions: number[]
  onSave: (vehicle: CustomerVehicle) => void
  onCancel: () => void
  errorMessage?: string | null
}

function fieldClass(hasError: boolean) {
  return `form-input${hasError ? ' form-input--error' : ''}`
}

function toFormValues(vehicle: CustomerVehicle): VehicleFormValues {
  return {
    carBrand: vehicle.carBrand,
    carModel: vehicle.carModel,
    carYear: vehicle.carYear > 0 ? String(vehicle.carYear) : '',
    vin: vehicle.vin,
  }
}

export default function CustomerVehicleForm({
  draft,
  isEditing,
  carBrands,
  carYearOptions,
  onSave,
  onCancel,
  errorMessage,
}: CustomerVehicleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    defaultValues: toFormValues(draft),
    mode: 'onSubmit',
  })

  useEffect(() => {
    reset(toFormValues(draft))
  }, [draft, reset])

  const selectedCarBrand = watch('carBrand')
  const selectedCarModel = watch('carModel')
  const carModelOptions = useMemo(
    () => getCarModelsForBrand(selectedCarBrand),
    [selectedCarBrand],
  )
  const isCarModelDisabled = !selectedCarBrand

  const carBrandField = register('carBrand', customerCarBrandRules)
  const carModelField = register('carModel', customerCarModelRules)
  const vinField = register('vin', {
    ...customerVinRules,
    setValueAs: (value: string) =>
      value.toUpperCase().slice(0, VIN_MAX_LENGTH),
  })

  useEffect(() => {
    if (!selectedCarBrand) {
      if (selectedCarModel) setValue('carModel', '')
      return
    }

    if (selectedCarModel && !carModelOptions.includes(selectedCarModel)) {
      setValue('carModel', '')
    }
  }, [selectedCarBrand, selectedCarModel, carModelOptions, setValue])

  const submitVehicle = handleSubmit((data) => {
    onSave({
      id: draft.id,
      carBrand: data.carBrand.trim(),
      carModel: data.carModel.trim(),
      carYear: Number(data.carYear),
      vin: data.vin.trim().toUpperCase(),
    })
  })

  return (
    <div className="customer-vehicle-form">
      <h3 className="customer-vehicle-form__title">
        {isEditing ? 'Edit vehicle' : 'Add vehicle'}
      </h3>
      {errorMessage && (
        <p className="form-error customer-vehicle-form__error" role="alert">
          {errorMessage}
        </p>
      )}
      <form
        className="customer-vehicle-form__grid"
        onSubmit={submitVehicle}
        noValidate
      >
        <label className="form-field">
          <span className="form-label form-label--required">Car brand</span>
          <select
            {...carBrandField}
            onChange={(e) => {
              void carBrandField.onChange(e)
              setValue('carModel', '')
            }}
            className={fieldClass(Boolean(errors.carBrand))}
          >
            <option value="">Select car brand</option>
            {carBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          {errors.carBrand?.message && (
            <p className="form-error">{errors.carBrand.message}</p>
          )}
        </label>
        <label className="form-field">
          <span className="form-label form-label--required">Car model</span>
          <select
            {...carModelField}
            disabled={isCarModelDisabled}
            className={fieldClass(Boolean(errors.carModel))}
            aria-disabled={isCarModelDisabled}
          >
            <option value="">
              {isCarModelDisabled
                ? 'Select a car brand first'
                : 'Select car model'}
            </option>
            {carModelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.carModel?.message && (
            <p className="form-error">{errors.carModel.message}</p>
          )}
        </label>
        <label className="form-field">
          <span className="form-label form-label--required">Year of the car</span>
          <select
            {...register('carYear', customerCarYearRules)}
            className={fieldClass(Boolean(errors.carYear))}
          >
            <option value="">Select year</option>
            {carYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.carYear?.message && (
            <p className="form-error">{errors.carYear.message}</p>
          )}
        </label>
        <label className="form-field customer-vehicle-form__vin">
          <span className="form-label form-label--required">VIN number</span>
          <input
            type="text"
            {...vinField}
            maxLength={VIN_MAX_LENGTH}
            className={fieldClass(Boolean(errors.vin))}
            placeholder="17-character VIN"
            aria-invalid={Boolean(errors.vin)}
          />
          {errors.vin?.message && (
            <p className="form-error">{errors.vin.message}</p>
          )}
        </label>
        <div className="customer-vehicle-form__actions customer-vehicle-form__field--wide">
          <Button type="submit" variant="primary">
            {isEditing ? 'Update vehicle' : 'Add vehicle'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
