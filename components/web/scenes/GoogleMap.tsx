"use client"

import useSettings from "@/stores/settings"
import useScene from "@/stores/web/scene"
import { AnimatePresence, motion } from "framer-motion"
import { memo, useEffect, useRef, useState } from "react"


import Map, { NavigationControl, GeolocateControl, Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { SceneProps } from "@/app/(web)/layout"

const GoogleMap = ({ scenes }: { scenes: SceneProps[] }) => {

  const googleMap = useScene(state => state.googleMap)
  const findSettingByName = useSettings(state => state.findSettingByName)

  const isMount = useRef(false)
  const googleMapLink = findSettingByName('so do')
  const datas = [
    {
      "lat": "22.4140944",
      "lon": "105.6076494",
      "name": "Olkhovka Airport",
      "url": "khuon_vien_(an_ma)"
    },
  ]

  const mapboxToken = "pk.eyJ1IjoiY3VvbmdwaGFtMjEwNyIsImEiOiJjbHM3bTFwb2ExNXYwMmhucmJ4OTA1a3N3In0.oRhDjYMlKHnlSwqvWQ-Qcw";
  const [selectedMarker, setSelectedMarker] = useState<{ airport: any, index: number } | null>(null);
  const mapRef = useRef(null);

  const zoomToSelectedLoc = (e: React.MouseEvent<HTMLButtonElement>, airport: any, index: number) => {
    // stop event bubble-up which triggers unnecessary events
    e.stopPropagation();
    setSelectedMarker({ airport, index });
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [airport.lon, airport.lat], zoom: 10 });
    }
  };
  return (
    <AnimatePresence>
      {googleMap || isMount.current
        ? <motion.div
          initial={{ opacity: 0 }}
          animate={googleMap ? { opacity: 1, display: 'block' } : { opacity: 0, transitionEnd: { display: 'none' } }}
          exit={{ opacity: 0 }}
          transition={{ duration: .3 }}
          className="absolute w-full h-full top-0 left-0 p-8 bg-black/30 z-50"
        // onClick={() => useScene.setState({googleMap: false})}
        >
          <style jsx global>{`
              .map iframe {
                width: 100% !important;
                height: 100% !important;
              }
            `}</style>
          <div className="map w-full h-full bg-gray-200 rounded-lg overflow-hidden">
            <Map
              mapboxAccessToken={mapboxToken}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              initialViewState={{ latitude: 22.4140944, longitude: 105.6076494, zoom: 12 }}
              maxZoom={20}
              minZoom={3}
            >
              {/* <GeolocateControl position="top-left" /> */}
              <NavigationControl position="top-left" />
              {scenes.map((data, index) => {
                if (data.latitude && data.longitude) {
                  return (
                    <Marker key={index} longitude={parseFloat(data.longitude)} latitude={parseFloat(data.latitude)}>
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={(e) => zoomToSelectedLoc(e, data, index)}
                      >
                        {
                          <Link
                            href={data.url === "" ? "#" : data.slug}
                            onClick={() => useScene.setState({ googleMap: false })}>
                              <svg width="30px" height="30px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">

                                <g id="SVGRepo_bgCarrier" stroke-width="0"/>

                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

                                <g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M23.1397 4.05909C20.4929 1.35303 17.2979 0 13.5549 0C9.81179 0 6.61688 1.35303 3.97014 4.05909C1.32338 6.76515 0 10.0317 0 13.8586C0 17.6855 1.32338 20.952 3.97014 23.6582L11.1323 30.9808C12.4615 32.3397 14.6483 32.3397 15.9775 30.9808L23.1397 23.6582C25.7864 20.952 27.1097 17.6855 27.1097 13.8586C27.1097 10.0317 25.7864 6.76515 23.1397 4.05909ZM13.5549 19.0556C13.8886 19.0556 14.2192 19.0223 14.5465 18.9556C14.8739 18.8891 15.1917 18.7906 15.5001 18.66C15.8084 18.5294 16.1014 18.3693 16.3789 18.1798C16.6564 17.9901 16.9131 17.7747 17.1491 17.5334C17.2668 17.4131 17.3785 17.2871 17.4841 17.1556C17.5897 17.024 17.6888 16.8874 17.7813 16.7459C17.8738 16.6044 17.9593 16.4585 18.0378 16.3084C18.1162 16.1583 18.1872 16.0047 18.251 15.8474C18.3147 15.6901 18.3707 15.5301 18.419 15.3672C18.4674 15.2043 18.5078 15.0394 18.5404 14.8725C18.5728 14.7055 18.5972 14.5374 18.6135 14.368C18.6298 14.1986 18.6379 14.0288 18.6379 13.8586C18.6379 13.6884 18.6298 13.5186 18.6135 13.3492C18.5972 13.1798 18.5728 13.0117 18.5404 12.8447C18.5078 12.6778 18.4674 12.5129 18.419 12.35C18.3707 12.1871 18.3147 12.0271 18.251 11.8698C18.1872 11.7125 18.1162 11.5589 18.0378 11.4088C17.9593 11.2587 17.8738 11.1128 17.7813 10.9713C17.6888 10.8298 17.5897 10.6933 17.4841 10.5617C17.3785 10.4301 17.2668 10.3041 17.1491 10.1838C16.9131 9.94249 16.6564 9.72705 16.3789 9.53748C16.1014 9.34789 15.8084 9.18781 15.5001 9.05723C15.1917 8.92664 14.8739 8.82806 14.5465 8.76148C14.2192 8.69491 13.8886 8.66163 13.5549 8.66163C13.2211 8.66163 12.8906 8.69491 12.5632 8.76148C12.2359 8.82806 11.918 8.92664 11.6097 9.05723C11.3013 9.18781 11.0084 9.34789 10.7309 9.53748C10.4534 9.72705 10.1966 9.94249 9.96059 10.1838C9.84288 10.3041 9.73122 10.4301 9.6256 10.5617C9.51999 10.6933 9.42094 10.8298 9.32845 10.9713C9.23596 11.1128 9.15048 11.2587 9.072 11.4088C8.99352 11.5589 8.92243 11.7126 8.85872 11.8698C8.79501 12.0271 8.73899 12.1871 8.69067 12.35C8.64235 12.5129 8.60194 12.6778 8.56946 12.8447C8.53698 13.0117 8.51259 13.1798 8.49628 13.3492C8.47996 13.5186 8.47179 13.6884 8.47179 13.8586C8.47179 14.0288 8.47996 14.1986 8.49628 14.368C8.51259 14.5374 8.53698 14.7055 8.56946 14.8725C8.60194 15.0394 8.64235 15.2043 8.69067 15.3672C8.73899 15.5301 8.79501 15.6902 8.85872 15.8474C8.92243 16.0047 8.99352 16.1583 9.072 16.3084C9.15048 16.4585 9.23596 16.6044 9.32845 16.7459C9.42094 16.8874 9.51999 17.024 9.6256 17.1556C9.73122 17.2871 9.84288 17.4131 9.96059 17.5334C10.1966 17.7747 10.4534 17.9901 10.7309 18.1798C11.0084 18.3693 11.3013 18.5294 11.6097 18.66C11.918 18.7906 12.2359 18.8891 12.5632 18.9556C12.8906 19.0223 13.2211 19.0556 13.5549 19.0556Z" fill="url(#paint0_radial_103_1597)"/> <defs> <radialGradient id="paint0_radial_103_1597" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.5549) rotate(90) scale(32 27.1097)"> <stop stop-color="#9cceec"/> <stop offset="1" stop-color="#1f66b2"/> </radialGradient> </defs> </g>

                              </svg>
                          </Link>

                        }
                      </button>
                      <Popup
                        offset={25}
                        latitude={parseFloat(data.latitude)}
                        longitude={parseFloat(data.longitude)}
                        onClose={() => {
                          setSelectedMarker(null);
                        }}
                        closeButton={false}
                      >
                        <h3 >{data.name}</h3>
                      </Popup>
                    </Marker>
                  );
                }

              })}
            </Map>
          </div>
        </motion.div>
        : null
      }
    </AnimatePresence>
  )
}

export default memo(GoogleMap)