<template>
    <div v-if="library" class="library">
        <div class="top-buttons">
            <div class="left-buttons">
                <v-select class="directory-select" v-model="dirKey"
                          :items="library.Directory.filter(d => !d.secondary && !d.search)" item-text="title"
                          item-value="key" outlined
                          rounded dense/>
            </div>
            <div class="right-buttons">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on" class="mr-2">
                            <v-icon>mdi-play</v-icon>
                        </v-btn>
                    </template>
                    <span>Play</span>
                </v-tooltip>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>mdi-shuffle</v-icon>
                        </v-btn>
                    </template>
                    <span>Shuffle</span>
                </v-tooltip>
            </div>
        </div>
        <div class="items">
            <media-item v-for="item in directory.Metadata" :key="item.guid" :item="item" :size="160"/>
        </div>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";

export default {
    name: "ShowLibrary",
    components: {MediaItem, PlexImage},
    data: () => ({
        dirKey: 'all'
    }),
    async mounted() {
        await this.$store.restored;
        await this.init();
    },
    methods: {
        async init() {
            this.dirKey = this.$route.params.directory ?? 'all';
            this.updateSectionLibrary(this.key).then();
            this.updateLibraryDirectory({sectionKey: this.key, directory: this.dirKey}).then();
            console.log(this.library);
            console.log(this.directory);
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory']),
    },
    computed: {
        key() {
            return this.$route.params.key ?? '1';
        },
        library() {
            return this.$store.state.plex.content['sectionLibrary' + this.key];
        },
        directory() {
            return this.$store.state.plex.content['sectionLibrary' + this.key + '|' + this.dirKey] ?? [];
        },
    },
    watch: {
        key() {
            this.init();
        },
        dirKey() {
            this.updateLibraryDirectory({sectionKey: this.key, directory: this.dirKey});
        },
    },
}
</script>

<style scoped>
.library {

}

.top-buttons {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 40px 45px;
    padding-bottom: 10px;
}

.directory-select {
    width: 200px;
    display: inline-flex;
}

.items {
    padding-bottom: 40px;
}
</style>