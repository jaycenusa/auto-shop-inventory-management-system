import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import AppHeader, { type AppHeaderProps } from '../pages/header'
import PartCompareTable, { getPartChanges } from './part-compare-table'
import Filter, {
  emptyInventoryFilters,
  filterInventoryParts,
  hasActiveInventoryFilters,
  useBrandOptions,
} from '../shared/filter'
import {
  availabilityOptions,
  inventoryCategories,
  type InventoryPart,
} from '../database/InventoryData'
import PictureDropzone from '../shared/picture-dropzone'
import Button from '../shared/button'
import {
  brandRules,
  carPartRules,
  categoryRules,
  countInvalidPartRows,
  imageUrlRules,
  modifyPartsValidationMessage,
  priceNumberRules,
  quantityNumberRules,
} from '../utils/part-validation'

type ModifyCarPartProps = AppHeaderProps & {
  parts: InventoryPart[]
  setParts: Dispatch<SetStateAction<InventoryPart[]>>
}

type ModifyPartsFormValues = {
  parts: InventoryPart[]
}

function cellClass(hasError: boolean) {
  return `form-cell-input${hasError ? ' form-cell-input--error' : ''}`
}

function RequiredHeader({ children }: { children: ReactNode }) {
  return (
    <>
      {children} <span className="form-required-mark">*</span>
    </>
  )
}

