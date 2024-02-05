export default defineEventHandler(async(event)=>{
    return await prisma.Archive.findFirst({
        where: {
            uuid: event.context.params.uuid
        }
    })
})