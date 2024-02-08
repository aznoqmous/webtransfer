export default defineEventHandler(async(event) => {
    setCookie(event, "auth-token", null, {
        path: "/",
        sameSite: "strict"
    })
    return true
})