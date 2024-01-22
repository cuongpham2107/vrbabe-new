"use client"
import React, {FC, InputHTMLAttributes, memo, useId} from 'react'
import { twMerge } from "tailwind-merge";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | null | undefined,
  startIcon?: React.ReactNode | string,
  endIcon?: React.ReactNode | string,
  inputClass?: string
}

const InputAdmin: FC<Props> = (props) => {
  const { className, label, startIcon, endIcon, inputClass, ...rest } = props

  const id = useId()

  return (
    <div className={className}>
      { label ? 
        <label htmlFor={id} className="inline-block text-sm font-medium mb-2 dark:text-white">
          {label} { props.required && <span className="text-red-500">*</span> }
        </label> 
        : null 
      }
      <div className="relative">
        <input type="text" id={id} 
          className={twMerge(`py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600 
          ${startIcon ? 'ps-11' : ''} ${endIcon ? 'pe-11' : ''}`, inputClass)} {...rest} />

        { startIcon
          ? <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
            { typeof startIcon === "string" ? <span className='icon w-4 h-4 text-lg'>{startIcon}</span> : startIcon }
          </div>
          : null
        }

        { endIcon
          ? <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
            { typeof endIcon === "string" ? <span className='icon w-4 h-4 text-lg'>{endIcon}</span> : endIcon }
          </div>
          : null
        }
      </div>
    </div>
  )
}

export default memo(InputAdmin)