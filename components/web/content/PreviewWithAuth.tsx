"use client"
import ButtonAdmin from '@/components/admin/form/ButtonAdmin'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PreviewWithAuth = () => {
  const pathname = usePathname()
  return (
    <div className='w-full h-screen bg-gray-200 grid place-items-center'>
      <div className="relative w-full max-w-md rounded bg-white shadow border p-8 text-gray-600">
        <div className="absolute left-4 top-0 -translate-y-1/2 px-6 py-4 bg-white rounded shadow border font-semibold">Chế độ xem trước</div>

        <p className="mt-2 mb-4">Để truy cập được website này. Vui lòng <span className="font-semibold">đăng nhập</span> bằng tài khoản quản trị viên Website</p>

        <ButtonAdmin LinkComponent={Link} href={`/admin/login?url=${pathname}`}>Chuyển đến trang đăng nhập</ButtonAdmin>
      </div>
    </div>
  )
}

export default PreviewWithAuth