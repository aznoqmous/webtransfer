import prisma from "prisma"

export default defineEventHandler(async(event)=>{
    const uuid = event.context.params.uuid
    const data = await readBody(event)
    console.log(data)
    await prisma.Archive.create({
        data: {
            uuid,
            userId: data.userId
        }
    })
})