import type { AvailabilityStatus, InventoryPart } from '../Database/InventoryData'

const ALERT_EMAIL_TO = 'jaycenca.github@gmail.com'
const SHOP_PHONE = '+15551234567'
const EMAIL_API_URL = '/api/notify/email'

export type StockNotificationResult = {
  partId: string
  carPart: string
  brand: string
  status: AvailabilityStatus
  quantity: number
  textSent: boolean
  emailSent: boolean
  sentAt: string
}

const ALERT_STATUSES: AvailabilityStatus[] = ['Low Stock', 'Out of Stock']

function isAlertStatus(status: AvailabilityStatus): boolean {
  return ALERT_STATUSES.includes(status)
}

function buildAlertContent(part: InventoryPart) {
  const urgency =
    part.availabilityStatus === 'Out of Stock' ? 'URGENT' : 'WARNING'

  const subject = `[${urgency}] ${part.availabilityStatus}: ${part.carPart}`
  const body = [
    `AutoShop IMS — Stock Alert Report`,
    ``,
    `Part: ${part.carPart}`,
    `Brand: ${part.brand}`,
    `Status: ${part.availabilityStatus}`,
    `Quantity on hand: ${part.quantity}`,
    `Category: ${part.category}`,
    ``,
    `Please reorder or update inventory as soon as possible.`,
  ].join('\n')

  const sms = `${urgency}: ${part.carPart} (${part.brand}) is ${part.availabilityStatus}. Qty: ${part.quantity}.`

  return { subject, body, sms }
}

async function sendTextNotification(
  message: string,
  phone: string,
): Promise<boolean> {
  // Replace with Twilio, SNS, or your SMS provider API.
  console.info(`[SMS → ${phone}]`, message)
  return true
}

async function sendEmailNotification(
  subject: string,
  body: string,
  email: string = ALERT_EMAIL_TO,
): Promise<boolean> {
  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, to: email }),
    })

    if (!response.ok) {
      console.error('[Email] API error:', response.status, await response.text())
      return false
    }

    const data = (await response.json()) as { emailSent?: boolean }
    return Boolean(data.emailSent)
  } catch (error) {
    console.error(
      '[Email] Failed to reach notification API. Is the server running? (npm run server)',
      error,
    )
    return false
  }
}

export async function sendStockAlertNotification(
  part: InventoryPart,
): Promise<StockNotificationResult | null> {
  if (!isAlertStatus(part.availabilityStatus)) {
    return null
  }

  const { subject, body, sms } = buildAlertContent(part)

  const [textSent, emailSent] = await Promise.all([
    sendTextNotification(sms, SHOP_PHONE),
    sendEmailNotification(subject, body, ALERT_EMAIL_TO),
  ])

  return {
    partId: part.id,
    carPart: part.carPart,
    brand: part.brand,
    status: part.availabilityStatus,
    quantity: part.quantity,
    textSent,
    emailSent,
    sentAt: new Date().toISOString(),
  }
}

export async function sendStockAlertReport(
  parts: InventoryPart[],
): Promise<StockNotificationResult[]> {
  const alertParts = parts.filter((part) => isAlertStatus(part.availabilityStatus))

  if (alertParts.length === 0) {
    return []
  }

  const subject = `AutoShop IMS — Stock Alert Report (${alertParts.length} items)`
  const body = [
    `AutoShop IMS — Stock Alert Report`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `The following parts require attention:`,
    ``,
    ...alertParts.map(
      (part, index) =>
        `${index + 1}. ${part.carPart} (${part.brand})\n   Status: ${part.availabilityStatus}\n   Quantity: ${part.quantity}\n   Category: ${part.category}`,
    ),
    ``,
    `Please reorder or update inventory as soon as possible.`,
  ].join('\n')

  const emailSent = await sendEmailNotification(subject, body, ALERT_EMAIL_TO)
  const sentAt = new Date().toISOString()

  return alertParts.map((part) => ({
    partId: part.id,
    carPart: part.carPart,
    brand: part.brand,
    status: part.availabilityStatus,
    quantity: part.quantity,
    textSent: false,
    emailSent,
    sentAt,
  }))
}
