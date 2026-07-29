import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'

export async function flushClicks() {
  const keys = await redis.keys('clicks:*')

  for (const key of keys) {
    const count = await redis.getdel(key)
    if (!count) continue

    const shortCode = key.replace('clicks:', '')

    await prisma.url.update({
      where: { shortCode },
      data: { clicks: { increment: Number(count) } },
    }).catch(() => {})
  }
}