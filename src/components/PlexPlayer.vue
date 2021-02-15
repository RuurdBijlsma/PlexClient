<template>
    <div ref="playerContainer"
         v-if="item"
         :class="{
             'electron': platformType === 'electron',
             'big-screen': bigScreen,
             'small-screen': !bigScreen,
             'hide-controls': hideControls && bigScreen && !mouseOnControls && playing,
         }"
         :style="{
            '--controlsHeight': controlsHeight + 'px',
            '--videoWidth': videoWidth + 'px',
            '--videoHeight': videoHeight + 'px',
            '--seekProgress': Math.round(progress * 10000) / 100 + '%',
        }">
        <div v-if="bigScreen && !fullscreen" class="player-app-bar">
            <div class="player-app-bar-content">
                <v-btn icon dark small class="no-drag" @click="exitBigScreen">
                    <v-icon small>mdi-chevron-down</v-icon>
                </v-btn>
                <template v-if="platformType === 'electron'">
                    <v-spacer></v-spacer>
                    <v-btn icon dark small class="no-drag" @click="minimizeWindow">
                        <v-icon small>mdi-minus</v-icon>
                    </v-btn>
                    <v-btn icon dark small class="no-drag ml-2" @click="closeWindow">
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </template>
            </div>
        </div>
        <plex-video class="video-container" ref="video"
                    @click.native="enterBigScreen"
                    @dblclick.native="toggleFullscreen"
                    v-if="item"
                    :key="item.key"/>
        <v-sheet
            :color="bigScreen ? 'transparent' : 'default'"
            :dark="bigScreen"
            v-if="item !== null"
            ref="controls"
            elevation="4"
            @mouseenter="mouseOnControls = true"
            @mouseleave="mouseOnControls = false"
            :style="controlsStyle"
            @mousedown="handleControlDown"
            class="plex-player">
            <div class="top-controls ml-4 mt-4">
                <div class="plex-media-info" @mousedown.stop="empty">
                    <template v-if="item.type==='episode'">
                        <router-link :to="`/show/${item.grandparentRatingKey}`" no-style>
                            {{ item.grandparentTitle }}
                        </router-link>
                        <router-link :to="`/episode/${item.ratingKey}`" no-style>{{ item.title }}</router-link>
                        <episode-link :item="item"/>
                    </template>
                    <template v-else>
                        <router-link :to="`/movie/${item.ratingKey}`" no-style>{{ item.title }}</router-link>
                        <router-link :to="`/library/${item.librarySectionID}/all?filter=year~${item.ratingKey}`"
                                     no-style>{{ item.year }}
                        </router-link>
                    </template>
                </div>
                <div class="plex-volume mr-5" @mousedown.stop="empty" @wheel.prevent="volumeWheel">
                    <v-slider @click:prepend="toggleMute"
                              :max="1" :min="0" :step="0.01"
                              dense
                              :color="bigScreen ? 'softForeground' : 'primary'"
                              v-model="$store.state.media.volume"
                              :prepend-icon="volumeIcon"
                              hide-details="auto" class="plex-volume-slider"></v-slider>
                </div>
            </div>
            <div class="middle-controls ml-4">
                <span>{{ niceCurrentTime }} / {{ niceDuration }}</span>
                <div class="seek-controls" @mousedown.stop="handleMouseDown" @wheel.prevent="seekWheel">
                    <v-sheet class="plex-seek-bg" ref="seekBg" :color="bigScreen ? '#292929' : 'softerBackground'">
                        <v-sheet class="plex-seek-progress" :color="bigScreen ? 'white' : 'primary'"/>
                        <v-sheet class="plex-buffer" color="#868686"
                                 v-for="(buffer, i) in progressBuffers" :key="i"
                                 :style="{
                                     left: Math.round(buffer[0] * 1000) / 10 + '%',
                                     width: Math.round((buffer[1] - buffer[0]) * 1000) / 10 + '%',
                                 }"/>
                        <v-sheet class="plex-seek-thumb" :color="bigScreen ? 'white' : 'primary'"/>
                    </v-sheet>
                </div>
            </div>
            <div class="bottom-controls ml-4 mt-1">
                <div class="left-control-buttons" @mousedown.stop="empty">
                    <v-btn icon small @click="skip(false)" :disabled="!canSkipBackwards">
                        <v-icon small>mdi-skip-previous</v-icon>
                    </v-btn>
                    <v-btn icon small @click="seekBy(-10)" :disabled="!canSeekLeft">
                        <v-icon small>mdi-skip-backward</v-icon>
                    </v-btn>
                    <v-btn icon @click="togglePlay" :loading="srcLoading">
                        <v-icon v-if="playing">mdi-pause</v-icon>
                        <v-icon v-else>mdi-play</v-icon>
                    </v-btn>
                    <v-btn icon small @click="seekBy(10)" :disabled="!canSeekRight">
                        <v-icon small>mdi-skip-forward</v-icon>
                    </v-btn>
                    <v-btn icon small @click="skip(true)" :disabled="!canSkipForwards">
                        <v-icon small>mdi-skip-next</v-icon>
                    </v-btn>
                    <v-btn icon small @click="stopPlaying">
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </div>
                <div class="right-control-buttons mr-5" @mousedown.stop="empty">
                    <v-btn icon small plain>
                        <v-icon small>mdi-repeat</v-icon>
                    </v-btn>
                    <v-btn icon small plain>
                        <v-icon small>mdi-shuffle</v-icon>
                    </v-btn>
                    <v-btn icon small plain>
                        <v-icon small>mdi-playlist-play</v-icon>
                    </v-btn>
                    <media-item-menu attach=".plex-player"
                                     :dark="bigScreen"
                                     :item="item"
                                     :nudge-top="140"></media-item-menu>
                </div>
            </div>
        </v-sheet>
    </div>
