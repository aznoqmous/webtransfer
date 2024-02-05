import prisma from "prisma"
export default defineEventHandler(async(event) => {
    const cookie = getCookie(event, "auth-token")
    if(cookie) {
        return await prisma.User.findFirst({
            where: {
                token: cookie
            },
            include: {
                archives: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        })
    }
    return null
})
