<template>
    <v-sheet elevation="4" :style="{
        '--controlsHeight': controlsHeight + 'px',
        '--videoWidth': videoWidth + 'px',
        '--videoHeight': videoHeight + 'px',
    }" class="plex-player">
        <div class="video-container">
            <vlc-video :src="src"
                       v-if="usePlayer === 'vlc'"
                       class="video"
                       ref="vlc"
                       width="auto"
                       controls
                       enable-context-menu
                       :dark="$vuetify.theme.dark"/>
            <video controls
                   ref="hls"
                   v-else-if="usePlayer === 'hls'"
                   class="video"/>
        </div>
        <div class="plex-controls">
            <div class="top-controls ml-4 mt-4">
                <div class="plex-media-info">
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
                <div class="plex-volume mr-5">
                    <v-slider @click:prepend="toggleMute" :max="1" :min="0" :step="0.01" v-model="volume"
                              :prepend-icon="volumeIcon"
                              hide-details="auto" class="plex-volume-slider"></v-slider>
                </div>
            </div>
            <div class="seek-controls ml-4" @mousedown="handleMouseDown">
                <v-sheet class="plex-seek-bg" ref="seekBg" color="softerBackground">
                    <v-sheet class="plex-seek-progress" color="primary"></v-sheet>
                    <v-sheet class="plex-seek-thumb" color="primary"></v-sheet>
                </v-sheet>
            </div>
            <div class="bottom-controls ml-4">
                <div class="left-control-buttons">
                    <v-btn icon small>
                        <v-icon>mdi-skip-previous</v-icon>
                    </v-btn>
                    <v-btn icon small>
                        <v-icon>mdi-skip-backward</v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                    <v-btn icon small>
                        <v-icon>mdi-skip-forward</v-icon>
                    </v-btn>
                    <v-btn icon small>
                        <v-icon>mdi-skip-next</v-icon>
                    </v-btn>
                </div>
                <div class="right-control-buttons mr-5">
                    <v-btn icon small plain>
                        <v-icon>mdi-repeat</v-icon>
                    </v-btn>
                    <v-btn icon small plain>
                        <v-icon>mdi-shuffle</v-icon>
                    </v-btn>
                    <v-btn icon small plain>
                        <v-icon>mdi-playlist-play</v-icon>
                    </v-btn>
                    <media-item-menu :item="item"></media-item-menu>
                </div>
            </div>
        </div>
    </v-sheet>
</template>

<script>
import Utils from "@/js/Utils";
import Hls from 'hls.js';
import {mapGetters, mapState} from "vuex";
import EpisodeLink from "@/components/EpisodeLink";
import MediaItemMenu from "@/components/MediaItemMenu";

let vlcComponent = Utils.isElectron ? {VlcVideo: require('./vlc-video/VlcVideo').default} : {};

export default {
    name: "PlexPlayer",
    components: {MediaItemMenu, EpisodeLink, ...vlcComponent},
    data: () => ({
        hlsPlayer: new Hls(),
        videoRatio: 16 / 9,
        controlsHeight: 150,
        mouseDown: false,
        volume: 1,
        muted: false,
        seekBounds: null,
    }),
    props: {
        item: {
            type: Object,
            default: null,
        },
        transcode: {
            type: Object,
            default: null,
        },
    },
    async mounted() {
        await this.$store.restored;
        if (this.platformType === 'web') {
            this.hlsPlayer.attachMedia(this.$refs.hls);
            this.hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, () => {
                this.initSrc();
            });
        }
        this.player.addEventListener('error', () => {
            console.log('error player');
        });
        this.player.addEventListener('loadeddata', () => {
            console.log('loadeddata player');
            this.videoRatio = this.player.videoWidth / this.player.videoHeight;
        });
        document.addEventListener('mousemove', this.handleMouseMove, false);
        document.addEventListener('mouseup', this.handleMouseUp, false);
        console.log({
            item: this.item,
            src: this.src,
            usedPlayer: this.usePlayer,
            platform: this.platformType,
            player: this.player,
        });
    },
    methods: {
        handleMouseDown(e) {
            this.seekBounds = this.$refs.seekBg.$el.getBoundingClientRect();
            this.mouseDown = true;
            this.handleMouseMove(e);
        },
        handleMouseMove(e) {
            if (this.mouseDown) {
                let x = e.pageX - this.seekBounds.left;
                let progress = Math.min(1, Math.max(0, x / this.seekBounds.width));
                console.log(progress);
                // this.player.currentTime = this.player.duration * progress;
            }
        },
        handleMouseUp() {
            if (this.mouseDown)
                this.mouseDown = false;
        },
        toggleMute() {
            this.muted = !this.muted;
        },
        initSrc() {
            if (this.usePlayer === 'hls') {
                this.hlsPlayer.loadSource(this.src);
                this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    console.log('hls manifest loaded', data);
                });
            }
        },
    },
    computed: {
        volumeIcon() {
            if (this.muted)
                return 'mdi-volume-mute';
            return 'mdi-volume-high';
        },
        videoWidth() {
            return this.videoHeight * this.videoRatio;
        },
        videoHeight() {
            return this.controlsHeight - 10;
        },
        player() {
            return this.usePlayer === 'vlc' ? this.$refs.vlc : this.$refs.hls;
        },
        src() {
            if (this.usePlayer === 'vlc') {
                // return original part url
                return this.originalMkv(this.item);
            } else {
                return this.originalHls(this.item);
            }
        },
        usePlayer() {
            if (this.platformType === 'electron') {
                return 'vlc';
            } else {
                return 'hls';
            }
        },
        ...mapGetters(['originalHls', 'originalMkv', 'originalDash']),
        ...mapState({
            platformType: state => state.platform.type,
        })
    },
    watch: {
        volume() {

        },
        src() {
            this.initSrc();
        },
    },
}
</script>

<style scoped>
.plex-player {
    position: fixed;
    width: 100%;
    max-width: 1000px;
    height: var(--controlsHeight);
    bottom: 20px;
    left: calc(50% - 500px);
    border-radius: 7px;
    padding-left: calc(var(--videoWidth) + 10px);
}

.video-container {
    position: fixed;
    bottom: 25px;
    left: calc(50% - 500px + 5px);
    height: var(--videoHeight);
    width: var(--videoWidth);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.3);
}

@media (max-width: 1000px) {
    .plex-player {
        left: 0;
        bottom: 0;
        border-radius: 0;
    }

    .video-container {
        left: 5px;
        bottom: 5px;
    }
}

.video {
    height: 100%;
}

.top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.plex-controls {
    display: flex;
    flex-direction: column;
}

.plex-media-info {
    display: flex;
    flex-direction: column;
    font-size: 14px;
}

.plex-volume-slider {
    width: 120px;
}

.seek-controls {
    width: calc(100% - 40px);
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.plex-seek-bg {
    width: 100%;
    height: 4px;
    border-radius: 2px;
}

.plex-seek-progress {
    width: 50%;
    height: 100%;
    border-bottom-left-radius: 2px;
    border-top-left-radius: 2px;
}

.plex-seek-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    position: relative;
    left: calc(50% - 5px);
    top: -7px;
}

.bottom-controls {
    display: flex;
    justify-content: space-between;
}

.left-control-buttons > *, .right-control-buttons > * {
    margin: 0 3px;
}
</style>