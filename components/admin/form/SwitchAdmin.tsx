"use client"
import React, {FC, InputHTMLAttributes, useId} from 'react'
import { twMerge } from 'tailwind-merge'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> & {
  label?: string | null | undefined,
  endLabel?: string | null | undefined,
  inputClass?: string,
  value?: boolean
}

const SwitchAdmin: FC<Props> = (props) => {
  const { className, label, inputClass, endLabel, value, checked, onChange, ...rest } = props

  const id = useId()

  const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const syntheticEvent: any = {
      ...e,
      target: { ...e.target, value: e.target.checked },
    };

    onChange?.(syntheticEvent)
  }

  const isValue = typeof value != "undefined" ? value : checked
  
  return (
    <div className={className}>
      { label ? 
        <label htmlFor={id} className="inline-block text-sm font-medium mb-2 dark:text-white select-none">
          {label} { props.required && <span className="text-red-500">*</span> }
        </label> 
        : null 
      }

      <div className={twMerge(`relative w-[3.25rem] h-7 ${endLabel ? 'inline-block' : 'block'}`, inputClass)}>
        <input
          type="checkbox" id={id}
          className="w-full h-full p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-sky-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-sky-600 checked:border-sky-600 focus:checked:border-sky-600 dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-sky-500 dark:checked:border-sky-500 dark:focus:ring-offset-gray-600"
          checked={isValue}
          onChange={handelChange}
          {...rest} />
          <span className={`absolute top-0.5 left-0.5 inline-block w-6 h-6 bg-white translate-x-0 rounded-full shadow transform ring-0 transition ease-in-out duration-200 dark:bg-gray-400 pointer-events-none ${isValue ? 'bg-sky-200 translate-x-full dark:bg-sky-200' : ''}`}></span>
      </div>

      { endLabel ? 
        <label htmlFor={id} className="inline-block text-sm font-medium ml-2 dark:text-white select-none">
          {endLabel}
        </label> 
        : null 
      }
    </div>
  )
}

export default SwitchAdmin