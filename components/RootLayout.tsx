"use client"
import React, { useRef, useEffect } from 'react'
import { Inter } from 'next/font/google'
import useSettings from '@/stores/settings'
import SnackBar from './ui/SnackBar'

const RootLayout = ({children, settings}: {
  children: React.ReactNode
  settings: any[]
}) => {

  const willMount = useRef(true)

  useEffect(() => {
    if (!willMount.current) {
      useSettings.setState({settings})
    }
  }, [settings])


  if (willMount.current && settings) {
    useSettings.setState({settings})
    willMount.current = false
  }

  return (
    <>
      {children}
      <SnackBar />
    </>
  )
}

export default RootLayout