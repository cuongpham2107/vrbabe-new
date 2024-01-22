"use client"

import Image from "next/image"
import styles from "./hotspot.module.css";

// million-ignore
const LinkHotSpot = ({
  title, image, logo
}: {
  title: string, image: string, logo?: string
}) => {

  return (
    <>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${styles.linkHotspot}`}>
        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-500 group-hover:w-20 group-hover:h-20 md:group-hover:w-32 md:group-hover:h-32 group hover:shadow-inner">
          <div className="ball bubble !absolute top-0 left-0">
            <Image src={logo || '/logo.png'} alt="" width={50} height={50} className="w-full h-full opacity-100 group-hover:opacity-0 transition-all
              duration-500 rounded-full" />
            <Image src={image} alt="" width={120} height={120} className="absolute top-0 left-0 w-full h-full object-cover rounded-full
              opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
        </div>
        { title
          ? <div className="title text-xs md:text-sm translate-y-[-25px] group-hover:translate-y-0 group-hover:bg-[rgba(62,62,62,0.784)]">{title}</div>
          : null
        }
      </div>
    </>
  )
}

export default LinkHotSpot