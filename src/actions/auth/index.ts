import { prisma } from '@/lib/prisma'
import { Account } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

export async function checkUserExist(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

export async function createAccount(account: Account, userEmail: string) {
  return await prisma.account.create({
    data: {
      type: 'credential',
      provider: account.provider,
      student_id: account.student_id,
      password: account.password,
      access_token: account.access_token,
      user: { connect: { email: userEmail } },
    },
  })
}

export async function addCredentialUser2DB({ ...props }) {
  return await prisma.account.create({
    data: {
      type: 'email',
      provider: 'credential',
      user: { create: { email: props.email, name: props.name } },
      password: props.hassedPassword,
    },
  })
}

export async function addVLUCredentialAccount({ account }: { account: Account }) {
  return await prisma.account.create({
    data: {
      type: 'credential',
      provider: 'vanLang',
      user: { connect: { id: account.userId } },
      student_id: account.id,
      password: account.password,
      access_token: account.access_token,
    },
  })
}

export async function getUser(id: string) {
  return await prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email }, include: { accounts: true } })
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

export async function deleteAccount(id: string) {
  return await prisma.account.deleteMany({ where: { id } })
}

export async function updateAccount(id: string, data: Partial<Account>) {
  return await prisma.account.update({
    where: { id },
    data,
  })
}

export async function getAccount(id: string) {
  return await prisma.account.findUnique({ where: { id } })
}
