"use client"

import { useState, useEffect, HTMLAttributes } from 'react'

type ClientOnlyProps = HTMLAttributes<HTMLElement>

const ClientOnly: React.FC<ClientOnlyProps> = (props) => {
  const { children, ...rest } = props

  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if(!hasMounted) {
    return null
  }

  if (Object.keys(rest).length > 0) {
    return (
      <div {...rest}>{children}</div>
    )
  }
  
  return children
}

export default ClientOnly