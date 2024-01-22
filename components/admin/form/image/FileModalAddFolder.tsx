"use client"
import {useEffect, useState} from 'react'
import { FolderFile } from '@prisma/client';
import { createPortal } from 'react-dom';
import { useAction, usePromise } from '@/lib/utils/promise';
import { createEditFolder, deleteFolder } from '@/actions/admin/upload';
import { Modal, ModalAction, ModalContent } from '@/components/ui/Modal';
import ButtonAdmin from '../ButtonAdmin';
import dayjs from 'dayjs';
import InputAdmin from '../InputAdmin';

type AddModalType = {
  show: boolean,
  setShow: (data: boolean) => void,
  data: FolderFile | null
  setData: (data: FolderFile) => void,
  parentId?: string,
  tableName: string,
  dataDelete: FolderFile | null,
  setDataDelete: (data: FolderFile) => void,
}

const AdminFileModalAddFolder: React.FC<AddModalType> = ({
  show, setShow, data, setData, tableName, parentId,
  dataDelete, setDataDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    setName(data?.name || '')
  }, [data])

  const handelClose = () => {
    if (!loading) {
      setShow(false)
    }
  }

  const handelSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        const { folder } = await useAction(() => createEditFolder({
          folderId: data?.id,
          name: name,
          tableName: tableName,
          parentId: data ? data.parentId : parentId
        }))
  
        setShow(false)
        setData(folder)
      }
    })
  }

  // delete
  const [deletePopup, setDeletePopup] = useState(false)

  const handelDeleteFolder = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    if (!data) return

    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => deleteFolder({
          folderId: data.id
        }))
  
        setDeletePopup(false)
        setShow(false)
        setDataDelete(data)
      }
    })
  }

  return (
    <div>
      <Modal
        open={show}
        onClose={handelClose}
      >
        <div className="p-6 flex items-center space-x-4">
          <span className='text-xl font-semibold'>{data ? 'Sửa' : 'Thêm'} thư mục mới</span>
          <div className="!ml-auto"></div>
          { data
            ? <ButtonAdmin color='red' size='sm'
              startIcon={<span className='icon'>delete</span>}
              onClick={() => setDeletePopup(true)}
            >
              Xóa
            </ButtonAdmin>
            : null
          }
          <span 
            className="w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer flex items-center justify-center"
            onClick={handelClose}
          >
            <span className="icon">close</span>
          </span>
        </div>

        <div className="p-6 border-y">
          { data
            ? <div className="p-4 rounded bg-gray-50 flex space-x-4 text-xs text-gray-800 mb-4">
              <div className='w-1/2'>
                <p className="uppercase">Creation Date</p>
                <p>{dayjs(data.createdAt).format('DD/MM/YYYY')}</p>
              </div>
              <div className='w-1/2'>
                <p className="uppercase">Update Date</p>
                <p>{dayjs(data.updatedAt).format('DD/MM/YYYY')}</p>
              </div>
            </div>
            : null
          }

          <InputAdmin label='Tên' name='name' value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="p-6 bg-gray-100 flex items-center">
          <ButtonAdmin color='white' size='sm' disabled={loading} onClick={handelClose}>
            Hủy bỏ
          </ButtonAdmin>

          <ButtonAdmin className='!ml-auto' size='sm' disabled={loading}
            startIcon={loading ? (<span className='icon animate-spin'>progress_activity</span>) : null}
            onClick={handelSubmit}
          >
            Tạo mới
          </ButtonAdmin>
        </div>
      </Modal>

      <Modal
        open={deletePopup}
        onClose={() => {
          if (!loading) {
            setDeletePopup(false)
          }
        }}
        title='Bạn chắc chắn xóa thư mục tài sản này'
      >
        <ModalContent>
          Việc xóa thư mục tài sản sẽ xóa vĩnh viễn chúng và tất cả tài sản con ra khỏi cơ sở dữ liệu và không thể khôi phục được
        </ModalContent>
        <ModalAction>
          <ButtonAdmin disabled={loading} onClick={() => setDeletePopup(false)}>Hủy</ButtonAdmin>
          <ButtonAdmin disabled={loading} color='red' onClick={handelDeleteFolder} startIcon={loading ? (
            <span className='icon animate-spin'>progress_activity</span>
          ) : null} >Tiếp tục</ButtonAdmin>
        </ModalAction>
      </Modal>
    </div>
  )
}

export default AdminFileModalAddFolder