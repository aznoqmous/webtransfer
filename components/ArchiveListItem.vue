<template>
    <div class="archive-item">
        <a :href="'/'+archive.uuid">
            <figure class="material-symbols-outlined">
                folder
            </figure>
        </a>
        <div class="content">
            <h3>{{ archive.title || "Sans titre" }}</h3>
            <div class="files-count">
                {{ archive.filesCount > 1 ? archive.filesCount + " fichiers" : "1 fichier"}}
                -
                {{ Utils.humanFileSize(archive.fileSize) }}
            </div>
            <small>Téléchargé {{ archive.downloadCount }} fois</small>
            <small>Expire dans {{ Utils.humanDuration(timeLeft) }}</small>
            <div v-if="user && user.id == archive.userId" class="actions">
                <span class="time material-symbols-outlined" @click="resetTime()" title="Réinitialiser le temps">history</span>
                <span class="delete material-symbols-outlined" @click="removeButton()" title="Supprimer">delete</span>
            </div>
        </div>
            <div class="time-left-progress" :style="'--progress:' + timeLeftProgress"></div>
        </div>
</template>
<script setup>
import config from "~/src/config.json"
import Utils from '~/src/utils';

const user = await useUser()
const props = defineProps(["archive"])
const emit = defineEmits(["delete"])
const archive = props.archive
const timeLeft = ref(null)
const timeLeftProgress = ref(0)

const removeButton = ()=>{
    if(!confirm("L'archive sera supprimée du serveur et ne sera plus accessible")) return;
    remove()
}
const remove = async ()=>{
    emit("delete", archive)
    await $fetch(`/api/${archive.uuid}/delete`, {method: "POST"})
}
const expire = async ()=>{
    const deleted = await $fetch(`/api/${archive.uuid}/expire`, {method: "POST"})
    if(deleted) emit("delete", archive)
}

const resetTime = async()=>{
    const date =  new Date()
    await $fetch(`/api/${archive.uuid}/update`, {
        method: "POST", 
        body: {
        startedAt: new Date()
    }})
    archive.startedAt = date
}

onMounted(()=>{
    scheduleUpdateTimeLeft()
})
const updateTimeLeft = ()=>{
    const startedAt = new Date(archive.startedAt)
    const ellapsedTime = Date.now() - startedAt.getTime()
    timeLeft.value = config.archiveLifeTimeSeconds - ellapsedTime / 1000
    timeLeftProgress.value = (ellapsedTime / 1000) / config.archiveLifeTimeSeconds
} 
updateTimeLeft()
const scheduleUpdateTimeLeft = ()=>{
    updateTimeLeft()
    if(timeLeft.value < 0) {
        expire()
    }
    else {
        setTimeout(scheduleUpdateTimeLeft, 1000)
    }
}
</script>