"use client"

import React, { MouseEvent, useState } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdminType, updateProfile } from '@/actions/admin/admin';
import { useAction, usePromise } from '@/lib/utils/promise';
import ButtonAdmin from '../form/ButtonAdmin';
import InputAdmin from '../form/InputAdmin';
import FileInputAdmin from '../form/FileInputAdmin';

type Props = {
  defaultValue: NonNullable<AdminType>
}

const ProfileContentAdmin: React.FC<Props> = ({defaultValue}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(defaultValue.name)
  const [email, setEmail] = useState(defaultValue.email)
  const [image, setImage] = useState(defaultValue?.image || null)
  const [password, setPassword] = useState('')

  const isChangedValue = (name != defaultValue.name
    || email != defaultValue.email
    || (image ? image != defaultValue.image : false)
    || password != ''
  )

  const handelSubmit = (e: MouseEvent) => {
    e.preventDefault()

    usePromise({
      loading,
      setLoading,
      callback: async () => {
        if (loading) return
        setLoading(true)
  
        await useAction(() => updateProfile({
          email,
          name,
          imageId: image?.id,
          password
        }))
  
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className='-mx-8 -my-4 bg-white' style={{minHeight: 'calc(100vh - 64px)'}}>
        <div className="w-full h-36 bg-gray-200 relative bg-[url('/bg-profile.png')] overflow-hidden"></div>
        <div className="px-8">
          <div className="-translate-y-8 flex items-center space-x-4">
            <div className={`w-28 h-28 rounded-full border-4 border-white ${!defaultValue.image ? 'bg-sky-500' : ''} overflow-hidden grid place-items-center`}>
              { defaultValue.image
                ? <Image src={defaultValue.image.url} alt={`image profile user ${defaultValue.name}`} width={112} height={112} className='w-full h-full object-cover' />
                : <span className="icon icon-fill !text-white !text-7xl">
                  person
                </span>
              }
            </div>
            <div className="flex flex-col pt-6">
              <h3 className="text-2xl font-semibold">{defaultValue.name}</h3>
              <h5 className="text-gray-600">{defaultValue.email}</h5>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-y-6 text-sm">
            <div className='col-span-2 flex justify-between items-center border-b pb-6'>
              <div>
                <div className="text-base font-semibold">Hồ sơ cá nhân</div>
                <p className='text-gray-600'>Cập nhập ảnh và thông tin cá nhân của bạn ở đây</p>
              </div>
              <div className='flex space-x-4'>
                { isChangedValue
                  ? <ButtonAdmin>Hủy bỏ</ButtonAdmin>
                  : null
                }
                <ButtonAdmin disabled={!isChangedValue} onClick={handelSubmit}>Lưu thay đổi</ButtonAdmin>
              </div>
            </div>
            <div className='border-b pb-6 pr-8'>
              <div className="font-semibold">Thông tin công khai</div>
              <p className='text-gray-600'>Mọi người có thể thấy được thông tin này</p>
            </div>
            <div className='flex flex-col gap-4 border-b pb-6'>
              <InputAdmin name='name' className='w-96' label="Tên" value={name} onChange={(e) => setName(e.target.value)} />
              <InputAdmin name='email' className='w-96' label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className='border-b pb-6 pr-8'>
              <div className="font-semibold">Ảnh cá nhân</div>
              <p className='text-gray-600'>Cập nhập ảnh của bạn bằng cách chọn tùy chọn thêm ảnh bên cạnh</p>
            </div>
            <div className="border-b pb-6 flex gap-4 items-center">
              <div className={`w-24 h-24 rounded-full border-2 border-white ${!defaultValue.image ? 'bg-sky-500' : ''} overflow-hidden shadow grid place-items-center`}>
                { defaultValue.image
                  ? <Image src={defaultValue.image.url} alt={`image profile user ${defaultValue.name}`} width={96} height={96} className='w-full h-full object-cover' />
                  : <span className="icon icon-fill !text-white !text-6xl">
                    person
                  </span>
                }
              </div>
              <FileInputAdmin details={{tableName:"admin", onlyTable:true}} defaultValue={defaultValue.image} onChange={(e) => setImage(e.target.value)} name='name' className='w-96' />
            </div>
            <div className='border-b pb-6 pr-8'>
              <div className="font-semibold">Mật khẩu</div>
              <p className='text-gray-600'>Bạn nên giữ bí mật mật khẩu của mình</p>
            </div>
            <div className='flex flex-col gap-4 border-b pb-6'>
              <InputAdmin name='name' type='password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-96' label="Mật khẩu" autoComplete="new-password" />
            </div>
            <div className='col-span-2 flex justify-end space-x-4'>
              { isChangedValue
                ? <ButtonAdmin color='black'>Hủy bỏ</ButtonAdmin>
                : null
              }
              <ButtonAdmin disabled={!isChangedValue} onClick={handelSubmit}>Lưu thay đổi</ButtonAdmin>
            </div>
          </div>
        </div>
      </div>

      { loading ? <div className="absolute w-full h-full top-0 left-0 bg-white/30 grid place-items-center pointer-events-auto">
        <span className="icon-svg animate-spin w-10 h-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
        </span>
      </div> : null }
    </>
  )
}

export default ProfileContentAdmin