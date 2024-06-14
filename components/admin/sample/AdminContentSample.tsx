"use client"

import { useState } from 'react'
import Link from 'next/link';
import { File } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { DeleteDataSampleState, SampleColumnsType, deleteDataSample } from '@/actions/admin/sample';
import { useTransition } from "react";
import dayjs from 'dayjs';
import { useAction, usePromise } from '@/lib/utils/promise';
import ButtonAdmin from '../form/ButtonAdmin';
import Dropdown, { MenuItem } from '@/components/ui/Dropdown';
import SwitchAdmin from '../form/SwitchAdmin';
import FileIcon from '../form/image/FileIcon';
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal';
import Backdrop from '@/components/ui/Backdrop';
import { Pagination, TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table';
import Checkbox from '@/components/ui/Checkbox';

export type SampleStateType = {
  data: any[],
  name: string,
  table_name: string,
  count: number,
  ROWS_PER_PAGES: number[],
  ORDER_BY?: string,
  ORDER_TYPE?: 'asc' | 'desc',
  columns: SampleColumnsType[],
  canDelete: boolean,
  canEdit: boolean,
  canCreate: boolean
}
const AdminContentSample: React.FC<SampleStateType> = ({ 
  data, name, table_name, count, ROWS_PER_PAGES, columns , canDelete,
  canEdit, canCreate, ORDER_BY, ORDER_TYPE
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const page = +(searchParams?.get('page') || 1)
  const perPage = +(searchParams?.get('per_page') || ROWS_PER_PAGES[0])

  const orderBy = searchParams?.get('order_by') || ORDER_BY
  const orderType = searchParams?.get('order_type') || ORDER_TYPE

  
  const handleChangePage = (page: number) => {
    let query = new URLSearchParams(searchParams?.toString())

    // query.set('page', (page + 1).toString())
    query.set('page', (page).toString())
    router.push(`?${query.toString()}`)
  }

  const handleChangeRowsPerPage = (perPage: number) => {
    let query = new URLSearchParams(searchParams?.toString())

    query.delete('page')
    query.set('per_page', (perPage.toString() || ROWS_PER_PAGES[0].toString()))
        
    router.push(`?${query.toString()}`)
  }

  const changeOrder = (orderByChange: string) => {
    let tempOrderBy = orderBy,
      tempOrderType = orderType

    if (orderBy == orderByChange) {
      tempOrderType = orderType == "asc" ? "desc" : orderType == "desc" ? undefined : "asc"
    }
    else {
      tempOrderBy = orderByChange
      tempOrderType = "asc"
    }

    let query = new URLSearchParams(searchParams?.toString())
    // query.delete('page')
    // query.delete('per_page')
    if (!tempOrderType || !tempOrderBy) {
      query.delete('order_by')
      query.delete('order_type')
    }
    else {
      query.set('order_by', tempOrderBy)
      query.set('order_type', tempOrderType)
    }

    router.push(`?${query.toString()}`)
  }

  // show field

  const [columnShowFields, setColumnShowFields] = useState<string[]>(columns.filter(v => v.show).map(e => e.name))
  const handelChangeColumnShowField = (e: React.FormEvent<HTMLInputElement>, key: string) => {
    const { checked: isChecked } = e.target as HTMLInputElement

    if (isChecked) {
      setColumnShowFields([...columnShowFields, key])
    }
    else {
      setColumnShowFields(columnShowFields.filter(item => item !== key))
    }
  }

  // checked
  const [checked, setChecked] = useState<string[]>([])

  const handleSelectAll = () => {
    if (checked.length == data.length) {
      setChecked([])
    }
    else {
      setChecked(data.map(v => v.id))
    }
  }

  const handleSelect = (e: React.FormEvent<HTMLInputElement>) => {
    const { id, checked: isChecked } = e.target as HTMLInputElement

    if (isChecked) {
      setChecked([...checked, id])
    }
    else {
      setChecked(checked.filter(item => item !== id))
    }
  }

  // delete data item
  const [loading, setLoading] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<string | number | null>(null)

  const handleCloseModalDelete = () => {
    setIsDelete(false)
    setDeleteId(null)
  }

  const showDeleteModal = (id?: number | string) => {
    if (id != undefined) {
      setDeleteId(id)
    }

    setIsDelete(true)
  }

  const handelDeleteData = async (e: React.MouseEvent<HTMLElement>) => {
    usePromise({
      loading,
      setLoading,
      callback: async () => {
        let ids = deleteId ? [deleteId] : checked
        
        await useAction(() => deleteDataSample({ ids: ids, tableName: table_name}))

        router.refresh()
        setIsDelete(false)
      }
    })
  }

  return (
    <>
      <section className="flex items-center space-x-4">
        <div>
          <h3 className="text-2xl font-semibold">{name}</h3>
          {/* <p className="text-sm text-gray-600 mt-1">{count} bản ghi</p> */}
        </div>

        <ButtonAdmin color='red' disabled={!canDelete || checked.length == 0} 
          onClick={() => showDeleteModal()}
          startIcon={(
            <span className="icon">
              delete
            </span>
          )}
        >
          Xóa bản ghi
        </ButtonAdmin>

        <ButtonAdmin href={`${pathname}/create`} disabled={!canCreate} LinkComponent={Link} className='!ml-auto' startIcon={(
          <span className="icon">
            add
          </span>
        )}>
          Thêm bản ghi mới
        </ButtonAdmin>

        <Dropdown renderItem={(rest) => (
          <button {...rest} className="flex space-x-2 p-2 pr-2 bg-white border rounded shadow">
            <span className="icon icon-fill">
              settings
            </span>
            <span className="icon">
              arrow_drop_down
            </span>
          </button>
        )} className='z-10' >
          {columns.map(column =>
            <MenuItem key={column.name}>
              <SwitchAdmin endLabel={column.label}
                onChange={(e) => handelChangeColumnShowField(e, column.name)} 
                checked={columnShowFields.includes(column.name)}/>
            </MenuItem>
          )}
        </Dropdown>
      </section>

      <section className='mt-8'>
        <Table rounded border shadow className='bg-white'
          pagination={<Pagination 
            placement="right"
            count={count} 
            page={page}
            rowsPerPage={perPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onPageChange={handleChangePage}
          />}
        >
          <THead gray={true} >
            <Tr>
              <Th style={{width: '0px'}}>
                <Checkbox checked={checked.length == data.length} onChange={handleSelectAll} />
              </Th>
              {columns.filter(v => columnShowFields.includes(v.name)).map((column) => (
                <Th
                  key={column.name}
                  // width={column?.width || 'auto'}
                  style={{width: column.name == 'id' ? 0 : 'auto'}}
                  className='cursor-pointer select-none'
                  onClick={() => changeOrder(column.name)}
                >
                  <div className="flex space-x-2 items-center justify-between">
                    <span>{column.label}</span>
                    { orderBy == column.name && orderType != undefined
                      ? <span className="icon">{orderType == "asc" ? 'arrow_drop_down' : 'arrow_drop_up'}</span>
                      : null
                    }
                  </div>
                </Th>
              ))}
              <Th align="right" style={{width: '0px', whiteSpace: 'nowrap'}}>Hành động</Th>
            </Tr>
          </THead>
          <TBody>
            {data.length > 0 ? data.map((row) => (
              <Tr key={row.id}>
                <Td>
                  <Checkbox id={row.id} checked={checked.includes(row.id)} onChange={handleSelect} />
                </Td>
                {columns.filter(v => columnShowFields.includes(v.name)).map(column => 
                  <Td key={`${row.id}-${column.name}`}>
                    { column.type == 'date'
                      ? ViewDateField(row[column.name])
                      : column.type == 'publish' ? ViewPublishField(row[column.name])
                      : column.type == 'select' ? ViewSelectField(row[column.name], column.details.list)
                      : column.type == 'file' ? ViewFileField(row[column.name])
                      : column.type == 'relation' ? ViewRelationField(row[column.name], column.details.titleRelation)
                      : column.type == 'permissions' ? null
                      : (column.type == "custom" && column.details.customComponentView) ? column.details.customComponentView(row[column.name])
                      : <span className={column.name == "id" ? 'whitespace-nowrap' : ''}>{row[column.name] || ''}</span>
                    }
                  </Td>
                )}
                <Td align="right">
                  <div className="flex space-x-1 items-center justify-end">
                    <ButtonAdmin LinkComponent={Link} href={`${pathname}/${row.id}`} disabled={!canDelete} size='sm' startIcon="edit" >Sửa</ButtonAdmin>
                    <ButtonAdmin color='red' disabled={!canDelete} size='sm' 
                      onClick={() => showDeleteModal(row.id)}
                      startIcon="delete"
                    >Xóa</ButtonAdmin>
                  </div>
                </Td>
              </Tr>
            ))
            : <Tr><Td colSpan={"100%" as any} className='!text-center'>Không có bản ghi nào</Td></Tr> }
          </TBody>
        </Table>
      </section>

      <Modal
        open={isDelete}
        onClose={handleCloseModalDelete}
      >
        <ModalTitle>Xóa bản ghi</ModalTitle>
        <ModalContent>
          Bạn có chắc chắn muốn xóa 
          <span className="text-red-600"> {deleteId ? `"${deleteId}"` : checked.join(', ')}</span>
        </ModalContent>
        <ModalAction>
          <ButtonAdmin size='sm' variant="outline" color='black' onClick={handleCloseModalDelete}>Hủy bỏ</ButtonAdmin>
          <ButtonAdmin size='sm' color='red' onClick={handelDeleteData}>Tiếp tục</ButtonAdmin>
        </ModalAction>
      </Modal>

      <Backdrop
        open={loading}
        className='grid place-items-center'
      >
        <span className="icon animate-spin">progress_activity</span>
      </Backdrop>
    </>
  )
}

const ViewDateField = (value: Date) => {
  const date = dayjs(value)
  const formattedDate = date.format('YYYY-MM-DD')
  const formattedTime = date.format('HH:mm:ss')

  return <div className="whitespace-nowrap">
    <p className="text-sm">{formattedDate}</p>
    <p className='text-gray-500 text-xs'>{formattedTime}</p>
  </div>
}

const ViewPublishField = (value: string) => {
  return <div className={`inline-block px-4 py-1.5 rounded border font-semibold 
    ${value == 'draft' ? 'bg-sky-100 border-sky-300 text-sky-600' : 'bg-green-100 border-green-300 text-green-700'}`}
  >
    { value == 'draft' ? 'Nháp' : 'Xuất bản'}
  </div>
}

const ViewFileField = (data: File | File[] | null) => {
  if (data == null) {
    return <p>...</p>
  }

  const files = Array.isArray(data) ? data : [data]
  const length = files.length > 2 ? 2 : files.length

  return (
    <div className="flex -space-x-10">
      {files.slice(0, length).map((file,i) =>
        <FileIcon key={file.id} name={file.name} mime={file.mime} url={file.url} className='w-20 h-16 rounded-lg object-cover ring-2 ring-white' />
      )}
      {files.length > length 
        ? <div className="h-16 rounded-lg ring-2 ring-white bg-gray-300/90 flex items-center px-2 font-semibold text-xs">+{files.length - length} more</div>
        : null
      }
    </div>
  )
}

const ViewRelationField = (data: any | any[] | null, title: string) => {
  if (data == null) {
    return <p>...</p>
  }

  const list = Array.isArray(data) ? data : [data]
  const length = list.length > 3 ? 3 : list.length

  return (
    <div className="flex flex-wrap items-center -mx-1">
      {list.slice(0, length).map((item,i) =>
        <div className="px-1 mb-2" key={item.id}>
          <div key={item.id} className='rounded-full bg-gray-200 px-2 py-1.5 font-semibold text-xs'>{item[title] || ''}</div>
        </div>
      )}
      {list.length > length 
        ? <div className="rounded-lg bg-gray-300/90 flex items-center p-2 font-semibold text-xs">+{list.length - length} more</div>
        : null
      }
    </div>
  )
}

const ViewSelectField = (value: string, list: { title: string, value: string}[]) => {
  const data = list.find(v => v.value == value)?.title || ''
  return (<span>{data}</span>)
}

export default AdminContentSample