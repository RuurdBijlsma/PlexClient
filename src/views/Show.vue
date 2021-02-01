<template>
    <div v-if="show" class="show">
        show
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";

export default {
    name: "Show",
    components: {},
    data: () => ({}),
    async mounted() {
        console.log(5555, this.key);
        await this.init();
        console.log(this.show);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then();
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateMetadata']),
    },
    computed: {
        key() {
            return this.$route.params.key ?? '1';
        },
        show() {
            return this.$store.state.plex.content['metadata' + this.key];
        },
    },
    watch: {
        key() {
            this.init();
        },
    },
}
</script>

<style scoped>
.show {

}

</style>