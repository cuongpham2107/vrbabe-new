"use client"
import React, {FC, InputHTMLAttributes, useId} from 'react'
import dayjs from "dayjs";
import 'dayjs/locale/vi'

dayjs.locale('vi')

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | null | undefined,
}

const DatePickerAdmin: FC<Props> = (props) => {
  const { className, label, ...rest } = props

  const id = useId()

  return (
    <div className={className}>
      { label ? 
        <label htmlFor={id} className="inline-block text-sm font-medium mb-2 dark:text-white">
          {label} { props.required && <span className="text-red-500">*</span> }
        </label> 
        : null 
      }
      <input type="date" id={id} className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" {...rest} />
    </div>
  )
}

const DatePickerModal = () => {
  return (
    <>fd</>
  )
}


export default DatePickerAdmin