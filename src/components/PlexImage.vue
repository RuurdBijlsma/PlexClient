<template>
    <div class="plex-image" :style="{
        '--width': width + 'px',
        '--height': height + 'px',
            borderRadius: rounding,
    }">
        <glow-image :rounding="rounding" class="vimg" :width="width" :height="height" :src="fullSrc" v-if="glow"/>
        <div class="vimg" v-else :style="{
            backgroundImage: `url(${fullSrc})`,
            borderRadius: rounding,
        }"></div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import GlowImage from "@/components/GlowImage";

export default {
    name: "PlexImage",
    components: {GlowImage},
    props: {
        glow: {
            type: Boolean,
            default: false,
        },
        src: {
            type: String,
            default: null,
            required: true,
        },
        width: {
            type: Number,
            default: 140,
        },
        height: {
            type: Number,
            default: 140,
        },
        transitionDuration: {
            type: String,
            default: '.1s',
        },
        rounding: {
            type: String,
            default: '0',
        },
    },
    data: () => ({
        lazySrc: '',
        fullSrc: '',
        transition: '',
    }),
    mounted() {
        this.transition = this.transitionDuration;
        this.setSrc();
        this.lazySrc = this.placeholderImg;
    },
    methods: {
        async setSrc() {
            if (navigator.onLine)
                this.fullSrc = this.imgUrl;
            // let offlineUrl = await this.offlinePlexImg(this.imgUrl);
            // if (offlineUrl) {
            //     this.transition = '0s';
            //     this.fullSrc = offlineUrl;
            // } else {
            //     this.fullSrc = await this.onlinePlexImg(this.imgUrl);
            // }
        },
        ...mapActions(['onlinePlexImg', 'offlinePlexImg']),
    },
    computed: {
        thumbWidth() {
            return Math.ceil(this.width / 100) * 100;
        },
        thumbHeight() {
            return Math.round(this.thumbWidth / this.aspectRatio);
        },
        imgUrl() {
            return this.transcodeUrl({
                url: this.src,
                width: Math.round(this.thumbWidth),
                height: Math.round(this.thumbHeight),
            });
        },
        placeholderImg() {
            return this.transcodeUrl({
                url: this.src,
                width: Math.round(this.thumbWidth * .05),
                height: Math.round(this.thumbHeight * .05),
            });
        },
        aspectRatio() {
            return this.width / this.height;
        },
        ...mapGetters(['transcodeUrl', 'plexUrl']),
    },
    watch: {
        imgUrl() {
            this.setSrc();
        },
    },
}
</script>

<style scoped>
.plex-image {
    width: var(--width);
    height: var(--height);
    position: relative;
    display: flex;
}

.vimg {
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.img-filter {
    width: 100%;
    height: 100%;
    position: absolute;
}
</style>