import { useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { Controller, useForm } from 'react-hook-form'
import AppHeader, { type AppHeaderProps } from '../Pages/Header'
import PartPreviewTable from './PartPreviewTable'
import {
  availabilityOptions,
  inventoryCategories,
  type AvailabilityStatus,
  type InventoryCategory,
  type InventoryPart,
} from '../Database/InventoryData'
import PictureDropzone from '../Shared/PictureDropzone'
import Button, { PlusIcon } from '../Shared/Button'
import {
  brandRules,
  carPartRules,
  categoryRules,
  imageUrlRules,
  priceStringRules,
  quantityRules,
} from '../Utils/PartValidation'

type AddCarPartProps = AppHeaderProps & {
  parts: InventoryPart[]
  setParts: Dispatch<SetStateAction<InventoryPart[]>>
}

type AddPartFormValues = {
  carPart: string
  brand: string
  price: string
  quantity: string
  imageUrl: string
  category: InventoryCategory
  availabilityStatus: AvailabilityStatus
}

function getAddPartDefaults(
  inventoryCategory: InventoryCategory | null,
): AddPartFormValues {
  return {
    carPart: '',
    brand: '',
    price: '',
    quantity: '',
    imageUrl: '',
    category: inventoryCategory ?? 'Car Parts',
    availabilityStatus: 'In Stock',
  }
}

function fieldClass(hasError: boolean) {
  return `form-input${hasError ? ' form-input--error' : ''}`
}

function RequiredLabel({ children }: { children: ReactNode }) {
  return <span className="form-label form-label--required">{children}</span>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="form-error">{message}</p>
}

export default function AddCarPart({
  activePage,
  onNavigate,
  inventoryCategory,
  inventoryFilters,
  onInventorySearchChange,
  setParts,
}: AddCarPartProps) {
  const [draftParts, setDraftParts] = useState<InventoryPart[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddPartFormValues>({
    defaultValues: getAddPartDefaults(inventoryCategory),
    mode: 'onSubmit',
  })

  const carPartValue = watch('carPart')

  const onAddToPreview = handleSubmit((data) => {
    const part: InventoryPart = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      carPart: data.carPart.trim(),
      brand: data.brand.trim(),
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity, 10),
      category: data.category,
      availabilityStatus: data.availabilityStatus,
      imageUrl: data.imageUrl.trim(),
    }

    setDraftParts((prev) => [...prev, part])
    reset(getAddPartDefaults(inventoryCategory))
    setShowConfirm(true)
  })

  const handleConfirm = () => {
    if (draftParts.length === 0) return
    setParts((prev) => [...prev, ...draftParts])
    onNavigate('inventory')
  }

  const removeDraft = (id: string) => {
    setDraftParts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      if (next.length === 0) setShowConfirm(false)
      return next
    })
  }

  return (
    <div className="page">
      <AppHeader
        activePage={activePage}
        onNavigate={onNavigate}
        inventoryCategory={inventoryCategory}
        inventoryFilters={inventoryFilters}
        onInventorySearchChange={onInventorySearchChange}
      />

      <div className="page-header">
        <div className="page-header__inner">
          <p className="page-header__eyebrow">Inventory</p>
          <h1 className="page-header__title">Add new car part</h1>
          <p className="page-header__description">
            Add one or more parts to the preview list, review them, then confirm
            to save.
          </p>
        </div>
      </div>

      <main className="page-main">
        <section className="section-card--full">
          <form onSubmit={onAddToPreview} noValidate className="add-part-form">
            <div className="add-part-form__fields">
              <label className="form-field add-part-form__field--wide">
                <RequiredLabel>Car part</RequiredLabel>
                <input
                  type="text"
                  {...register('carPart', carPartRules)}
                  className={fieldClass(Boolean(errors.carPart))}
                  placeholder="e.g. Brake Rotor"
                />
                <FieldError message={errors.carPart?.message} />
              </label>
              <label className="form-field">
                <RequiredLabel>Brand</RequiredLabel>
                <input
                  type="text"
                  {...register('brand', brandRules)}
                  className={fieldClass(Boolean(errors.brand))}
                  placeholder="e.g. Bosch"
                />
                <FieldError message={errors.brand?.message} />
              </label>
              <label className="form-field">
                <RequiredLabel>Category</RequiredLabel>
                <select
                  {...register('category', categoryRules)}
                  className={fieldClass(Boolean(errors.category))}
                >
                  {inventoryCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.category?.message} />
              </label>
              <label className="form-field">
                <RequiredLabel>Price</RequiredLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('price', priceStringRules)}
                  className={fieldClass(Boolean(errors.price))}
                  placeholder="0.00"
                />
                <FieldError message={errors.price?.message} />
              </label>
              <label className="form-field">
                <span className="form-label">Quantity</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('quantity', quantityRules)}
                  className={fieldClass(Boolean(errors.quantity))}
                  placeholder="0"
                />
                <FieldError message={errors.quantity?.message} />
              </label>
              <label className="form-field add-part-form__field--wide">
                <span className="form-label">
                  Availability status
                </span>
                <select
                  {...register('availabilityStatus')}
                  className="form-input"
                >
                  {availabilityOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="add-part-form__actions">
                <Button type="submit" variant="primary" icon={<PlusIcon />}>
                  Add to preview
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onNavigate('inventory')}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="add-part-form__sidebar">
              <RequiredLabel>Part picture</RequiredLabel>
              <Controller
                name="imageUrl"
                control={control}
                rules={imageUrlRules}
                render={({ field, fieldState }) => (
                  <>
                    <PictureDropzone
                      className="mt-2"
                      imageUrl={field.value}
                      validationError={fieldState.error?.message}
                      onImageUrlChange={field.onChange}
                      previewAlt={carPartValue.trim() || 'Part preview'}
                      previewId="add-preview"
                    />
                    <label className="picture-dropzone__url-label">
                      <span className="picture-dropzone__url-label-text">
                        Or paste an image URL
                      </span>
                      <input
                        type="url"
                        value={
                          field.value.startsWith('data:') ? '' : field.value
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className={fieldClass(Boolean(fieldState.error))}
                        placeholder="https://example.com/part-image.jpg"
                      />
                    </label>
                    <FieldError message={fieldState.error?.message} />
                  </>
                )}
              />
            </div>
          </form>

          {showConfirm && (
            <div className="add-part-preview-footer">
              <PartPreviewTable
                title="Parts to be added"
                description="Review the list below. Confirm to save all parts to inventory, or remove any you do not want."
                parts={draftParts}
                badge="New"
                onRemove={removeDraft}
              />
            </div>
          )}

          {draftParts.length > 0 && (
            <div className="section-card__footer-row">
              <Button variant="accent" onClick={handleConfirm}>
                Confirm and save ({draftParts.length})
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDraftParts([])
                  setShowConfirm(false)
                }}
              >
                Clear preview
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
