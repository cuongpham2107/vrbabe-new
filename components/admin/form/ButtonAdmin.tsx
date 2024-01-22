"use client"
import React, {ButtonHTMLAttributes, cloneElement, forwardRef} from 'react'
import { twMerge } from 'tailwind-merge'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  endIcon?: React.ReactNode | string,
  startIcon?: React.ReactNode | string,
  variant?: 'solid' | 'outline' | 'text',
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'red' | 'yellow' | 'green' | 'black' | 'gray' | 'white',
  tag?: keyof JSX.IntrinsicElements
} & ({ LinkComponent: React.FC<any> | string, href: string } | { LinkComponent?: undefined, href?: undefined })
& {
  icon?: React.ReactNode | string
}

const ButtonAdmin = forwardRef<HTMLButtonElement, Props>((props, ref ) => {
  const { className, children, startIcon, endIcon, variant = 'solid', color = 'blue', tag, LinkComponent, href, size = 'md', ...rest } = props

  const variantColor = colors[color]

  const commonClass = `inline-flex items-center gap-x-2 text-sm font-semibold border disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 shadow
    ${variant == 'solid' ? variantColor.solid : variant == 'outline' ? variantColor.outline : variantColor.text }
    ${size == 'sm' ? 'px-2 py-1.5 text-sm rounded' : size == 'md' ? 'py-2 px-4 rounded-lg' : 'py-3 px-4 text-lg rounded-lg' }
  `

  const Tag: any = LinkComponent || tag || 'button'

  return (
    <Tag ref={ref} href={href} className={twMerge(commonClass, className)} type="button" {...rest}>
      { typeof startIcon === "string" ? <span className='icon w-4 h-4 text-lg'>{startIcon}</span> : startIcon }
      {children}
      { typeof endIcon === "string" ? <span className='icon w-4 h-4'>{endIcon}</span> : endIcon }
    </Tag>
  )
})

export default ButtonAdmin

const colors: Record<NonNullable<Props['color']>, { solid: string, outline: string, text: string }> = {
  'blue': {
    solid: 'bg-sky-600 text-white hover:bg-sky-700 border-transparent',
    outline: 'border-sky-600 text-sky-600 hover:border-sky-500 hover:text-sky-500',
    text: 'text-sky-600 hover:text-sky-800 dark:text-sky-500 dark:hover:text-sky-400'
  },
  'red': {
    solid: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    outline: 'border-red-600 text-red-600 hover:border-red-500 hover:text-red-500',
    text: 'text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400'
  },
  'yellow': {
    solid: 'bg-yellow-600 text-white hover:bg-yellow-700 border-transparent',
    outline: 'border-yellow-600 text-yellow-600 hover:border-yellow-500 hover:text-yellow-500',
    text: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-500 dark:hover:text-yellow-400'
  },
  'green': {
    solid: 'bg-green-600 text-white hover:bg-green-700 border-transparent',
    outline: 'border-green-600 text-green-600 hover:border-green-500 hover:text-green-500',
    text: 'text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400'
  },
  'black': {
    solid: 'bg-black-600 text-white hover:bg-black-700 border-transparent',
    outline: 'border-black-600 text-black-600 hover:border-black-500 hover:text-black-500',
    text: 'text-black-600 hover:text-black-800 dark:text-black-500 dark:hover:text-black-400'
  },
  'gray': {
    solid: 'bg-gray-600 text-white hover:bg-gray-700 border-transparent',
    outline: 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500',
    text: 'text-gray-600 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-400'
  },
  'white': {
    solid: 'bg-white text-black-600 hover:bg-gray-100 border-gray-300',
    outline: 'border-sky-600 text-sky-600 hover:border-sky-500 hover:text-sky-500',
    text: 'text-black-600 hover:text-black-800 dark:text-black-500 dark:hover:text-black-400'
  }
}