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
      user: {
        create: {
          email: props.email,
          name: props.name,
        },
      },
      hass_password: props.hassedPassword,
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
