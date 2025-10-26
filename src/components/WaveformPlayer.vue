<template>
    <div ref="waveformPlayer">
        <div id="waveform">
            <span class="waveform__time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        </div>

        <el-dropdown
            ref="dropdownRef"
            :virtual-ref="triggerRef"
            :show-arrow="false"
            :popper-options="{
                modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
            }"
            virtual-triggering
            trigger="contextmenu"
            placement="bottom-start"
            @command="HandleCommandClick"
        >
            <template #dropdown>
                <el-dropdown-menu class="more-region-menu">
                    <el-dropdown-item :icon="Delete"  :command="'Delete'"  class="more-region delete" >Delete</el-dropdown-item>
                    <el-dropdown-item :icon="Rank"    :command="'Move'"    class="more-region move"   >Move</el-dropdown-item>
                    <el-dropdown-item :icon="EditPen" :command="'Rename'"  class="more-region rename" >Rename</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
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
    padding: 2px 5px 0 0;
    color: #9c9c9c;
    font-size: 14px;
}

#waveform ::part(cursor) {
    height: 150px;
    background-color: rgba(210, 180, 140, 0);
}
#waveform ::part(cursor):after {
    content: '▼';
    font-size: 1.6em;
    position: absolute;
    left: 0.8px;
    top: -37px;
    color: #aeaeae;
    transform: translateX(-50%);
}

#waveform ::part(canvases) {
    margin-top: 15px;
}

#waveform ::part(scroll) {
    height: 100%;
    padding-bottom: 10px;
    outline: none;      
}

#waveform ::part(scroll)::-webkit-scrollbar {
    height: 7.5px;
}
#waveform ::part(scroll)::-webkit-scrollbar-thumb {
    border-radius: 2px;
    background: #cfdcd6;
}
#waveform ::part(scroll)::-webkit-scrollbar-track {
    background: #f0f0f0;
}

#waveform ::part(region) {
    background-color: #edffc052;
}

#waveform ::part(region-handle-left) {
    border-left: 2px solid #c4b53180;
}
#waveform ::part(region-handle-right) {
    border-right: 2px solid #c4b53180;
}

#waveform ::part(region-content) {
    font-size: 11.5px;
    color: #898989;
    padding: 0.2em 0.6em !important;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 70%;
    margin: 0 !important;
}

#waveform ::part(hover) {
    height: 54%;
    display: flex;
    flex-direction: column-reverse;
    top: 69px;
    border-left: none !important;
}

#waveform ::part(hover-label) {
    width: 40px;
    position: absolute;
    transform: translateX(-50%);
    border-radius: 5px;
    background-color: darkseagreen;
    color: #fff;
}

#waveform ::part(hover-label):before {
    content: '⏱️ ';
}

#waveform ::part(minimap) {
    position: absolute;
    left: 0;
    width: 100%;
    top: -29px;
    background-color: #acc2a7;
    border-radius: 4px;

}

.more-region-menu {
    padding: 4px 4px;
}

.more-region {
    padding: 2px 8px;
    font-size: 12px;
}

.more-region:hover,
.more-region:focus {
    background-color: #ffefe8cf; 
    outline: none !important;
    box-shadow: none !important;
}

