import {prisma} from '../lib/prisma'

export const urlRepository = {
    findByShortCode(shortCode:string){
        return prisma.url.findUnique({where:{shortCode}})
    },


    findByOriginalUrl(originalUrl:string){
        return prisma.url.findFirst({where:{originalUrl}})
    },

    create(data:{shortCode :string; originalUrl:string;expiresAt?:Date | undefined}){
        return prisma.url.create({
            data: {
                shortCode: data.shortCode,
                originalUrl: data.originalUrl,
                ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
            },
        })
    }
}