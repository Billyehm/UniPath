import { createHash } from 'node:crypto'

/**
 * Remita merchant client (RRR generation + status checks).
 *
 * Configure with env vars (set on Vercel, never in the repo):
 *   REMITA_MERCHANT_ID, REMITA_SERVICE_TYPE_ID, REMITA_API_KEY
 *   REMITA_BASE_URL (optional, defaults to the live gateway)
 *
 * The merchant credentials come from Remita when UniPath registers as a biller.
 */

export type RemitaConfig = {
  merchantId: string
  serviceTypeId: string
  apiKey: string
  baseUrl: string
}

export function getRemitaConfig(): RemitaConfig {
  const merchantId = process.env.REMITA_MERCHANT_ID
  const serviceTypeId = process.env.REMITA_SERVICE_TYPE_ID
  const apiKey = process.env.REMITA_API_KEY
  if (!merchantId || !serviceTypeId || !apiKey) {
    throw new Error('Remita is not configured. Set REMITA_MERCHANT_ID, REMITA_SERVICE_TYPE_ID and REMITA_API_KEY.')
  }
  return { merchantId, serviceTypeId, apiKey, baseUrl: process.env.REMITA_BASE_URL || 'https://login.remita.net' }
}

function sha512Hex(input: string): string {
  return createHash('sha512').update(input, 'utf8').digest('hex')
}

export type GenerateRRRInput = {
  orderId: string
  amountNaira: number
  payerName: string
  payerEmail: string
  payerPhone: string
  description: string
}

export type GenerateRRRResult = { rrr: string; raw: unknown }

export async function generateRRR(input: GenerateRRRInput): Promise<GenerateRRRResult> {
  const { merchantId, serviceTypeId, apiKey, baseUrl } = getRemitaConfig()
  const apiHash = sha512Hex(`${merchantId}${serviceTypeId}${input.orderId}${input.amountNaira}${apiKey}`)
  const response = await fetch(`${baseUrl}/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `remitaConsumerKey=${merchantId},remitaConsumerToken=${apiHash}`,
    },
    body: JSON.stringify({
      serviceTypeId,
      amount: String(input.amountNaira),
      orderId: String(input.orderId),
      payerName: input.payerName,
      payerEmail: input.payerEmail,
      payerPhone: input.payerPhone,
      description: input.description,
    }),
  })
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null
  const rrr = typeof data?.RRR === 'string' ? data.RRR : null
  if (!response.ok || !rrr) {
    throw new Error(typeof data?.statusmessage === 'string' ? data.statusmessage : 'Remita could not generate a payment reference.')
  }
  return { rrr, raw: data }
}

export type RRRStatus = 'successful' | 'pending' | 'failed'

export type CheckRRRResult = { status: RRRStatus; raw: unknown }

export async function checkRRRStatus(rrr: string): Promise<CheckRRRResult> {
  const { merchantId, apiKey, baseUrl } = getRemitaConfig()
  const apiHash = sha512Hex(`${rrr}${apiKey}${merchantId}`)
  const response = await fetch(
    `${baseUrl}/remita/exapp/api/v1/send/api/echannelsvc/${merchantId}/${rrr}/${apiHash}/status.reg`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `remitaConsumerKey=${merchantId},remitaConsumerToken=${apiHash}`,
      },
    },
  )
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null
  if (!response.ok || !data) throw new Error('Could not check the payment status with Remita.')
  const code = String(data.statuscode ?? data.status ?? '').toUpperCase()
  const message = String(data.statusmessage ?? data.message ?? '').toLowerCase()
  let status: RRRStatus = 'pending'
  if (code === '00' || code === '025' || message.includes('success') || message.includes('approved')) status = 'successful'
  else if (message.includes('fail') || message.includes('revers') || message.includes('cancel')) status = 'failed'
  return { status, raw: data }
}

export function koboToNaira(kobo: number): number {
  return Math.round(kobo) / 100
}

export function formatNaira(kobo: number): string {
  return `₦${koboToNaira(kobo).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
}