.more-region.delete {
    color: #ff0000 !important;
}
.more-region.move {
    color: #60bad3 !important;
}
.more-region.rename {
    color: #11b938 !important;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.js'
import MinimapPlugin from 'wavesurfer.js/dist/plugins/minimap.js'

import type { Region } from 'wavesurfer.js/dist/plugins/regions.js'
import type { DropdownInstance } from 'element-plus' 

import { ElMessage } from 'element-plus' 
import { Delete, Rank, EditPen } from '@element-plus/icons-vue'

// --- Type Definitions ---
type ModeRegionCommand   = 'Delete' | 'Move' | 'Rename'
type WaveSurferEventName = 'ready' | 'audioprocess' | 'finish' | 'seek' | 'play' | 'pause' | 'seeking' | 'region-out' | 'region-in'
type CleanupFunction = () => void

// --- Refs cho Context Menu (Virtual Triggering) -
const dropdownRef   = ref<DropdownInstance>()
const position      = ref({ top: 0, left: 0, bottom: 0, right: 0 } as DOMRect)
const triggerRef    = ref({ getBoundingClientRect: () => position.value })

const prop = defineProps<{ urlAudioWaveform: string; }>()
const waveformPlayer = ref<HTMLDivElement | null>(null)
const wavesurfer = ref<WaveSurfer | null>(null)
const currentTime = ref<number>(0)
const duration = ref<number>(0)
const currentRegion = ref<Region | null>(null)

const regionsPluginCurrent = ref<RegionsPlugin | null>(null)
const hoverPluginCurrent = ref<HoverPlugin | null>(null)
const minimapPluginCurrent = ref<MinimapPlugin | null>(null)
const disableDrag = ref<CleanupFunction | null>(null);

const eventMap = new Map<WaveSurferEventName, (() => void)[]>()

onMounted(() => {
    if (!waveformPlayer.value) return

    // KHAI BÁO INSTANCE PLUGINS TRỰC TIẾP
    const roomPlugin = ZoomPlugin.create({ scale: 0.5, maxZoom: 300 })
    const regionsPlugin = RegionsPlugin.create()
    const hoverPlugin = HoverPlugin.create()

    // TẠO WAVESURFER
    wavesurfer.value = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#d6e1c1',
        progressColor: '#A8DBA8',
        barWidth: 1.5,
        cursorColor: '#bababa',
        cursorWidth: 1.5,   
        minPxPerSec: 150,  
        plugins: [ roomPlugin, regionsPlugin, hoverPlugin ] 
    })
    wavesurfer.value.load(prop.urlAudioWaveform)

    regionsPluginCurrent.value = regionsPlugin
    hoverPluginCurrent.value = hoverPlugin

    setupWaveform()
    setupPluginWaveform()
})

onBeforeUnmount(() => wavesurfer.value?.destroy())


function setupWaveform() {
    wavesurfer.value?.on('ready', ()=> {
        duration.value = wavesurfer.value?.getDuration() || 0
        emitEvent('ready')
    })
    wavesurfer.value?.on('finish', ()=> {
        wavesurfer.value?.stop()
        emitEvent('finish')
    })
    wavesurfer.value?.on('audioprocess', ()=> {
        currentTime.value = wavesurfer.value?.getCurrentTime() || 0
        emitEvent('audioprocess')
    })
    wavesurfer.value?.on('seeking', ()=> {
        currentTime.value = wavesurfer.value?.getCurrentTime() || 0
        emitEvent('seeking')
    })
    wavesurfer.value?.on('play', ()=> emitEvent('play'))
    wavesurfer.value?.on('pause', ()=> emitEvent('pause'))
}

function setupPluginWaveform() {
    if (!regionsPluginCurrent.value) return

    // Tắt chế độ di chuyển và thêm các sự kiện click chuột
    regionsPluginCurrent.value.on('region-created', (region)=> {
        region.drag = false

        // Thêm sự kiện hiện menu hành động khi click chuột phải.
        region.element?.addEventListener('contextmenu', (event)=> {
            handleContextmenu(event)
            currentRegion.value = region
        })
        region.element?.addEventListener('click', handleClick)
    })

    // Phát audio khi click vào vùng region.
    regionsPluginCurrent.value.on('region-clicked', (region, e)=> {
        e.stopPropagation()
        region.play(true)
    })
    regionsPluginCurrent.value.on('region-out',()=> emitEvent('region-out'))
    regionsPluginCurrent.value.on('region-in', ()=> emitEvent('region-in'))

    // Tắt chế độ tạo region.
    disableDrag.value = regionsPluginCurrent.value.enableDragSelection({})
    disableDrag.value()
}



/** Xử lý sự kiện Context Menu (Chuột phải ảo) */
// -----------------------------------------------
const handleContextmenu = (event: MouseEvent) => {
    const { clientX, clientY } = event
    position.value = DOMRect.fromRect({ x: clientX, y: clientY,})
    event.preventDefault()
    dropdownRef.value?.handleOpen()
}