</template>

<script>
import Utils from "@/js/Utils";
import {mapActions, mapGetters, mapState} from "vuex";
import EpisodeLink from "@/components/EpisodeLink";
import MediaItemMenu from "@/components/MediaItemMenu";
import PlexVideo from "@/components/PlexVideo";

export default {
    name: "PlexPlayer",
    components: {PlexVideo, MediaItemMenu, EpisodeLink},
    data: () => ({
        dragControls: false,
        mouseDown: false,
        seekBounds: null,
        drag: null,
        fullscreen: false,
        mouseOnControls: false,
        moveTimeout: -1,
        hideControls: false,
        controlsOffset: {x: 0, y: 0},
    }),
    beforeDestroy() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('fullscreenchange', this.changeFullscreen);
    },
    async mounted() {
        await this.$store.restored;
        document.addEventListener('mousemove', this.handleMouseMove, false);
        document.addEventListener('mouseup', this.handleMouseUp, false);
        document.addEventListener('fullscreenchange', this.changeFullscreen, false);
    },
    methods: {
        seekWheel(e) {
            this.seekBy(e.deltaY / -10);
        },
        volumeWheel(e) {
            let maxVolume = this.usePlayer === 'vlc' ? 2 : 1;
            let newVolume = this.volume - e.deltaY / 2000;
            this.$store.commit('volume', Math.max(0, Math.min(newVolume, maxVolume)));
        },
        empty() {

        },
        toggleFullscreen() {
            if (this.fullscreen) {
                document.exitFullscreen();
            } else {
                let container = this.$refs.playerContainer;
                container.requestFullscreen();
            }
        },
        changeFullscreen() {
            this.fullscreen = document.fullscreenElement === this.$refs.playerContainer;
        },
        enterBigScreen() {
            if (!this.bigScreen)
                this.$router.push({query: {...this.$route.query, player: 1}});
        },
        exitBigScreen() {
            if (this.bigScreen)
                this.$router.push({query: {...this.$route.query, player: 0}});
        },
        togglePlay() {
            if (this.playing)
                this.$store.commit('playing', false);
            else
                this.$store.commit('playing', true);
        },
        seekTo(seconds) {
            this.$store.commit('currentTime', seconds);
        },
        seekBy(seconds) {
            this.seekTo(Math.max(0, Math.min(this.duration, this.currentTime + seconds)));
        },
        handleControlDown(e) {
            this.drag = {
                startX: e.clientX - this.controlsOffset.x,
                startY: e.clientY - this.controlsOffset.y,
            }
            this.dragControls = true;
        },
        handleMouseDown(e) {
            this.seekBounds = this.$refs.seekBg.$el.getBoundingClientRect();
            this.mouseDown = true;
            this.handleMouseMove(e);
        },
        handleMouseMove(e) {
            if (this.item === null) return;

            if (this.dragControls && this.bigScreen && this.windowWidth > 700) {
                this.controlsOffset = {
                    x: e.clientX - this.drag.startX,
                    y: e.clientY - this.drag.startY,
                };
            }
            if (this.mouseDown) {
                let x = e.pageX - this.seekBounds.left;
                let progress = Math.min(1, Math.max(0, x / this.seekBounds.width));
                this.seekTo(this.duration * progress);
            }
            if (e.movementX > 0 || e.movementY > 0) {
                this.hideControls = false;
                clearTimeout(this.moveTimeout);
                this.moveTimeout = setTimeout(() => {
                    this.hideControls = true;
                }, 2500);
            }
        },
        handleMouseUp() {
            if (this.mouseDown)
                this.mouseDown = false;
            if (this.dragControls)
                this.dragControls = false;
        },
        toggleMute() {
            this.$store.commit('muted', !this.muted);
        },
        ...mapActions(['markWatched', 'skip', 'stopPlaying', 'minimizeWindow', 'closeWindow']),
    },
    computed: {
        progressBuffers() {
            if (this.duration === 0)
                return [];
            return this.buffers.map(([s, e]) => [s / this.duration, e / this.duration]);
        },
        controlsStyle() {
            let style = {};
            if (this.bigScreen && this.windowWidth > 700) {
                style.transform = `translate(${this.controlsOffset.x}px, ${this.controlsOffset.y}px)`;
            }
            return style;
        },
        niceCurrentTime() {
            return Utils.msToTime(this.currentTime * 1000, false);
        },
        niceDuration() {
            return Utils.msToTime(this.duration * 1000, false);
        },
        progress() {
            if (this.duration === 0)
                return 0;
            return Math.min(1, this.currentTime / this.duration);
        },
        volumeIcon() {
            if (this.muted)
                return 'mdi-volume-mute';
            return 'mdi-volume-high';
        },
        bigScreen() {
            return this.$route.query.player === '1';
        },
        ...mapGetters([
            'usePlayer', 'videoWidth', 'videoHeight', 'canSkipBackwards',
            'canSkipForwards', 'canSeekLeft', 'canSeekRight'
        ]),
        ...mapState({
            controlsHeight: state => state.media.controlsHeight,
            windowWidth: state => state.windowWidth,
            platformType: state => state.platform.type,
            playing: state => state.media.playing,
            volume: state => state.media.volume,
            muted: state => state.media.muted,
            buffers: state => state.media.buffers,
            duration: state => state.media.duration,
            currentTime: state => state.media.currentTime,
            srcLoading: state => state.media.srcLoading,
            item: state => state.media.context.item,
        }),
    },
    watch: {
        '$route.query.player'() {
            if (!this.bigScreen && this.fullscreen) {
                document.exitFullscreen();
            }
        },
    },
}
</script>

