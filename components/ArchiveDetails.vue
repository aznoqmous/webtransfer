<template>
    <div class="archive-details">
      <div v-if="archive.files.length" class="column">
        <div class="content">
          <div class="row header">
            <div class="title row">
              <h3 v-if="user && user.id == archive.userId"><input ref="titleInput" class="archive-title form-transparent" placeholder="Sans titre" type="text" :value="title" @input="titleChange" @focusout="update"></h3>
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
              <div class="file" v-for="(file,i) in files">
                  <FileItem :key="file.id||i" :file="file" :progress="file.progress" :archive="archive" @delete="removeFile"/>
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
          <small class="time-left">
            {{ Utils.humanDuration((totalUploadFileSize-uploadedFileSize)/avgSpeed) }} restant
          </small>
        </div>

        <div class="column" v-if="!queue.length">
          <div class="row-center buttons">
            <DownloadArchiveButton :archive="archive"/>
            <ShareArchiveButton :archive="archive">Partager</ShareArchiveButton>
          </div>
          <small v-if="timeLeft" class="time-left">Expire dans {{ Utils.humanDuration(timeLeft) }}</small>
          <small class="download-count" v-if="timeLeft && user && user.id == archive.userId">Téléchargé {{ archive.downloadCount }} fois</small>
          <div class="time-left-progress" :style="'--progress:' + timeLeftProgress"></div>
          <div v-if="user && user.id == archive.userId" class="actions">
                <span class="time material-symbols-outlined" @click="resetTime()" title="Réinitialiser le temps">history</span>
                <span class="delete material-symbols-outlined" @click="removeButton()" title="Supprimer">delete</span>
            </div>
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

const timeLeft = ref(null)

const titleInput = ref(null)
const title = ref(archive.title)
const chunkSize = 1024 * 1024
const files = ref(archive.files)
const uploadedFileSize = ref(0)
const totalUploadFileSize = ref(0)
const totalFileSize = ref(archive.fileSize)
const speed = ref(0)
const avgSpeed = ref(0)
const queue = []
const timeLeftProgress = ref(0)

const remove = async (uuid)=>{
    user.value.archives = user.value.archives.filter(a => a.uuid !== uuid)
    await $fetch(`/api/${archive.uuid}/delete`, {method: "POST"})
    window.location.reload()
}

const titleChange = ()=>{
  title.value = titleInput.value.value
}

const update = async(e)=>{
    title.value = titleInput.value ? titleInput.value.value : archive.uuid
    totalFileSize.value = files.value.reduce((a,b)=> a + b.size, 0)
    const a = await $fetch(`/api/${archive.uuid}/update`, {
        method: "POST",
        body: {
          title: titleInput.value ? titleInput.value.value : archive.uuid,
          userId: user.value.id,
          fileSize: totalFileSize.value,
          filesCount: files.value.length
        }
    })
    archive.startedAt = a.startedAt
    scheduleUpdateTimeLeft()
}

const filesChange = (inputFiles, newFiles) => {
  upload(newFiles)
  newFiles.map(file => addToQueue(file))
  update()
}

const addToQueue = (file)=>{
  // filter already existing files
  if(files.value.some(f => f.name == file.name)) return;

  // start upload
  if(!queue.length){
    window.history.pushState({}, "", "/"+archive.uuid)
    startedAt = Date.now()
    avgSpeed.value = 0
    uploadedFileSize.value = 0
    totalUploadFileSize.value = 0
    upload(file)
  }
  queue.push(file)
  file.progress = ref(0)
  files.value.push(file)
  totalUploadFileSize.value += file.size

}

let startedAt = 0
const upload = async (file) => {
  
  file = file || queue[0]

  if(file == null) {
    // end of queue
    await update()
    return;
  }


  const dbFile = await uploadFile(file)
  file.id = dbFile.id
  files.value.splice(files.value.indexOf(file), 1, file)
  queue.splice(queue.indexOf(file), 1)
  totalFileSize.value += file.size
  setTimeout(async()=>{ 
    //files.value.push(file)
  })
  await upload()
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
        resolve(f)
      }
    };
    
    function readNext() {
      let slice = file.slice(offset, offset + chunkSize);
      try {
        fileReader.readAsBinaryString(slice);
      }catch(e){
        
      }
    }
    
    readNext();
    
  })
}

onMounted(()=>{
    scheduleUpdateTimeLeft()
    window.addEventListener('beforeunload', (e)=>{
      if(queue.length && !confirm("Les fichiers en cours d'envoi seront supprimés !")) e.preventDefault()
    })
})
const updateTimeLeft = ()=>{
    const startedAt = new Date(archive.startedAt)
    const ellapsedTime = Date.now() - startedAt.getTime()
    timeLeft.value = config.archiveLifeTimeSeconds - ellapsedTime / 1000
    timeLeftProgress.value = (ellapsedTime / 1000) / config.archiveLifeTimeSeconds
} 
updateTimeLeft()
let sheduledUpdateTimeLeft = null
const scheduleUpdateTimeLeft = ()=>{
  if(sheduledUpdateTimeLeft) clearTimeout(sheduledUpdateTimeLeft)
  updateTimeLeft()
  if(timeLeft.value < 0) {
      remove()
  }
  else {
    sheduledUpdateTimeLeft = setTimeout(scheduleUpdateTimeLeft, 1000)
  }
}
const removeFile = (file)=>{
  files.value.splice(files.value.indexOf(file), 1)
  update()
}


const resetTime = async()=>{
    const date =  new Date()
    await $fetch(`/api/${archive.uuid}/update`, {
        method: "POST", 
        body: {
        startedAt: new Date()
    }})
    archive.startedAt = date
}
const removeButton = ()=>{
    if(!confirm("L'archive sera supprimée du serveur et ne sera plus accessible")) return;
    remove()
}
</script>