"use client"
import { sortScene } from '@/actions/admin/scenes';
import { SceneDataState } from '@/app/admin/(admin)/scenes/page'
import { removeAccents } from '@/lib/utils/hepler';
import { useAction, usePromise } from '@/lib/utils/promise';
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, memo, useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs';
import InputAdmin from '../form/InputAdmin';
import ButtonAdmin from '../form/ButtonAdmin';

const ListScene = ({
  scenes, setOpenModalAdd, sceneId, setSceneId
}: {
  scenes: SceneDataState[],
  setOpenModalAdd: (data: SceneDataState | null) => void,
  sceneId?: string, 
  setSceneId: Dispatch<SetStateAction<string>>
}) => {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const [scenesFilter, setScenesFilter] = useState<SceneDataState[]>(scenes)

  useEffect(() => {
    setScenesFilter(scenes.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0))
  }, [search])

  // sort scene
  const sortable = useRef<Sortable>()
  const listRef = useRef(null)
  const [stages, setStages] = useState(scenes.map(v => v.id))

  useEffect(() => {
    setScenesFilter(scenes.filter(v => removeAccents(v.name.toLowerCase()).indexOf(removeAccents(search.toLowerCase())) >= 0))
    setStages(scenes.map(v => v.id))
  }, [scenes])
  

  const checkSort = (scenesFilter.length == scenes.length) && (JSON.stringify(scenes.map(v => v.id)) != JSON.stringify(stages))

  const handleSort = (newIndex: number, oldIndex: number) => {
    let updatedItems = [...stages]
    let [movedItem] = updatedItems.splice(oldIndex, 1)
    updatedItems.splice(newIndex, 0, movedItem)
    setStages(updatedItems)
  };

  useEffect(() => {
    if (sortable.current) {
      sortable.current.options.onSort = (event: any) => {
        const { newIndex, oldIndex } = event;
        handleSort(newIndex, oldIndex)
      }
    }
  }, [stages, handleSort])

  const [loading, setLoading] = useState(false)

  const handelSortList = async () => {
    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        await useAction(() => sortScene(stages))

        router.refresh()
      }
    })
  }

  useEffect(() => {
    if (listRef.current) {
      sortable.current = new Sortable(listRef.current, {
        animation: 150,
        handle: '.item-handel'
      })
    }

    return () => {
      sortable.current?.destroy()
    };
  }, [])


  return (
    <div className='w-full h-full flex flex-col space-y-4 py-4'>
      <div className="px-4">
        <InputAdmin startIcon="search" placeholder='Tìm kiếm...' 
          value={search}
          onChange={(e => setSearch(e.target.value))}
        />
      </div>

      <div className='border-b mx-4'></div>

      <div ref={listRef} className="flex-grow min-h-0 flex flex-col space-y-2 overflow-y-auto px-4">
        { scenesFilter.length > 0 ? scenesFilter.map(v =>
            <button key={v.id} className={`flex items-center space-x-4 rounded hover:bg-gray-200 px-2 py-2 group ${v.publish == "draft" ? 'text-gray-500' : ''} ${sceneId == v.id ? 'bg-gray-200' : ''}`}
              onClick={() => setSceneId(v.id)}
            >
              <span className="icon">location_on</span>
              <span className="flex-grow min-w-0 text-left">{v.name}</span> 
              <span className={`item-handel flex-none icon invisible pointer-events-none group-hover:visible 
                group-hover:pointer-events-auto !ml-auto text-teal-500 hover:text-teal-600 
                ${scenesFilter.length < scenes.length ? '!invisible !pointer-events-none' : ''}`}>
                drag_indicator
              </span>
            </button>
          )
          : <p className="p-2">Không tìm thấy điểm chụp nào</p>
        }
      </div>

      { checkSort
        ? <ButtonAdmin startIcon={loading ? "progress_activity" : "save"} 
          className='!mx-4 justify-center' disabled={loading} onClick={handelSortList} >Lưu vị trí</ButtonAdmin>
       : null
      }

      <ButtonAdmin variant='outline' startIcon="add" className='!mx-4 justify-center' onClick={() => setOpenModalAdd(null)} >Thêm bối cảnh mới</ButtonAdmin>

    </div>
  )
}

export default memo(ListScene)