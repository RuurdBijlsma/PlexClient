<template>
    <div class="glow-column-page">
        <div class="left-column">
            <plex-image
                glow
                class="ml-6"
                rounding="10px"
                :src="src"
                :width="imgWidth"
                :height="imgHeight"/>
        </div>
        <div class="right-column" :style="{
            width: `calc(100% - ${Math.round(imgWidth)}px - 24px - 50px)`,
            marginLeft: `calc(${Math.round(imgWidth)}px + 24px + 50px)`,
        }">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import PlexImage from "@/components/PlexImage";

export default {
    name: "GlowColumnPage",
    components: {PlexImage},
    props: {
        imgWidth: {
            type: Number,
            default: 200,
        },
        imgHeight: {
            type: Number,
            default: 200,
        },
        src: {
            type: String,
            default: '',
        },
    },
}
</script>

<style scoped>
.glow-column-page {
    max-width: 1300px;
    width: calc(100% - 20px);
    padding: 30px 10px;
    margin: 0 auto;
    display: flex;
}

.left-column {
    position: fixed;
}

</style>