<style scoped>
.player-app-bar {
    position: fixed;
    z-index: 52;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    backdrop-filter: blur(30px) saturate(80%) brightness(80%);
    transition: opacity 0.1s;
    cursor: auto !important;
}

.hide-controls .player-app-bar {
    opacity: 0.7;
    backdrop-filter: blur(10px) saturate(90%) brightness(90%);
}

.electron .player-app-bar {
    background-color: rgba(60, 60, 60, 0.2);
}

.player-app-bar-content {
    margin: 5px;
    height: 30px;
    width: calc(100% - 10px);
    display: flex;
    align-items: center;
    padding: 0 10px;
    -webkit-app-region: drag;
}

.no-drag, .no-drag >>> * {
    -webkit-app-region: no-drag;
}

.plex-player {
    position: fixed;
    width: 100%;
    max-width: 1000px;
    height: var(--controlsHeight);
    border-radius: 7px;
    padding-left: calc(var(--videoWidth) + 10px);
    transition: 0.5s, opacity 0.1s, transform 0s;
    z-index: 49;
    bottom: 20px;
    left: calc(50% - 500px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 15px;
}

.hide-controls .plex-player {
    opacity: 0;
}

.big-screen .plex-player {
    backdrop-filter: blur(35px) saturate(80%) brightness(80%);
    background-image: linear-gradient(to top, rgba(20, 20, 20, 0.4), rgba(20, 20, 20, 0.2));
    z-index: 51;
    padding-left: 10px;
    max-width: 600px;
    left: calc(50% - 300px);
}

.video-container {
    position: fixed;
    bottom: 25px;
    left: calc(50% - 500px + 5px);
    height: var(--videoHeight);
    width: var(--videoWidth);
    border-radius: 5px;
    overflow: hidden;
    /*box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.3);*/
    transition: 0.5s;
    z-index: 50;
}

.small-screen .video-container {
    cursor: pointer !important;
}

.big-screen .video-container {
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
    border-radius: 0;
    background-color: #000000;
}

@media (max-width: 1100px) {
    .small-screen .plex-player {
        left: 0;
        bottom: 0;
        border-radius: 0;
        max-width: 1100px;
    }

    .small-screen .video-container {
        left: 5px;
        bottom: 5px;
    }
}

@media (max-width: 700px) {
    .big-screen .plex-player {
        left: 0;
        bottom: 0;
        border-radius: 0;
        max-width: 700px;
    }
}

.hide-controls >>> .video {
    cursor: none !important;
}

.top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.plex-media-info {
    display: flex;
    flex-direction: column;
    font-size: 14px;
}

.plex-volume-slider {
    width: 120px;
    transform: scale(0.8);
}

.middle-controls {
    display: flex;
    align-items: center;
}

.middle-controls > span {
    width: 130px;
    font-size: 13px;
    opacity: 0.7;
}

.seek-controls {
    width: 100%;
    margin-right: 25px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.plex-seek-bg {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    position: relative;
}

.plex-seek-progress {
    height: 100%;
    border-bottom-left-radius: 2px;
    border-top-left-radius: 2px;
    width: var(--seekProgress);
}

.plex-buffer {
    position: absolute;
    height: 4px;
    top: 0;
    opacity: 0.3;
}

.plex-seek-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    position: relative;
    top: -7px;
    left: calc(var(--seekProgress) - 5px);
}

.bottom-controls {
    display: flex;
    justify-content: space-between;
}

.left-control-buttons > *, .right-control-buttons > * {
    margin: 0 3px;
}
</style>