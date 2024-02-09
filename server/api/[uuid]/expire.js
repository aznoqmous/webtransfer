import fs from "fs"
import prisma from "prisma"
import Config from "~/src/config.json"

export default defineEventHandler(async(event)=>{
    
    const archive = await prisma.Archive.delete({
        where: {
            uuid: event.context.params.uuid
        }
    })
    if(!archive) return false;

    const startedAt = new Date(archive.startedAt)
    if(Date.now() - startedAt < Config.archiveLifeTimeSeconds) return false;
    

    const body = await readBody(event)
    const tmpFolder = "./public/tmp"
    const path = `${tmpFolder}/${event.context.params.uuid}`
    if(fs.existsSync(path)){
        fs.rmdirSync(path, {
            recursive: true,
            force: true
        });
    }

    await prisma.Archive.delete({
        where: {
            uuid: archive.uuid
        }
    })

    return true
})