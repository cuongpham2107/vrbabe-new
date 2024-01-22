"use client"
import {useEffect, useState} from 'react'
import { FolderFile, File } from '@prisma/client';
import AdminFileAdd from './FileModalAdd';
import AdminFileEdit from './FileModalEdit';
import AdminFileModalAddFolder from './FileModalAddFolder';
import { getListFolderFile } from '@/actions/admin/upload';
import { FileTypeState } from '@/actions/admin/sample';
import FileIcon from './FileIcon';
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal';
import ButtonAdmin from '../ButtonAdmin';
import { useAction, usePromise } from '@/lib/utils/promise';
import Checkbox from '@/components/ui/Checkbox';

type ModalType = {
  show: boolean,
  setShow: (data: boolean) => void,
  multiple?: boolean,
  data: File[]
  setData: (data: File[]) => void,
  tableName: string,
  onlyTable?: boolean,
  fileTypes?: FileTypeState
}

const AdminFileModal: React.FC<ModalType> = ({
  show, setShow, multiple, data, setData, tableName, onlyTable, fileTypes
}) => {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [folders, setFolders] = useState<FolderFile[]>([])
  const [folderParentId, setFolderParentId] = useState<string | undefined>(data.length > 0 ? (data[0].folderFileId || undefined) : undefined)
  const [folderParents, setFolderParents] = useState<FolderFile[]>([])

  // const [selects, setSelects] = useState<File[]>(data)
  const [checked, setChecked] = useState<string[]>(data.map(v => v.id))

  const [page, setPage] = useState(0)

  const [addModal, setAddModal] = useState(false)
  const [dataUpload, setDataUpload] = useState<File[]>([])

  const [editModal, setEditModal] = useState(false)
  const [dataEdit, setDataEdit] = useState<File | null>(null)

  const [addFolderModal, setAddFolderModal] = useState(false)
  const [dataFolderEdit, setDataFolderEdit] = useState<FolderFile | null>(null)
  const [dataFolderAdd, setDataFolderAdd] = useState<FolderFile | null>(null)

  // reload checked in open modal
  useEffect(() => {
    if (show) {
      setChecked(data.map(v => v.id))
    }
  }, [show])

  const fetchFiles = () => usePromise({
    loading,
    setLoading,
    showSuccessTitle: false,
    callback: async () => {
      const { folderParents, folders, files: filesData } = await useAction(() => getListFolderFile({
        parentId: folderParentId,
        tableName: onlyTable ? tableName : undefined,
        fileTypes
      }))

      setFiles(filesData)
      setFolders(folders)
      setFolderParents(folderParents)
    }
  })

  // reload data in folder
  useEffect(() => {
    fetchFiles()
  }, [folderParentId])

  // upload files
  useEffect(() => {
    if (dataUpload.length == 0) return

    fetchFiles()
    
    // checked
    var updatedList: string[] = []
    if (multiple) {
      updatedList = [...checked, ...dataUpload.map(v => v.id)]
      // setSelects(state => [...state, ...dataUpload])
    }
    else {
      updatedList = [dataUpload[0].id]
      // setSelects([dataUpload[0]])
    }

    setChecked(updatedList)
    setPage(1)

  }, [dataUpload])

  const editFile = (file: File) => {
    setDataEdit(file)
    setEditModal(true)
  }

  // add or edit folder
  useEffect(() => {
    if (dataFolderAdd) {
      let findDataFolder = folders.some(v => v.id == dataFolderAdd.id)

      if (findDataFolder) {
        setFolders(state => state.map(v => (v.id == dataFolderAdd.id) ? dataFolderAdd : v))
      }
      else {
        setFolders(state => [...state, dataFolderAdd])
      }
    }
  }, [dataFolderAdd])

  const handelAddEditFolder = (e: React.MouseEvent, dataEdit?: FolderFile) => {
    e.stopPropagation()
    if (dataEdit) {
      setDataFolderEdit(dataEdit)
    }
    else {
      setDataFolderEdit(null)
    }
    setAddFolderModal(true)
  }

  // delete folder
  const [dataFolderDelete, setDataFolderDelete] = useState<FolderFile | null>(null)

  useEffect(() => {
    setFolders(state => state.filter(v => v.id != dataFolderDelete?.id))
  }, [dataFolderDelete])

  // change folder parent
  const handelClickFolder = (id: string) => {
    setFolderParentId(id)
  }

  // Add/Remove checked item from list
  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    var updatedList: string[] = []

    if (multiple) {
      updatedList = [...checked]
      if (event.target.checked) {
        updatedList = [...checked, event.target.value]
      } else {
        updatedList.splice(checked.indexOf(event.target.value), 1)
      }
    }
    else {
      if (event.target.checked) {
        updatedList = [event.target.value]
      } else {
        updatedList = []
      }
    }
    
    var tempFiles: File[] = []

    updatedList.forEach(v => {
      let tmp = files.find(v2 => v2.id == v)
      if (tmp) {
        tempFiles.push(tmp)
      }
    })

    setChecked(updatedList)
    // setSelects(tempFiles)
  }

  const isChecked = (item: string) => checked.includes(item)

  const next = () => {
    setData(files.filter(v => checked.includes(v.id)))
    setShow(false)
  }

  return (
    <>
      <Modal
        open={show}
        onClose={() => setShow(false)}
        className='max-w-3xl'
      >
        <ModalTitle>Danh sách tài sản</ModalTitle>

        <ModalContent className='overflow-hidden p-0 flex flex-col'>
          <div className="flex-none px-6 flex items-center border-b">
            <div 
              className={`p-4 uppercase text-xs font-semibold border-b hover:bg-sky-100 cursor-pointer border-transparent ${page == 0 ? 'text-sky-600 !border-sky-600' : ''}`}
              onClick={() => setPage(0)}
            >
              <span>Danh sách</span>
              <span className="ml-1 px-1 py-0.5 bg-gray-100 rounded">{files.length}</span>
            </div>
            <div 
              className={`p-4 uppercase text-xs font-semibold border-b hover:bg-sky-100 cursor-pointer border-transparent ${page == 1 ? 'text-sky-600 !border-sky-600' : ''}`}
              onClick={() => setPage(1)}
            >
              <span>Đã chọn</span>
              <span className="ml-1 px-1 py-0.5 bg-gray-100 rounded">{checked.length}</span>
            </div>
            <ButtonAdmin className='!ml-auto' size='sm'
              onClick={(e) => handelAddEditFolder(e)}
            >
              Thêm thư mục
            </ButtonAdmin>
            <ButtonAdmin className='!ml-4' size='sm'
              onClick={() => setAddModal(true)}
            >
              Thêm tài sản
            </ButtonAdmin>
          </div>

          <div hidden={page != 0} className='flex-grow min-h-0 flex'>
            { loading
              ? <div className="w-full h-full min-h-0 p-6 grid place-items-center bg-white/80 animate-pulse">
                  <span className="icon animate-spin">
                    progress_activity
                  </span>
                </div>
              : <div className="w-full flex-grow min-h-0 flex flex-col">
                { folderParents.length > 0
                  ? <div className="flex px-6 py-4 items-center bg-gray-100">
                    <span className="icon flex-none hover:bg-text-500 cursor-pointer"
                      onClick={() => setFolderParentId(undefined)}  
                    >folder_copy</span>
                    <div className="flex-grow min-w-0 flex flex-row-reverse justify-end items-center">
                      {folderParents.map((v, i) => 
                        <div key={v.id}>
                          <span className='mx-2'>/</span>
                          <span className={`text-sm hover:bg-text-500 ${i == 0 ? '' : 'text-sky-600 hover:underline cursor-pointer'}`}
                            onClick={() => setFolderParentId(v.id)}  
                          >{i == 4 ? '...' : v.name}</span>
                        </div>  
                      )}
                    </div>
                  </div>
                  : null
                }
                <div className='flex-grow min-h-0 overflow-y-auto pb-6'>
                  { folders.length > 0
                    ? <div className="mt-6 px-6">
                      <p className="font-semibold text-base mb-2">Thư mục ({folders.length})</p>
                      <div className="grid gap-4 grid-flow-col auto-cols-[100px]">
                        { folders.map(v =>
                          <div key={v.id} className="flex flex-col items-center space-y-1 px-2 py-2 bg-sky-50 rounded relative group cursor-pointer"
                            onClick={() => handelClickFolder(v.id)}
                          >
                            <span className="icon icon-fill !text-5xl text-sky-500">folder</span>
                            <span className="line-clamp-3 text-center text-sm">{v.name}</span>
                            <div className="absolute top-0 right-2 w-8 h-8 rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer hidden group-hover:block"
                              onClick={(e) => handelAddEditFolder(e,v)}
                            >
                              <span className="icon !text-[18px]">edit</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    : null
                  }
                
                  <div className="mt-6 px-6">
                    <p className="font-semibold text-base mb-2">Ảnh ({files.length})</p>
                    { files.length > 0
                      ? <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))'}}>
                        { files.map((v,i) =>
                          <div className="rounded border overflow-hidden" key={v.id}>
                            <div className="relative w-full h-24 bg-make-transparent group">
                              <FileIcon name={v.name} mime={v.mime} url={v.url} caption={v.caption} width={v.naturalWidth} height={v.naturalHeight} />
                              <div className="absolute top-2 left-2">
                                <Checkbox value={v.id} checked={isChecked(v.id)} onChange={(e) => handleCheck(e)} />
                              </div>
                              <span
                                className="absolute top-2 right-2 icon w-8 h-8 !text-[18px] rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer hidden group-hover:block"
                                onClick={() => editFile(v)}
                              >
                                edit
                              </span>
                            </div>
                            <div className="p-4 py-2 flex flex-col items-start space-y-2 text-xs">
                              <p className="font-semibold break-words">{v.name}</p>
                              <p className="uppercase text-[10px] p-1 py-0.5 font-semibold rounded bg-gray-100">{v.mime}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      : <p>Không có tài sản nào</p>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
          
          <div hidden={page != 1}>
            <div className="px-6 pt-6 flex items-center justify-between">
              <div>
                <h5 className="font-semibold">{checked.length} tài sản đã chọn</h5>
                <p className="text-sm mt-1 text-gray-600">Quản lý tài sản trước khi thêm chúng vào thư viện phương tiện</p>
              </div>
            </div>
            { checked.length > 0
              ? <div className="px-6 my-6 grid gap-4 overflow-y-auto max-h-[60vh]" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))'}}>
                { files.filter(v => checked.includes(v.id)).map((v,i) =>
                  <div className="rounded border overflow-hidden" key={v.id}>
                    <div className="relative w-full h-24 bg-make-transparent">
                    <FileIcon name={v.name} mime={v.mime} url={v.url} caption={v.caption} width={v.naturalWidth} height={v.naturalHeight} />
                      <div className="absolute top-2 left-2">
                        <Checkbox value={v.id} checked={isChecked(v.id)} onChange={(e) => handleCheck(e)} />
                      </div>
                      <span
                        className="absolute top-2 right-2 icon w-8 h-8 !text-[18px] rounded border p-1.5 bg-white hover:bg-gray-100 cursor-pointer hidden group-hover:block"
                        onClick={() => editFile(v)}
                      >
                        edit
                      </span>
                    </div>
                    <div className="p-4 py-2 flex flex-col items-start space-y-2 text-xs">
                      <p className="font-semibold break-words">{v.name}</p>
                      <p className="uppercase text-[10px] p-1 py-0.5 font-semibold rounded bg-gray-100">{v.mime}</p>
                    </div>
                  </div>
                )}
              </div>
              : <div className='px-6 my-6'>Không có tài sản nào được chọn</div>
            }
          </div>
        </ModalContent>

        <ModalAction className="p-6 flex items-center space-x-4">
          <ButtonAdmin color='white' onClick={() => setShow(false)} size='sm'>
            Hủy bỏ
          </ButtonAdmin>

          <div className="!ml-auto"></div>

          <ButtonAdmin 
            startIcon="refresh" size='sm' variant='outline'
            onClick={() => fetchFiles()}
          >
            Tải lại
          </ButtonAdmin>

          <ButtonAdmin
            onClick={next} size='sm'
          >
            Tiếp theo
          </ButtonAdmin>
        </ModalAction>
      </Modal>

      <AdminFileAdd tableName={tableName} fileTypes={fileTypes} folderFileId={folderParentId} show={addModal} setShow={setAddModal} setData={setDataUpload} />
      <AdminFileEdit show={editModal} setShow={setEditModal} data={dataEdit} setData={setDataEdit} setFiles={setFiles} />
      <AdminFileModalAddFolder 
        tableName={tableName} show={addFolderModal} 
        parentId={folderParentId} setShow={setAddFolderModal} 
        data={dataFolderEdit} setData={setDataFolderAdd} 
        dataDelete={dataFolderDelete} setDataDelete={setDataFolderDelete}
      />
    </>
  )
}

export default AdminFileModal