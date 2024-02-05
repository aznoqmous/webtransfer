import prisma from "prisma"

export default defineEventHandler(async(event)=>{
    const uuid = event.context.params.uuid
    const data = await readBody(event)
    await prisma.Archive.update({
        where: {
            uuid
        },
        data
    })
})