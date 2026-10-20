'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

const students = [
  { name: 'Adaeze O.', image: '/stories/adaeze.jpg', quote: 'I finally stopped guessing. Every requirement was just there, waiting for me.' },
  { name: 'Tobi A.', image: '/stories/tobi.jpg', quote: 'I stopped worrying about what I had forgotten. UniPath showed me exactly what to do next.' },
  { name: 'Chiamaka E.', image: '/stories/chiamaka.jpg', quote: 'My documents were scattered everywhere. Now I open one page and see it all.' },
  { name: 'Emeka N.', image: '/stories/emeka.jpg', quote: 'Deadlines used to sneak up on me. Not anymore.' },
  { name: 'Aisha B.', image: '/stories/aisha.jpg', quote: 'Applying felt so lonely before. Now it feels like someone is walking with me.' },
  { name: 'Olumide S.', image: '/stories/olumide.jpg', quote: 'I picked my schools with actual confidence this time.' },
  { name: 'Fatima Y.', image: '/stories/fatima.jpg', quote: 'My mum stopped asking for updates every day. She just checks my progress herself.' },
  { name: 'Kelechi I.', image: '/stories/kelechi.jpg', quote: 'The checklist told me what to do each week. I just followed it.' },
  { name: 'Zainab M.', image: '/stories/zainab.jpg', quote: 'I got my admission letter and cried. UniPath kept me organized the whole way.' },
  { name: 'Segun A.', image: '/stories/segun.jpg', quote: 'It turned a confusing process into small steps I could actually finish.' },
]

const SLIDE_H = 252
const STAY_MS = 3000
const SWAP_MS = 550

function Slide({ name, image, quote }: { name: string; image: string; quote: string }) {
  return (
    <div style={{ height: SLIDE_H }} className="flex flex-col">
      <blockquote className="text-balance text-xl font-medium leading-snug tracking-[-.03em]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pb-1">
        <Image src={image} alt={`Portrait of ${name}`} width={96} height={96} className="size-12 rounded-full object-cover" />
        <p className="font-semibold">{name}</p>
      </figcaption>
    </div>
  )
}

export default function StoriesRotator() {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const indexRef = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const prev = indexRef.current
      let next = Math.floor(Math.random() * students.length)
      if (next === prev) next = (next + 1) % students.length
      indexRef.current = next
      setLeaving(prev)
      setIndex(next)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setLeaving(null), SWAP_MS)
    }, STAY_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <figure
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="rounded-[30px] bg-white p-7 shadow-[0_20px_60px_rgba(23,53,31,.07)] sm:p-8"
    >
      <div className="flex gap-1 text-[#658617]">
        {[1, 2, 3, 4, 5].map((x) => <Star key={x} className="size-4 fill-current" />)}
      </div>
      <div className="relative mt-5 overflow-hidden" style={{ height: SLIDE_H }} aria-live="polite">
        {leaving !== null && (
          <div key={`out-${leaving}`} className="story-exit absolute inset-0" aria-hidden="true">
            <Slide {...students[leaving]} />
          </div>
        )}
        <div key={`in-${index}`} className="story-enter absolute inset-0">
          <Slide {...students[index]} />
        </div>
      </div>
    </figure>
  )
}
