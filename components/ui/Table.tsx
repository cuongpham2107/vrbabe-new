"use client"
import { generatePaginationArray } from '@/lib/admin/pagination'
import React, { TdHTMLAttributes, TableHTMLAttributes, useEffect, useState, HTMLAttributes, ThHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import Skeleton from './Skeleton'

type TableType = Omit<TableHTMLAttributes<HTMLTableElement>, 'border'> & {
  border?: boolean,
  rounded?: boolean,
  shadow?: boolean,
  loading?: boolean,
  pagination?: React.ReactNode
}

export const Table = (props: TableType) => {
  const {children, className, border, rounded, shadow, loading, pagination, ...rest} = props

  const commonClass = `relative overflow-hidden 
    ${border ? 'border dark:border-gray-700' : ''}
    ${rounded ? 'rounded-lg' : ''}
    ${shadow ? 'shadow dark:shadow-gray-900' : ''}
  `

  return (
    <div className="flex flex-col">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className={twMerge(commonClass, className)}>
            <div className={`${loading ? 'min-h-[150px]' : ''}`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...rest}>
                {children}
              </table>

              { loading
                ? <div className="absolute top-0 left-0 w-full h-full grid place-items-center bg-white/90 z-10 animate-pulse">
                    <span className="loader !text-gray-800"></span>
                  </div>
                : null
              }
            </div>
            { pagination }
          </div>
        </div>
      </div>
    </div>
  )
}

export const THead = (props: HTMLAttributes<HTMLTableSectionElement> & {
  gray?: boolean
}) => {
  const {children, className, gray, ...rest} = props

  const commonClass = gray ? "bg-gray-50 dark:bg-gray-700" : ''

  return <thead className={twMerge(commonClass, className)} {...rest}>{children}</thead>
}

export const Th = (props: ThHTMLAttributes<HTMLTableHeaderCellElement>) => {
  const {children, className, ...rest} = props

  return <th className={twMerge("px-6 py-3 text-xs font-medium text-gray-500 uppercase", className)} align='left' {...rest}>{children}</th>
}

export const TBody = (props: HTMLAttributes<HTMLTableSectionElement>) => {
  const {children, className, ...rest} = props

  return <tbody className={twMerge("divide-y divide-gray-200 dark:divide-gray-700", className)} {...rest}>{children}</tbody>
}

export const Tr = (props: HTMLAttributes<HTMLTableRowElement> & { divide?: boolean }) => {
  const {children, className, divide, ...rest} = props

  return (
    <tr className={twMerge(`hover:bg-gray-100 dark:hover:bg-gray-700 
      ${divide ? 'divide-x divide-gray-200 dark:divide-gray-700' : ''}`, className)} {...rest}
    >
      {children}
    </tr>
  )
}

export const Td = (props: TdHTMLAttributes<HTMLTableCellElement>) => {
  const {children, className, ...rest} = props

  return <td className={twMerge("px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200", className)} align='left' {...rest}>{children}</td>
}

export const Pagination = (props: {
  placement?: 'left' | 'center' | 'right'
  className?: string,
  page: number,
  count: number,
  rowsPerPageOptions?: {label: string, value: number}[]
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}) => {
  const { page, count, rowsPerPage, rowsPerPageOptions, onPageChange, onRowsPerPageChange } = props
  const commonClass = `flex items-center space-x-1 ${props.placement == 'center' ? 'justify-center' : props.placement == 'right' ? 'justify-end' : ''}`

  const [maxPage, setMaxPage] = useState(Math.ceil(count / rowsPerPage))

  const [listPage, setListPage] = useState<{
    title: string | number,
    active:boolean,
    link: number | null
  }[]>([])

  useEffect(() => {
    let maxPage = Math.ceil(count / rowsPerPage)

    setMaxPage(maxPage)
    setListPage(generatePaginationArray(maxPage, page))
  }, [page, count, rowsPerPage])

  return (
    <div className="py-1 px-4 border-t border-gray-200">
      <nav className={twMerge(commonClass, props.className)}>
        <button disabled={page <= 1} type="button" className="p-2.5 inline-flex items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
          <span aria-hidden="true">«</span>
          <span className="sr-only">Previous</span>
        </button>

        {listPage.map((v,i) =>
          <button
            key={i}
            disabled={v.active || !v.link}
            type="button"
            className="min-w-[40px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10" aria-current="page"
            onClick={() => v.link ? onPageChange(v.link) : null}
          >
            {v.title}
          </button>
        )}

        <button disabled={page >= maxPage} type="button" className="p-2.5 inline-flex items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
          <span className="sr-only">Next</span>
          <span aria-hidden="true">»</span>
        </button>
      </nav>
    </div>
  )
}