"use client"
import { File } from '@prisma/client'
import Image from 'next/image';
import React, { useEffect, useRef } from 'react'
import Swiper, {  } from 'swiper';
// import Swiper styles
import 'swiper/css';
// import 'swiper/css/navigation';

const FilesSlide = ({files}: {files: File[]}) => {
  const swiperEl = useRef<HTMLDivElement | null>(null)
  const swiper = useRef<Swiper | null>(null)

  useEffect(() => {
    if (swiperEl.current) {
      swiper.current = new Swiper(swiperEl.current, {
        slidesPerView: 1,
        // navigation: {
        //   nextEl: '.swiper-button-next',
        //   prevEl: '.swiper-button-prev',
        // },
        // modules: [Navigation]
      })

    }

    return () => {
      if (swiper.current)
        swiper.current.destroy()
    }
  }, [])

  const nextSlide = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    swiper.current?.slideNext()
  }

  const prevSlide = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    swiper.current?.slidePrev()
  }

  useEffect(() => {
    swiper.current?.update()
  }, [files])

  return (
    <div className="w-full h-full relative select-none bg-make-transparent">
      <div className="swiper h-full" ref={swiperEl}>
        <div className="swiper-wrapper">
          {files.map((v,i) =>
            <div className='swiper-slide w-full h-full !flex flex-col' key={v.id}>
              { v.mime.startsWith('image')
               ? <Image 
                  src={v.url} 
                  alt={v.caption || v.name}
                  width={300}
                  height={300}
                  className='my-1 w-full flex-grow min-h-0 object-contain'
                />
                : v.mime.startsWith('audio') ? <div className={`w-full h-full grid place-items-center`} >
                  <span className="icon !text-4xl text-amber-600">audio_file</span>
                </div>
                : v.mime.startsWith('video') ? <div className={`w-full h-full grid place-items-center`} >
                  <span className="icon !text-4xl text-green-600">video_file</span>
                </div>
                : <div className={`w-full h-full grid place-items-center`} >
                  <span className="icon !text-4xl text-sky-600">attach_file</span>
                </div>
              }
              <p className="m-1 text-center text-sm">{v.name}</p>
            </div>
          )}
        </div>
        <div className="absolute top-1/2 left-2 z-10 -translate-y-1/2" onClick={prevSlide}>
          <span className="icon rounded-full hover:bg-gray-200 cursor-pointer">
            chevron_left
          </span>
        </div>
        <div className="absolute top-1/2 right-2 z-10 -translate-y-1/2" onClick={nextSlide}>
          <span className="icon rounded-full hover:bg-gray-200 cursor-pointer">
            chevron_right
          </span>
        </div>

        <div className="absolute w-full bottom-7 p-2 z-10 flex justify-center space-x-2 pointer-events-none">
          <span className="icon w-8 h-8 !text-lg p-1 rounded bg-white border hover:bg-gray-200 cursor-pointer pointer-events-auto">
            add
          </span>
        </div>
      </div>
    </div>
  )
}

export default FilesSlide