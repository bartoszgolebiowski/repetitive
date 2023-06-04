import { NextResponse } from 'next/server'
import { prisma } from '~/server/db'
import { initializeBus } from '~/server/event/bus'
import { createHandlers } from '~/server/event/initialize'

export const config = {
    runtime: 'edge',
}

export default function handler() {
    const bus = initializeBus(createHandlers(prisma))
    bus.emit('cron:check', { expiryDate: new Date() })
    return new NextResponse(null, {
        status: 200,
    })
}

