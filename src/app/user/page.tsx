import { Button } from '@/components/ui/button'
import React from 'react'

const UserPage = () => {
  return (
    <div className='w-full h-full flex justify-center items-center flex-col'>
        <p>UserPage</p>
        <div className='flex flex-col gap-2'>
            <Button>Liên kết tài khoản Văn Lang</Button>
            <Button>Liên kết tài khoản Google</Button>
            <Button>Liên kết tài khoản Mircosoft</Button>
        </div>  
    </div>
  )
}

export default UserPage