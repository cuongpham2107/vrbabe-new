"use client"

import { GroupScene } from "@prisma/client"
import { useEffect, useRef, useState } from "react"
import useSettings from "@/stores/settings"
import Image from "next/image"
import useScene from "@/stores/web/scene"
import { motion } from "framer-motion"
import { SceneProps } from "@/app/(web)/layout"
import ScenesScreen from "../scenes/ScenesScreen"
import { useAction } from "@/lib/utils/promise"
import { createAccess } from "@/actions/access"
import { t } from "i18next"

const SceneContent = ({
  scenes = [], groups = [], children,
  scenesNonGroup = []
}: {
  scenes: SceneProps[],
  scenesNonGroup: SceneProps[]
  groups: GroupScene[],
  children: React.ReactNode
}) => {
  const {findSettingByName} = useSettings()

  const  {start, setStart} = useScene()

  const willMount = useRef(true)

  if (willMount.current) {
    useScene.setState({
      scenes, scenesNonGroup,  groups
    })
    willMount.current = false
  }

  const [startCompleted, setStartCompleted] = useState(false)

  useEffect(() => {
    useAction(createAccess)
  }, [])

  return (
    <>
      <style global jsx>
        {`html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }`}
      </style>

      { scenes.length > 0 || scenesNonGroup.length > 0
        ? <ScenesScreen />
        : <div className="fixed w-full h-screen top-0 left-0 grid place-items-center">
          {t('There is no context')}
        </div>
      }

      { !start
        ? <motion.div 
            className="fixed w-full h-screen top-0 left-0 z-[100] bg-white"
            animate={{
              scale: startCompleted ? 2 : 1,
              opacity: startCompleted ? 0 : 1
            }}
            initial={false}
            transition={{ type: "tween", duration: 0.7}}
            onAnimationComplete={() => {
              setStart(true)
            }}
          >
          <Image 
            src={findSettingByName('banner')?.url || ''} 
            alt="banner website"
            width={1920}
            height={1080}
            priority={true}
            loading="eager"
            className="w-full h-full object-cover cursor-pointer"
            onClick={(e) => setStartCompleted(true)}
          />

          {/* <div className="absolute w-full h-full left-0 top-0 flex flex-col items-center justify-center gap-8">
            <button 
              className="!rounded-full !bg-gradient-to-r !from-cyan-500 !to-blue-500 px-6 py-3 text-white md:text-lg shadow" 
              onClick={(e) => setStartCompleted(true)}
            >Bắt đầu tham quan</button>
          </div> */}
        </motion.div>
        : null
      }

      { children }
    </>
  )
}

export default SceneContent