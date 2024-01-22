"use client"
import {InputHTMLAttributes, useCallback, useEffect, useState} from 'react'
import { File } from '@prisma/client';
import AdminFileModal from './image/FileModal';
import FilesSlide from './image/FileSlide';
import { FileTypeState } from '@/actions/admin/sample';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> & {
  label?: string | null,
  caption?: string,
  value?: File | null,
  defaultValue?: File | null,
  onChange?: React.ChangeEventHandler<Omit<HTMLInputElement, 'value'> & { value: File }>
  details: {
    multiple?: boolean,
    tableName: string,
    onlyTable?: boolean
    fileTypes?: FileTypeState
  }
}

const FileInputAdmin: React.FC<Props> = ({
  name,
  label,
  caption,
  required = false,
  defaultValue,
  className,
  value,
  onChange,
  details: {
    multiple = false,
    tableName,
    onlyTable = true,
    fileTypes = ['image']
  }
}) => {
  const [showModal, setShowModal] = useState(false)
  const [files, setFiles] = useState<File[]>(value 
    ? (value ? Array.isArray(value) ? value : [value] : []) 
    : (defaultValue ? Array.isArray(defaultValue) ? defaultValue : [defaultValue] : [])
  )

  useEffect(() => {
    setFiles(value 
      ? (value ? Array.isArray(value) ? value : [value] : []) 
      : (defaultValue ? Array.isArray(defaultValue) ? defaultValue : [defaultValue] : [])
    )
  }, [value, defaultValue])

  const handelShowModal = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setShowModal((state) => state = !state)
  }

  const handelChangeFile = useCallback((data: File[]) => {
    const syntheticEvent: any = {
      target: {
        value: multiple ? data : data.length > 0 ? data[0] : null
      },
    }

    onChange?.(syntheticEvent)
  }, [])

  return (
    <div className={className}>
      { label
        ? <p className="inline-block text-sm font-medium mb-2 dark:text-white">{label} { required && <span className="text-red-500">*</span> }</p>
        : null
      }
      { caption
        ? <p className="block text-xs mb-2 dark:text-white">{caption}</p>
        : null
      }
      <div className="h-40 border rounded bg-white relative">
        <input type="text" className='sr-only' value={value ? JSON.stringify(value) : ''} onChange={() => {}} required={required} />
        <div className="w-full h-full flex flex-col justify-center items-center cursor-pointer"
          onClick={handelShowModal}
        >
          { files.length > 0
            ? <FilesSlide files={files} />
            : <>
              <div className="flex">
                { fileTypes.includes('all')
                  ? <span className="icon text-sky-600 !text-4xl bg-white">attach_file</span>
                  : fileTypes.includes('image') ? <span className="icon text-orange-600 !text-4xl bg-white">image</span>
                  : fileTypes.includes('audio') ? <span className="icon text-amber-600 !text-4xl bg-white">audio_file</span>
                  : fileTypes.includes('video') ? <span className="icon text-green-600 !text-4xl bg-white">video_file</span>
                  : <span className="icon text-sky-600 !text-4xl bg-white">attach_file</span>
                }
              </div>
              <span className="mt-2 text-xs font-semibold">Chọn để thêm một tài sản</span>
            </>
          }
        </div>
      </div>

      <AdminFileModal 
        onlyTable={onlyTable}
        tableName={tableName} 
        show={showModal} 
        setShow={setShowModal} 
        multiple={multiple} 
        data={files} 
        setData={handelChangeFile} 
        fileTypes={fileTypes}
      />
    </div>
  )
}

export default FileInputAdmin