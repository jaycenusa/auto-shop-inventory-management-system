import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import AppHeader, { type AppHeaderProps } from '../Pages/Header'
import PartCompareTable, { getPartChanges } from './PartCompareTable'
import Filter, {
  emptyInventoryFilters,
  filterInventoryParts,
  hasActiveInventoryFilters,
  useBrandOptions,
} from '../Shared/Filter'
import {
  availabilityOptions,
  inventoryCategories,
  type InventoryPart,
} from '../Database/InventoryData'
import PictureDropzone from '../Shared/PictureDropzone'
import Button from '../Shared/Button'
import {
  brandRules,
  carPartRules,
  categoryRules,
  countInvalidPartRows,
  imageUrlRules,
  modifyPartsValidationMessage,
  priceNumberRules,
  quantityNumberRules,
} from '../Utils/PartValidation'

type ModifyCarPartProps = AppHeaderProps & {
  parts: InventoryPart[]
  setParts: Dispatch<SetStateAction<InventoryPart[]>>
}

type ModifyPartsFormValues = {
  parts: InventoryPart[]
}

const cellInputClass =
  'w-full min-w-[5rem] rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'

const cellInputErrorClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500'

function cellClass(hasError: boolean) {
  return `${cellInputClass} ${hasError ? cellInputErrorClass : ''}`
}

function RequiredHeader({ children }: { children: ReactNode }) {
  return (
    <>
      {children} <span className="text-red-600">*</span>
    </>
  )
}

export default function ModifyCarPart({
  activePage,
  onNavigate,
  inventoryCategory,
  onSelectInventoryCategory,
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
    <div className="min-h-svh w-full bg-slate-100 text-slate-900">
      <AppHeader
        activePage={activePage}
        onNavigate={onNavigate}
        inventoryCategory={inventoryCategory}
        onSelectInventoryCategory={onSelectInventoryCategory}
        inventoryFilters={inventoryFilters}
        onInventorySearchChange={onInventorySearchChange}
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-600">
            Inventory
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Modify car parts
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Filter parts, edit multiple items, preview changes, then confirm.
          </p>
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <Filter
              filters={filters}
              brandOptions={brandOptions}
              onChange={setFilters}
              onClear={() => setFilters(emptyInventoryFilters)}
              showClear={hasActiveFilters}
            />
          </div>

          {validationMessage && (
            <div
              className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {validationMessage}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold">
                    <RequiredHeader>Picture</RequiredHeader>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <RequiredHeader>Car part</RequiredHeader>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <RequiredHeader>Brand</RequiredHeader>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <RequiredHeader>Category</RequiredHeader>
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <RequiredHeader>Price</RequiredHeader>
                  </th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-slate-500"
                    >
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
                    <tr key={field.fieldKey} className="hover:bg-slate-50">
                      <td className="px-4 py-2 align-top">
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
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2">
                        <select
                          {...statusField}
                          onChange={(e) => {
                            void statusField.onChange(e)
                            onFieldChange()
                          }}
                          className={cellInputClass}
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

          <div className="flex flex-wrap gap-3 border-t border-slate-200 px-6 py-6">
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
            <div className="border-t border-slate-200 px-6 pb-6">
              <PartCompareTable changes={changes} />
            </div>
          )}

          {showCompare && changes.length > 0 && (
            <div className="flex gap-3 border-t border-slate-200 px-6 py-6">
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
