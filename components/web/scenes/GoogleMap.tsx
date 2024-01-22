"use client"

import useSettings from "@/stores/settings"
import useScene from "@/stores/web/scene"
import { AnimatePresence, motion } from "framer-motion"
import { memo, useEffect, useRef } from "react"

const GoogleMap = () => {
  const googleMap = useScene(state => state.googleMap)
  const findSettingByName = useSettings(state => state.findSettingByName)

  const isMount = useRef(false)
  const googleMapLink = findSettingByName('so do')

  useEffect(() => {
    if (googleMap && !isMount.current) {
      isMount.current = true
    }
  }, [googleMap])

  return (
    <AnimatePresence>
      { googleMap || isMount.current
        ? <motion.div 
            initial={{ opacity: 0 }}
            animate={googleMap ? { opacity: 1, display: 'block' } : { opacity: 0, transitionEnd: {display: 'none'} }}
            exit={{ opacity: 0 }}
            transition={{duration: .3}}
            className="absolute w-full h-full top-0 left-0 p-8 bg-black/30 z-50"
            onClick={() => useScene.setState({googleMap: false})}
          >
            <style jsx global>{`
              .map iframe {
                width: 100% !important;
                height: 100% !important;
              }
            `}</style>
            <div className="map w-full h-full bg-gray-200 rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: googleMapLink}}></div>
          </motion.div>
        : null
      }
    </AnimatePresence>
  )
}

export default memo(GoogleMap)