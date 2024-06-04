"use client"
import { useCallback, useState } from 'react'
import ListScene from '../scenes/ListScene'
import SceneAddModal from '../scenes/SceneAddModal'
import AdminSceneControl from '../scenes/SceneControl'
// import AdminSceneScreen from '../scenes/SceneScreen'
import dynamic from 'next/dynamic'
import { SceneDataState } from '@/app/admin/(admin)/scenes/page'
import Loading from '@/components/ui/Loading'

const AdminSceneScreen = dynamic(() => import('../scenes/SceneScreen'), { loading: () => <Loading /> })
const HotspotAdvancedModal = dynamic(() => import('../scenes/HotspotAdvancedModal'), { loading: () => <Loading /> })

const SceneContentAdmin = ({
  scenes
}: {
  scenes: SceneDataState[]
}) => {
  
  const [openModalAdd, setOpenModalAdd] = useState(false)

  const [sceneId, setSceneId] = useState(scenes[0]?.id)
  const [sceneEdit, setSceneEdit] = useState<SceneDataState | null>(null)

  const [openHotspotModal, setOpenHotspotModal] = useState(false)
  const [tabCurrentHotspot, setTabCurrentHotspot] = useState<'link' | 'info'>('link');
  const [editHotspotModal, setEditHotspotModal] = useState<any | null>(null)

  const handelOpenModalAddScene = useCallback((data: SceneDataState | null) => {
    setSceneEdit(data)
    setOpenModalAdd(true)
  },[])

  return (
    <div className='-mx-8 -my-4' style={{height: 'calc(100vh - 64px)'}}>
      <div className="w-full h-full flex">
        <div className="flex-none w-80 h-full bg-white">
          <ListScene scenes={scenes} setOpenModalAdd={handelOpenModalAddScene} sceneId={sceneId} setSceneId={setSceneId} />
        </div>
        <div className="flex-grow min-w-0 h-full relative overflow-hidden">
          <AdminSceneScreen 
            tabCurrentHotspot={tabCurrentHotspot} 
            setTabCurrentHotspot={setTabCurrentHotspot} 
            editHotspotModal={editHotspotModal}
            setEditHotspotModal={setEditHotspotModal}
            scenes={scenes} 
            sceneId={sceneId} 
            setSceneId={setSceneId}
            openHotspotModal={openHotspotModal}
            setOpenHotspotModal={setOpenHotspotModal}
          />

          <AdminSceneControl 
            tabCurrentHotspot={tabCurrentHotspot} 
            setTabCurrentHotspot={setTabCurrentHotspot}
            editHotspotModal={editHotspotModal}
            setEditHotspotModal={setEditHotspotModal}
            scenes={scenes} 
            setOpenModalAdd={handelOpenModalAddScene} 
            sceneId={sceneId} 
            setSceneId={setSceneId}
            openHotspotModal={openHotspotModal}
            setOpenHotspotModal={setOpenHotspotModal}
          />

          <HotspotAdvancedModal sceneId={sceneId} />
        </div>
      </div>

      <SceneAddModal scene={sceneEdit} setScene={setSceneEdit} open={openModalAdd} setOpen={setOpenModalAdd} count={scenes.length} />
    </div>
  )
}

export default SceneContentAdmin