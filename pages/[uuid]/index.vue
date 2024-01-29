<template>
    <div>
        <div v-if="files.length">
            <div v-for="file in files">
                {{ file.name }}
                {{ humanFileSize(file.size) }}
            </div>
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

const fetchInfos = async()=>{
    files.value = await $fetch(`/api/${uuid}/infos`)
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