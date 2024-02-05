import {navigateTo} from "nuxt/app";
import useUser from "~/composables/useUser";
import useAuth from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async (from, to)=> {
    const user = await useUser()
    if(!user.value){
        const {me} = await useAuth()
        user.value = await me()
    }
    if(!user.value) return navigateTo('/login')
})