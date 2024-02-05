import prisma from "prisma"
import {MD5} from "MD5";
export default defineEventHandler(async(event) => {
    const body = await readBody(event)

    let user = await prisma.User.findFirst({
        where: {
            OR: [
                {
                    email: body.email
                },
                {
                    username: body.email
                }
            ]
        }
    })


    if(!user) return {
        error: "User doesnt exists"
    }

    if(user.password !== body.password){
        return {
            error: "Unvalid password"
        }
    }

    user = await prisma.User.update({
        where: {
            id: user.id
        },
        data: {
            token: MD5(Date.now()),
            tokenValidity: new Date(Date.now()+1000*3600*24*7)
        }
    })

    setCookie(event, "auth-token", user.token, {
        expires: user.tokenValidity
    })

    return user
})