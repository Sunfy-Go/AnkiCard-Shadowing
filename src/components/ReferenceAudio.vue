<template>
    <div id="reference-audio">
        <div class="reference-audio__waveform">
            <WaveformPlayer ref="player" :url-audio-waveform=audioUrlReference class="reference-audio__waveform-player" tabindex="-1"/>
        </div>
        <div class="reference-audio__controls">
            <div class="reference-audio__controls-left">
                <button class="reference-audio__button reference-audio__button--play" @click="handleTogglePlay" tabindex="-1">
                    <component :is="playIcon" class="audio-icon" color="currentColor" :size="16" stroke-width="1.8"/>
                </button>

                <el-dropdown trigger="click" @command="handleCommandSpeed" tabindex="-1">
                    <button class="reference-audio__button reference-audio__button--speed">
                        <Speech class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                    </button>

                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command=0.85 @click="handleItemClick($event)" class="speed-audio">0.85</el-dropdown-item>
                            <el-dropdown-item command=0.9  @click="handleItemClick($event)" class="speed-audio">0.9</el-dropdown-item>
                            <el-dropdown-item command=1.0  @click="handleItemClick($event)" class="speed-audio" ref="defaultSelector">1.0</el-dropdown-item>
                            <el-dropdown-item command=1.05 @click="handleItemClick($event)" class="speed-audio">1.05</el-dropdown-item>
                            <el-dropdown-item command=1.1  @click="handleItemClick($event)" class="speed-audio">1.1</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <button class="reference-audio__button reference-audio__button--regions" @click="handleSetRegions($event)" tabindex="-1">
                    <SquareSplitHorizontal class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>
            </div>
            <div class="reference-audio__controls-right">
                <button class="reference-audio__button reference-audio__button--mode-audio" @click="handleToggleRepeatMode" tabindex="-1">
                    <component :is="repeatModeIcon" class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                </button>

                <el-dropdown placement="top" trigger="click" @command="handleCommandSetting" tabindex="-1">
                    <button class="reference-audio__button reference-audio__button--setting">
                        <Settings class="audio-icon" color="currentColor" :size="16" stroke-width="2"/>
                    </button>
                    
                    <template #dropdown>
                        <el-dropdown-menu class="menu-settting">
                            <el-dropdown-item :icon="Position"    class="action-item switch">Hover  <el-switch v-model="switchHover"   size="small" class="hover-switch" @click="handleSwitchHover"/></el-dropdown-item>
                            <el-dropdown-item :icon="TrendCharts" class="action-item switch">Minimap<el-switch v-model="switchMinimap" size="small" class="hover-switch" @click="handleSwitchMinimap"/></el-dropdown-item>
                            <el-dropdown-item :icon="Warning"     class="action-item">Info</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../styles/mixins.scss' as mixis;

#reference-audio {
    width: 100%;
    margin-bottom: 30px;
    border: 1px solid #c0c0c0;
    border-radius: 5px 5px 0 0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
} 

.reference-audio__waveform {
    height: 160.2px;
    @include mixis.flex-center;
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
    @include mixis.flex-center-row-space-between;
}
.reference-audio__controls-left {
    height: 100%;
    width: 100%;
    @include mixis.flex-row;
}
.reference-audio__controls-right {
    height: 100%;
    @include mixis.flex-row;
}

.reference-audio__button {
    color: #acacac;
    margin: 0 .5rem;  
    border: none;
    padding: 0;
    @include mixis.flex-center;
}
.reference-audio__button .audio-icon {
    width: 1rem;
}
.reference-audio__button:hover .audio-icon {
    color: #1cafd0; 
    transition: color 0.2s ease;
}

.regionClick {
    color: #1cd4e1; 
}

.hover-switch {
    // padding-left: 30px;
    margin-left: auto;
}

.menu-settting {
    width: 150px;
}



</style>


<style lang="scss">
.speed-audio {
    padding: 3px 16px;
    color: #939292;
    font-size: 12.7px;
}
.speed-audio.selector {
    background-color: #d3e6df;
    color: #23b188;
    pointer-events: none;
}

.action-item {
    font-size: 12.5px;
    color: #529a9d;
    padding: 4px 12px;
    
} 

.action-item.switch {
    display: flex; 
    // flex-direction: row; 
    // justify-content: space-between;
}

</style>


<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import WaveformPlayer from './WaveformPlayer.vue'
import { Play, Pause, Speech, Infinity, Repeat1, Repeat2, SquareSplitHorizontal, Settings } from 'lucide-vue-next';
import { ElMessage } from 'element-plus'
import { Position, TrendCharts, Warning,} from '@element-plus/icons-vue'

const switchHover = ref(true)
const switchMinimap = ref(false)

// --- Type Definitions ---
type PlayerInstance = InstanceType<typeof WaveformPlayer>

// --- Props ---
defineProps<{ audioUrlReference: string }>()

// --- State Variables ---
const player                = ref<PlayerInstance | null>(null)
const repeatMode            = ref(0)   // 0: Single, 1: Loop Audio, 2: Loop Region
const isPlaying             = ref(false)
const defaultSelector       = ref<any>()  // Ref cho item mặc định (1.0x)
const lastClickedElement    = ref<HTMLElement | null>(null);
const regionButton          = ref<HTMLElement | null>(null);
const isRegioning           = ref(false)

// --- Computed ---
const repeatModeIcon = computed(()=> {
    if (repeatMode.value === 0) return Repeat1
    if (repeatMode.value === 1) return Infinity
    return Repeat2
})
const playIcon = computed(()=> {
    if (!isPlaying.value) return Play
    return Pause
})


onMounted(()=> {
    setupDefaultSpeedHighlight()
    setupEventPlayer()
}) 

function setupDefaultSpeedHighlight() {
    nextTick(()=> {
        const node = defaultSelector.value.$el as HTMLElement
        const defaultEl = node.nextElementSibling
    
        if (defaultEl) {
            defaultEl.classList.add('selector')
            lastClickedElement.value = defaultEl as HTMLElement
        }
    })
}

function setupEventPlayer() {
    player.value?.addEvent('region-in', ()=> isPlaying.value = true)
    player.value?.addEvent('region-out', ()=> isPlaying.value = false)

    player.value?.addEvent('finish', ()=> {
        if (repeatMode.value === 1) {
            player.value?.play()
            isPlaying.value = true
        }
        else {
            isPlaying.value = false
        }
    })

    // Xử lý khi bắt đầu phát (Tắt chế độ kéo chọn nếu đang bật)
    player.value?.addEvent('play', ()=> {
        if (isRegioning) {
            isRegioning.value = false
            player.value?.disableDragSelectionRegions()
            regionButton.value?.classList.remove('regionClick')
        }
    })
}


// --- Logic Handlers ---
// ========================================================================================= //

const handleItemClick = (event: MouseEvent) => {
    if (lastClickedElement.value) {
        lastClickedElement.value?.classList.remove('selector')
    }
    lastClickedElement.value = event.currentTarget as HTMLElement
    lastClickedElement.value.classList.add('selector')
}

const handleCommandSpeed = (command: string | number) => {
    const speedValue = parseFloat(command as string)

    if (speedValue === undefined || isNaN(speedValue)) {
        ElMessage(`Giá trị tốc độ không hợp lệ: ${command}`);
        return;
    }
    ElMessage(`Đặt tốc độ: ${speedValue.toFixed(2)}x`);
    player.value?.setSpeed(speedValue);
}

function handleTogglePlay() {
    isPlaying.value ? player.value?.pause() : player.value?.play()
    isPlaying.value = !isPlaying.value
}

function handleToggleRepeatMode() { 
    repeatMode.value = (repeatMode.value + 1) % 3;
    let modeStr = ""

    if (repeatMode.value === 0) {
        modeStr = "Chạy một lần."
    } else if (repeatMode.value === 1) {
        modeStr = "Lặp lại audio."
    } else if (repeatMode.value === 2) {
        modeStr = "Lặp lại region."
    }
    ElMessage(`Thiết lập chế độ audio chạy: ${modeStr}`);
    player.value?.toggleRepeatMode(repeatMode.value)
}

function handleSetRegions(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement
    if (!regionButton.value) {
        regionButton.value = el
    }

    if (isRegioning.value) {
        isRegioning.value = false
        el.classList.remove('regionClick')
        player.value?.disableDragSelectionRegions()
    } else {
        isRegioning.value = true
        el.classList.add('regionClick')
        player.value?.enableDragSelectionRegions()
    }
}

function handleSwitchHover() {
    if (switchHover.value) {
        player.value?.enableHoverPlugin()
    } else {
        player.value?.disableHoverPlugin()
    }
}

function handleSwitchMinimap() {
    if (switchMinimap.value) {
        player.value?.enableMinimapPlugin()
    } else {
        player.value?.disableMinimapPlugin()
    }
}



function handleCommandSetting() {

}
</script>