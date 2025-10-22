<template>
    <div id="main">
        <ReferenceAudio :audio-url-reference=audioUrl></ReferenceAudio>
        <UserRecording/>
    </div>
</template>

<style scoped lang="scss">
@use "./styles/mixins.scss" as mixis;

#main {
  @include mixis.flex-center-column;
  width: 100%;
}
</style>

<script setup lang="ts">
import ReferenceAudio from './components/ReferenceAudio.vue';
import UserRecording from './components/UserRecording.vue';

// Lấy đường dẫn audio từ main.ts
defineProps<{ audioUrl: string }>()
</script>