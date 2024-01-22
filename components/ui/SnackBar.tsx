import useAlerts, { ALertType } from '@/stores/alerts';
import { AnimatePresence, useIsPresent, motion } from 'framer-motion';
import React from 'react'

const SnackBar = () => {
  const { alerts } = useAlerts()

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full max-w-3xl flex flex-col space-y-4 items-end z-[100] pointer-events-none p-4">
      <AnimatePresence>
        {alerts.map((item) => (
          <Item key={item.id} alert={item} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default SnackBar

const Item = ({alert} : {alert: ALertType}) => {
  const isPresent = useIsPresent()
  
  const animations = {
    initial: { scale: 0, opacity: 0, x: 0 },
    animate: { scale: 1, opacity: 1, x: 0 },
    exit: { scale: 0, opacity: 0, x: 200 }
  }

  return (
    <motion.div {...animations} style={{ position: isPresent ? "static" : "absolute" }} layout>
      <div className={`flex items-center space-x-2 border text-sm rounded-lg px-4 py-3
        ${alert.type == 'error' ? 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-800/10 dark:border-yellow-900 dark:text-yellow-500' 
        : 'bg-green-100 border-green-200 text-green-800 dark:bg-green-800/10 dark:border-green-900 dark:text-green-500'}
      `} role="alert">
        <span className="icon">{alert.type == 'error' ? 'warning' : 'check_circle'}</span>
        <span>{alert.message}.</span>
      </div>
    </motion.div>
  );
};
