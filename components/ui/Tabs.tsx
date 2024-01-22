import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Tabs = ({ children, value, setValue } : {
  children: React.ReactNode,
  value: any,
  setValue: React.Dispatch<React.SetStateAction<any>>
}) => {
  return <TabsContext.Provider value={{value, setValue}}>{children}</TabsContext.Provider>
}

export const TabList = ({ children, className } : {
  children: React.ReactNode,
  className?: string
}) => {
  return (
    <div className={twMerge("border-b border-gray-200 dark:border-gray-700", className)}>
      <nav className="flex gap-2" role="tablist">
        {children}
      </nav>
    </div>
  )
}

export const Tab = ({ children, value } : {
  children: React.ReactNode,
  value: any
}) => {
  const { value: v, setValue } = useTabsContext()

  return (
    <button type="button" className={`py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:text-blue-500 ${v == value ? 'font-semibold !border-blue-600 !text-blue-600' : ''}`} role="tab"
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  )
}

export const TabContent = ({ children, value, className } : {
  children: React.ReactNode,
  value: any, className?: string
}) => {

  const { value: v } = useTabsContext()

  return value == v ? <div className={className}>{children}</div> : null
}

/**
 * context modal
 */

type ContextType = {
  value: any,
  setValue: React.Dispatch<React.SetStateAction<any>>
} | null

const TabsContext = React.createContext<ContextType>(null);

export const useTabsContext = () => {
  const context = React.useContext(TabsContext);

  if (context == null) {
    throw new Error("Modal components must be wrapped in <Modal />");
  }

  return context
}