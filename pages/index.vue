<template>
    <div class="upload">
      <div class="head row">
        <form v-if="uploadedFiles.length" ref="form" @submit.prevent="update">
          <div class="form-field">
            <input type="text" id="title" name="title" @focusout="update">
            <label for="title">title</label>
          </div>
        </form>
        <FileInput @filesChange="filesChange"></FileInput>
      </div>
      <div class="uploaded-files" v-if="uploadedFiles.length">
          <figure class="file" v-for="file in uploadedFiles">
              <strong v-if="file.progress >= 1">{{ file.name }}</strong>
              <span v-else>{{ file.name }}</span>
              <small>{{ Utils.humanFileSize(file.size) }} - {{ file.type }}</small>  
              <progress v-if="file.progress < 1" max="100" :value="file.progress * 100">{{ file.progress * 100 }}%</progress>
          </figure>
          <div v-if="uploadedFiles.length">
            <div class="progress">
              <div class="size">
                {{ Utils.humanFileSize(uploadedFileSize) }} / {{ Utils.humanFileSize(totalFileSize) }}
              </div>
            </div>
          </div>
          <div v-if="uploadedFiles.length" class="circle-progress" :style="'--progress:' + totalProgress">
            <span>
              <strong>{{ Math.round(totalProgress * 100) }}%</strong>
              <small>{{ Utils.humanFileSize(speed) }}/s</small>
            </span>
          </div>
        </div>
        <div v-if="totalProgress >= 1" class="link button" @click="copy">
          {{ req.origin + "/" + uuid }}
        </div>
    </div>
</template>
<script setup>
definePageMeta({
  middleware: ["auth"]
})

import useUuid from "~/composables/useUuid"
import useUser from "~/composables/useUser"
import Utils from "~/src/utils"

const req = useRequestURL()
const chunkSize = 1000000
const uuid = ref(await useUuid())
const uploadedFiles = ref([])
let files = []
const uploadedFileSize = ref(0)
const totalProgress = ref(0)
const totalFileSize = ref(0)
const speed = ref(0)
const user = await useUser()
const form = ref(null)

const copy = ()=>{
  navigator.clipboard.writeText(req.origin + "/" + uuid.value)
}

const filesChange = (inputFiles, newFiles) => {
  files = inputFiles
  upload(newFiles)
}

const update = async()=>{

  const data = Object.fromEntries(new FormData(form.value))
  if(data.title.length < 5) return;
  await $fetch(`/api/${uuid.value}/update`, {
    method: "POST",
    body: {
      userId: user.value.id,
      title: data.title,
      filesCount: files.length,
      fileSize: totalFileSize.value
    }
  })
}

const upload = async (newFiles) => {
  await $fetch(`/api/${uuid.value}/create`, {
    method: "POST",
    body: {
      userId: user.value.id
    }
  })

  if(newFiles.length == files.length) {
    uploadedFiles.value = []
    uploadedFileSize.value = 0
  }

  for (let file of newFiles) {
    file.progress = 0
    uploadedFiles.value.push(file)
    totalFileSize.value += file.size
  }
  for (let file of newFiles) {
    const path = await uploadFile(file)
    file.src = path
    if(!path) uploadedFiles.value.splice(uploadedFiles.value.indexOf(file), 1)
  }
  await update()
}

const getFileContent = async (file) => {
  return new Promise(resolve => {
    const fr = new FileReader()
    fr.onloadend = (e) => {
      if (e.target.readyState == FileReader.DONE) resolve(e.srcElement.result)
    }
    fr.readAsBinaryString(file)
  })
}

const uploadFile = async (file) => {
  let path = null
  const content = await getFileContent(file)
  let lastByte = Date.now()
  for (let i = 0; i < file.size; i += chunkSize) {
    const data = content.slice(i, i + chunkSize)
    path = await $fetch(`/api/${uuid.value}/upload`, {
      method: "POST",
      body: {
        uuid: uuid.value,
        name: file.name,
        content: btoa(data)
      }
    })
    speed.value = data.length / ((Date.now() - lastByte) / 1000)
    lastByte = Date.now()
    file.progress = Math.min((i+chunkSize)/file.size,1)
    uploadedFileSize.value += data.length
    totalProgress.value = uploadedFileSize.value / totalFileSize.value
  }
  return path ? path.replace('./public', "") : null
}

</script>
