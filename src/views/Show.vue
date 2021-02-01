<template>
    <div v-if="show" class="show">
        <plex-image
            :src="show.thumb"
            :width="200"
            :height="300"/>
        <h1>{{show.title2}}</h1>
        <p>{{show.summary}}</p>
        <p>Year: {{show.parentYear}}</p>
        <media-item v-for="season in show.Metadata" :item="season"/>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";

export default {
    name: "Show",
    components: {PlexImage, MediaItem},
    data: () => ({}),
    async mounted() {
        console.log(5555, this.key);
        await this.init();
        console.log(this.show);
    },
    methods: {
        async init() {
            this.updateMetadata(this.key).then(console.log);
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