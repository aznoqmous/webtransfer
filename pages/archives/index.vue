<template>
    <div v-if="archives.length" class="archives-list">
        <div v-for="archive in archives" class="archive">
            <ArchiveListItem :archive="archive" @delete="deleteArchive" :key="archive.uuid"/>
        </div>
    </div>
    <div v-else class="column">
        Aucune archive
    </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"]
})
const user = await useUser()
const archives = ref(user.value.archives || [])

const deleteArchive = async (archive)=>{
    //console.log(archive, archives.value.indexOf(archive))
    archives.value.splice(
        archives.value.indexOf(archive),
        1
    )
}
</script>