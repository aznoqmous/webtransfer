<template>
    <div class="share button" @click="copy">
        <slot></slot>
    </div>
</template>
<script setup>
const req = useRequestURL()
const props = defineProps(["archive"])
const archive = props.archive

const copiedText = "Copié !"

const copy = (e)=>{
    navigator.clipboard.writeText(req.origin + "/" + archive.uuid)
    if(e.target.innerText == copiedText) return
    const content = e.target.innerText
    e.target.innerText = copiedText
    setTimeout(()=> e.target.innerText = content, 1000)
}
</script>