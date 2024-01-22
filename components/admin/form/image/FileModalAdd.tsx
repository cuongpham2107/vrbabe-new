"use client"
import {useEffect, useState, memo} from 'react'
import { FileTypeState } from '@/actions/admin/sample';
import FileIcon from './FileIcon';
import { createPortal } from 'react-dom';
import { useAction, usePromise } from '@/lib/utils/promise';
import { uploadFiles } from '@/actions/admin/upload';
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal';
import Backdrop from '@/components/ui/Backdrop';
import ButtonAdmin from '../ButtonAdmin';

type AddModalFileState = {
  show: boolean,
  setShow: (data: boolean) => void,
  setData: (data: any) => void,
  tableName: string,
  folderFileId?: string,
  fileTypes?: FileTypeState
}

const AdminFileAdd= memo(({
  show, setShow, setData, tableName, folderFileId, fileTypes = ['image']
}: AddModalFileState) => {
  const [files, setFiles] = useState<{
    name: string,
    type: string,
    preview: string,
    file: File
  }[]>([])

  const [isAddFiles, setIsAddFiles] = useState(false)
  const [loading, setLoading] = useState(false)

  const changeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    let tmpFiles = e.target.files ?? []
    let newFiles: any = []
    Array.from(tmpFiles).map((v,i) => {
      if (files.findIndex(v2 => v2.name == v.name) < 0) {
        newFiles.push({
          name: v.name,
          type: v.type,
          preview: URL.createObjectURL(v),
          file: v
        })
      }
    })

    setFiles((state) => [...state, ...newFiles])
  }

  useEffect(() => {
    if (files.length > 0) {
      setIsAddFiles(true)
    }
    else {
      setIsAddFiles(false)
    }
  }, [files])

  const removeFileChange = (index: number) => {
    URL.revokeObjectURL(files[index].preview)
    setFiles(files.filter((v,i) => i != index))
  }

  const upload = async () => {
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        var formData = new FormData()

        files.map(v => {
          formData.append('files[]', v.file)
        })

        const { files: filesData } = await useAction(() => uploadFiles({
          formData: formData,
          tableName: tableName,
          folderFileId: folderFileId,
          fileTypes: fileTypes
        }))

        files.forEach((v,i) => {
          URL.revokeObjectURL(files[i].preview)
        })
        setFiles([])

        setShow(false)
        setData(filesData)
      }
    })
   
  }

  useEffect(() => {
    return () => {
      files.forEach((v,i) => {
        URL.revokeObjectURL(files[i].preview)
      })
    }
  }, [])

  return (
    <>
      <Modal
        open={show}
        onClose={() => !loading ? setShow(false) : null }
        className='max-w-3xl'
      >
        <ModalTitle>Thêm tài sản mới</ModalTitle>

        <ModalContent className='overflow-hidden p-0 flex flex-col relative'>
          { isAddFiles
            ? <>
              <div className="mx-6 py-6 flex items-center justify-between border-b">
                <div>
                  <h5 className="font-semibold">{files.length} tài sản đã sẵn sàng để tải lên</h5>
                  <p className="text-sm mt-1 text-gray-600">Quản lý tài sản trước khi thêm chúng vào thư viện phương tiện</p>
                </div>
                <ButtonAdmin size='sm' onClick={(e) => setIsAddFiles(false)}>Thêm file</ButtonAdmin>
              </div>
              <div className="flex-grow min-h-0 p-6 overflow-y-auto" >
                <div className='grid gap-4' style={{gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))'}}>
                  { files.map((v,i) =>
                    <div className="rounded border overflow-hidden h-max" key={i}>
                      <div className="relative w-full h-24 bg-make-transparent">
                        <FileIcon name={v.name} mime={v.type} url={v.preview}/>
                        <span
                          className="absolute top-2 right-2 icon w-8 h-8 !text-[18px] rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer"
                          onClick={() => {removeFileChange(i)}}
                        >
                          delete
                        </span>
                      </div>
                      <div className="p-4 py-2 flex flex-col items-start space-y-2 text-xs">
                        <p className="font-semibold break-words">{v.name}</p>
                        <p className="uppercase text-[10px] p-1 py-0.5 font-semibold rounded bg-gray-100">{v.type}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
            : <>
              <div className="px-6 flex items-center border-b">
                <div className="p-4 uppercase text-xs font-semibold text-sky-600 border-b border-sky-600">
                  <span>Từ máy tính của bạn</span>
                </div> 
              </div>
              <div className="px-6 mt-6 overflow-y-auto max-h-[60vh] flex flex-col items-center justify-center w-full border border-dashed py-12 rounded bg-gray-50">
                <span className="icon text-sky-600 !text-6xl">
                  attach_file_add
                </span>
                <span className="my-4 font-semibold">Bấm để thêm một tài sản</span>
                <ButtonAdmin variant="solid" tag="label">
                  Chọn file
                  <input hidden type="file" name="fileUpload" id="fileUpload" 
                    multiple={true} accept={fileTypes.includes('all') ? '*' : fileTypes.map(v => `${v}/*`).toString()} 
                    onChange={(e) => changeFiles(e)} 
                  />
                </ButtonAdmin>
              </div>
            </>
          }

          { loading
            ? <div className='absolute w-full h-full top-0 left-0 bg-white/80 animate-pulse'></div>
            : null
          }
        </ModalContent>

        <ModalAction>
          <ButtonAdmin variant="outline" size='sm' color='white' disabled={loading} onClick={() => setShow(false)}>
            Hủy bỏ
          </ButtonAdmin>

          <ButtonAdmin className='!ml-auto' size='sm' disabled={loading} startIcon={
            loading ? <span className='icon animate-spin w-4 h-4'>progress_activity</span> : null
          } onClick={upload} >
            Tải tài sản lên
          </ButtonAdmin>
        </ModalAction>
      </Modal>
    </>
  )
})

export default AdminFileAdd