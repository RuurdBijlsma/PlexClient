<template>
    <div class="blur-card" :style="blurStyle">
        <slot></slot>
    </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
    name: "BlurCard",
    computed: {
        blurStyle() {
            if (!this.fancyGraphics)
                return {
                    backgroundColor: this.themeColors.hardBackground,
                };
            return {
                backdropFilter: `blur(60px) brightness(${this.$vuetify.theme.dark ? '70' : '130'}%) saturate(130%)`,
                boxShadow: `0 15px 40px 0 rgba(${this.$vuetify.theme.dark ? '100,100,100' : '0,0,0'}, 0.3)`,
                backgroundImage: `linear-gradient(transparent, rgba(${this.$vuetify.theme.dark ? '50,50,50' : '255,255,255'}, 0.4))`,
            }
        },
        ...mapGetters(['themeColors']),
        ...mapState({
            fancyGraphics: state => state.fancyGraphics,
        }),
    }
}
</script>

<style scoped>
.blur-card {
    border-radius: 10px;
}
</style>