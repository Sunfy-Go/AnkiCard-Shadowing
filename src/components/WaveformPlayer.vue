<template>
    <div ref="waveformPlayer">
        <div id="waveform">
            <span class="waveform__time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        </div>
    </div>
</template>

<style lang="scss">
#waveform {
    position: relative;
    width: 100%;
    height: 100%;
}

.waveform__time {
    top: 0;
    right: 0;
    position: absolute;
    padding: 2px 6px 0 0;
    color: #9c9c9c;
    font-size: 14.5px;
}

::part(cursor) {
    height: 150px;
}

::part(cursor):after {
    content: '▼';
    font-size: 1.6em;
    position: absolute;
    left: 0.8px;
    top: -37px;
    color: #aeaeae;
    transform: translateX(-50%);
}

::part(canvases) {
    margin-top: 15px;
}

::part(scroll) {
    height: 100%;
    padding-bottom: 10px;
}

::part(scroll)::-webkit-scrollbar {
    height: 7.5px;
}

::part(scroll)::-webkit-scrollbar-thumb {
    border-radius: 2px;
    background: #cfdcd6;
}

::part(scroll)::-webkit-scrollbar-track {
    background: #f0f0f0;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js'

const waveformPlayer = ref<HTMLDivElement | null>(null)
const wavesurfer = ref<WaveSurfer | null>(null)
const propAudioIrl = defineProps<{ urlAudioWaveform: string }>()
const currentTime = ref<number>(0)
const duration = ref<number>(0)

onMounted(() => {
    if (!waveformPlayer.value) 
        return
    
    wavesurfer.value = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#d6e1c1',
        progressColor: '#A8DBA8',
        barWidth: 1.5,
        cursorColor: '#bababa',
        cursorWidth: 1.5,   
        minPxPerSec: 150,   
    })
    wavesurfer.value.load(propAudioIrl.urlAudioWaveform)

    wavesurfer.value.registerPlugin(
        ZoomPlugin.create({ scale: 0.5, maxZoom: 300 })
    )
    wavesurfer.value.on('ready', ()=> {
        duration.value = wavesurfer.value?.getDuration() || 0
    })
    wavesurfer.value.on('audioprocess', ()=> {
        currentTime.value = wavesurfer.value?.getCurrentTime() || 0
    })
})

onBeforeUnmount(() => {
    wavesurfer.value?.destroy()
})

function play()  { wavesurfer.value?.play() }
function pause() { wavesurfer.value?.pause() }

function formatTime(t: number) {
    const minute = Math.floor(t / 60.0)
    const second = Math.floor(t % 60)
    return `${minute}:${second.toString().padStart(2, '0')}`
}

defineExpose({ play, pause })
</script>