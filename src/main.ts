import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.scss'

const urlAudioElement = document.querySelector('.url-audio-str')
let initialAudioUrl = '';

// Lấy nội dung văn bản (URL) từ thẻ span
if (urlAudioElement && urlAudioElement.textContent) {
    initialAudioUrl = urlAudioElement.textContent.trim()
    urlAudioElement.remove()
}
createApp(App, {audioUrl: initialAudioUrl}).mount('#app')