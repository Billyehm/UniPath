export default function Logo({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light'; className?: string }) {
  const mark = variant === 'dark' ? '#d8ff63' : '#17351f'
  return (
    <svg viewBox="0 0 400 120" className={className} role="img" aria-label="UniPath">
      <path d="M 88,103.3 L 35,103.3 L 8,60 L 35,16.7 L 88,16.7" fill="none" stroke={mark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 82,95.5 L 39,95.5 L 17,60 L 39,24.5 L 82,24.5" fill="none" stroke={mark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 55,33 L 80,43 L 55,53 L 30,43 Z" fill={mark} />
      <path d="M 42,56 L 42,63 Q 55,69 68,63 L 68,56 Q 55,61 42,56 Z" fill={mark} />
      <line x1="55" y1="43" x2="70" y2="55" stroke={mark} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="55" r="3" fill={mark} />
      <text x="118" y="75" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="40" letterSpacing="2" fill={mark}>UNIPATH</text>
    </svg>
  )
}

export function LogoMark({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light'; className?: string }) {
  const mark = variant === 'dark' ? '#d8ff63' : '#17351f'
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="UniPath">
      <path d="M 88,103.3 L 35,103.3 L 8,60 L 35,16.7 L 88,16.7" fill="none" stroke={mark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 82,95.5 L 39,95.5 L 17,60 L 39,24.5 L 82,24.5" fill="none" stroke={mark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 55,33 L 80,43 L 55,53 L 30,43 Z" fill={mark} />
      <path d="M 42,56 L 42,63 Q 55,69 68,63 L 68,56 Q 55,61 42,56 Z" fill={mark} />
      <line x1="55" y1="43" x2="70" y2="55" stroke={mark} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="55" r="3" fill={mark} />
    </svg>
  )
}
