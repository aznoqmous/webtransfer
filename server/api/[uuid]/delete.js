import fs from "fs"
import prisma from "prisma"
export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const tmpFolder = "./public/tmp"
    const path = `${tmpFolder}/${event.context.params.uuid}`
    const deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file) {
              var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rm(path, {recursive: true, force: true});
          }
      };
    //deleteFolderRecursive(path)
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