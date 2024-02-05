<template>
    <form action="" @submit.prevent="login">
        <div class="form-field">
            <input type="text" name="username" id="username">
            <label for="username">Identifiant</label>
        </div>
        <div class="form-field">
            <input type="password" name="password" id="password">
            <label for="password">Mot de passe</label>
        </div>
        <button>Se connecter</button>
        <p v-if="error" class="error">
            {{ error }}
        </p>
    </form>
</template>
<script setup>
const auth = await useAuth()
const error = ref(null)
definePageMeta({
  layout: "login",
})
const login = async(e)=>{
    error.value = null
    const formData = Object.fromEntries(new FormData(e.target))
    const user = await auth.login(formData.username, formData.password)
    if(user.error) error.value = user.error
    else navigateTo("/")
}
</script>