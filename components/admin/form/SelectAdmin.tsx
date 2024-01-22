"use client"
import React, {FC, SelectHTMLAttributes, useId} from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string | null | undefined,
}

const SelectAdmin: FC<Props> = (props) => {
  const { className, label, children, ...rest } = props

  const id = useId()

  return (
    <div className={className}>
      { label ? 
        <label htmlFor={id} className="inline-block text-sm font-medium mb-2 dark:text-white">
          {label} { props.required && <span className="text-red-500">*</span> }
        </label> 
        : null 
      }
      <select id={id} className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" {...rest}>
        { children
          ? children
          : <option selected>Open this select menu</option>
        }
      </select>
    </div>
  )
}

export default SelectAdmin