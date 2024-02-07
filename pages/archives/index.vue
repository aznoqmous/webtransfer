<template>
    <div class="archives-list">
        <div v-for="archive in user.archives" class="archive">
            <ArchiveListItem :archive="archive" @delete="deleteArchive"/>
        </div>
    </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"]
})
const user = await useUser()
const deleteArchive = (uuid)=>{
    console.log(uuid, user.value.archives)
    user.value.archives = user.value.archives.filter(a => a.uuid != uuid)
}
</script>