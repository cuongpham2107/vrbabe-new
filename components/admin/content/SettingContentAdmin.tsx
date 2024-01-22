"use client"
import { useEffect, useState, FC } from 'react'
import { DATA_FIELDS, createDefaultValue } from '@/lib/admin/fields';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { GroupSettingSampleType } from '@/app/admin/(admin)/[slug]/table';
import { GroupSettingType, createEditSettings, saveSettings } from '@/actions/admin/settings';
import { SampleColumnSlugType } from '@/actions/admin/sample';
import { useAction, usePromise } from '@/lib/utils/promise';
import ButtonAdmin from '../form/ButtonAdmin';
import { Modal, ModalAction, ModalContent, ModalTitle } from '@/components/ui/Modal';

type State = {
  groupSettings: GroupSettingType[],
  canDelete: boolean,
  canEdit: boolean,
  canCreate: boolean,
  GROUPS: GroupSettingSampleType[]
}

// million-ignore
const SettingContentAdmin: FC<State> = ({
  groupSettings, canDelete, canCreate, canEdit, GROUPS
}) => {
  const router = useRouter()
  const [groupActive, setGroupActive] = useState(groupSettings.length > 0 ? groupSettings[0] : undefined);

  const settings = groupActive != undefined ? groupActive.settings : []

  const [openUpdateSettingModal, setOpenUpdateSettingModal] = useState(false)

  useEffect(() => {
    setGroupActive(groupSettings.length > 0 ? groupSettings[0] : undefined)
  }, [groupSettings])

  // list data
  const [listDataValue, setListDataValue] = useState<{
    name: string,
    value: any
  }[]>([])

  useEffect(() => {
    setListDataValue(createDataDefault(groupSettings))
  }, [groupSettings])

  const createDataDefault = (groupSettings: GroupSettingType[]) => {
    let data: {
      name: string,
      value: any
    }[] = []

    groupSettings.forEach(group => {
      let temp = group.settings.map(v => ({ name: v.name, value: v.value ?? createDefaultValue(v) }) )
      data.push(...temp)
    });

    return data
  }

  const onChangeValue = (value: any, name: string) => {
    let columns = GROUPS.find(v => v.name == groupActive?.name)?.settings || []

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


  // save settings
  const [loading, setLoading] = useState(false)
  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    usePromise({
      loading: loading,
      setLoading: setLoading,
      callback: async () => {
        await useAction(() => saveSettings(listDataValue.map(v => ({
          name: v.name,
          value: typeof v.value == "object" ? v.value?.id || '' : v.value.toString()
        }))))
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="-my-4 flex flex-col" style={{minHeight: 'calc(100vh - 64px)'}}>
        <div className="-mx-8 px-8 border-b bg-white pt-6 flex space-x-4 items-start">
          <div>
            <h5 className="text-3xl font-semibold">Cài đặt</h5>
            <div className="flex mt-4 gap-6 items-center">
              { groupSettings.map(v =>
                <div key={v.id} 
                  className={`py-2 capitalize hover:text-blue-500 cursor-pointer 
                    ${v.id == groupActive?.id ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                  onClick={() => setGroupActive(v)}
                >{v.name}</div>
              )}
            </div>
          </div>
          <div className="!ml-auto"></div>
          <ButtonAdmin color='yellow' disabled={!canEdit} startIcon="sync"
            onClick={() => setOpenUpdateSettingModal(true)}
          >
            Cập nhập cài đặt
          </ButtonAdmin>
        </div>
        <div className="flex-grow min-h-0 -mx-8 p-8">
          <form className="grid grid-cols-12 bg-white rounded-lg p-8 gap-6" onSubmit={handelSubmit}>
            { settings.length > 0 
              ? <>
                { settings.map(v => {
                  const Component = DATA_FIELDS[v.type] ? DATA_FIELDS[v.type].Component : null
                  return Component ? <div key={v.id} style={{gridColumn: `span ${v.col || 6} / span ${v.col || 6}`}}>
                    <Component
                      label={v.label} name={v.name}
                      placeholder={v.label}
                      required={false} 
                      value={listDataValue.find(v2 => v2.name == v.name)?.value || ''}
                      onChange={(e: any) => onChangeValue(e.target.value, v.name)}
                      details={{...v.details, tableName: 'setting'}}
                    />
                  </div> : null
                })}
                <div className="col-span-12">
                  <ButtonAdmin type='submit' className='float-right' disabled={!canEdit} startIcon="save">
                    Lưu cài đặt
                  </ButtonAdmin>
                </div>
              </>
              : <p className='col-span-12'>Không có cài đặt nào</p>
            }
          </form>
        </div>
      </div>

      <UpdateSettingsPopup open={openUpdateSettingModal} setOpen={setOpenUpdateSettingModal} />
    </>
  )
}

const UpdateSettingsPopup = ({
  open, setOpen
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}) => {

  const router = useRouter()

  const handelSubmit = () => {
    usePromise({
      callback: async () => {
        await useAction(createEditSettings)
        
        router.refresh()
        setOpen(false)
      }
    })
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
    >
      <ModalTitle>Cập nhập cài đặt</ModalTitle>
      <ModalContent>
        Bạn có  muốn cập nhập lại cài đặt không ?
      </ModalContent>
      <ModalAction>
        <ButtonAdmin size='sm' color='white' onClick={() => setOpen(false)}>Hủy</ButtonAdmin>
        <ButtonAdmin size='sm' onClick={handelSubmit}>Tiếp tục</ButtonAdmin>
      </ModalAction>
    </Modal>
  )
}

export default SettingContentAdmin