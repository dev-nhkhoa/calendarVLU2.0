import { useState, useEffect } from 'react'

const useLocalStorage = <T,>(key: string): [T | null, (value: T | ((val: T | null) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T | null>(null)

  // Khởi tạo giá trị từ localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key)
      setStoredValue(item ? JSON.parse(item) : null)
    } catch (error) {
      console.error(`Lỗi đọc localStorage key "${key}":`, error)
    }
  }, [key])

  // Cập nhật localStorage khi giá trị thay đổi
  const setValue = (value: T | ((val: T | null) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        if (valueToStore === null) {
          window.localStorage.removeItem(key)
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      }
    } catch (error) {
      console.error(`Lỗi ghi localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
