"use client"
import React, { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = HTMLAttributes<HTMLElement> & {
  open: boolean
}

const Backdrop = (props: Props) => {
  const { className, open, ...rest } = props

  return open ? <div className={twMerge("fixed w-full h-full top-0 left-0 z-[60] bg-black/30", className)} {...rest} /> : null
}

export default Backdrop