"use client"

import { twMerge } from "tailwind-merge"

type State = {
  width?: number | string
  height?: number | string
  className?: string
}

const Skeleton = (props: State) => {
  return (
    <div className={twMerge("h-4 bg-gray-200 rounded-full dark:bg-gray-700", props.className)} style={{
      width: props.width,
      height: props.height
    }}></div>
  )
}

export default Skeleton