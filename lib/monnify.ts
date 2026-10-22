/**
 * Monnify client (one-time payments via hosted checkout).
 *
 * Configure with env vars (set on Vercel, never in the repo):
 *   MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE
 *   MONNIFY_BASE_URL (optional, defaults to the sandbox)
 *   MONNIFY_TEST_MODE=1 (optional, simulates the whole flow with no credentials)
 *
 * Credentials come from the Monnify dashboard (Developers section) after signup.
 */

export type MonnifyConfig = {
  apiKey: string
  secretKey: string
  contractCode: string
  baseUrl: string
}

export function getMonnifyConfig(): MonnifyConfig {
  const apiKey = process.env.MONNIFY_API_KEY
  const secretKey = process.env.MONNIFY_SECRET_KEY
  const contractCode = process.env.MONNIFY_CONTRACT_CODE
  if (!apiKey || !secretKey || !contractCode) {
    throw new Error('Monnify is not configured. Set MONNIFY_API_KEY, MONNIFY_SECRET_KEY and MONNIFY_CONTRACT_CODE.')
  }
  return { apiKey, secretKey, contractCode, baseUrl: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com' }
}

export function isMonnifyTestMode(): boolean {
  return process.env.MONNIFY_TEST_MODE === '1'
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.token
  const { apiKey, secretKey, baseUrl } = getMonnifyConfig()
  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64')
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}` },
  })
  const data = (await response.json().catch(() => null)) as {
    requestSuccessful?: boolean
    responseBody?: { accessToken?: string }
  } | null
  const token = data?.responseBody?.accessToken
  if (!response.ok || !data?.requestSuccessful || !token) throw new Error('Monnify authentication failed.')
  cachedToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 }
  return token
}

export type InitTransactionInput = {
  amountNaira: number
  paymentReference: string
  customerName: string
  customerEmail: string
  paymentDescription: string
  redirectUrl: string
}

export type InitTransactionResult = {
  checkoutUrl: string | null
  transactionReference: string | null
  paymentReference: string
  testMode: boolean
  raw: unknown
}

export async function initTransaction(input: InitTransactionInput): Promise<InitTransactionResult> {
  if (isMonnifyTestMode()) {
    return { checkoutUrl: null, transactionReference: null, paymentReference: input.paymentReference, testMode: true, raw: { testMode: true } }
  }
  const { contractCode, baseUrl } = getMonnifyConfig()
  const token = await getAccessToken()
  const response = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amount: input.amountNaira,
      currencyCode: 'NGN',
      paymentReference: input.paymentReference,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      paymentDescription: input.paymentDescription,
      contractCode,
      redirectUrl: input.redirectUrl,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
    }),
  })
  const data = (await response.json().catch(() => null)) as {
    requestSuccessful?: boolean
    responseMessage?: string
    responseBody?: { checkoutUrl?: string; transactionReference?: string; paymentReference?: string }
  } | null
  const body = data?.responseBody
  if (!response.ok || !data?.requestSuccessful || !body?.checkoutUrl) {
    throw new Error(typeof data?.responseMessage === 'string' && data.responseMessage ? data.responseMessage : 'Monnify could not start the payment.')
  }
  return {
    checkoutUrl: body.checkoutUrl,
    transactionReference: body.transactionReference ?? null,
    paymentReference: body.paymentReference ?? input.paymentReference,
    testMode: false,
    raw: data,
  }
}

export type MonnifyPaymentState = 'PAID' | 'PENDING' | 'FAILED'

export async function queryTransaction(paymentReference: string): Promise<{ status: MonnifyPaymentState; raw: unknown }> {
  if (isMonnifyTestMode()) return { status: 'PAID', raw: { testMode: true } }
  const { baseUrl } = getMonnifyConfig()
  const token = await getAccessToken()
  const response = await fetch(
    `${baseUrl}/api/v2/merchant/transactions/query?paymentReference=${encodeURIComponent(paymentReference)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const data = (await response.json().catch(() => null)) as {
    requestSuccessful?: boolean
    responseBody?: { paymentStatus?: string }
  } | null
  const paymentStatus = String(data?.responseBody?.paymentStatus || '').toUpperCase()
  if (!response.ok || !data?.requestSuccessful) throw new Error('Could not check the payment status with Monnify.')
  const status: MonnifyPaymentState =
    paymentStatus === 'PAID'
      ? 'PAID'
      : /FAIL|CANCEL|EXPIRED|REJECT/.test(paymentStatus)
        ? 'FAILED'
        : 'PENDING'
  return { status, raw: data }
}

export function koboToNaira(kobo: number): number {
  return Math.round(kobo) / 100
}

export function formatNaira(kobo: number): string {
  return `₦${koboToNaira(kobo).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
}
