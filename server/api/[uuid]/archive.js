import archiver from "archiver"
import fs from "fs"
import path from "path"
import process from "process"

export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const publicPath = "/archive.zip"
    const sourceDirectory = process.cwd() + `/public/tmp/${event.context.params.uuid}/upload`
    const targetFile = `${process.cwd()}/public/tmp/${event.context.params.uuid}/${publicPath}`
    console.log(targetFile, sourceDirectory)
    await new Promise(resolve => {
        const output = fs.createWriteStream(targetFile)
        const archive = archiver('zip')
        archive.pipe(output)
        archive.directory(sourceDirectory, false)
        archive.finalize()
        output.on('close', ()=> resolve("/archive.zip"))
    })
    return {
        targetPath: `/tmp/${event.context.params.uuid}/${publicPath}`
    }
})
