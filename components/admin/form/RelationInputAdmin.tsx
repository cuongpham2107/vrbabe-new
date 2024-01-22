"use client"
import { getListDataOfRelation } from '@/actions/admin/sample';
import { MenuItem } from '@/components/ui/Dropdown';
import { useClickOutside } from '@/lib/utils/clickOutside';
import { debounce } from '@/lib/utils/hepler';
import { useAction, usePromise } from '@/lib/utils/promise';
import React, {FC, InputHTMLAttributes, MouseEvent, useEffect, useId, useMemo, useRef, useState} from 'react'
import { twMerge } from "tailwind-merge";

type Props = {
  label?: string | null | undefined,
  startIcon?: React.ReactNode | string,
  endIcon?: React.ReactNode | string,
  inputClass?: string,
  required?: boolean
  className?: string
  value: any | any[]
  onChange: React.ChangeEventHandler<Omit<HTMLInputElement, 'value'> & { value: any }>
  details: {
    typeRelation: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many',
    titleRelation: string,
    tableNameRelation: string
  }
}

const RelationInputAdmin: FC<Props> = (props) => {
  const { className, label, startIcon, endIcon, inputClass, value, 
    onChange, details: {
      typeRelation,
      titleRelation,
      tableNameRelation
    }, ...rest 
  } = props

  const id = useId()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<any[]>([])

  useEffect(() => {
    usePromise({
      loading,
      setLoading,
      showSuccessTitle: false,
      callback: async () => {
        const {data} = await useAction(() => getListDataOfRelation({tableName: tableNameRelation}))
        setOptions([...data])
      }
    })
  }, [])

  const handelShowMenu = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setOpen(true)
  }

  const handelChangeValue = (data: any | any[]) => {
    // let tempValue = id

    // if (typeRelation == 'one-to-many' || typeRelation == 'many-to-many') {
      
    // }

    const syntheticEvent: any = {
      target: {
        value: data
      },
    }

    onChange?.(syntheticEvent)

    setOpen(false)
  }

  const [labelValue, setLabelValue] = useState('')
  const handelBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const item = options.findIndex(v => v[titleRelation] == e.target.value)

    if (item < 0) {
      setLabelValue(value ? value[titleRelation] || '' : '')
    }
  }

  useEffect(() => {
    setLabelValue(value ? value[titleRelation] || '' : '')
  }, [value])

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
          ${startIcon ? 'ps-11' : ''} ${endIcon ? 'pe-11' : ''}`, inputClass)} {...rest} 
          value={labelValue} onChange={(e) => setLabelValue(e.target.value)} 
          onClick={handelShowMenu}
          onBlur={handelBlur}
        />

        { startIcon
          ? <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
            { typeof startIcon === "string" ? <span className='icon w-4 h-4 text-lg'>{startIcon}</span> : startIcon }
          </div>
          : null
        }

        { loading || endIcon
          ? <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
            { loading
              ? <span className='icon w-4 h-4 text-lg animate-spin'>progress_activity</span>
              : typeof endIcon === "string" ? <span className='icon w-4 h-4 text-lg'>{endIcon}</span> : endIcon
            }
          </div>
          : null
        }

        { open 
          ? <Menu loading={loading} 
            options={options} handelChangeValue={handelChangeValue} 
            titleRelation={titleRelation} setOpen={setOpen} />
          : null
        }
      </div>
    </div>
  )
}

export default RelationInputAdmin

const Menu = ({
  loading, options, handelChangeValue, titleRelation, setOpen
}: {
  loading: boolean,
  options: any[],
  handelChangeValue: (data: any | any[]) => void,
  titleRelation: string,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  // const [isTop, setIsTop] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const handleScroll = debounce(() => {
  //     const element = ref.current;
  //     if (element) {
  //       const { top, bottom, height } = element.getBoundingClientRect()

  //       let isTopTemp = false

  //       console.log(top, bottom, window.innerHeight)

  //       if (!isTop && bottom >= window.innerHeight && (window.innerHeight - top) >= height) {
  //         isTopTemp = true
  //       }
  //       else if (isTop && )

  //       setIsTop(isTopTemp)
  //     }
  //   }, 100)

  //   window.addEventListener('scroll', handleScroll)
  //   window.addEventListener('resize', handleScroll)

  //   return () => {
  //     window.removeEventListener('scroll', handleScroll)
  //     window.removeEventListener('resize', handleScroll)
  //   }
  // }, [])

  // const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
  //   if ((e.target as HTMLDivElement).classList.contains("cs-backdrop")) {
  //     e.preventDefault()
  //     e.stopPropagation()
  //     setOpen(false)
  //   }
  // }
  
  useClickOutside(ref, (e) => {
    setOpen(false)
  })

  return (
    <>
      {/* <div className="fixed top-0 right-0 bottom-0 h-screen w-screen cs-backdrop z-50"
        onClick={handleBackgroundClick}
      ></div> */}

      <div ref={ref} className={`absolute left-0 w-full bg-white shadow border rounded-lg p-2 dark:bg-gray-800 dark:border dark:border-gray-700 !m-0 top-full translate-y-2 z-50`}>
        {
          loading
          ? <div className="py-2 text-gray-800 text-center">
              <span className="icon animate-spin">progress_activity</span>
            </div>
          : <>
            { options.length > 0 ? options.map(v => (
                <MenuItem key={v.id} onClick={() => handelChangeValue(v)}>{v[titleRelation]}</MenuItem>
              ))
              : <MenuItem>Không có lựa chọn nào</MenuItem>
            }
          </>
        }
      </div>
    </>
  )
}