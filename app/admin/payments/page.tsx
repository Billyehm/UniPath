import { getAdminPayments } from '@/lib/data/admin'
import type { AdminPayment } from '@/lib/models'
import { formatNaira } from '@/lib/monnify'

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) return String((error as { message: unknown }).message)
  return 'Could not load payments.'
}

const statusStyle: Record<string, string> = {
  successful: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-rose-100 text-rose-700',
}

export default async function AdminPaymentsPage() {
  let payments: AdminPayment[] = []
  let loadError: string | null = null
  try {
    payments = await getAdminPayments()
  } catch (error) {
    loadError = errorMessage(error)
  }
  return <div className="mx-auto max-w-7xl">
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Money in</p>
      <h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Payments</h2>
      <p className="mt-2 text-[#667069]">Every Monnify payment attempt, newest first.</p>
    </div>
    {loadError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">{loadError}</div>}
    {!loadError && <section className="overflow-hidden rounded-3xl border border-[#dfe3da] bg-white">
      <div className="divide-y divide-[#edf0e9]">
        {payments.map((payment) => (
          <article key={payment.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{payment.studentName}</p>
              <p className="truncate text-sm text-[#667069]">{payment.studentEmail}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatNaira(payment.amountKobo)}</p>
              <p className="text-xs text-[#667069]">{payment.reference}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle[payment.status]}`}>{payment.status}</span>
          </article>
        ))}
        {!payments.length && <div className="px-6 py-16 text-center text-sm text-[#667069]">No payments yet.</div>}
      </div>
    </section>}
  </div>
}
