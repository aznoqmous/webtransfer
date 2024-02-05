import useUser from "~/composables/useUser";
import {MD5} from "~/src/MD5";

export default async function(){
    const user = await useUser()

    const login = async (email, password)=>{
        const data = await $fetch("/api/auth/login", {
            method: 'POST',
            body: {
                email,
                password: MD5(password)
            }
        })
        if(!user.error) user.value = data
        return data
    }

    const logout = async ()=>{
        await $fetch("/api/auth/logout")
        user.value = null
        window.location.reload()
    }

    const me = async()=>{
        return await $fetch("/api/auth/me", {
            headers: useRequestHeaders(['cookie'])
        }) || null
    }

    return {
        login,
        logout,
        me
    }
}