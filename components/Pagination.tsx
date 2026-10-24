'use client'

export default function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-6" aria-label="Pagination">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className="rounded-xl border border-[#dfe3da] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
      {pages.map((p, i) => p === '…' ? <span key={`gap-${i}`} className="px-1 text-sm text-[#667069]">…</span> : (
        <button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? 'page' : undefined} className={`h-9 min-w-9 rounded-xl px-2 text-sm font-semibold ${p === page ? 'bg-[#17351f] text-white' : 'border border-[#dfe3da] bg-white'}`}>{p}</button>
      ))}
      <button type="button" disabled={page === totalPages} onClick={() => onPage(page + 1)} className="rounded-xl border border-[#dfe3da] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
    </nav>
  )
}
