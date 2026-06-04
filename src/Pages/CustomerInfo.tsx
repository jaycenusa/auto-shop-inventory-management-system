import { useEffect, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import AppHeader, { type AppHeaderProps } from './Header'
import {
  createEmptyCustomer,
  createEmptyTransaction,
  type Customer,
  type CustomerTransaction,
} from '../Database/CustomerData'
import Button, { PlusIcon } from '../Shared/Button'
import {
  customerCarBrandRules,
  customerCarModelRules,
  customerFullNameRules,
  customerPhoneRules,
  customerVinRules,
} from '../Utils/CustomerValidation'

type CustomerInfoProps = AppHeaderProps & {
  customerId: string | null
  customers: Customer[]
  setCustomers: Dispatch<SetStateAction<Customer[]>>
  onDone: () => void
}

type CustomerFormValues = {
  fullName: string
  phone: string
  carBrand: string
  carModel: string
  vin: string
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

export default function CustomerInfo({
  activePage,
  onNavigate,
  inventoryCategory,
  inventoryFilters,
  onInventorySearchChange,
  customerId,
  customers,
  setCustomers,
  onDone,
}: CustomerInfoProps) {
  const existing = customerId
    ? customers.find((c) => c.id === customerId)
    : undefined

  const isNew = !existing

  const [transactions, setTransactions] = useState<CustomerTransaction[]>(
    existing?.transactions ?? [],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: {
      fullName: existing?.fullName ?? '',
      phone: existing?.phone ?? '',
      carBrand: existing?.carBrand ?? '',
      carModel: existing?.carModel ?? '',
      vin: existing?.vin ?? '',
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    reset({
      fullName: existing?.fullName ?? '',
      phone: existing?.phone ?? '',
      carBrand: existing?.carBrand ?? '',
      carModel: existing?.carModel ?? '',
      vin: existing?.vin ?? '',
    })
    setTransactions(existing?.transactions ?? [])
  }, [customerId, existing, reset])

  const onSave = handleSubmit((data) => {
    const record: Customer = {
      id: existing?.id ?? createEmptyCustomer().id,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      carBrand: data.carBrand.trim(),
      carModel: data.carModel.trim(),
      vin: data.vin.trim().toUpperCase(),
      transactions,
    }

    setCustomers((prev) => {
      const index = prev.findIndex((c) => c.id === record.id)
      if (index === -1) return [...prev, record]
      return prev.map((c) => (c.id === record.id ? record : c))
    })

    onDone()
  })

  const updateTransaction = (
    id: string,
    field: keyof CustomerTransaction,
    value: string,
  ) => {
    setTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id !== id) return txn
        if (field === 'cost' || field === 'downPayment') {
          const parsed = parseFloat(value)
          return { ...txn, [field]: Number.isNaN(parsed) ? 0 : parsed }
        }
        return { ...txn, [field]: value }
      }),
    )
  }

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((txn) => txn.id !== id))
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
          <p className="page-header__eyebrow">Customers</p>
          <h1 className="page-header__title">
            {isNew ? 'New customer' : 'Edit customer'}
          </h1>
          <p className="page-header__description">
            {isNew
              ? 'Enter customer and vehicle details, then add service transactions.'
              : `Updating ${existing?.fullName ?? 'customer'} records.`}
          </p>
        </div>
      </div>

      <main className="page-main">
        <section className="section-card">
          <div className="section-card__header">
            <h2 className="customers-toolbar__title">Customer information</h2>
          </div>

          <form className="px-6 py-6" onSubmit={onSave} noValidate>
            <div className="customer-info-form">
              <label className="form-field customer-info-form__field--wide">
                <RequiredLabel>Full name</RequiredLabel>
                <input
                  type="text"
                  {...register('fullName', customerFullNameRules)}
                  className={fieldClass(Boolean(errors.fullName))}
                  placeholder="Jane Doe"
                />
                <FieldError message={errors.fullName?.message} />
              </label>

              <label className="form-field">
                <RequiredLabel>Phone number</RequiredLabel>
                <input
                  type="tel"
                  {...register('phone', customerPhoneRules)}
                  className={fieldClass(Boolean(errors.phone))}
                  placeholder="(555) 123-4567"
                />
                <FieldError message={errors.phone?.message} />
              </label>

              <label className="form-field">
                <RequiredLabel>Car brand</RequiredLabel>
                <input
                  type="text"
                  {...register('carBrand', customerCarBrandRules)}
                  className={fieldClass(Boolean(errors.carBrand))}
                  placeholder="Toyota"
                />
                <FieldError message={errors.carBrand?.message} />
              </label>

              <label className="form-field">
                <RequiredLabel>Car model</RequiredLabel>
                <input
                  type="text"
                  {...register('carModel', customerCarModelRules)}
                  className={fieldClass(Boolean(errors.carModel))}
                  placeholder="Camry"
                />
                <FieldError message={errors.carModel?.message} />
              </label>

              <label className="form-field customer-info-form__field--wide">
                <RequiredLabel>VIN number</RequiredLabel>
                <input
                  type="text"
                  {...register('vin', customerVinRules)}
                  className={fieldClass(Boolean(errors.vin))}
                  placeholder="17-character VIN"
                />
                <FieldError message={errors.vin?.message} />
              </label>
            </div>

          </form>
        </section>

        <section className="section-card mt-6">
          <div className="section-card__header customer-transactions__header">
            <h2 className="customer-transactions__title">Transactions</h2>
            <Button
              type="button"
              variant="accent"
              icon={<PlusIcon />}
              onClick={() =>
                setTransactions((prev) => [...prev, createEmptyTransaction()])
              }
            >
              Add transaction
            </Button>
          </div>

          <div className="px-6 pb-6">
            {transactions.length === 0 ? (
              <p className="customer-transactions__empty">
                No transactions yet. Use Add transaction to record a service.
              </p>
            ) : (
              <div className="inventory-table-wrap">
                <table className="inventory-table inventory-table--wide">
                  <thead>
                    <tr className="inventory-table__head-row">
                      <th className="table-cell--header">Date</th>
                      <th className="table-cell--header">Description</th>
                      <th className="table-cell--header">Cost</th>
                      <th className="table-cell--header">Down payment</th>
                      <th className="table-cell--header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="inventory-table__body">
                    {transactions.map((txn) => (
                      <tr key={txn.id}>
                        <td className="table-cell">
                          <input
                            type="date"
                            value={txn.date}
                            onChange={(e) =>
                              updateTransaction(txn.id, 'date', e.target.value)
                            }
                            className="form-cell-input"
                          />
                        </td>
                        <td className="table-cell">
                          <input
                            type="text"
                            value={txn.description}
                            onChange={(e) =>
                              updateTransaction(
                                txn.id,
                                'description',
                                e.target.value,
                              )
                            }
                            className="form-cell-input"
                            placeholder="Service description"
                          />
                        </td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={txn.cost}
                            onChange={(e) =>
                              updateTransaction(txn.id, 'cost', e.target.value)
                            }
                            className="form-cell-input"
                          />
                        </td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={txn.downPayment}
                            onChange={(e) =>
                              updateTransaction(
                                txn.id,
                                'downPayment',
                                e.target.value,
                              )
                            }
                            className="form-cell-input"
                          />
                        </td>
                        <td className="table-cell">
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => removeTransaction(txn.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <div className="customer-info-actions mt-6 px-0">
          <Button variant="primary" onClick={onSave}>
            {isNew ? 'Save customer' : 'Save changes'}
          </Button>
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </main>
    </div>
  )
}
