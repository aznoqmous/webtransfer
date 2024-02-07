<template>
    <div class="button" @click="downloadArchive">
      <div class="column">
        <div class="row">
      <span class="material-symbols-outlined">
          download
      </span>
      <strong>Télécharger</strong>

      </div>
      <small class="files-count">
          {{ archive.filesCount > 1 ? archive.filesCount + " fichiers" : "1 fichier"}}
          - {{ Utils.humanFileSize(archive.fileSize) }}
      </small>
      </div>
    </div>
</template>
<script setup>
import Utils from "~/src/utils"
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