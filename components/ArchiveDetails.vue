<template>
    <div class="archive-details">
      <div v-if="archive.files.length" class="column">
        <div class="content">
          <div class="row header">
            <div class="title row">
              <h3 v-if="user && user.id == archive.userId"><input ref="titleInput" class="archive-title form-transparent" placeholder="Sans titre" type="text" :value="archive.title" @focusout="update"></h3>
              <h3 v-else>{{ archive.title || "Sans titre" }}</h3>
              <FileInput v-if="user && user.id == archive.userId" @filesChange="filesChange"></FileInput>
            </div>
          </div>
          <small class="files-count">
              {{ archive.files.length > 1 ? archive.files.length + " fichiers" : "1 fichier"}}
              -
              {{ Utils.humanFileSize(totalFileSize) }}
          </small>
          
          <div class="files">
              <div class="file" v-for="file in files">
                  <FileItem :file="file" :progress="file.progress"/>
              </div>
          </div>
        </div>
        <div class="column" v-if="uploadedFileSize > 0 && uploadedFileSize/totalUploadFileSize < 1">
          <div class="circle-progress" :style="'--progress:'+uploadedFileSize/totalUploadFileSize">
            <span>
              <strong>{{ Math.floor(uploadedFileSize/totalUploadFileSize*100) }}%</strong>
              <small>{{ Utils.humanFileSize(speed) }}/s</small>
            </span>
            
          </div>
          <div class="time-left">
            {{ Utils.humanDuration((totalUploadFileSize-uploadedFileSize)/avgSpeed) }}
          </div>
        </div>
        <div v-else-if="timeLeft" class="column">
          <DownloadArchiveButton :archive="archive"/>
          <small class="time-left">Expire dans {{ Utils.humanDuration(timeLeft) }}</small>
          <small class="download-count" v-if="timeLeft && user && user.id == archive.userId">Téléchargé {{ archive.downloadCount }} fois</small>
        </div>
        <div v-else>
          <ShareArchiveButton :archive="archive">Partager</ShareArchiveButton>
        </div> 
      
      </div>
      <div v-else>
        <FileInput v-if="user && user.id == archive.userId" @filesChange="filesChange"></FileInput>
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

const chunkSize = 1024 * 1024
const uploadedFiles = ref([])
const files = ref(archive.files)
const uploadedFileSize = ref(0)
const totalUploadFileSize = ref(0)
const totalFileSize = ref(archive.fileSize)
const speed = ref(0)
const avgSpeed = ref(0)

import fs from "fs"

const remove = async (uuid)=>{
    user.value.archives = user.value.archives.filter(a => a.uuid !== uuid)
    await $fetch(`/api/${uuid}/delete`, {method: "POST"})
}

if(timeLeft < 0) {
    remove(archive.uuid)
}

const update = async(e)=>{
    await $fetch(`/api/${archive.uuid}/update`, {
        method: "POST",
        body: {
          title: titleInput.value ? titleInput.value.value : archive.uuid,
          userId: user.value.id,
          fileSize: totalFileSize.value,
          filesCount: files.value.length
        }
    })
}

const filesChange = (inputFiles, newFiles) => {
  upload(newFiles)
}

let startedAt = 0
const upload = async (newFiles) => {
  startedAt = Date.now()
  avgSpeed.value = 0
  uploadedFileSize.value = 0
  totalUploadFileSize.value = 0

  await update()

  if(newFiles.length == files.length) {
    uploadedFiles.value = []
    uploadedFileSize.value = 0
  }

  for (let file of newFiles) {
    file.progress = ref(0)
    files.value.push(file)
    uploadedFiles.value.push(file)
    totalUploadFileSize.value += file.size
  }
  for (let file of newFiles) {
    const f = await uploadFile(file)
    uploadedFiles.value.splice(uploadedFiles.value.indexOf(file), 1)
    totalFileSize.value += file.size
  }

  await update()
}

const uploadFile = async (file)=>{

  await $fetch(`/api/${archive.uuid}/file/before-upload`, {
      method: "POST",
      body: {
        name: file.name
      }
    })

  return new Promise(resolve => {

    const fileReader = new FileReader()
    
    let lastByte = Date.now()
    let offset = 0
    let i = 0
    fileReader.onload = async (event) => {
      const data = event.target.result
      if (event.target.result.length > 0) {
        await $fetch(`/api/${archive.uuid}/file/upload`, {
          method: "POST",
          body: {
            name: file.name,
            content: btoa(event.target.result)
          }
        })
        
        if(!(i % 5)) speed.value = data.length / ((Date.now() - lastByte) / 1000)
        if(!(i % 5)) avgSpeed.value = uploadedFileSize.value / ((Date.now() - startedAt) / 1000)
        lastByte = Date.now()
        file.progress.value = Math.min((offset+chunkSize)/file.size,1)
        uploadedFileSize.value += data.length
        i++;
        offset += chunkSize;
        readNext();
      } else {
        // Done reading file
        const f = await $fetch(`/api/${archive.uuid}/file/uploaded`, {
            method: "POST",
            body: {
              name: file.name,
              type: file.type 
            }
        })
        resolve()
      }
    };
    
    function readNext() {
      let slice = file.slice(offset, offset + chunkSize);
      fileReader.readAsBinaryString(slice);
    }
    
    readNext();
    
  })
}

</script>