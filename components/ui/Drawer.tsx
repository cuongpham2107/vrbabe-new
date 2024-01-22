"use client"
import React, { FormEvent, HTMLAttributes, MouseEvent, Suspense, useEffect, useRef } from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import ButtonAdmin from '../admin/form/ButtonAdmin';
import { useClickOutside } from '@/lib/utils/clickOutside';

export type DrawerProps = Omit<HTMLMotionProps<'form'>, 'children' | 'className'> & {
  anchor?: 'left' | 'right'
  open: boolean
  onClose?: () => void,
  children?: React.ReactNode,
  className?: string,
  title?: string,
  contentClass?: string,
  closeTitle?: string,
  submitTitle?: string,
  action?: boolean,
  keepMounted?: boolean,
  loading?: boolean
}

export const Drawer: React.FC<DrawerProps> = (props) => {
  if (typeof window === 'undefined') {
    return null
  }

  const {open, onClose, children, action = false, anchor = 'left', 
    title, onSubmit, className, contentClass, keepMounted, loading,
    closeTitle = 'Close', submitTitle = 'Continue', ...rest
  } = props

  const ref = useRef<HTMLFormElement>(null)

  // useClickOutside(ref, () => {
  //   if (typeof onClose !== "undefined") {
  //     onClose()
  //   }
  // })

  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).classList.contains("cs-backdrop") && typeof onClose != "undefined" && loading == false) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  const handelSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (typeof onSubmit == "function" && !loading) {
      onSubmit(e)
    }
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'initial'
  }, [open])

  return (
    <DrawerContext.Provider value={{onClose, loading}}>{
      createPortal(
        <AnimatePresence mode='wait'>
          {(open || keepMounted) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={open ? { opacity: 1, display: 'block' } : { opacity: 0, transitionEnd: {display: 'none'}}}
              exit={{ opacity: 0 }}
              className='fixed top-0 left-0 w-full h-screen bg-black/30 z-[60] cs-backdrop'
              onClick={handleBackgroundClick }
            >
              <motion.form
                ref={ref}
                initial={{ x: anchor == 'left' ? '-100%' : '100%' }}
                animate={open ? { x: 0, display: 'flex' }: { x: anchor == 'left' ? '-100%' : '100%', transitionEnd: { display: 'none'}}}
                exit={{ x: anchor == 'left' ? '-100%' : '100%' }}
                transition={{ type: 'tween' }}
                className={twMerge(`max-w-xs w-full h-full flex flex-col bg-white border-s dark:bg-gray-800 dark:border-gray-700 ${anchor == 'right' ? 'float-right' : ''}`, className)}
                {...rest}
                onSubmit={handelSubmit}
              >
                { title 
                  ? <div className="flex justify-between items-center py-3 px-4 border-b dark:border-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        Offcanvas title
                      </h3>
                      <button type="button" className="flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" 
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <span className="icon">close</span>
                      </button>
                    </div>
                  : null
                }

                {children}

                { action
                  ? <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-gray-700">
                      <ButtonAdmin color='white'>{closeTitle}</ButtonAdmin>
                      <ButtonAdmin type='submit'>{submitTitle}</ButtonAdmin>
                    </div>
                  : null
                }
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    }</DrawerContext.Provider>
  )
}

export const DrawerTitle = (props: HTMLAttributes<HTMLDivElement>) => {
  const {className, children, ...rest} = props
  const { onClose, closeTitle } = useDrawerContext()

  return (
    <div className={twMerge("flex justify-between items-center py-3 px-4 border-b dark:border-gray-700", className)}>
      <h3 className="font-bold text-gray-800 dark:text-white" {...rest}>
        {children}
      </h3>
      <button type="button" className="flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
        onClick={onClose}
      >
        <span className="sr-only">{closeTitle}</span>
        <span className="icon">close</span>
      </button>
    </div>
  )
}

export const DrawerContent = (props: HTMLAttributes<HTMLElement>) => {
  const {className, children, ...rest} = props

  const { loading } = useDrawerContext()

  return (
    <div className="relative flex-grow min-h-0">
      <div className={twMerge(`h-full p-4 overflow-y-auto`, className)} {...rest}>
        {children}
      </div>
      { loading
        ? <div className="absolute w-full h-full top-0 left-0 bg-white/80 animate-pulse z-10"></div>
        : null
      }
    </div>
  )
}

export const DrawerAction = (props: HTMLAttributes<HTMLElement>) => {
  const {className, children, ...rest} = props
  return (
    <div className={twMerge("flex justify-end items-center gap-x-2 py-3 px-4 border-t border-gray-200 dark:border-gray-700", className)} {...rest}>
      {children}
    </div>
  )
}

/**
 * context modal
 */

type ContextType = {
  onClose?: () => void,
  closeTitle?: string,
  loading?: boolean
} | null

const DrawerContext = React.createContext<ContextType>(null);

export const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);

  if (context == null) {
    throw new Error("Modal components must be wrapped in <Modal />");
  }

  return context
}

export default Drawer