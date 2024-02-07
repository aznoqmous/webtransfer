<template>
    <div class="archive-details">
      <div class="column">
        <div class="content">
          <div class="row header">
            <div class="title row">
              <h3 v-if="user && user.id == archive.userId"><input ref="titleInput" class="archive-title form-transparent" type="text" :value="archive.title" @focusout="update"></h3>
              <h3 v-else>{{ archive.title || "No title" }}</h3>
              <FileInput v-if="user && user.id == archive.userId" @filesChange="filesChange"></FileInput>
            </div>
            </div>
            <small>
                {{ archive.files.length > 1 ? archive.files.length + " fichiers" : "1 fichier"}}
                -
                {{ Utils.humanFileSize(archive.fileSize) }}
            </small>
            
            <div class="files">
                <div class="file" v-for="file in files">
                    <FileItem :file="file" :progress="file.progress"/>
                </div>
            </div>
            <small v-if="user && user.id == archive.userId">Téléchargé {{ archive.downloadCount }} fois</small>
            <div v-if="user && user.id == archive.userId" class="actions">
              <span class="delete material-symbols-outlined" @click="remove(archive.uuid)">delete</span>
            </div>
          </div>
          <div class="column">
            <small>Expire dans {{ Utils.humanDuration(timeLeft) }}</small>
            <DownloadArchiveButton :archive="archive"/>
          </div>
      </div>
    </div>
</template>
<script setup>
import config from "~/src/config.json"
import Utils from '~/src/utils';

const user = await useUser()
const props = defineProps(["archive"])
const archive = props.archive
const createdDate = new Date(archive.startedAt)
const ellapsedTime = Date.now() - createdDate.getTime()
const timeLeft = config.archiveLifeTimeSeconds - ellapsedTime / 1000
const titleInput = ref(null)

const chunkSize = 1000000
const uploadedFiles = ref([])
const files = ref(archive.files)
const uploadedFileSize = ref(0)
const totalProgress = ref(0)
const totalFileSize = ref(0)
const speed = ref(0)

const remove = async (uuid)=>{
    user.value.archives = user.value.archives.filter(a => a.uuid !== uuid)
    await $fetch(`/api/${uuid}/delete`, {method: "POST"})
}

if(timeLeft < 0) {
    remove(archive.uuid)
}


const update = async(e)=>{
    const body = {}
    if(titleInput.value) body.title = titleInput.value.value,
    await $fetch(`/api/${archive.uuid}/update`, {
        method: "POST",
        body
    })
}


const filesChange = (inputFiles, newFiles) => {
  upload(newFiles)
}

const upload = async (newFiles) => {

  if(newFiles.length == files.length) {
    uploadedFiles.value = []
    uploadedFileSize.value = 0
  }

  for (let file of newFiles) {
    file.progress = ref(0)
    files.value.push(file)
    uploadedFiles.value.push(file)
    totalFileSize.value += file.size
  }
  for (let file of newFiles) {
    const f = await uploadFile(file)
    uploadedFiles.value.splice(uploadedFiles.value.indexOf(file), 1)
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
  const content = await getFileContent(file)
  let lastByte = Date.now()

  await $fetch(`/api/${archive.uuid}/file/before-upload`, {
      method: "POST",
      body: {
        name: file.name
      }
    })

  for (let i = 0; i < file.size; i += chunkSize) {
    const data = content.slice(i, i + chunkSize)
    await $fetch(`/api/${archive.uuid}/file/upload`, {
      method: "POST",
      body: {
        name: file.name,
        content: btoa(data)
      }
    })
    speed.value = data.length / ((Date.now() - lastByte) / 1000)
    lastByte = Date.now()
    file.progress.value = Math.min((i+chunkSize)/file.size,1)
    uploadedFileSize.value += data.length
    totalProgress.value = uploadedFileSize.value / totalFileSize.value
  }

  const f = await $fetch(`/api/${archive.uuid}/file/uploaded`, {
      method: "POST",
      body: {
        name: file.name,
        type: file.type 
      }
  })

}

</script>