export default function ModifyCarPart({
  activePage,
  onNavigate,
  inventoryCategory,
  inventoryFilters,
  onInventorySearchChange,
  parts,
  setParts,
}: ModifyCarPartProps) {
  const [filters, setFilters] = useState(emptyInventoryFilters)
  const [showCompare, setShowCompare] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )

  const brandOptions = useBrandOptions(parts)

  const filteredOriginals = useMemo(
    () => filterInventoryParts(parts, filters, inventoryCategory),
    [parts, filters, inventoryCategory],
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ModifyPartsFormValues>({
    defaultValues: { parts: [] },
    mode: 'onSubmit',
  })

  const { fields } = useFieldArray({
    control,
    name: 'parts',
    keyName: 'fieldKey',
  })

  useEffect(() => {
    reset({ parts: filteredOriginals.map((p) => ({ ...p })) })
    setShowCompare(false)
    setValidationMessage(null)
  }, [filteredOriginals, reset])

  const watchedParts = watch('parts')

  const changes = useMemo(
    () => getPartChanges(filteredOriginals, watchedParts ?? []),
    [filteredOriginals, watchedParts],
  )

  const runValidation = (): Promise<boolean> =>
    new Promise((resolve) => {
      void handleSubmit(
        () => {
          setValidationMessage(null)
          resolve(true)
        },
        (formErrors) => {
          const invalidCount = countInvalidPartRows(formErrors.parts)
          setValidationMessage(modifyPartsValidationMessage(invalidCount))
          resolve(false)
        },
      )()
    })

  const handlePreview = async () => {
    if (changes.length === 0) return
    setShowCompare(false)
    if (!(await runValidation())) return
    setShowCompare(true)
  }

  const handleConfirm = async () => {
    if (!(await runValidation())) return
    const editMap = new Map(getValues('parts').map((p) => [p.id, p]))
    setParts((prev) => prev.map((p) => editMap.get(p.id) ?? p))
    onNavigate('inventory')
  }

  const onFieldChange = () => {
    setShowCompare(false)
    setValidationMessage(null)
  }

  const hasActiveFilters = hasActiveInventoryFilters(filters)

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
          <h1 className="page-header__title">Modify car parts</h1>
          <p className="page-header__description">
            Filter parts, edit multiple items, preview changes, then confirm.
          </p>
        </div>
      </div>

      <main className="page-main">
        <section className="section-card--full">
          <div className="section-card__header">
            <Filter
              filters={filters}
              brandOptions={brandOptions}
              onChange={setFilters}
              onClear={() => setFilters(emptyInventoryFilters)}
              showClear={hasActiveFilters}
            />
          </div>

          {validationMessage && (
            <div className="alert-error" role="alert">
              {validationMessage}
            </div>
          )}

          <div className="modify-table-scroll">
            <table className="modify-table">
              <thead>
                <tr className="modify-table__head-row">
                  <th className="modify-table__th">
                    <RequiredHeader>Picture</RequiredHeader>
                  </th>
                  <th className="modify-table__th">
                    <RequiredHeader>Car part</RequiredHeader>
                  </th>
                  <th className="modify-table__th">
                    <RequiredHeader>Brand</RequiredHeader>
                  </th>
                  <th className="modify-table__th">
                    <RequiredHeader>Category</RequiredHeader>
                  </th>
                  <th className="modify-table__th">
                    <RequiredHeader>Price</RequiredHeader>
                  </th>
                  <th className="modify-table__th">Quantity</th>
                  <th className="modify-table__th">Status</th>
                </tr>
              </thead>
              <tbody className="modify-table__body">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="modify-table__empty">
                      No parts match your filters.
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => {
                    const carPartField = register(
                      `parts.${index}.carPart`,
                      carPartRules,
                    )
                    const brandField = register(`parts.${index}.brand`, brandRules)
                    const categoryField = register(
                      `parts.${index}.category`,
                      categoryRules,
                    )
                    const priceField = register(
                      `parts.${index}.price`,
                      priceNumberRules,
                    )
                    const quantityField = register(
                      `parts.${index}.quantity`,
                      quantityNumberRules,
                    )
                    const statusField = register(
                      `parts.${index}.availabilityStatus`,
                    )

                    return (
                    <tr key={field.fieldKey} className="modify-table__row">
                      <td className="modify-table__cell modify-table__cell--top">
                        <Controller
                          name={`parts.${index}.imageUrl`}
                          control={control}
                          rules={imageUrlRules}
                          render={({ field: imageField, fieldState }) => (
                            <PictureDropzone
                              compact
                              previewId={field.id}
                              imageUrl={imageField.value}
                              validationError={fieldState.error?.message}
                              onImageUrlChange={(url) => {
                                imageField.onChange(url)
                                onFieldChange()
                              }}
                              previewAlt={watchedParts?.[index]?.carPart ?? ''}
                            />
                          )}
                        />
                      </td>
                      <td className="modify-table__cell">
                        <input
                          type="text"
                          {...carPartField}
                          onChange={(e) => {
                            void carPartField.onChange(e)
                            onFieldChange()
                          }}
                          className={cellClass(
                            Boolean(errors.parts?.[index]?.carPart),
                          )}
                        />
                      </td>
                      <td className="modify-table__cell">
                        <input
                          type="text"
                          {...brandField}
                          onChange={(e) => {
                            void brandField.onChange(e)
                            onFieldChange()
                          }}
                          className={cellClass(
                            Boolean(errors.parts?.[index]?.brand),
                          )}
                        />
                      </td>
                      <td className="modify-table__cell">
                        <select
                          {...categoryField}
                          onChange={(e) => {
                            void categoryField.onChange(e)
                            onFieldChange()
                          }}
                          className={cellClass(
                            Boolean(errors.parts?.[index]?.category),
                          )}
                        >
                          {inventoryCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="modify-table__cell">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...priceField}
                          onChange={(e) => {
                            void priceField.onChange(e)
                            onFieldChange()
                          }}
                          className={cellClass(
                            Boolean(errors.parts?.[index]?.price),
                          )}
                        />
                      </td>
                      <td className="modify-table__cell">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          {...quantityField}
                          onChange={(e) => {
                            void quantityField.onChange(e)
                            onFieldChange()
                          }}
                          className={cellClass(
                            Boolean(errors.parts?.[index]?.quantity),
                          )}
                        />
                      </td>
                      <td className="modify-table__cell">
                        <select
                          {...statusField}
                          onChange={(e) => {
                            void statusField.onChange(e)
                            onFieldChange()
                          }}
                          className="form-cell-input"
                        >
                          {availabilityOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="section-card__footer">
            <Button
              variant="primary"
              onClick={() => void handlePreview()}
              disabled={changes.length === 0}
            >
              Preview changes ({changes.length})
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('inventory')}>
              Cancel
            </Button>
          </div>

          {showCompare && (
            <div className="modify-compare-footer">
              <PartCompareTable changes={changes} />
            </div>
          )}

          {showCompare && changes.length > 0 && (
            <div className="section-card__footer-row">
              <Button variant="accent" onClick={() => void handleConfirm()}>
                Confirm changes
              </Button>
              <Button variant="secondary" onClick={() => setShowCompare(false)}>
                Back to editing
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
