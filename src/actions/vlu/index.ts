'use server'

export async function getVluCookie(): Promise<string | undefined> {
  try {
    const fetchVluServer = await fetch(process.env.VLU_URL as string)
    const loginCookie = fetchVluServer.headers.get('set-cookie')?.split(';')[0]
    return loginCookie
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export async function createFormData(id: string, password: string): Promise<FormData> {
  const applyAuth = new FormData()
  applyAuth.append('txtTaiKhoan', id)
  applyAuth.append('txtMatKhau', password)
  return applyAuth
}
