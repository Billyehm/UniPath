import { INSTITUTION_ALIASES } from '@/lib/institution-aliases'

export function institutionAliases(id: string): string[] {
  return INSTITUTION_ALIASES[id] ?? []
}

export function institutionMatchesQuery(item: { id: string; name: string; state: string; ownership: string }, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (`${item.name} ${item.state} ${item.ownership}`.toLowerCase().includes(q)) return true
  return institutionAliases(item.id).some((alias) => alias.toLowerCase().includes(q) || q.includes(alias.toLowerCase()))
}
