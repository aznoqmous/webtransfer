import fs from "fs"
export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const tmpFolder = `./public/tmp/${event.context.params.uuid}/upload`
    const path = `${tmpFolder}/${body.name}`
    
    if(fs.existsSync(path)){
        fs.rmSync(path, {
            recursive: true
        });
    }

    return true
})