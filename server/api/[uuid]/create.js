import prisma from "prisma"

export default defineEventHandler(async(event)=>{
    const uuid = event.context.params.uuid
    const data = await readBody(event)
    console.log(data)
    if(await prisma.Archive.findFirst({where: {uuid}})) return;
    await prisma.Archive.create({
        data: {
            uuid,
            userId: data.userId
        }
    })
})