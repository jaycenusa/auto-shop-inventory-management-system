import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import AppHeader, { type AppHeaderProps } from './Header'
import CustomerVehicleForm from '../Components/CustomerVehicleForm'
import VehicleVinCell from '../Components/VehicleVinCell'
import { getCarBrands, getCarYearOptions } from '../Database/CarCatalog'
import {
  createEmptyCustomer,
  createEmptyTransaction,
  createEmptyVehicle,
  type Customer,
  type CustomerTransaction,
  type CustomerVehicle,
} from '../Database/CustomerData'
import Button, { EditIcon, PlusIcon } from '../Shared/Button'
import TablePagination from '../Shared/TablePagination'
import {
  customerFullNameRules,
  customerPhoneRules,
} from '../Utils/CustomerValidation'
import { usePagination } from '../Utils/usePagination'

type CustomerInfoProps = AppHeaderProps & {
  customerId: string | null
  customers: Customer[]
  setCustomers: Dispatch<SetStateAction<Customer[]>>
  onDone: () => void
}

type CustomerFormValues = {
  fullName: string
  phone: string
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

  const [vehicles, setVehicles] = useState<CustomerVehicle[]>(
    existing?.vehicles ?? [],
  )
  const [transactions, setTransactions] = useState<CustomerTransaction[]>(
    existing?.transactions ?? [],
  )
  const [vehicleDraft, setVehicleDraft] = useState<CustomerVehicle | null>(null)
  const [vehicleFormError, setVehicleFormError] = useState<string | null>(null)

  const carBrands = useMemo(() => getCarBrands(), [])
  const carYearOptions = useMemo(() => getCarYearOptions(), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: {
      fullName: existing?.fullName ?? '',
      phone: existing?.phone ?? '',
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    reset({
      fullName: existing?.fullName ?? '',
      phone: existing?.phone ?? '',
    })
    setVehicles(existing?.vehicles ?? [])
    setTransactions(existing?.transactions ?? [])
    setVehicleDraft(null)
    setVehicleFormError(null)
  }, [customerId, existing, reset])

  const vehiclePagination = usePagination(vehicles)
  const transactionPagination = usePagination(transactions)

  const isEditingVehicle =
    vehicleDraft !== null &&
    vehicles.some((vehicle) => vehicle.id === vehicleDraft.id)

  const openAddVehicle = () => {
    setVehicleFormError(null)
    setVehicleDraft(createEmptyVehicle())
  }

  const openEditVehicle = (vehicle: CustomerVehicle) => {
    setVehicleFormError(null)
    setVehicleDraft({ ...vehicle })
  }

  const cancelVehicleForm = () => {
    setVehicleDraft(null)
    setVehicleFormError(null)
  }

  const saveVehicleDraft = (record: CustomerVehicle) => {
    setVehicles((prev) => {
      const index = prev.findIndex((vehicle) => vehicle.id === record.id)
      if (index === -1) return [...prev, record]
      return prev.map((vehicle) =>
        vehicle.id === record.id ? record : vehicle,
      )
    })
    cancelVehicleForm()
  }

  const removeVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id))
    if (vehicleDraft?.id === id) cancelVehicleForm()
  }

  const onSave = handleSubmit((data) => {
    const record: Customer = {
      id: existing?.id ?? createEmptyCustomer().id,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      vehicles,
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
        if (field === 'vin') {
          return { ...txn, vin: value.toUpperCase() }
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
              ? 'Enter customer details, register vehicles, and record service transactions.'
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

              <label className="form-field customer-info-form__field--wide">
                <RequiredLabel>Phone number</RequiredLabel>
                <input
                  type="tel"
                  {...register('phone', customerPhoneRules)}
                  className={fieldClass(Boolean(errors.phone))}
                  placeholder="(555) 123-4567"
                />
                <FieldError message={errors.phone?.message} />
              </label>
            </div>
          </form>

          <div className="px-6 pb-6">
            <div className="customer-transactions__header">
              <h3 className="customer-transactions__title">Vehicles</h3>
              <Button
                type="button"
                variant="accent"
                icon={<PlusIcon />}
                onClick={openAddVehicle}
                disabled={vehicleDraft !== null}
              >
                Add vehicle
              </Button>
            </div>

            {vehicleDraft && (
              <CustomerVehicleForm
                draft={vehicleDraft}
                isEditing={isEditingVehicle}
                carBrands={carBrands}
                carYearOptions={carYearOptions}
                onSave={saveVehicleDraft}
                onCancel={cancelVehicleForm}
                errorMessage={vehicleFormError}
              />
            )}

            {vehicles.length === 0 ? (
              <p className="customer-transactions__empty">
                No vehicles yet. Add a vehicle to link it to this customer.
              </p>
            ) : (
              <>
                <div className="inventory-table-wrap">
                  <table className="inventory-table inventory-table--wide">
                    <thead>
                      <tr className="inventory-table__head-row">
                        <th className="table-cell--header">Car brand</th>
                        <th className="table-cell--header">Car model</th>
                        <th className="table-cell--header">Year</th>
                        <th className="table-cell--header">VIN number</th>
                        <th className="table-cell--header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="inventory-table__body">
                      {vehiclePagination.paginatedItems.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td className="table-cell">{vehicle.carBrand}</td>
                          <td className="table-cell">{vehicle.carModel}</td>
                          <td className="table-cell">
                            {vehicle.carYear > 0 ? vehicle.carYear : '—'}
                          </td>
                          <td className="table-cell">
                            <VehicleVinCell vin={vehicle.vin} />
                          </td>
                          <td className="table-cell">
                            <div className="customers-table__actions">
                              <Button
                                type="button"
                                variant="secondary"
                                icon={<EditIcon />}
                                onClick={() => openEditVehicle(vehicle)}
                                disabled={vehicleDraft !== null}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => removeVehicle(vehicle.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  totalItems={vehicles.length}
                  itemLabel="vehicles"
                  rangeStart={vehiclePagination.rangeStart}
                  rangeEnd={vehiclePagination.rangeEnd}
                  currentPage={vehiclePagination.currentPage}
                  totalPages={vehiclePagination.totalPages}
                  pageSize={vehiclePagination.pageSize}
                  onPageChange={vehiclePagination.goToPage}
                  onPageSizeChange={vehiclePagination.handlePageSizeChange}
                  pageSizeLabel="Vehicles per page"
                />
              </>
            )}
          </div>
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
              <>
                <div className="inventory-table-wrap">
                  <table className="inventory-table inventory-table--wide">
                    <thead>
                      <tr className="inventory-table__head-row">
                        <th className="table-cell--header">Date</th>
                        <th className="table-cell--header">Description</th>
                        <th className="table-cell--header">VIN number</th>
                        <th className="table-cell--header">Cost</th>
                        <th className="table-cell--header">Down payment</th>
                        <th className="table-cell--header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="inventory-table__body">
                      {transactionPagination.paginatedItems.map((txn) => (
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
                              type="text"
                              value={txn.vin}
                              onChange={(e) =>
                                updateTransaction(txn.id, 'vin', e.target.value)
                              }
                              className="form-cell-input"
                              placeholder="VIN"
                              maxLength={17}
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
                <TablePagination
                  totalItems={transactions.length}
                  itemLabel="transactions"
                  rangeStart={transactionPagination.rangeStart}
                  rangeEnd={transactionPagination.rangeEnd}
                  currentPage={transactionPagination.currentPage}
                  totalPages={transactionPagination.totalPages}
                  pageSize={transactionPagination.pageSize}
                  onPageChange={transactionPagination.goToPage}
                  onPageSizeChange={transactionPagination.handlePageSizeChange}
                  pageSizeLabel="Transactions per page"
                />
              </>
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
