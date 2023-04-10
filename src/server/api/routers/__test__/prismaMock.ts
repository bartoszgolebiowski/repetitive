import { type PrismaClient } from '@prisma/client'
import { beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'

const prismaDeepMock = mockDeep<PrismaClient>()

beforeEach(() => {
    mockReset(prismaDeepMock)
})

export const prismaMock = prismaDeepMock as unknown as DeepMockProxy<PrismaClient>