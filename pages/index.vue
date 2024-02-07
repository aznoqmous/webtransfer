<template>
    <ArchiveDetails :archive="archive"/>  
</template>
<script setup>
definePageMeta({
  middleware: ["auth"]
})
const uuid = await useUuid()
const user = await useUser()
const archive = ref({
  title: uuid,
  uuid,
  files: [],
  userId: user.value.id,
  downloadCount: 0,
  fileSize: 0,
  filesCount: 0
})
</script>
