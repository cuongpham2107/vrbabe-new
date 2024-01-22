import React from 'react'
import { motion, AnimatePresence } from "framer-motion"

const Collapsed = ({ open, children }: { 
  open: boolean, children: React.ReactNode
}) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{
            height: 0,
            opacity: 0,
          }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: {
                duration: 0.4,
              },
              opacity: {
                duration: 0.25,
                delay: 0.15,
              },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: {
                duration: 0.4,
              },
              opacity: {
                duration: 0.25,
              },
            },
          }}
          key="collapse"
          className='overflow-hidden'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Collapsed