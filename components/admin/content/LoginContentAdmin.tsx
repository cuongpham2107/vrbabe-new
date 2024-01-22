"use client"
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import React, { FormEvent, useState } from 'react'
import { useAction, usePromise } from '@/lib/utils/promise'
import InputAdmin from '../form/InputAdmin'
import Checkbox from '@/components/ui/Checkbox'
import { loginAdmin } from '@/actions/admin/admin'

const LoginContentAdmin = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  

  const login = async (e: FormEvent) => {
    e.preventDefault()

    await usePromise({
      loading,
      setLoading,
      callback: async () => {
        const { email, password, remember }: any = Object.fromEntries(
          new FormData(e.target as HTMLFormElement),
        )
        
        const { user } = await useAction(() => loginAdmin({
          email, password, remember
        }))

        router.refresh()
      }
    })
  }

  return (
    <div className="w-full h-[1px] min-h-screen flex items-stretch">
      <div className="w-full flex min-h-full h-max">
        <div className="flex w-full items-stretch text-gray-600 overflow-x-hidden">
          <div className="hidden lg:flex w-full lg:w-6/12 items-center justify-center bg-gray-50 px-8 py-8">
            <div className="relative w-full h-full">
              <Image src="/images/bg-auth.png" alt="auth login" className="absolute w-full h-full object-contain top-0 left-0" width={800} height={800} />
            </div>
          </div>

          <div className="w-full lg:w-6/12 px-6 lg:px-20 py-8">
            <div className="flex h-full w-full flex-col justify-center space-y-8">
              <div className='flex flex-col items-center lg:block'>
                <h3 className="text-2xl uppercase">Đăng nhập</h3>
                <h5 className="mt-4 text-4xl font-semibold text-gray-800">Chào mừng quay trở lại</h5>
                <p className="mt-4">Vui lòng nhập chi tiết tài khoản của bạn</p>

                <form
                  className="mt-16 flex w-full max-w-xl flex-col gap-4" 
                  onSubmit={login}
                >
                  <InputAdmin name='email' id='email' placeholder="Email" label="Email" startIcon="email" inputClass='bg-gray-100' />

                  <InputAdmin type='password' name='password' id='password' placeholder="Password" label="Password" startIcon="key" inputClass='bg-gray-100' />

                  <Checkbox name='remember' label='Ghi nhớ tôi' defaultChecked />

                  { error != ""
                    ? <div className="border border-red-500 p-2 rounded bg-red-200">
                      {error}
                    </div> : null
                  }

                  <button className="rounded-md bg-indigo-500 px-4 py-2.5 text-white hover:bg-indigo-400 relative overflow-hidden">
                    <span>Tiếp tục</span>
                    { loading
                      ? <div className="absolute w-full h-full top-0 left-0 grid place-items-center bg-indigo-400">
                        <span className="icon animate-spin">progress_activity</span>
                      </div>
                      : null
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginContentAdmin