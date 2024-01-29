<template>
    <div>
        <FileInput @filesChange="filesChange"></FileInput>
        <ul class="uploaded-files">
            <li v-for="file in uploadedFiles" @click="selectPreviewImage">
            <figure class="file">
                <legend>{{ file.name }} {{ humanFileSize(file.size) }}</legend>
            </figure>
            </li>
        </ul>
        <div v-if="uploadedFiles.length">
            {{ humanFileSize(uploadedFileSize) }}
        </div>
        <div v-if="uploadedFiles.length" class="link">
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
    file.src = await uploadFile(file)
    uploadedFiles.value.push(file)
    uploadedFileSize.value += file.size
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
    path = await $fetch(`/api/${uuid.value}/upload`, {
      method: "POST",
      body: {
        uuid: uuid.value,
        name: file.name,
        content: btoa(content.slice(i, i + chunkSize))
      }
    })
  }
  return path.replace('./public', "")
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
