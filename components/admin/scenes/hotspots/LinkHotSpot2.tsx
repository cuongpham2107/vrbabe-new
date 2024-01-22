"use client"

import Anim from "./Anim";

// million-ignore
const LinkHotSpot2 = ({
  title
}: {
  title: string
}) => {

  return (
    <div className={`absolute top-0 left-0 w-0 h-0 cursor-pointer`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
        <div className="relative w-24 h-24 md:w-28 md:h-24 group overflow-hidden">
          <div className="absolute w-[200%] top-[60%] left-[68%] -translate-x-1/2 -translate-y-1/2">
            <Anim src="/asset/lotties/helicopter.json" />
            {/* <lottie-player src="/lotties/helicopter.json" autoplay loop /> */}
          </div>
        </div>

        { title
          ? <div className="opacity-0 absolute left-1/2 bottom-1/2 -translate-x-1/2 px-4 py-1 transition-all duration-500 rounded whitespace-nowrap text-white group-hover:bg-stone-700 group-hover:bottom-[calc(100%+1rem)] group-hover:opacity-100 text-xs md:text-sm">{title}</div>
          : null
        }
      </div>
    </div>
  )
}

export default LinkHotSpot2