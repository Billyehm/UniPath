'use client'

import { useEffect, useState } from 'react'
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

export default function StoriesRotator() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex((prev) => {
        let next = Math.floor(Math.random() * students.length)
        if (next === prev) next = (next + 1) % students.length
        return next
      })
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
      <div className="mt-5 overflow-hidden" style={{ height: SLIDE_H }} aria-live="polite">
        <div
          className="transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
          style={{ transform: `translateY(${-index * SLIDE_H}px)` }}
        >
          {students.map((s) => (
            <div key={s.name} style={{ height: SLIDE_H }} className="flex flex-col">
              <blockquote className="text-balance text-xl font-medium leading-snug tracking-[-.03em]">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pb-1">
                <Image src={s.image} alt={`Portrait of ${s.name}`} width={96} height={96} className="size-12 rounded-full object-cover" />
                <p className="font-semibold">{s.name}</p>
              </figcaption>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
