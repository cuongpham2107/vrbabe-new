"use client"

import { File, GroupScene, Scene } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, memo, useEffect, useState } from "react";
import slugify from "slugify";
import { SceneDataState } from "@/app/admin/(admin)/scenes/page";
import { useAction, usePromise } from "@/lib/utils/promise";
import { addEditScene } from "@/actions/admin/scenes";
import { Drawer, DrawerAction, DrawerContent, DrawerTitle } from "@/components/ui/Drawer";
import ButtonAdmin from "../form/ButtonAdmin";
import InputAdmin from "../form/InputAdmin";
import FileInputAdmin from "../form/FileInputAdmin";
import RelationInputAdmin from "../form/RelationInputAdmin";
import RichTextAdmin from "../form/RichTextAdmin";
import SwitchAdmin from "../form/SwitchAdmin";
import { Modal, ModalAction, ModalContent, ModalTitle } from "@/components/ui/Modal";
import Backdrop from "@/components/ui/Backdrop";
import { DrawerLazy } from "@/components/ui/Lazy";

const SceneAddModal = ({
  scene, setScene, open, setOpen, count
}: {
  scene: SceneDataState | null,
  count: number,
  setScene: Dispatch<SetStateAction<SceneDataState | null>>
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter()
  
  // modal
  const onCloseModal = () => {
    if (scene && (scene.name != name 
      || scene.slug != slugName
      || scene.audio?.id != audio?.id
      || scene.image?.id != image?.id
      || scene.group?.id != group?.id
      || scene.description?.replace(/[^a-zA-Z0-9]/g, '') != description?.replace(/[^a-zA-Z0-9]/g, '')
      || scene.publish != (publish ? 'publish' : 'draft')
    )) {
      setHasCloseModal(true)
    }
    else {
      setOpen(false)
      // setDefaultData()
    }
  }

  const [hasCloseModal, setHasCloseModal] = useState(false)

  const changeHasCloseModal = () => {
    setHasCloseModal(false)
    setOpen(false)
    setDefaultData(scene)
  }

  const [name, setName] = useState('')
  const [slugName, setSlugName] = useState('')
  const [image, setImage] = useState<File>()
  const [audio, setAudio] = useState<File>()
  const [group, setGroup] = useState<GroupScene | null>(null)
  const [description, setDescription] = useState<string>()
  const [publish, setPublish] = useState(true)

  const handelChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    setName(value)
    if (!scene) {
      setSlugName(slugify(value, {
        replacement: '_',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case, defaults to `false`
        strict: false,     // strip special characters except replacement, defaults to `false`
        locale: 'vi',      // language code of the locale to use
        trim: true         // trim leading and trailing replacement chars, defaults to `true`
      }))
    }
  }

  const handelChangeSlugName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugName(slugify(e.target.value, {
      replacement: '_',  // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: true,      // convert to lower case, defaults to `false`
      strict: false,     // strip special characters except replacement, defaults to `false`
      locale: 'vi',      // language code of the locale to use
      trim: true         // trim leading and trailing replacement chars, defaults to `true`
    }))
  }

  const setDefaultData = (scene: SceneDataState | null) => {
    if (scene) {
      setName(scene.name)
      setSlugName(scene.slug)
      setImage(scene.image || undefined)
      setAudio(scene.audio || undefined)
      setGroup(scene.group)
      setDescription(scene.description || '')
      setPublish(scene.publish == "publish")
    }
    else {
      setName('')
      setSlugName('')
      setImage(undefined)
      setAudio(undefined)
      setGroup(null)
      setDescription('')
      setPublish(true)
    }
  }

  useEffect(() => {
    setDefaultData(scene)
  },[scene])

  // create collection
  const [loading, setLoading] = useState(false)

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    await usePromise({
      loading: loading,
      setLoading: setLoading,
      callback: async () => {

        await useAction(() => addEditScene({
          audio: audio?.id,
          imageId: image?.id,
          name,
          publish,
          slug : slugName,
          count,
          description,
          group: group?.id,
          id: scene?.id,
        }))

        setOpen(false)
        setDefaultData(null)
        // setScene(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      <DrawerLazy
        anchor='right'
        open={open}
        keepMounted
        onClose={onCloseModal}
        loading={loading}
        className="max-w-3xl"
        onSubmit={handelSubmit}
      >
        <DrawerTitle>{!scene ? 'Thêm' : 'Sửa'} điểm chụp <span className="text-blue-600">{scene?.name}</span></DrawerTitle>
        <DrawerContent className="flex flex-col gap-4 relative">
          <InputAdmin label="Tiêu đề" name="name" value={name} onChange={handelChangeName} placeholder="Vd: bán đảo Bắc Hà" required={true} />
          <InputAdmin label="Slug" name="slug" value={slugName} onChange={handelChangeSlugName} required={true} />
          <div className="flex gap-6">
            <FileInputAdmin className="w-1/2" label="Ảnh" name="image" value={image} onChange={(e) => setImage(e.target.value)} details={{tableName: 'scene'}} required />
            <FileInputAdmin className="w-1/2" label="Âm thanh" value={audio} onChange={(e) => setAudio(e.target.value)} name="audio" details={{tableName: 'scene', fileTypes: ['audio']}} />
          </div>
          <RelationInputAdmin label="Danh mục" value={group || null} onChange={(e) => setGroup(e.target.value)} details={{tableNameRelation: 'groupScene', titleRelation: 'name', typeRelation: 'many-to-one'}} />
          <RichTextAdmin label="Nội dung" value={description} onChange={e => setDescription(e.target.value)} name="description" />
          <SwitchAdmin label="Xuất bản" checked={publish} onChange={(e) => setPublish(e.target.checked)} name="publish" />
        </DrawerContent>
        <DrawerAction>
          <ButtonAdmin variant="text" color='black' disabled={loading} onClick={onCloseModal}>Hủy</ButtonAdmin>
          <ButtonAdmin type="submit" disabled={loading} startIcon={
            loading ? <span className="icon w-4 h-4 animate-spin">progress_activity</span> : null
          }>Tiếp tục</ButtonAdmin>
        </DrawerAction>
      </DrawerLazy>

      <Modal
        open={hasCloseModal}
        onClose={() => setHasCloseModal(false)}
      >
        <ModalTitle>Đóng bảng điều khiển</ModalTitle>
        <ModalContent>
          Bạn có các thay đổi chưa lưu. Bạn có thực sự muốn đóng bảng điều khiển không?
        </ModalContent>
        <ModalAction>
          <ButtonAdmin onClick={() => setHasCloseModal(false)}>Hủy</ButtonAdmin>
          <ButtonAdmin color='red' onClick={changeHasCloseModal}>Đóng</ButtonAdmin>
        </ModalAction>
      </Modal>
    </>
  )
}

export default memo(SceneAddModal)