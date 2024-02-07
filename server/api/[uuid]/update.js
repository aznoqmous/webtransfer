import prisma from "prisma"

export default defineEventHandler(async(event)=>{
    const uuid = event.context.params.uuid
    const data = await readBody(event)
    if(await prisma.Archive.findFirst({where: {uuid}})) {
        return await prisma.Archive.update({
            where: {
                uuid
            },
            data
        })
    }
    return await prisma.Archive.create({
        data: {
            uuid,
            userId: data.userId
        }
    })
})