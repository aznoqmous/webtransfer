<template>
    <div class="archives-list">
        <div v-for="archive in user.archives" class="archive">
            <ArchiveDetails :archive="archive"/>
        </div>
    </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"]
})
const user = await useUser()
</script>