"use client"
import React, { FormEvent, memo, useEffect, useRef, useState } from 'react'
import { motion, useDragControls } from "framer-motion";
import ButtonAdmin from '../form/ButtonAdmin';
import InputAdmin from '../form/InputAdmin';
import SelectAdmin from '../form/SelectAdmin';
import RichTextAdmin from '../form/RichTextAdmin';
import FileInputAdmin from '../form/FileInputAdmin';
import useAdminScene from '@/stores/admin/admin_scene';
import { useAction, usePromise } from '@/lib/utils/promise';
import { useRouter } from 'next/navigation';
import { createEditAdvancedHotspot, deleteHotspot } from '@/actions/admin/scenes';
import { File } from '@prisma/client';
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal';

const HotspotAdvancedModal = ({ sceneId }: { sceneId: string }) => {
  const constraintsRef = useRef(null)
  const dragControls = useDragControls()

  const { 
    isAdvancedHotspotModal, type, position, deletePosition, changeType,
    advancedHotSpotDelete, advancedHotSpotEdit
  } = useAdminScene()

  const [title, setTitle] = useState('')
  const [title_en, setTitleEn] = useState('')
  const [layer, setLayer] = useState<File | null>(null)

  // update data edit
  useEffect(() => {
    if (!advancedHotSpotEdit) return
    setTitle(advancedHotSpotEdit.title)
    setTitleEn(advancedHotSpotEdit.title_en || '')
    setLayer(advancedHotSpotEdit.layer)
  }, [advancedHotSpotEdit])

  // close modal
  useEffect(() => {
    if (!isAdvancedHotspotModal) {
      setTitle('')
      setTitleEn('')
      setLayer(null)
    }
  }, [isAdvancedHotspotModal])

  // save
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const handelSubmit = (e: FormEvent) => {
    e.preventDefault()

    usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => createEditAdvancedHotspot({
          id: advancedHotSpotEdit?.id,
          title,
          title_en,
          layerId: layer?.id,
          sceneId: sceneId || '',
          type,
          position
        }))
  
        router.refresh()
        useAdminScene.setState({isAdvancedHotspotModal: false})
      }
    })
  }

  const handelDeleteHotspot = (e: FormEvent) => {
    e.preventDefault()
    if (!advancedHotSpotDelete) return

    usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => deleteHotspot({id: advancedHotSpotDelete.id, type: 'advanced'}))
  
        router.refresh()
        useAdminScene.setState({isAdvancedHotspotModal: false})
      }
    })
  }

  return (
    <>
      <motion.div ref={constraintsRef} className='absolute left-2 top-2 right-2 bottom-12 z-10 flex flex-col justify-end pointer-events-none'>
        <motion.form
          className={`relative w-full max-w-md max-h-[600px] bg-white rounded-md overflow-hidden flex-col pointer-events-auto ${isAdvancedHotspotModal ? 'flex' : 'hidden'}`}
          drag
          dragConstraints={constraintsRef}
          dragControls={dragControls}
          dragListener={false}
          onSubmit={handelSubmit}
        >
          <div className="flex-none p-4 border-b flex items-center justify-between select-none cursor-move"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <h3>Thêm điểm nóng nâng cao</h3>
            <button disabled={loading} className="cursor-pointer w-10 h-10 rounded-full disabled:pointer-events-none bg-gray-100 hover:bg-gray-200 grid place-items-center"
              type='button'
              onClick={() => useAdminScene.setState({isAdvancedHotspotModal: false})}
            >
              <span className="icon">close</span>
            </button>
          </div>
          <div className="flex-grow min-h-0 flex flex-col relative">
            <div className="flex-grow min-h-0 overflow-auto p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="inline-block text-sm font-medium mb-2 dark:text-white">Tọa độ</label>
                  <div className="min-h-[46px] py-2 px-2 w-full border border-gray-200 bg-gray-100 rounded-lg text-sm grid grid-cols-2 gap-3 select-none">
                    { position.map((v,i) =>
                      <div key={v.id} className="w-full h-full rounded bg-gray-300 text-xs p-1 px-2 relative group flex overflow-hidden">
                        <span className="flex-1 truncate">{v.yaw}</span> -
                        <span className="flex-1 truncate">{v.pitch}</span>
                        <span className="hidden group-hover:inline-flex absolute top-0 left-0 w-full h-full
                          icon bg-red-600 text-white text-sm cursor-pointer"
                          onClick={() => deletePosition(v.id)}
                        >close</span>
                      </div>
                    )}
                  </div>
                </div>
                <SelectAdmin label="Loại" required value={type} onChange={(e) => changeType(e.target.value as any)}>
                  <option value="layer">Layer (ảnh hoặc video)</option>
                  <option value="polygon">Polygon (Đường bao)</option>
                </SelectAdmin>
                <InputAdmin label="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} required />
                <InputAdmin label="Tiêu đề(en)" value={title_en} onChange={e => setTitleEn(e.target.value)}/>
                {/* <RichTextAdmin label="Mô tả" /> */}
                { type == "layer"
                  ? <FileInputAdmin label="Ảnh hoặc video"
                    caption='Ở dạng xem trước sẽ không thấy hình ảnh hoặc video, nhưng nó hoạt động khi lưu thành điểm mới'
                    details={{tableName: 'hotspot', fileTypes: ['image', 'video']}}
                    value={layer}
                    onChange={e => setLayer(e.target.value)}
                    required />
                  : null
                }
      
              </div>
            </div>
            { loading
              ? <div className="absolute w-full h-full top-0 left-0 bg-white/50"></div>
              : null
            }
          </div>
          <div className="flex-none border-t p-4 flex justify-between space-x-4">
            <ButtonAdmin color='white' disabled={loading} onClick={() => useAdminScene.setState({isAdvancedHotspotModal: false})}>Hủy</ButtonAdmin>
            <ButtonAdmin type='submit' disabled={loading}>Lưu</ButtonAdmin>
          </div>
        </motion.form>
      </motion.div>

      {/* dialog delete scene */}
      <Modal
        open={advancedHotSpotDelete != undefined}
        onClose={() => useAdminScene.setState({ advancedHotSpotDelete: undefined })}
        onSubmit={handelDeleteHotspot}
        loading={loading}
      >
        <ModalTitle>Xóa điểm chụp</ModalTitle>
        <ModalContent>
          Bạn có thực sự muốn xóa điểm chụp <span className="text-red-500">{advancedHotSpotDelete?.title}</span>?
        </ModalContent>
        <ModalAction >
          <ButtonAdmin disabled={loading} onClick={() => useAdminScene.setState({ advancedHotSpotDelete: undefined })}>Hủy</ButtonAdmin>
          <ButtonAdmin disabled={loading} color='red' type='submit' startIcon={loading ? "progress_activity" : null} >Tiếp tục</ButtonAdmin>
        </ModalAction>
      </Modal>
    </>
  )
}

export default memo(HotspotAdvancedModal)