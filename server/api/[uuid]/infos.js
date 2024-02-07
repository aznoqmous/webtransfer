import fs from "fs"
export default defineEventHandler(async event => {
    const uuid = event.context.params.uuid
    const files = fs.readdirSync(`./public/tmp/${uuid}/upload`).map(file => ({
        name: file,
        size: fs.statSync(`public/tmp/${uuid}/upload/${file}`).size
    }))
    return files
})