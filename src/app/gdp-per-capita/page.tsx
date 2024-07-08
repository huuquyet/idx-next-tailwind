'use client'

import { gdpPerCapita as notebook } from '@/@d3/bar-chart-race'
import { Inspector, Runtime } from '@observablehq/runtime'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function Page() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const runtime = new Runtime()
    runtime.module(notebook, (name: string) => {
      if (name === 'chart') {
        return new Inspector(ref.current)
      }
    })
    return () => runtime.dispose()
  }, [])

  return (
    <>
      <h1>
        Hello, Observable! <Link href="/">Back to home &lt;-</Link>
      </h1>

      <div ref={ref} />
    </>
  )
}
