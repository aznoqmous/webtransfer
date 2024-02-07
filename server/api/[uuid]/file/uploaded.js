import fs from "fs"
export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const uuid = event.context.params.uuid
    const tmpFolder = `./public/tmp/${uuid}/upload`
    const path = `${tmpFolder}/${body.name}`
    const size = fs.statSync(`public/tmp/${uuid}/upload/${body.name}`).size
    
    const archive = await prisma.Archive.findFirst({where: { uuid }})
    const file = await prisma.File.create({
        data: {
            archiveId: archive.id,
            name: body.name,
            path,
            size,
            type: body.type
        }
    })


    return file
})
