<template>
    <div id="user-recording">
        <div class="user-recording__start">
            <button class="user-recording__button user-recording__button--recording" @click="startRecoding">
                <Mic class="audio-icon" color="Red" :size="17" stroke-width="2"/>
            </button>
            <span class="user-recording__span user-recording__span-start-recording">Start Recording.</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '../styles/mixins.scss';

#user-recording {
    width: 100%;
    height: 80px;
    border: 1px solid #c0c0c0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    background-color: #ffffff;
}

.user-recording__start {
    @include flex-center;
    flex-direction: column;
    margin-top: 18px;
}

.user-recording__button {
    color: #acacac;
    margin: 0 .5rem;  
    border: none;
    @include flex-center;
    padding: 0;
}
.user-recording__span {
    font-size: 14px;
    color: #949494;
}

.user-recording__button--recording {
    margin-bottom: 5px;
}
</style>

<script setup lang="ts">
import { Mic } from 'lucide-vue-next';
// import { Mic, CircleX, CirclePlay, CirclePause, CircleCheck } from 'lucide-vue-next';

function startRecoding() {

}


</script>