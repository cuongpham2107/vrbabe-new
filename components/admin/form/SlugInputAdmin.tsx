"use client"
import React, {FC, InputHTMLAttributes, useId} from 'react'
import slugify from 'slugify'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | null | undefined,
}

const SlugInputAdmin: FC<Props> = (props) => {
  const { className, label, onChange, ...rest } = props

  const id = useId()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const slug = slugify(value, { 
      replacement: '_',
      lower: true,
      locale: 'vi',
      trim: false
    })

    if (!props.value) {
      e.target.value = slug
    }

    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: slug },
    };

    onChange?.(syntheticEvent)
  }

  return (
    <div className={className}>
      { label ? 
        <label htmlFor={id} className="inline-block text-sm font-medium mb-2 dark:text-white">
          {label} { props.required && <span className="text-red-500">*</span> }
        </label> 
        : null 
      }
      <input 
        type="text" 
        id={id} 
        className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600" 
        onChange={handleInputChange}
        {...rest} 
      />
    </div>
  )
}

export default SlugInputAdmin