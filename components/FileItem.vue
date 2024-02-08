<template>
    <div :class="'file-item'
    + (progress === 0 || progress < 1 || deleted ? ' loading' : '')
    + (progress > 0 && progress < 1 ? ' uploading' : '')
    " :title="file.name">
        <figure v-if="Utils.getFileIcon(file.type) != 'image' || !file.path || file.size > 1000000" class="material-symbols-outlined">{{ Utils.getFileIcon(file.type) }}</figure>
        <figure  v-else>
            <img :src="file.path.replace('/public', '')" alt="">
        </figure>
        <strong class="name">{{ file.name }}</strong>
        <small class="type">{{ file.type }}</small>
        <small class="size">{{ Utils.humanFileSize(file.size) }}</small>
        <small class="extension">{{ file.name.split('.').at(-1) }}</small>
        <progress v-if="progress === 0 || progress < 1" max="100" :value="progress * 100">{{ progress * 100 }}%</progress>
        <span v-if="user && user.id == archive.userId && file.id" class="delete material-symbols-outlined" @click="remove()">delete</span>
    </div>
</template>
<script setup>
const user = await useUser()

import Utils from '~/src/utils';
const props = defineProps(["file", "progress", "archive"])
const emit = defineEmits(["delete"])
const file = props.file
const progress = props.progress
const archive = props.archive
const deleted = ref(false)

const remove = async ()=>{
    deleted.value = true
    await $fetch(`/api/${archive.uuid}/file/${file.id}/delete`, {
        method: "POST"
    })
    emit("delete", file)
}
</script>