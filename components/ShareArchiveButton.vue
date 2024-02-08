<template>
    <div class="share-button button" @click="copy">
        <span class="material-symbols-outlined">
          content_copy
        </span>
        <div class="span" ref="slot">
            <slot></slot>
        </div>
    </div>
</template>
<script setup>
const req = useRequestURL()
const props = defineProps(["archive"])
const archive = props.archive
const slot = ref(null)
const copiedText = "Copié !"

const copy = (e)=>{
    navigator.clipboard.writeText(req.origin + "/" + archive.uuid)
    if(slot.value.innerText == copiedText) return
    const content = slot.value.innerText
    slot.value.innerText = copiedText
    setTimeout(()=> slot.value.innerText = content, 1000)
}
</script>