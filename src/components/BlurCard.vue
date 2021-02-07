<template>
    <div class="blur-card" :style="{
            backdropFilter: `blur(60px) brightness(${$vuetify.theme.dark ? '70' : '130'}%) saturate(130%)`,
            boxShadow: `0 15px 40px 0 rgba(${$vuetify.theme.dark ? '100,100,100' : '0,0,0'}, 0.3)`,
            backgroundImage: `linear-gradient(transparent, rgba(${$vuetify.theme.dark ? '50,50,50' : '255,255,255'}, 0.4))`,
        }">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "BlurCard"
}
</script>

<style scoped>
.blur-card {
    border-radius: 10px;
}
</style>