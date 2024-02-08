export default defineEventHandler(async (event)=>{
    const body = await readBody(event)
    const uuid = event.context.params.uuid
    console.log(body)
    return await prisma.User.update({
        where: {
            id: parseInt(uuid)
        },
        data: body
    })
})