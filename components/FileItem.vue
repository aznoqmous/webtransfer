<template>
    <div :class="'file-item' + (progress === 0 || progress < 1 ? ' loading' : '')" :title="file.name">
        <figure v-if="Utils.getFileIcon(file.type) != 'image' || !file.path" class="material-symbols-outlined">{{ Utils.getFileIcon(file.type) }}</figure>
        <figure  v-else>
            <img :src="file.path.replace('/public', '')" alt="">
        </figure>
        <strong>{{ file.name }}</strong>
        <small>{{ file.type }}</small>
        <small class="size">{{ Utils.humanFileSize(file.size) }}</small>
        <small class="extension">{{ file.name.split('.').at(-1) }}</small>
        <progress v-if="progress === 0 || progress < 1" max="100" :value="progress * 100">{{ progress * 100 }}%</progress>
    </div>
</template>
<script setup>
import Utils from '~/src/utils';
const props = defineProps(["file", "progress"])
const file = props.file
const fileName = file.name.split("/").at(-1)
const extension = file.name.split(".").at(-1)
const name = file.name.replace(extension, "")
const progress = props.progress
</script>