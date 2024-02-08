import fs from "fs"
import prisma from "prisma"
export default defineEventHandler(async(event)=>{
    const file = await prisma.File.findFirst({
        where: {
            id: parseInt(event.context.params.uuid)
        }
    })
    if(fs.existsSync(file.path)){
        fs.rmSync(file.path)
    }
    return await prisma.File.delete({
        where: {
            id: parseInt(event.context.params.uuid)
        }
    })
})