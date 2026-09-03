import { useMemo, useState } from 'react'
import { CAR_BRANDS } from '../constant/vehicles'
import { useLang } from '../i18n/lang-context'
import { isValidVin, sanitizeVin } from '../utils/vin'
import {
  addRecentVehicle,
  isUsableDecode,
  toLookupVehicle,
  toManualVehicle,
  type LookupVehicle,
} from '../utils/vin-lookup'
import { useVehicleByVin, type VehicleByVinSources } from './use-vehicle-by-vin'

/** Identification happens by VIN decode or by picking brand, model and year. */
export type VehicleEntryTab = 'vin' | 'manual'

/** Both views show compatible parts only, so skip the recall/safety calls. */
const DECODE_ONLY: VehicleByVinSources = {
  recalls: false,
  safety: false,
  parts: false,
}

/** Enough characters to be worth a decode attempt, matching the design. */
export const MIN_DECODE_LENGTH = 11

/** Line a decoded make up with the brand list so the select can preselect it. */
function matchBrand(make: string): string {
  return CAR_BRANDS.find(b => b.toLowerCase() === make.toLowerCase()) ?? make
}

/**
 * The vehicle identification flow shared by the owner VIN Lookup page and the
 * customer portal: decode a VIN or pick brand/model/year, correct the result,
 * then confirm it to browse parts. Owns only identification, so each view keeps
 * its own search, category and layout state.
 */
export function useVehicleIdentification() {
  const t = useLang()

  const [entryTab, setEntryTab] = useState<VehicleEntryTab>('vin')
  const [vinInput, setVinInput] = useState('')
  const [submittedVin, setSubmittedVin] = useState<string | null>(null)
  const [decoded, setDecoded] = useState<LookupVehicle | null>(null)
  const [inputError, setInputError] = useState('')
  const [recent, setRecent] = useState<LookupVehicle[]>([])
  const [manualBrand, setManualBrand] = useState('')
  const [manualModel, setManualModel] = useState('')
  const [manualYear, setManualYear] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const { vehicle, loading, errors, reload } = useVehicleByVin({
    vin: submittedVin,
    sources: DECODE_ONLY,
  })

  // A fresh decode prefills the manual selects so the vehicle can be corrected
  // before browsing parts. Adjusted during render rather than in an effect, so
  // the panel never paints with the previous vehicle still selected.
  const [syncedVehicle, setSyncedVehicle] = useState(vehicle)
  if (vehicle !== syncedVehicle) {
    setSyncedVehicle(vehicle)
    if (vehicle && isUsableDecode(vehicle)) {
      const lookup = toLookupVehicle(vehicle)
      setDecoded(lookup)
      setInputError('')
      setRecent(prev => addRecentVehicle(prev, lookup))
      setManualBrand(matchBrand(lookup.make))
      setManualModel(lookup.model)
      setManualYear(lookup.year)
      setEntryTab('manual')
      setConfirmed(false)
    } else if (vehicle) {
      setDecoded(null)
      setInputError(t('vinErrorNotFound'))
    }
  }

  const manualVehicle = toManualVehicle(manualBrand, manualModel, manualYear)
  const activeVehicle = confirmed ? (decoded ?? manualVehicle) : null
  const sanitizedVin = useMemo(() => sanitizeVin(vinInput), [vinInput])

  function changeVinInput(value: string) {
    setVinInput(value.toUpperCase())
    setInputError('')
  }

  function decode(vin?: string) {
    const next = sanitizeVin(vin ?? vinInput)
    if (vin) setVinInput(next)
    if (!isValidVin(next)) {
      setInputError(t('vinInvalid'))
      return
    }
    setInputError('')
    setDecoded(null)
    setConfirmed(false)
    if (next === submittedVin) reload()
    else setSubmittedVin(next)
  }

  function selectRecent(entry: LookupVehicle) {
    setVinInput(entry.vin)
    setDecoded(entry)
    setManualBrand(matchBrand(entry.make))
    setManualModel(entry.model)
    setManualYear(entry.year)
    setEntryTab('manual')
    setConfirmed(false)
  }

  /** Any manual edit invalidates the decode it was prefilled from. */
  function editManual(apply: () => void) {
    apply()
    setDecoded(null)
    setConfirmed(false)
  }

  function clear() {
    setVinInput('')
    setSubmittedVin(null)
    setDecoded(null)
    setInputError('')
    setManualBrand('')
    setManualModel('')
    setManualYear('')
    setConfirmed(false)
    setEntryTab('vin')
  }

  return {
    entryTab,
    selectTab: setEntryTab,

    vinInput,
    changeVinInput,
    /** Count of legal VIN characters entered, for the `n/17` indicator. */
    vinCharCount: sanitizedVin.length,
    canDecode: sanitizedVin.length >= MIN_DECODE_LENGTH && !loading,
    decoding: loading,
    /** Translated message for a rejected input or a failed decode. */
    error: inputError || (errors.vehicle ? t('vinErrorNetwork') : ''),
    decode,

    manualBrand,
    manualModel,
    manualYear,
    selectBrand: (brand: string) =>
      editManual(() => {
        setManualBrand(brand)
        setManualModel('')
        setManualYear('')
      }),
    selectModel: (model: string) =>
      editManual(() => {
        setManualModel(model)
        setManualYear('')
      }),
    selectYear: (year: string) => editManual(() => setManualYear(year)),

    /** Complete brand/model/year selection, awaiting confirmation. */
    manualVehicle,
    /** The vehicle to browse parts for, once confirmed. */
    activeVehicle,
    confirm: () => setConfirmed(true),
    clear,

    recent,
    selectRecent,
  }
}
