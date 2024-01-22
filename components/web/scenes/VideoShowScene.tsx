"use client"

import useScene from "@/stores/web/scene"
import { AnimatePresence, motion } from "framer-motion"
import { memo } from "react"

const VideoShowScene = () => {
  const videoShow = useScene(state => state.videoShow)
  const setVideoShow = useScene(state => state.setVideoShow)
  return (
    <AnimatePresence>
      { videoShow != null
        ? <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{duration: .3}}
            className="absolute w-full h-full top-0 left-0 p-8 md:py-20 bg-black/30 z-50"
            onClick={() => setVideoShow(undefined)}
          >
            <div className="w-full h-full md:w-auto md:h-auto md:aspect-[16/9] max-h-full mx-auto bg-black rounded-lg overflow-hidden">
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoShow}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              </div>
          </motion.div>
        : null
      }
    </AnimatePresence>
  )
}

export default memo(VideoShowScene)