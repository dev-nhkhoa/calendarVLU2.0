import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React from 'react'
import VanLangLoginForm from './van-lang-login-form'
import { Button } from './ui/button'

export default function AddVLUAccountDialog({ open, setOpen }: { setOpen: React.Dispatch<React.SetStateAction<boolean>>; open: boolean }) {
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>Thêm tài khoản VLU</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add tài khoản VLU</DialogTitle>
          <DialogDescription>Thêm liên kết tài khoản VLU.</DialogDescription>
          <VanLangLoginForm setOpen={() => {}} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
