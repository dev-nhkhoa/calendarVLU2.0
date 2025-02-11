import { prisma } from '@/lib/prisma'

export async function CheckUserExist(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

export async function AddCredentialUser2DB({ ...props }) {
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
