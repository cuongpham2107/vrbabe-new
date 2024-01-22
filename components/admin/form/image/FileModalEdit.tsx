"use client"
import {Dispatch, FormEvent, SetStateAction, useState} from 'react'
import { File } from '@prisma/client';
import FileIcon from './FileIcon';
import { deleteFileData, editFileData } from '@/actions/admin/upload';
import { createPortal } from 'react-dom';
import { useAction, usePromise } from '@/lib/utils/promise';
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal';
import { formatBytes, formatDate } from '@/lib/utils/hepler';
import Tooltip from '@/components/ui/Tooltip';
import ButtonAdmin from '../ButtonAdmin';
import InputAdmin from '../InputAdmin';

type EditModalType = {
  show: boolean,
  setShow: (data: boolean) => void,
  data: File | null,
  setData: (data: any) => void,
  setFiles: Dispatch<SetStateAction<File[]>>
}

const AdminFileEdit: React.FC<EditModalType> = ({show, setShow, data, setData, setFiles}) => {
  const [loading, setLoading] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)

  const handelClose = () => {
    if (loading) return
    setShow(false)
  }

  const handelUpdate = async (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!data) return
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        const {name, caption, height, width}: any = Object.fromEntries(
          new FormData(e.target as HTMLFormElement)
        )

        const {file} = await useAction(() => editFileData({
          id: data.id, 
          name, caption, height, width
        }))

        setData(file)

        setFiles(state => state.map(v => {
          if (v.id == file.id) {
            return file
          }
          return v
        }))

        setShow(false)
      }
    })
  }

  const download = () => {
    if (typeof window === "undefined" || !data) return
    var a = document.createElement('a')
    a.href = data.url
    a.download = data.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const copy = () => {
    if (typeof window === "undefined" || !data) return
    navigator.clipboard.writeText(window.location.origin + data.url);
  }

  const deleteFile = async () => {
    if (!data) return
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => deleteFileData({
          id: data.id, 
          url: data.url
        }))

        setDeletePopup(false)
        setData(null)

        setFiles(state => state.filter(v => v.id != data.id))
        setShow(false)
      }
    })
  }

  return (
    <>
      <Modal
        open={show}
        onClose={handelClose}
        className='max-w-3xl'
        onSubmit={handelUpdate}
      >
        <ModalTitle>Chi tiết hình tài sản</ModalTitle>
        <ModalContent className={`flex space-x-4 items-start`}>
          <div className="w-1/2 rounded border bg-gray-200">
            <div className="p-2 flex justify-end space-x-2">
              <Tooltip title="Xóa tài sản" placement="top">
                <span className="icon w-8 h-8 !text-lg rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                  onClick={() => setDeletePopup(true)}
                >
                  delete
                </span>
              </Tooltip>
              <Tooltip title="Tải tài sản xuống" placement="top">
                <span className="icon w-8 h-8 !text-lg rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                  onClick={download}
                >
                  download
                </span>
              </Tooltip>
              <Tooltip title="Sao chép liên kết" placement="top">
                <span className="icon w-8 h-8 !text-lg rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                  onClick={copy}
                >
                  content_copy
                </span>
              </Tooltip>
            </div>
            <div className="w-full h-36 bg-make-transparent">
              { data
                ? <FileIcon name={data.name} mime={data.mime} url={data.url} caption={data?.caption} width={data?.naturalWidth} height={data?.naturalHeight} />
                : <p className="p2">Không tìm thấy ảnh</p>
              }
        
            </div>
            <div className="p-6"></div>
          </div>
          <div className="w-1/2">
            <div className="w-full rounded px-6 py-4 bg-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <p className="uppercase font-semibold">Kích cỡ</p>
                <p className='mt-1'>{formatBytes(data?.size)}</p>
              </div>
              <div>
                <p className="uppercase font-semibold">Kích thước</p>
                <p className='mt-1'>{`${data?.naturalWidth}X${data?.naturalHeight}`}</p>
              </div>
              <div>
                <p className="uppercase font-semibold">Ngày</p>
                <p className='mt-1'>{formatDate(data?.createdAt)}</p>
              </div>
              <div>
                <p className="uppercase font-semibold">Phần mở rộng</p>
                <p className='mt-1'>{data?.mime || "Trống"}</p>
              </div>
              <div>
                <p className="uppercase font-semibold">ID tài sản</p>
                <p className='mt-1'>{data?.id || "Trống"}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col space-y-4">
              <InputAdmin label="Tên tài sản" name='name' defaultValue={data?.name} required />
              <InputAdmin label="Mô tả" name='caption' defaultValue={data?.caption || ""} />
              <InputAdmin type="number" label="Độ dài tài sản hiện thị (chỉ hoạt động với ảnh)" name='width' defaultValue={data?.width || ""} />
              <InputAdmin type="number" label="Chiều cao tài sản hiện thị (chỉ hoạt động với ảnh)" name='height' defaultValue={data?.height || ""} />
            </div>
          </div>
        </ModalContent>
        <ModalAction className="bg-gray-100 flex items-center">
          <ButtonAdmin disabled={loading} color='white' onClick={handelClose}>
            Hủy bỏ
          </ButtonAdmin>
          <ButtonAdmin className='!ml-auto' disabled={loading} type='submit'
            startIcon={loading ? <span className='icon animate-spin'>progress_activity</span> : null}
          >
            Lưu
          </ButtonAdmin>
        </ModalAction>
      </Modal>

      <Modal
        open={deletePopup}
        onClose={() => {
          if (!loading) {
            setDeletePopup(false)
          }
        }}
        title='Bạn chắc chắn xóa tài sản này'
      >
        <ModalContent>
          Việc xóa tài sản sẽ xóa vĩnh viễn chúng ra khỏi cơ sở dữ liệu và không thể khôi phục được
        </ModalContent>
        <ModalAction>
          <ButtonAdmin disabled={loading} onClick={() => setDeletePopup(false)}>Hủy</ButtonAdmin>
          <ButtonAdmin disabled={loading} color='red' onClick={deleteFile} startIcon={loading ? (
            <span className='icon animate-spin'>progress_activity</span>
          ) : null} >Tiếp tục</ButtonAdmin>
        </ModalAction>
      </Modal>
    </>
  )
}

export default AdminFileEdit