<template>
    <div class="profile" v-if="user">
        <figure>
          {{ user.username }}
        </figure>

        <nav>
            <ul>
                <li>
                    <a href="/" title="Partager des fichiers">
                        <span class="material-symbols-outlined">
                        add_circle
                        </span>
                    </a>
                </li>
                <li>
                    <a href="/archives" title="Liste des partages">
                        <span class="material-symbols-outlined">
                        list_alt
                        </span>
                    </a>
                </li>
                <li>
                    <a href="/settings" title="Paramètres du compte">
                        <span class="material-symbols-outlined">
                        settings
                        </span>
                    </a>
                </li>
                <li>
                    <a href="" @click.prevent="disconnect" title="Se déconnecter">
                        <span class="material-symbols-outlined">
                        logout
                        </span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>
<script setup>
const user = await useUser()
const {me, logout} = await useAuth()

if(!user.value){
    user.value = await me()
}
const disconnect = ()=>{
    logout()
}
</script>