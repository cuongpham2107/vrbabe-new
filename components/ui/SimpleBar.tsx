import React, { HTMLAttributes, useEffect, useRef } from 'react'
import SimpleBarCurrent from 'simplebar'
import 'simplebar/dist/simplebar.css';

const SimpleBar = (props: HTMLAttributes<HTMLDivElement>) => {
  const { children, ...rest } = props
  const refEl = useRef<HTMLDivElement | null>(null)
  const bar = useRef<SimpleBarCurrent>()

  useEffect(() => {
    if (!refEl.current) return
    
    bar.current = new SimpleBarCurrent(refEl.current)

    return () => {
      // bar.current.
    }
  }, [])
  return (
    <div ref={refEl} {...rest}>{children}</div>
  )
}

export default SimpleBar