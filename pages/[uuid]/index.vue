<template>
    <div>
        <div v-if="files.length">
            <ul>
              <li v-for="file in files">
                {{ file.name }}
                {{ humanFileSize(file.size) }} - {{ file.type }}
              </li>
            </ul>
              {{ humanFileSize(totalFileSize) }}
            <div class="button" @click="downloadArchive">
                Download
            </div>
        </div>
    </div>
</template>
<script setup>
const route = useRoute()
const uuid = route.params.uuid
const files = ref([])
const totalFileSize = ref(0)

const fetchInfos = async()=>{
    const fs = await $fetch(`/api/${uuid}/infos`)
    files.value = fs
    fs.map(f => totalFileSize.value += f.size)
}
fetchInfos()

const humanFileSize = (size) => {
  return Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(size)
}

const downloadArchive = async () => {
  const response = await $fetch(`/api/${uuid}/archive`, {
    method: "POST",
    body: {
      uuid: uuid.value
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