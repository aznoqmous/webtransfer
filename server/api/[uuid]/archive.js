import archiver from "archiver"
import fs from "fs"
import process from "process"
import prisma from "prisma"

export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const publicPath = "/archive.zip"
    const sourceDirectory = process.cwd() + `/public/tmp/${event.context.params.uuid}/upload`
    const targetFile = `${process.cwd()}/public/tmp/${event.context.params.uuid}/${publicPath}`
    await new Promise(resolve => {
        const output = fs.createWriteStream(targetFile)
        const archive = archiver('zip')
        archive.pipe(output)
        archive.directory(sourceDirectory, false)
        archive.finalize()
        output.on('close', ()=> resolve())
    })

    const archive = await prisma.Archive.findFirst({
        where: {
            uuid: event.context.params.uuid
        }
    })
    
    await prisma.Archive.update({
        where: {
            uuid: event.context.params.uuid
        },
        data: {
            downloadCount: archive.downloadCount + 1
        }
    })

    return {
        targetPath: `/tmp/${event.context.params.uuid}/${publicPath}`
    }
})
