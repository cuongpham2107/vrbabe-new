"use client"
import { useRouter } from 'next/navigation'
import React, { useState, FormEvent, MouseEvent, ChangeEvent } from 'react'
import { SampleColumnSlugType, SampleColumnsType, addEditDataSample, changePublishData } from '@/actions/admin/sample'
import { DATA_FIELDS, createDefaultValue } from '@/lib/admin/fields'
import slugify from 'slugify'
import { useAction, usePromise } from '@/lib/utils/promise'
import ButtonAdmin from '../form/ButtonAdmin'
import dayjs from 'dayjs'
import Backdrop from '@/components/ui/Backdrop'

export type SampleStateType = {
  data?: any | undefined,
  name: string,
  tableName: string,
  tablesName: string[],
  columns: SampleColumnsType[],
}

// million-ignore
const AdminContentSampleCreateEdit: React.FC<SampleStateType> = ({
  data, name, columns, tableName, tablesName
}) => {
  
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    usePromise({
      loading,
      setLoading,
      callback: async () => {
        // const formData = Object.fromEntries(
        //   new FormData(e.target as HTMLFormElement),
        // )

        let formData: {[key: string]: any} = listDataValue.reduce((pre, cur) => ({...pre, [cur.name]: cur.value}), {})

        if (data) {
          formData.id = data.id
        }
  
        await useAction(() => addEditDataSample({data: formData, edit: data != undefined, tableName: tableName}))

        if (!data) {
          router.back()
        }
        router.refresh()
      }
    })
  }

  const handelChangePublish = async (e: MouseEvent) => {
    if (!data || data.publish == undefined) return

    usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => changePublishData({
          id: data.id,
          publish: data.publish == 'publish' ? 'draft' : 'publish',
          tableName: tableName
        }))
        
        router.refresh()
      }
    })
  }
  
  // list data
  const [listDataValue, setListDataValue] = useState<{
    name: string,
    value: any
  }[]>(columns.map(v => ({ name: v.name, value: (data && data[v.name]) ? data[v.name]  : createDefaultValue(v)})))

  const onChangeValue = (value: any, name: string) => {
    let column = (columns.filter(v => v.type == "slug") as ({
      name: string
    } & SampleColumnSlugType)[]).find(v => v.details.tableNameSlug == name)

    setListDataValue(state => state.map(v => {
      if (column && v.name == column.name) {
        return { ...v, value: slugify(value, {
          replacement: '_',
          lower: true,
          locale: 'vi',
          trim: false
        }) }
      }

      if (v.name == name) {
        return {...v, value}
      }

      return v
    }))
  }
  return (
    <form onSubmit={save}>
      <div className="flex items-center space-x-1 text-sky-500 hover:text-sky-600 bg-transparent cursor-pointer"
        onClick={() => router.back()}
      >
        <span className="icon">
          arrow_left_alt
        </span>
        <span>Trở lại</span>
      </div>

      <section className="flex items-center gap-4 mt-2">
        <div className='mr-auto'>
          <h3 className="text-2xl font-semibold">{name}</h3>
        </div>

        { data && typeof data.publish !== 'undefined'
          ? <ButtonAdmin disabled={!data} color={(data ? data.publish == 'publish' : false) ? 'green' : 'black'} 
            startIcon={(data ? data.publish == 'publish' : false) ? 'check' : 'remove'} onClick={handelChangePublish}>
            {(data ? data.publish == 'publish' : false) ? 'Xuất bản' : 'Nháp'}
          </ButtonAdmin>
          : null
        }

        <ButtonAdmin type='submit'>
          Lưu
        </ButtonAdmin>
      </section>

      <div className="mt-6 flex flex-wrap -mx-2">
        <div className="w-full lg:w-3/4 px-2 mb-4">
          <div className="w-full p-4 bg-white rounded shadow">
            <div className="flex -mx-2 flex-wrap">
              {columns.filter(v => !['id', 'createdAt', 'updatedAt', 'publish'].includes(v.name)).map(column => {
                const Component = DATA_FIELDS[column.type] 
                  ? column.type == "custom" ? column.details.customComponentEdit 
                  : DATA_FIELDS[column.type].Component : null

                return Component ? <div className="px-2 mb-4" key={column.name} style={{ width: column.col ? `${(12 / column.col) * 100}%` : '50%' }}>
                  <Component
                    key={column.name}
                    label={column.label} name={column.name}
                    required={column.required} 
                    // defaultValue={data ? data[column.name] : undefined}
                    value={listDataValue.find(v => v.name == column.name)?.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeValue(e.target.value, column.name)}
                    details={{...column.details, tableName: tableName}}
                  />
                </div> : null
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/4 px-2 mb-4 flex flex-col gap-4">
          { data && typeof data.publish !== 'undefined'
            ? <div className={`w-full p-4 border rounded flex space-x-2 items-center text-sm
              ${(data ? data.publish == 'publish' : false) ? 'bg-purple-100 border-purple-400 text-purple-600' : 'bg-sky-100 border-sky-400 text-sky-600'}
            `}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="font-semibold">{data ? 'Chỉnh sửa' : 'Tạo mới'}</span>
              <span>phiên bản {(data ? data.publish == 'publish' : false) ? 'xuất bản' : 'nháp'}</span>
            </div>
            : null
          }

          <div className="w-full p-4 bg-white rounded shadow">
            <h5 className="uppercase text-sm border-b pb-2">Thông tin</h5>

            <div className="flex flex-col space-y-4 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Thời gian tạo</span>
                <span>{data ? dayjs(data?.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'now'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Thời gian cập nhập</span>
                <span>{data ? dayjs(data?.updatedAt).format('YYYY-MM-DD HH:mm:ss') : 'now'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Backdrop
        open={loading}
        className='grid place-items-center'
      >
        <span className="icon animate-spin">progress_activity</span>
      </Backdrop>
    </form>
  )
}

export default AdminContentSampleCreateEdit