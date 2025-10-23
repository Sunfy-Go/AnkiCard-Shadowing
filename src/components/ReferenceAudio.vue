<template>
    <div id="reference-audio">
        <div class="reference-audio__waveform">
            <WaveformPlayer ref="player" :url-audio-waveform=audioUrlReference class="reference-audio__waveform-player" />
        </div>

        <div class="reference-audio__controls">
            <div class="reference-audio__controls-left">
                <button class="reference-audio__button reference-audio__button--play" @click="togglePlay">
                    <Play v-if= "!isPlaying" class="audio-icon" color="currentColor" :size="16" stroke-width="1.7"/>
                    <Pause v-else class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>
                <button class="reference-audio__button reference-audio__button--speed" @click="setSpeed">
                    <Speech class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>
                <button class="reference-audio__button reference-audio__button--regions" @click="setRegions">
                    <SquareSplitHorizontal class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>
            </div>
            <div class="reference-audio__controls-right">
                <button class="reference-audio__button reference-audio__button--mode-audio" @click="setModeAudio">
                    <Repeat v-if="!isRepeating" class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                    <Repeat1 v-else class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>
                <button class="reference-audio__button reference-audio__button--setting" @click="setting">
                    <Settings class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../styles/mixins.scss';

#reference-audio {
    width: 100%;
    margin-bottom: 30px;
    border: 1px solid #c0c0c0;
    border-radius: 5px 5px 0 0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
} 

.reference-audio__waveform {
    height: 160.2px;
    @include flex-center;
}  

.reference-audio__waveform-player {
    width: 100%;
    height: 100%;
    display: flex;
}

.reference-audio__controls {
    height: 2.7rem;
    padding: .5rem;
    border-top: 1px solid  #c0c0c0;
    @include flex-center-row-space-between;
}

.reference-audio__controls-left {
    height: 100%;
    width: 100%;
    @include flex-row;
}

.reference-audio__controls-right {
    height: 100%;
    @include flex-row;
}

.reference-audio__button {
    color: #acacac;
    margin: 0 .5rem;  
    border: none;
    padding: 0;
    @include flex-center;
}

.reference-audio__button .audio-icon {
    width: 1rem;
}

.reference-audio__button:hover .audio-icon {
    color: #1cafd0; 
    transition: color 0.2s ease;
}
</style>


<script setup lang="ts">
import { ref } from 'vue'
import WaveformPlayer from './WaveformPlayer.vue'
import { Play, Pause, Speech, Repeat, Repeat1, SquareSplitHorizontal, Settings } from 'lucide-vue-next';

defineProps<{ 
    audioUrlReference: string 
}>()

const isPlaying = ref(false)
const isRepeating = ref(true)
const player = ref<InstanceType<typeof WaveformPlayer> | null>(null)

function togglePlay() {
    isPlaying.value ? player.value?.pause() : player.value?.play()
    isPlaying.value = !isPlaying.value
}

function setSpeed() {
}

function setModeAudio() {
    isRepeating.value = !isRepeating.value
}

function setRegions() {
}

function setting() {
}
</script>