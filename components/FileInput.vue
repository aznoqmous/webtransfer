<template>
    <div class="file-input">
        <label for="file">
            <i class="material-symbols-outlined">
            add
            </i>
            <span>Ajouter des fichiers</span> 
        </label>
        <input id="file" ref="fileInput" type="file" @input="handleFileInput" multiple>
    </div>
</template>
<script setup>
  const emit = defineEmits(['filesChange'])
    const fileInput = ref(null)
    const files = ref([])
    let _files = []
    const handleFileInput = (e)=>{
        const fileNames = _files.map(f => f.name)
        let  newFiles = [...e.target.files].filter(f => !fileNames.includes(f.name))
        _files = [..._files, ...newFiles]
        files.value = _files
        emit("filesChange", _files, [...newFiles])
    }
</script>