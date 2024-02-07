<template>
    <div class="archive-item">
        <a :href="'/'+archive.uuid">
            <figure class="material-symbols-outlined">
                folder
            </figure>
        </a>
        <div class="content">
            <h3>{{ archive.title || "No title" }}</h3>
            <strong>
                {{ Utils.humanFileSize(archive.fileSize) }}
                -
                {{ archive.filesCount > 1 ? archive.filesCount + " fichiers" : "1 fichier"}}
            </strong>
            <span>{{ Utils.humanDuration(timeLeft) }}</span>
            <small>Téléchargé {{ archive.downloadCount }} fois</small>
            <div v-if="user && user.id == archive.userId" class="actions">
                <span class="delete material-symbols-outlined" @click="remove()">delete</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import config from "~/src/config.json"
import Utils from '~/src/utils';

const user = await useUser()
const props = defineProps(["archive"])
const emit = defineEmits(["delete"])
const archive = props.archive
const createdDate = new Date(archive.createdAt)
const ellapsedTime = Date.now() - createdDate.getTime()
const timeLeft = config.archiveLifeTimeSeconds - ellapsedTime / 1000

const remove = async ()=>{
    emit("delete", archive.uuid)
    await $fetch(`/api/${archive.uuid}/delete`, {method: "POST"})
}

if(timeLeft < 0) {
    remove()
}
</script>