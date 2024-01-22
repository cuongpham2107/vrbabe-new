import { deleteHotspot, deleteScene, updateInitialViewParametersScene } from '@/actions/admin/scenes'
import { SceneDataState } from '@/app/admin/(admin)/scenes/page'
import { useAction, usePromise } from '@/lib/utils/promise'
import useAdminScene from '@/stores/admin/admin_scene'
import { useRouter } from 'next/navigation'
import React, { Dispatch, MouseEvent, SetStateAction, memo, useEffect, useState } from 'react'
import ButtonAdmin from '../form/ButtonAdmin'
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal'
import Dropdown, { Divide, MenuItem, MenuTitle } from '@/components/ui/Dropdown'
import Tooltip from '@/components/ui/Tooltip'
import { v4 } from 'uuid'

const AdminSceneControl = ({
  scenes, sceneId, setSceneId, setOpenModalAdd, tabCurrentHotspot, setTabCurrentHotspot,
  editHotspotModal, setEditHotspotModal, openHotspotModal, setOpenHotspotModal
}: {
  scenes: SceneDataState[],
  setOpenModalAdd: (data: SceneDataState | null) => void,
  sceneId?: string, 
  setSceneId: Dispatch<SetStateAction<string>>
  tabCurrentHotspot: 'link' | 'info',
  setTabCurrentHotspot: Dispatch<SetStateAction<'link' | 'info'>>;
  editHotspotModal: any | null,
  setEditHotspotModal: Dispatch<SetStateAction<any>>
  openHotspotModal: boolean,
  setOpenHotspotModal: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()

  // list hotspot in scene
  const openAdvancedHotspotModal = useAdminScene(state => state.openAdvancedHotspotModal)
  const [currentScene, setCurrentScene] = useState<SceneDataState | null>(scenes.find(v => v.id == sceneId) || null)

  useEffect(() => {
    setCurrentScene(scenes.find(v => v.id == sceneId) || null)
  })

  const findSceneDataById = (id: string ) => scenes.find(v => v.id == id)

  // delete scene
  const [loading, setLoading] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const handelCloseModal = (data: boolean) => {
    if (loading) return
    setOpenDeleteModal(data)
  }

  const handelDeleteScene = async () => {
    if (!currentScene) return
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => deleteScene({id: currentScene.id}))

        if (scenes.length > 1) {
          setSceneId(scenes[0].id)
        }

        router.refresh()
        setOpenDeleteModal(false)
      }
    })
  }

  // delete hotspot
  const [openDeleteHotspotModal, setOpenDeleteHotspotModal] = useState(false)

  const handelOpenHotspotModal = (data: any, type: 'link' | 'info') => {
    if (loading) return
    setEditHotspotModal(data)
    setTabCurrentHotspot(type)
    setOpenDeleteHotspotModal(true)
  }

  const getHotspotDeleteName = () => {
    if (!editHotspotModal) return ""

    if (tabCurrentHotspot == "link") {
      return findSceneDataById(editHotspotModal?.target)?.name || ''
    }
    else {
      return editHotspotModal?.title || ''
    }
  }

  const handelCloseHotspotModal = (data: boolean) => {
    if (loading) return
    setOpenDeleteHotspotModal(data)
  }

  const handelDeleteHotspot = async () => {
    if (!editHotspotModal) return
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => deleteHotspot({id: editHotspotModal.id, type: tabCurrentHotspot}))

        router.refresh()
        setOpenDeleteHotspotModal(false)
      }
    })
  }

  // edit hotspot
  const handelOpenEditHotspotModal = (data: any, type: 'link' | 'info' |'advanced') => {
    if (type == 'advanced') {
      openAdvancedHotspotModal(data)
    }
    else {
      if (loading) return
      setEditHotspotModal(data)
      setTabCurrentHotspot(type)
      setOpenHotspotModal(true)
    }
  }

  // update coordinates
  const viewer = useAdminScene(state => state.viewer)
  const handelUpdateInitial = async (e: MouseEvent) => {
    e.preventDefault()
    if (!currentScene) return
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        if (!viewer) throw "Không tìm thấy viewer"

        let _params = viewer.getPosition()

        const initialViewParameters = JSON.stringify({ pitch: _params.pitch, yaw: _params.yaw, zoom: viewer.getZoomLevel() })

        await useAction(() => updateInitialViewParametersScene({
          id: currentScene.id,
          initialViewParameters: initialViewParameters
        }))
      }
    })
  }

  return (
    <>
      <div className="absolute top-0 right-0 p-4 z-10">
        <Dropdown
          renderItem={(rest) => (
            <ButtonAdmin {...rest}>
              Danh sách điểm nóng ({(currentScene?.linkHotspots.length || 0) + (currentScene?.infoHotspots.length || 0) + (currentScene?.advancedHotspots.length || 0)})
            </ButtonAdmin>
          )}
        >
          { currentScene?.linkHotspots.length != 0
          ? <>
              <MenuTitle>Điểm nóng liên kết</MenuTitle>
              {currentScene?.linkHotspots.map((v,i)=>
                <MenuItem key={i}>
                  <div className="hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center text-base font-semibold gap-2 cursor-auto">
                    <span className="flex-none icon">link</span>
                    <span className="flex-grow min-w-0 w-max max-w-[250px] whitespace-pre-wrap text-sm">{findSceneDataById(v.target)?.name}</span> 
                    <span className="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
                      onClick={() => handelOpenEditHotspotModal(v, 'link')}
                    >edit</span>
                    <span className="flex-none icon p-1 hover:text-red-600 cursor-pointer"
                      onClick={() => handelOpenHotspotModal(v, 'link')}
                    >delete</span>
                  </div>
                </MenuItem>
              )}
              <Divide />
            </>
            : null
          }

          { currentScene?.infoHotspots.length != 0
          ? <>
              <MenuTitle>Điểm nóng thông tin</MenuTitle>
              {currentScene?.infoHotspots.map((v,i)=>
                <MenuItem key={i}>
                  <div className="hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center text-base font-semibold gap-2 cursor-auto">
                    <span className="flex-none icon">info</span>
                    <span className="flex-grow min-w-0 w-max max-w-[250px] whitespace-pre-wrap text-sm">{v.title}</span> 
                    <span className="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
                      onClick={() => handelOpenEditHotspotModal(v, 'info')}
                    >edit</span>
                    <span className="flex-none icon p-1 hover:text-red-600 cursor-pointer"
                      onClick={() => handelOpenHotspotModal(v, 'info')}
                    >delete</span>
                  </div>
                </MenuItem>
              )}
              <Divide />
            </>
            : null
          }

          { currentScene?.advancedHotspots.length != 0
          ? <>
              <MenuTitle>Điểm nóng nâng cao</MenuTitle>
              {currentScene?.advancedHotspots.map((v,i)=>
                <MenuItem key={i}>
                  <div className="hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left flex items-center text-base font-semibold gap-2 cursor-auto">
                    <span className="flex-none icon">conversion_path</span>
                    <span className="flex-grow min-w-0 w-max max-w-[250px] whitespace-pre-wrap text-sm">{v.title}</span> 
                    <span className="flex-none icon p-1 hover:text-sky-600 cursor-pointer"
                      onClick={() => handelOpenEditHotspotModal(v, 'advanced')}
                    >edit</span>
                    <span className="flex-none icon p-1 hover:text-red-600 cursor-pointer"
                      onClick={() => useAdminScene.setState({advancedHotSpotDelete: v})}
                    >delete</span>
                  </div>
                </MenuItem>
              )}
            </>
            : null
          }

          { !currentScene || (currentScene?.linkHotspots.length == 0 && currentScene?.infoHotspots.length == 0 && currentScene?.advancedHotspots.length == 0)
           ? <MenuItem>Không có điểm nóng nào</MenuItem>
           : null
          }
        </Dropdown>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white select-none z-10 h-10">
        <div className="absolute left-0 top-0 flex-none flex divide-x divide-transparent">
          <Tooltip title='Chỉnh sửa điểm chụp'>
            <span className="icon w-10 h-10 p-2 bg-sky-600 cursor-pointer"
              onClick={() => setOpenModalAdd(currentScene)}
            >
              <span className="icon">edit</span>
            </span>
          </Tooltip> 
          <Tooltip title='Xóa điểm chụp'>
            <span className="icon w-10 h-10 p-2 bg-red-600 cursor-pointer"
              onClick={() => setOpenDeleteModal(true)}
            >
              <span className="icon">delete</span>
            </span>
          </Tooltip>
        </div> 
        <div className="text-center p-2">{currentScene?.name}</div> 
        <div className="absolute right-0 top-0 flex-none flex divide-x divide-transparent">
          <Tooltip title='Thêm điểm nóng nâng cao'>
            <button type="submit" className="icon w-10 h-10 p-2 bg-green-500 hover:bg-green-400 cursor-pointer"
              onClick={() => openAdvancedHotspotModal()}
            >
              <span className="icon">add_location_alt</span>
            </button>
          </Tooltip>
          <Tooltip title='Lưu tọa độ điểm chụp'>
            <button type="submit" className="icon w-10 h-10 p-2 bg-blue-500 hover:bg-blue-400 cursor-pointer"
              onClick={handelUpdateInitial}
            >
              <span className="icon">save</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* dialog delete scene */}
      <Modal
        open={openDeleteModal}
        onClose={() => handelCloseModal(false)}
      >
        <ModalTitle>Xóa điểm chụp</ModalTitle>
        <ModalContent>
          Bạn có thực sự muốn xóa điểm chụp <span className="text-red-500">{currentScene?.name}</span>?
        </ModalContent>
        <ModalAction>
          <ButtonAdmin disabled={loading} onClick={() => handelCloseModal(false)}>Hủy</ButtonAdmin>
          <ButtonAdmin disabled={loading} color='red' onClick={handelDeleteScene} startIcon={loading ? "progress_activity" : null} >Tiếp tục</ButtonAdmin>
        </ModalAction>
      </Modal>

      {/* dialog delete hotspot */}
      <Modal
        open={openDeleteHotspotModal}
        onClose={() => handelCloseHotspotModal(false)}
      >
        <ModalTitle>Xóa điểm nóng</ModalTitle>
        <ModalContent>
          Bạn có thực sự muốn xóa điểm nóng <span className="text-red-500">{getHotspotDeleteName()}</span>?
        </ModalContent>
        <ModalAction>
          <ButtonAdmin disabled={loading} onClick={() => handelCloseHotspotModal(false)}>Hủy</ButtonAdmin>
          <ButtonAdmin disabled={loading} color='red' onClick={handelDeleteHotspot} startIcon={loading ? "progress_activity" : null} >Tiếp tục</ButtonAdmin>
        </ModalAction>
      </Modal>
    </>
  )
}

export default memo(AdminSceneControl)