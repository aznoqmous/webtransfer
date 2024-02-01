<template>
    <div>
        <FileInput @filesChange="filesChange"></FileInput>
        <div class="uploaded-files" v-if="uploadedFiles.length">
            <figure class="file" v-for="file in uploadedFiles">
                <strong v-if="file.progress >= 1">{{ file.name }}</strong>
                <span v-else>{{ file.name }}</span>
                <small>{{ humanFileSize(file.size) }} - {{ file.type }}</small>  
                <progress v-if="file.progress < 1" max="100" :value="file.progress * 100">{{ file.progress * 100 }}%</progress>
            </figure>
            <div v-if="uploadedFiles.length">
              <div class="progress">
                <div class="size">
                  {{ humanFileSize(uploadedFileSize) }} / {{ humanFileSize(totalFileSize) }}
                </div>
              </div>
            </div>
            <div v-if="uploadedFiles.length" class="circle-progress" :style="'--progress:' + totalProgress">
              <span>{{ Math.round(totalProgress * 100) }}%</span>
            </div>
          </div>
          <div v-if="totalProgress >= 1" class="link button" @click="copy">
            {{ req.origin + "/" + uuid }}
          </div>
    </div>
</template>
<script setup>
import useUuid from "~/composables/useUuid"

const req = useRequestURL()
const chunkSize = 1000000
const uuid = ref(await useUuid())
const uploadedFiles = ref([])
let files = []
const uploadedFileSize = ref(0)
const totalProgress = ref(0)
const totalFileSize = ref(0)

const copy = ()=>{

}

const filesChange = (inputFiles, newFiles) => {
  files = inputFiles
  upload(newFiles)
}

const upload = async (newFiles) => {

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
    file.progress = Math.min((i+chunkSize)/file.size,1)
    uploadedFileSize.value += data.length
    totalProgress.value = uploadedFileSize.value / totalFileSize.value
  }
  return path ? path.replace('./public', "") : null
}

const humanFileSize = (size) => {
  return Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(size)
}


</script>
