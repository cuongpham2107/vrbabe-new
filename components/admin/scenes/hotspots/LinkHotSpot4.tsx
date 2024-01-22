"use client"

// million-ignore
const LinkHotSpot4 = ({
  title
}: {
  title: string
}) => {

  return (
    <div className="absolute top-0 left-0 w-0 h-0 cursor-pointer">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
        <div className="absolute w-0.5 h-10 md:h-20 bg-white/90 left-1/2 -translate-x-1/2 bottom-1/2"></div>
        <div className="absolute w-max max-w-[10rem] md:max-w-[13rem] bg-teal-600/70 left-1/2 -translate-x-1/2 
          bottom-[45px] md:bottom-[86px] px-2 py-1.5 md:px-3 md:py-2 text-white rounded-xl border-2 border-sky-500 flex justify-center
          text-xs md:text-sm">
          {title}
        </div>
        <div className="relative w-3 h-3 rounded-full bg-sky-500">
          <div className="absolute w-full h-full rounded-full bg-sky-500 animate-ping"></div>
        </div>
      </div>
    </div>
  )
}

export default LinkHotSpot4