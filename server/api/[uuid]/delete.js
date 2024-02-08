import fs from "fs"
import prisma from "prisma"
export default defineEventHandler(async(event)=>{
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
            uuid: event.context.params.uuid
        }
    })

    return {
        body
    }
})