"use client"
import React, { FormEvent, HTMLAttributes, MouseEvent, useEffect, useRef } from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import ButtonAdmin from '../admin/form/ButtonAdmin';
import { useClickOutside } from '@/lib/utils/clickOutside';

type State = Omit<HTMLMotionProps<'form'>, 'children'> & {
  open: boolean
  onClose?: () => void,
  action?: boolean,
  title?: string,
  contentClass?: string,
  closeTitle?: string,
  submitTitle?: string,
  children?: React.ReactNode,
  loading?: boolean
}

export const Modal: React.FC<State> = (props) => {
  const {open, onClose, children, action = false, title, className, contentClass,
    closeTitle = 'Close', submitTitle = 'Continue', loading, onSubmit, ...rest
  } = props

  if (typeof window === 'undefined') {
    return null
  }

  const ref = useRef<HTMLFormElement>(null)

  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).classList.contains("cs-backdrop") && typeof onClose != "undefined") {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'initial'
  }, [open])

  const handelSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (typeof onSubmit == "function" && !loading) {
      onSubmit(e)
    }
  }

  return <ModalContext.Provider value={{onClose, closeTitle, loading}}>{
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='w-full h-full fixed top-0 start-0 z-[60] overflow-x-hidden overflow-y-auto flex items-center justify-center bg-black/30 py-8 cs-backdrop'
            onClick={handleBackgroundClick}
          >
              <motion.form
                ref={ref}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={twMerge('w-full max-w-sm max-h-full flex flex-col bg-white border shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7] overflow-hidden', className)}
                {...rest}
                onSubmit={handelSubmit}
              >
                { title
                  ? <div className="flex justify-between items-center py-3 px-4 border-b dark:border-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {title}
                      </h3>
                      <button type="button" className="flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                        onClick={onClose}
                      >
                        <span className="sr-only">{closeTitle}</span>
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
    )}
  </ModalContext.Provider>
}

export const ModalTitle = (props: HTMLAttributes<HTMLElement>) => {
  const {className, children, ...rest} = props
  const { onClose, closeTitle } = useModalContext()

  return (
    <div className={twMerge("flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700", className)}>
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

export const ModalContent = (props: HTMLAttributes<HTMLElement>) => {
  const {className, children, ...rest} = props

  const { loading } = useModalContext()

  return (
    <div className="relative flex-grow min-h-0 flex flex-col">
      <div className={twMerge("flex-grow min-h-0 w-full p-4 overflow-y-auto", className)} {...rest}>
        {children}
      </div>

      { loading
        ? <div className="absolute w-full h-full top-0 left-0 bg-white/80 animate-pulse z-10"></div>
        : null
      }
    </div>
  )
}

export const ModalAction = (props: HTMLAttributes<HTMLElement>) => {
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

const ModalContext = React.createContext<ContextType>(null);

export const useModalContext = () => {
  const context = React.useContext(ModalContext);

  if (context == null) {
    throw new Error("Modal components must be wrapped in <Modal />");
  }

  return context
}