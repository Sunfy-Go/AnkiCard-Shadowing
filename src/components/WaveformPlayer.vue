<template>
    <div ref="waveformPlayer" class="waveform">
        <span class="waveform__time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>
</template>

<style lang="scss">

.waveform {
    position: relative;
}

.waveform__time {
    top: 0;
    right: 0;
    position: absolute;
    padding: 2px 6px 0 0;
    color: #9c9c9c;
    font-size: 15px;
}


::part(cursor):after {
    content: '▼';
    font-size: 1.6em;
    position: absolute;
    left: 0.6px;
    top: -37px;
    color: #aeaeae;
    transform: translateX(-50%);
}

::part(canvases) {
    margin-top: 15px;
}

::part(wrapper) {
    padding-bottom: 23px;
    flex: 1;
}

::part(scroll) {
    height: 100%;
}

::part(scroll)::-webkit-scrollbar {
  height: 7.5px;
}

::part(scroll)::-webkit-scrollbar-thumb {
  background: #cfdcd6;
  border-radius: 2px;
}

// Đại diện cho phần nền bên dưới thanh cuộn (track).
::part(scroll)::-webkit-scrollbar-track {
  background: #f0f0f0;
}

</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import WaveSurfer from 'wavesurfer.js'

const waveformPlayer = ref<HTMLDivElement | null>(null)
const wavesurfer = ref<WaveSurfer | null>(null)
const propAudioIrl = defineProps<{ urlAudioWaveform: string }>()
const currentTime = ref<number>(0)
const duration = ref<number>(0)

onMounted(() => {
    if (waveformPlayer.value) {
        wavesurfer.value = WaveSurfer.create({
            container: waveformPlayer.value,
            waveColor: '#d6e1c1',
            progressColor: '#A8DBA8',
            height: 100,
            barWidth: 1.5,
            hideScrollbar: false,
            minPxPerSec: 100,
            cursorColor: '#bababa',
            cursorWidth: 1.5
        })
        wavesurfer.value.load(propAudioIrl.urlAudioWaveform)

        wavesurfer.value.on('ready', ()=> {
            duration.value = wavesurfer.value?.getDuration() || 0
        })
        wavesurfer.value.on('audioprocess', ()=> {
            currentTime.value = wavesurfer.value?.getCurrentTime() || 0
        })
    }
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