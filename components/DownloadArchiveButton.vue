<template>
    <div class="button" @click="downloadArchive">
    <span class="material-symbols-outlined">
        download
    </span>
    <strong>Télécharger</strong>
</div>
</template>
<script setup>
const props = defineProps(["archive"])
const archive = props.archive

const downloadArchive = async () => {
  const response = await $fetch(`/api/${archive.uuid}/archive`, {
    method: "POST",
    body: {
      uuid: archive.uuid
    }
  })
  const link = document.createElement('a')
  link.href = response.targetPath
  link.setAttribute('download', response.targetPath)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>