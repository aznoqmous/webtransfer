<template>

    <ArchiveDetails v-if="archive" :archive="archive"/>
    <div class="not-found" v-else>
        <figure class="material-symbols-outlined">folder_off</figure>
        <strong>Le dossier n'existe plus</strong>
    </div>
</template>
<script setup>
const route = useRoute()
const uuid = route.params.uuid
const archive = ref(null)

archive.value = await $fetch(`/api/${uuid}/get`)

</script>