'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const SLIDES = [
  { src: '/hero-campus-mufti.jpg', alt: 'Students in casual wear walking across a university campus' },
  { src: '/hero-campus-gate.jpg', alt: 'Students walking towards the university gate' },
  { src: '/hero-library-wide.jpg', alt: 'Wide view of students studying in a university library' },
  { src: '/hero-aerial-campus.jpg', alt: 'Aerial view of a university campus' },
]

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => go(index + 1), 6000)
    return () => clearInterval(timer)
  }, [index, paused, go])

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (dx < -40) go(index + 1)
        else if (dx > 40) go(index - 1)
        touchX.current = null
      }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <Image src={slide.src} alt={slide.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-[#d8ff63]' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  )
}
