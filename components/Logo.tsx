export default function Logo({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light'; className?: string }) {
  const src = variant === 'dark' ? '/logo-lime.png' : '/logo-forest.png'
  return <img src={src} alt="UniPath" className={className} />
}

export function LogoMark({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light'; className?: string }) {
  const src = variant === 'dark' ? '/logo-lime.png' : '/logo-forest.png'
  return <img src={src} alt="UniPath" className={className} />
}
