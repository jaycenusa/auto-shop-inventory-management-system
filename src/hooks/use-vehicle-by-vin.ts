import { useCallback, useEffect, useMemo, useState } from 'react'
import { partService } from '../service/part-service'
import { vehicleRecallService } from '../service/vehicle-recall-service'
import { vehicleSafetyRatingService } from '../service/vehicle-safety-rating-service'
import { vehicleServiceByVin } from '../service/vehicle-service-by-vin'
import {
  toPartListFilters,
  toRecallQuery,
  toVehicleLabel,
} from '../service/vin-request-mapping'
import type { Part } from '../types/part'
import type { VehicleByVin } from '../types/vehicle-by-vin'
import type { VehicleRecall } from '../types/vehicle-recall'
import type { VehicleSafetyRatingLookup } from '../types/vehicle-safety-rating'
import { isDecodableVin, normalizeVin } from '../utils/vin'

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function settledError(result: PromiseSettledResult<unknown>): Error | null {
  return result.status === 'rejected' ? toError(result.reason) : null
}

/** One entry per downstream source so consumers can render `-` per source. */
export type VehicleByVinErrors = {
  vehicle: Error | null
  recalls: Error | null
  safety: Error | null
  parts: Error | null
}

const NO_ERRORS: VehicleByVinErrors = {
  vehicle: null,
  recalls: null,
  safety: null,
  parts: null,
}

/** Downstream sources to request after a successful decode. */
export type VehicleByVinSources = {
  recalls?: boolean
  safety?: boolean
  parts?: boolean
}

export type UseVehicleByVinOptions = {
  /** VIN to decode; `null`, blank or malformed values skip all requests. */
  vin?: string | null
  /**
   * Opt out of sources a consumer does not render, so it pays for only the
   * requests it uses. Every source is requested by default.
   */
  sources?: VehicleByVinSources
}

/**
 * Decode a VIN, then fan the decoded make/model/year out to NHTSA recalls,
 * NHTSA safety ratings and matching inventory parts. Sources settle
 * independently, so one failing API does not blank the others.
 */
export function useVehicleByVin({
  vin = null,
  sources = {},
}: UseVehicleByVinOptions = {}) {
  const normalizedVin = useMemo(
    () => (vin == null ? '' : normalizeVin(vin)),
    [vin],
  )
  const shouldFetch = normalizedVin !== '' && isDecodableVin(normalizedVin)
  // Read as primitives so an inline `sources` object cannot retrigger fetches.
  const wantRecalls = sources.recalls ?? true
  const wantSafety = sources.safety ?? true
  const wantParts = sources.parts ?? true

  const [vehicle, setVehicle] = useState<VehicleByVin | null>(null)
  const [recalls, setRecalls] = useState<VehicleRecall[]>([])
  const [safety, setSafety] = useState<VehicleSafetyRatingLookup | null>(null)
  const [matchedParts, setMatchedParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<VehicleByVinErrors>(NO_ERRORS)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!shouldFetch) {
      setVehicle(null)
      setRecalls([])
      setSafety(null)
      setMatchedParts([])
      setErrors(NO_ERRORS)
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErrors(NO_ERRORS)

      let decoded: VehicleByVin
      try {
        decoded = await vehicleServiceByVin.decodeByVin(normalizedVin)
      } catch (e) {
        if (!cancelled) {
          setVehicle(null)
          setRecalls([])
          setSafety(null)
          setMatchedParts([])
          setErrors({ ...NO_ERRORS, vehicle: toError(e) })
          setLoading(false)
        }
        return
      }

      if (cancelled) return
      setVehicle(decoded)

      const recallQuery = wantRecalls ? toRecallQuery(decoded) : null
      const [recallResult, safetyResult, partsResult] = await Promise.allSettled(
        [
          recallQuery
            ? vehicleRecallService.listByVehicle(recallQuery)
            : Promise.resolve<VehicleRecall[]>([]),
          wantSafety
            ? vehicleSafetyRatingService.findByVehicle(decoded)
            : Promise.resolve(null),
          wantParts
            ? partService.list(toPartListFilters(decoded))
            : Promise.resolve<Part[]>([]),
        ],
      )

      if (cancelled) return
      setRecalls(recallResult.status === 'fulfilled' ? recallResult.value : [])
      setSafety(safetyResult.status === 'fulfilled' ? safetyResult.value : null)
      setMatchedParts(
        partsResult.status === 'fulfilled' ? partsResult.value : [],
      )
      setErrors({
        vehicle: null,
        recalls: settledError(recallResult),
        safety: settledError(safetyResult),
        parts: settledError(partsResult),
      })
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [
    normalizedVin,
    shouldFetch,
    wantRecalls,
    wantSafety,
    wantParts,
    reloadToken,
  ])

  const vehicleLabel = useMemo(
    () => (vehicle ? toVehicleLabel(vehicle) : ''),
    [vehicle],
  )

  const reload = useCallback(() => {
    setReloadToken(t => t + 1)
  }, [])

  return {
    vin: normalizedVin,
    vehicle,
    vehicleLabel,
    recalls,
    safety,
    matchedParts,
    loading,
    errors,
    reload,
  }
}
