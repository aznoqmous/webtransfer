<template>
    <div class="profile" v-if="user">
        {{ user.username }}
        <nav>
            <ul>
                <li>
                    <a href="/archives">
                        archives
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>
<script setup>
const user = await useUser()
if(!user.value){
    const {me} = await useAuth()
    user.value = await me()
}
</script>