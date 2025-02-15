import type { Account } from '@prisma/client'
import { create } from 'zustand'
import { toast } from 'react-toastify'

interface useAccountStoreProps {
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  addAccount: (account: Account, userEmail: string) => void
  deleteAccount: (account: Account) => void
}

export const useAccountStore = create<useAccountStoreProps>((set) => {
  return {
    accounts: [],
    setAccounts: (accounts: Account[]) => set({ accounts }),

    // Thêm tài khoản vào db rồi mới update state, giúp cho data trong state đồng bộ với db
    addAccount: (account: Account, userEmail: string) => {
      try {
        fetch('/api/auth/linked-accounts', { method: 'POST', body: JSON.stringify({ account: account, userEmail: userEmail }) }).then((res) => {
          if (!res.ok) throw new Error('Server Error!')
          res.json().then((account) => set((state) => ({ accounts: [...state.accounts, account] })))
        })

        toast('Thêm tài khoản VLU thành công!')
      } catch (error) {
        toast(('Lỗi khi xóa tài khoản! Vui lòng thử lại' + error) as string)
        console.error(error)
      }
    },

    // Xóa state trước khi xóa trong db, giúp load nhanh hơn làm cho UX tốt hơn
    deleteAccount: (account: Account) => {
      set((state) => ({ accounts: state.accounts.filter((a) => a.id !== account.id) }))

      try {
        fetch('/api/auth/linked-accounts', { method: 'DELETE', body: JSON.stringify(account) }).then((res) => {
          if (!res.ok) throw new Error('Server Error!')

          toast('Xóa tài khoản VLU thành công!')
        })
      } catch (error) {
        toast(('Lỗi khi xóa tài khoản! Vui lòng thử lại' + error) as string)
        console.error(error)
      }
    },
  }
})
