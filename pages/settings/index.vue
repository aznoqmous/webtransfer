<template>
    <div class="form-container">
        <div class="form-field">
            <input type="text" name="username" id="username" :value="user.username" disabled>
            <label for="username">Identifiant</label>
        </div>
        <div class="form-field">
            <input type="password" name="password" id="password" required @focusout="update">
            <label for="password">Mot de passe</label>
        </div>
    </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"]
})
import {MD5} from "~/src/MD5"
const user = await useUser()
const update = async(e)=>{
    await $fetch(`/api/user/${user.value.id}/update`, {
        method: "POST",
        body: {
            [e.target.name]: MD5(e.target.value)
        }
    })
}
</script>