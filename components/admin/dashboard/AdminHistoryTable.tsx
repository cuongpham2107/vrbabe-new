"use client"

import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";
import Image from "next/image"
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { generatePaginationArray } from "@/lib/admin/pagination"
import { useAction, usePromise } from "@/lib/utils/promise";
import dayjs from "dayjs";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/Drawer";
import { Pagination, TBody, THead, Table, Td, Tr } from "@/components/ui/Table";
import { AdminHistoryState, getAdminHistory } from "@/actions/admin/dashboard";

const AdminHistoryTable = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AdminHistoryState[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [count, setCount] = useState(0)

  const fetchData = (page: number, perPage: number) => usePromise({
    loading,
    setLoading,
    showSuccessTitle: false,
    callback: async () => {
      const { data, count } = await useAction(() => getAdminHistory(page, perPage))

      setData(data)
      setCount(count)
    }
  })

  useEffect(() => {
    fetchData(page, perPage)
  }, [page])

  // click data show details
  const [dataShow, setDataShow] = useState<AdminHistoryState | null>(null)
  const handelClickItem = (data: AdminHistoryState) => {
    setDataShow(data)
  }

  // prismjs hightlight
  useEffect(() => {
    Prism.highlightAll()
  }, [data])

  return (
    <>
      <section className='mt-4 relative'>
        <Table loading={loading}
          pagination={<Pagination 
            placement="center"
            count={count} 
            page={page}
            rowsPerPage={perPage}
            onRowsPerPageChange={(perPage) => setPerPage(perPage)}
            onPageChange={page => setPage(page)}
          />}
        >
          <THead>
            <Tr>
              <Td>Thời gian</Td>
              <Td>Quản trị viên</Td>
              <Td>Trạng thái và ID</Td>
              <Td>Hành động</Td>
              <Td>Bảng</Td>
              <Td>Dữ liệu</Td>
            </Tr>
          </THead>
          <TBody>
            { data.length > 0
              ? data.map((v,i) =>
                <Tr key={v.id} onClick={() => handelClickItem(v)} className="hover:bg-sky-50 cursor-pointer">
                  <Td>
                    <ViewDateField value={v.createdAt} />
                  </Td>
                  <Td>
                    <div className="flex items-center space-x-2">
                      <div className={`w-12 h-12 rounded-full border-2 border-white overflow-hidden ${!v?.admin.image ? 'bg-sky-500' : ''} shadow grid place-items-center`}>
                        { v.admin.image?.url
                          ? <Image src={v.admin.image?.url} alt={`image profile ${v.admin.name}`} width={48} height={48} />
                          : <span className="icon icon-fill !text-white !text-3xl">
                            person
                          </span>
                        }
                      </div>
                      <div>
                        <p className="font-semibold">{v.admin.name}</p>
                        <p className="text-gray-600">{v.admin.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center space-x-2">
                      <span className={`icon ${v.status == 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {v.status == 'success' ? 'task_alt' : 'cancel'}
                      </span>
                      <p className="font-semibold">#{v.id}</p>
                    </div>
                  </Td>
                  <Td>
                    <div>
                      <p className="font-semibold">{v.action}</p>
                      <p className="mt-1">{v.title}</p>
                    </div>
                  </Td>
                  <Td className="!font-semibold !text-teal-600">{v.tableName || '...'}</Td>
                  <Td>
                    <pre className="line-clamp-3 !overflow-hidden max-w-md">
                      { v.data
                        ? <code className="language-js">
                          {v.data}
                        </code>
                        : '...'
                      }
                      
                    </pre>
                  </Td>
                </Tr>
              )
              : <Tr><Td colSpan={"100%" as any} className='!text-center'>Không có bản ghi nào</Td></Tr>
            }
          </TBody>
        </Table>
      </section>

      <TableItem data={dataShow} setData={setDataShow} />
    </>
  )
}

const ViewDateField = ({value}:{value: Date}) => {
  const date = dayjs(value)
  const formattedDate = date.format('YYYY-MM-DD')
  const formattedTime = date.format('HH:mm:ss')

  return <div className="whitespace-nowrap">
    <p className="text-sm">{formattedDate}</p>
    <p className='text-gray-500 text-xs'>{formattedTime}</p>
  </div>
}

const TableItem = ({
  data, setData
}: {
  data: AdminHistoryState | null,
  setData: Dispatch<SetStateAction<AdminHistoryState | null>>
}) => {
  const codeEl = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeEl.current && data) {
      Prism.highlightElement(codeEl.current)
    }
  }, [data])

  return (
    <>
      <Drawer
        anchor='right'
        open={data != null}
        onClose={() => setData(null)}
        className="max-w-2xl"
      >
        <DrawerTitle>
          Thông tin lịch sử 
          <span className="text-sky-600 pl-2">{data?.id}</span>
        </DrawerTitle>
        <DrawerContent className="py-6 px-6 flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium mb-1 capitalize">Quản trị viên</p>
            <div className="flex items-center space-x-2">
              <div className={`w-12 h-12 rounded-full border-2 border-white overflow-hidden ${!data?.admin.image ? 'bg-sky-500' : ''} shadow grid place-items-center`}>
                { data?.admin.image?.url
                  ? <Image src={data.admin.image?.url} alt={`image profile ${data.admin.name}`} width={48} height={48} />
                  : <span className="icon icon-fill !text-white !text-3xl">
                    person
                  </span>
                }
              </div>
              <div>
                <p className="font-semibold">{data?.admin.name}</p>
                <p className="text-gray-600">{data?.admin.email}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 items-stretch -mx-2">
            <div className="w-1/2 px-2 flex flex-col">
              <p className="flex-none text-sm font-medium mb-1 capitalize">Thời gian</p>
              <div className="flex-grow min-h-0 rounded bg-gray-100 p-2 -mx-2">
                <div className="whitespace-nowrap">
                  <p className="text-base">{dayjs(data?.createdAt).format('YYYY-MM-DD')}</p>
                  <p className='text-gray-500 text-sm'>{dayjs(data?.createdAt).format('HH:mm:ss')}</p>
                </div>
              </div>
            </div>
            <div className="w-1/2 px-2 flex flex-col">
              <p className="flex-none text-sm font-medium mb-1 capitalize">Trạng thái và ID</p>
              <div className="flex-grow min-h-0 rounded bg-gray-100 p-2 -mx-2">
                <div className="flex items-center space-x-2">
                  <span className={`icon ${data?.status == 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {data?.status == 'success' ? 'task_alt' : 'cancel'}
                  </span>
                  <p className="font-semibold">#{data?.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 capitalize">Hành động</p>
            <div className="rounded bg-gray-100 p-2 -mx-2 text-sm">
              <p className="font-semibold">{data?.action}</p>
              <p className="mt-1">{data?.title}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 capitalize">Bảng</p>
            <div className="rounded bg-gray-100 p-2 -mx-2">
              <p className="!font-semibold !text-teal-600">{data?.tableName || '...'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 capitalize">Dữ liệu</p>
            <div className="rounded bg-gray-100 px-2 py-0.5 -mx-2">
              <pre>
                { data?.data
                  ? <code ref={codeEl} className="language-js">
                    {data.data}
                  </code>
                  : '...'
                }
              </pre>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AdminHistoryTable