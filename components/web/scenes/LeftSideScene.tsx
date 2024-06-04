"use client"

import styles from "./scenes.module.css";
import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useScene from "@/stores/web/scene";
import { GroupScene } from "@prisma/client";
import Image from "next/image";
import useSettings from "@/stores/settings";
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link";
import { SceneProps } from "@/app/(web)/layout";
import { useClickOutside } from "@/lib/utils/clickOutside";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { t } from "i18next";
import i18n from "@/lib/utils/i18next";
import { useLanguageStore } from "@/stores/web/language";

// million-ignore
const LeftSideScene = ({
  sceneSlug, currentScene
}: {
  sceneSlug?: string, currentScene?: SceneProps
}) => {
 
  const router = useRouter()
  const { scenes, scenesNonGroup, showListScene, groups, start } = useScene()
  const { findSettingByName } = useSettings()

  let listScene = useRef(null)

  const [showSceneDemo, setShowSceneDemo] = useState(false)
  const [showSceneDemImage, setShowSceneDemImage] = useState('')
  const [groupSelect, setGroupSelect] = useState<string>()
  const [showGroupScene, setShowGroupScene] = useState(false)

  const sceneFilter = groupSelect ? scenes.filter(v => v.groupId == groupSelect) : scenes

  const enterSceneTitle = (group: GroupScene | SceneProps, type: 'group' | 'scene' = 'group') => {
    let firstScene = type == 'group' ? scenes.find(v => v.groupId == group.id) : group

    if (firstScene) {
      setShowSceneDemImage(`/storage/tiles/${firstScene.id}/front.webp`)
      setShowSceneDemo(true)
    }
  }

  const leaveSceneTitle = () => {
    setShowSceneDemo(false)
  }

  const clickGroupScene = (group: GroupScene) => {
    if (showGroupScene) {
      setGroupSelect(group.id)
    }
    else {
      let tempScenes = scenes.filter(v => v.groupId == group.id)

      if (tempScenes.length == 1) {
        setShowSceneDemo(false)
        router.push(`/${tempScenes[0].slug}`)
      }
      else {
        setGroupSelect(group.id)
        setShowGroupScene(true)
      }
    }
  }

  const clickSceneTitle = (slug: string) => {
    router.push(`/${slug}`)
    setShowGroupScene(false)
    setShowSceneDemo(false)
  }

  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setShowGroupScene(false))

  useEffect(() => {
    // if (listScene.current) {
    //   new SimpleBar(listScene.current)
    // }

    // window.ResizeObserver = ResizeObserver
   
  }, [])
  const language = useLanguageStore(state => state.language)
  return (
    <div className={styles.leftside}>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none"></div>

      <AnimatePresence>
        { showSceneDemo || showGroupScene
          ? <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r 
            from-black/60 via-transparent to-black/60 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            { showSceneDemo
              ? <div className="hidden w-full h-full md:flex items-center justify-center relative z-50">
                <div className="w-3/4 max-w-3xl border-4 border-white bg-white">
                  <Image 
                    src={showSceneDemImage} 
                    alt={t('Demo photo of shooting point')}
                    width={1000}
                    height={1000}
                    className="w-full h-full aspect-[5/3] object-cover" 
                  />
                </div>
              </div>
              : null
            }
          </motion.div>
          : null
        }
      </AnimatePresence>

      <div className="absolute top-0 left-0 w-full h-full p-6 pb-20 pointer-events-none overflow-hidden select-none flex flex-col z-10">
        <div className="flex-none md:pl-6 lg:pl-12 mb-12">
          <AnimatePresence>
            { start && showListScene
              ? <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="block w-20 h-20 md:w-32 md:h-32 pointer-events-auto"
                  // style={{boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}
                >
                  <Link href="/">
                    <Image
                      src={findSettingByName('site logo')?.url || '/logo.png'}
                      width={100}
                      height={100}
                      alt="logo Bắc Hà"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </motion.div>
                : null
              }
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          { start && showListScene
            ? <motion.div 
                ref={ref}
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="flex-grow min-h-0 w-full max-w-[310px] relative text-sm md:text-base"
              >
                <AnimatePresence>
                  { showGroupScene
                    ? <motion.div
                      initial={{ x: -280 }}
                      animate={{ x: 0 }}
                      exit={{ x: -280 }}
                      className="w-full h-full flex flex-col"
                    >
                      <SimpleBar className="w-full max-h-full pointer-events-auto">
                        <div className="w-[280px] flex flex-col text-white divide-y divide-black/20"
                          onMouseLeave={() => leaveSceneTitle()}
                        >
                          { sceneFilter.length > 0
                            ? sceneFilter.map(v =>
                              <div key={v.id} className={`flex py-0.5 md:py-2 space-x-2 items-center cursor-pointer pointer-events-auto
                                hover:text-teal-300 ${sceneSlug == v.slug ? 'text-teal-300' : ''}`}
                                onClick={() => clickSceneTitle(v.slug)}
                                onMouseEnter={() => enterSceneTitle(v, 'scene')}
                              >
                                {language === 'vn' ? 
                                  <span className="flex-grow" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{v.name}</span>
                                :
                                  <span className="flex-grow" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{ v.name_en ? v.name_en : v.name}</span>
                                }
                                <span className="flex-none icon">
                                  chevron_right
                                </span>
                              </div>
                            )
                            : <div className="py-0.5 md:py-2">{t('There is no context')}</div>
                          }
                          { scenesNonGroup.map(v =>
                            <div key={`${v.id}-scene`} className="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.1] pointer-events-auto"
                              onMouseEnter={() => enterSceneTitle(v, 'scene')}
                              onClick={() => clickSceneTitle(v.slug)}
                            >
                              <div className={`w-1 h-7 md:h-9 bg-white group-hover:bg-sky-600 ${currentScene?.groupId == v.id ? '!bg-sky-600' : ''}`}></div>
                              {language === 'vn' ? 
                                <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{v.name}</span>
                              :
                                <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{ v.name_en ? v.name_en : v.name}</span>
                              }
                            </div>
                          )}
                        </div>
                      </SimpleBar>
                    </motion.div>
                    : null
                  }
                </AnimatePresence>

                <div className={`w-full h-full absolute top-0 left-0 transition-all ease-linear flex flex-col ${showGroupScene ? '!left-[calc(100%+1rem)]' : ''}`}>
                  <SimpleBar className="w-full max-h-full pointer-events-auto">
                    <div ref={listScene} className="w-[280px] overflow-hidden">
                      <div className="flex flex-col text-white"
                        onMouseLeave={() => leaveSceneTitle()}
                      >
                        { groups.map(v =>
                          <div key={v.id} className="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.1] pointer-events-auto"
                            onMouseEnter={() => enterSceneTitle(v)}
                            onClick={() => clickGroupScene(v)}
                          >
                            <div className={`w-1 h-7 md:h-9 bg-white group-hover:bg-sky-600 ${currentScene?.groupId == v.id ? '!bg-sky-600' : ''}`}></div>
                            {language === 'vn' ? 
                             <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{ v.name}</span>
                             : 
                             <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{ v.name_en ? v.name_en : v.name}</span>
                             }
                           
                          </div>
                        )}
                        { scenesNonGroup.map((v,i) =>
                          <div key={`${v.id}-scene`} className="flex py-1 space-x-2 items-center cursor-pointer group transition-all duration-[0.4s] origin-left hover:scale-[1.1] pointer-events-auto"
                            onMouseEnter={() => enterSceneTitle(v, 'scene')}
                            onClick={() => clickSceneTitle(v.slug)}
                          >
                            <div className={`w-1 h-7 md:h-9 bg-white group-hover:bg-sky-600 ${currentScene?.groupId == v.id ? '!bg-sky-600' : ''}`}></div>
                            {language === 'vn' ?
                              <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{v.name}</span>
                            :
                              <span className="group-hover:text-teal-300" style={{textShadow: "rgb(0, 0, 0) 1px 1px 4px"}}>{ v.name_en ? v.name_en : v.name}</span>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </SimpleBar>
                </div>
              </motion.div>
            : null
          }
        </AnimatePresence>
      </div>
    </div>
  )
}

export default memo(LeftSideScene)