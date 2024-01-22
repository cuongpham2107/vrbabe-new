"use client"
import React from 'react'
import { motion } from "framer-motion";

const loading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='w-full h-full bg-white' />
  )
}

export default loading