/**
 * Xử lý click (Đóng dropdown và Vô hiệu hóa Region Move)
 * @param event Sự kiện chuột (tùy chọn)
 */
// ------------------------------------------------------
const handleClick = () => { 
    dropdownRef.value?.handleClose() 

    // Vô hiệu hóa Region Move (Nếu đang ở chế độ Move và người dùng click vào vùng)
    const region = currentRegion.value as Region
    if (region) disableMoveRegion(region)
}

/**
 * Xử lý lệnh từ Dropdown Context Menu
 */
const HandleCommandClick = (command: ModeRegionCommand) => {
    const region = currentRegion.value as Region

    if (!region) {
        console.warn("Không có vùng nào được chọn.");
        return;
    }

    switch (command) {
        case 'Delete': { deleteRegion(region); break }
        case 'Move':   { enableMoveRegion(region); break }
        case 'Rename': { ElMessage("Chức năng đổi tên chưa được triển khai"); break }
        default: break
    }
}

// --- Logic Xử lý Region ---
const deleteRegion = (region: Region)=> region.remove()
const enableMoveRegion = (region: Region)=> region.drag = true
const disableMoveRegion = (region: Region)=> region.drag = false


// --- Logic Event Gửi/Nhận ---
function addEvent(eventName: WaveSurferEventName, callback: () => void) {
    if (!eventMap.has(eventName)) eventMap.set(eventName, [])
    eventMap.get(eventName)?.push(callback)
}
function emitEvent(eventName: WaveSurferEventName) {
    eventMap.get(eventName)?.forEach(cb => cb())
}


// --- Logic Kéo chọn Regions ---
function enableDragSelectionRegions() {
    if (regionsPluginCurrent.value)
        disableDrag.value = regionsPluginCurrent.value?.enableDragSelection({ content: "Default" })
}
function disableDragSelectionRegions() {
    if (disableDrag.value) disableDrag.value()
    disableDrag.value = null // Đặt lại ref về null sau khi tắt
}


// --- Logic Trình phát Audio ---
const play = ()=> wavesurfer.value?.play() 
const pause = ()=> wavesurfer.value?.pause() 
const setSpeed = (speed: number)=> wavesurfer.value?.setPlaybackRate(speed) 

function formatTime(t: number) {
    const minute = Math.floor(t / 60.0)
    const second = Math.floor(t % 60)
    return `${minute}:${second.toString().padStart(2, '0')}`
}

// Hàm này được truyền từ component cha và gọi logic lặp lại
const toggleRepeatMode = (repeatMode: number) => {
    if (repeatMode === 2) { 
        regionsPluginCurrent.value?.on('region-out', handleRegionLoop)
    } else {
        regionsPluginCurrent.value?.un('region-out', handleRegionLoop)
    }
}
const handleRegionLoop = (region: Region) => region.play(); 


function enableHoverPlugin() {
    if (hoverPluginCurrent.value || !wavesurfer.value) return

    const newHoverPlugin = HoverPlugin.create()
    wavesurfer.value.registerPlugin(newHoverPlugin)
    hoverPluginCurrent.value = newHoverPlugin
}
function disableHoverPlugin() {
    if (hoverPluginCurrent.value) {
        hoverPluginCurrent.value.destroy()
        hoverPluginCurrent.value = null
    }
}

function enableMinimapPlugin() {
    if (minimapPluginCurrent.value || !wavesurfer.value) return

    const newminimapPlugin = MinimapPlugin.create({height: 18, waveColor: '#ddd', progressColor: '#f1d088',})
    wavesurfer.value.registerPlugin(newminimapPlugin)
    minimapPluginCurrent.value = newminimapPlugin
}
function disableMinimapPlugin() {
    if (minimapPluginCurrent.value) {
        minimapPluginCurrent.value.destroy()
        minimapPluginCurrent.value = null
    }
}

defineExpose({ 
    play, pause, 
    addEvent, 
    setSpeed, 
    toggleRepeatMode,
    enableDragSelectionRegions, disableDragSelectionRegions,
    enableHoverPlugin, disableHoverPlugin,
    enableMinimapPlugin, disableMinimapPlugin
})
</script>