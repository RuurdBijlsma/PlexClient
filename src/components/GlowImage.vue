<template>
    <div class="glow-image" :style="{
        width: width + 'px',
        borderRadius: rounding,
    }">
        <div class="album-art album-background"
             :style="{
                    backgroundImage: `url(${src})`,
                    opacity: $vuetify.theme.dark ? 0.4 : 0.7,
                    minWidth: width + 'px',
                    height: height + 'px',
                    right: (-width / 2) + 'px',
                    borderRadius: rounding,
                    top: (height / 16) + 'px',
                    filter: `blur(${width / 16}px)`,
                 }"></div>
        <div class="album-art album-normal" :style="{
            backgroundImage: `url(${src})`,
            minWidth: width + 'px',
            height: height + 'px',
            left: (-width / 2) + 'px',
            borderRadius: rounding,
        }"></div>
    </div>
</template>

<script>
    export default {
        name: "GlowImage",
        props: {
            src: {
                type: String,
                default: undefined,
            },
            width: {
                type: Number,
                default: 300,
            },
            height: {
                type: Number,
                default: 300,
            },
            rounding: {
                type: String,
                default: '0',
            },
        },
    }
</script>

<style scoped>
    .glow-image {
        display: inline-flex;
        justify-content: center;
    }

    .album-art {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
        z-index: 3;
    }

    .album-background {
        transform: scale(1);
    }
</style>