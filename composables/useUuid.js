import { MD5 } from "~/src/MD5"

export default async function(){
    const uuid =  useState("uuid", ()=> null)
    if(!uuid.value){
        uuid.value = MD5(Date.now())
    }
    return uuid
}