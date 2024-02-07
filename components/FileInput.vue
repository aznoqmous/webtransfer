<template>
    <div class="file-input">
        <label for="file">
            <i class="material-symbols-outlined">
            add
            </i>
            <span>Ajouter des fichiers</span> 
        </label>
        <div class="overlay" ref="overlay" @dragend="hideOverlay" @dragleave="hideOverlay">
            <input id="file" ref="fileInput" type="file" @input="handleFileInput" multiple>
            <div class="column">
                <i class="material-symbols-outlined">
                upload
                </i>
                <span>Drop files here</span>
            </div>
        </div>
    </div>
</template>
<script setup>
    const emit = defineEmits(['filesChange'])
    const fileInput = ref(null)
    const files = ref([])
    let _files = []
    const overlay = ref(null)

    const handleFileInput = (e)=>{
        const fileNames = _files.map(f => f.name)
        let  newFiles = [...e.target.files].filter(f => !fileNames.includes(f.name))
        _files = [..._files, ...newFiles]
        files.value = _files
        emit("filesChange", _files, [...newFiles])
        hideOverlay()
    }

    const showOverlay = ()=>{
        overlay.value.classList.add('active')
    }
    const hideOverlay = ()=>{
        overlay.value.classList.remove('active')
    }
    onMounted(()=>{
        window.addEventListener('dragenter', ()=>{
            if(overlay.value.classList.contains('active')) return;
            showOverlay()
        })
        window.addEventListener('dragleave', ()=>{

        })
    })
    onBeforeUnmount(()=>{
        window.removeEventListener('dragenter', showOverlay)
    })
</script>
