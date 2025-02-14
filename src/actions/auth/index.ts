import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function checkUserExist(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

export async function addCredentialUser2DB({ ...props }) {
  return await prisma.account.create({
    data: {
      type: 'email',
      provider: 'credential',
      user: { create: { email: props.email, name: props.name } },
      hass_password: props.hassedPassword,
    },
  })
}

export async function addVLUCredentialAccount({ id, password, cookie, userId }: { id: string; password: string; cookie: string; userId: string }) {
  const hassedPassword = await bcrypt.hash(password, 10)

  return await prisma.account.create({
    data: {
      type: 'credential',
      provider: 'vanLang',
      user: { connect: { id: userId } },
      student_id: id,
      hass_password: hassedPassword,
      access_token: cookie,
    },
  })
}

export async function getUser(id: string) {
  return await prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

export async function getCredentialAccountByUserId(userId: string) {
  return await prisma.account.findFirst({ where: { userId, provider: 'credential' } })
}

export async function getAllUserAccounts(userId: string) {
  return await prisma.account.findMany({ where: { userId } })
}

export async function deleteAccount(email: string, provider: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  return await prisma.account.deleteMany({ where: { userId: user?.id, provider } })
}
