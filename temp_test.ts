import { prisma } from './src/lib/prisma'

async function main() {
  console.log('start')
  try {
    const rows = await prisma.url.findMany({ take: 1 })
    console.log('QUERY OK', rows)
  } catch (e: any) {
    console.error('QUERY FAIL', e.message)
  }
}

main()
