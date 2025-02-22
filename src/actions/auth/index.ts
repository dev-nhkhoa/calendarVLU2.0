import { prisma } from '@/lib/prisma'
import { Account } from '@prisma/client'

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email }, include: { accounts: true } })
}

export async function getAccount(id: string) {
  return await prisma.account.findUnique({ where: { id } })
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

export async function deleteAccount(provider: string, userId: string) {
  return await prisma.account.deleteMany({ where: { provider, userId } })
}

export async function updateAccount(id: string, data: Partial<Account>) {
  return await prisma.account.update({
    where: { id },
    data,
  })
}
