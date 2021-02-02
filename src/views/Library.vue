<template>
    <div v-if="library" class="library">
        <div class="top-buttons">
            <div class="left-buttons">
                <v-icon class="mr-3">mdi-filter-outline</v-icon>
                <v-select class="directory-select mr-3" v-model="dirKey"
                          :items="library.Directory.filter(d => !d.secondary && !d.search)" item-text="title"
                          item-value="key" outlined
                          rounded dense/>
                <v-icon class="mr-3">mdi-sort</v-icon>
                <v-select class="directory-select" v-model="sortProp"
                          :items="sort" item-text="name"
                          item-value="property" outlined
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
        <v-lazy>
            <div class="items">
                <media-item :item="item" :type="dirKey === 'folder' ? 'folder' : null" :size="160"
                            v-for="item in directory.Metadata" :key="item.guid" class="item"/>
            </div>
        </v-lazy>
    </div>
</template>

<script>
import {mapActions} from "vuex";
import PlexImage from "@/components/PlexImage";
import MediaItem from "@/components/MediaItem";

export default {
    name: "Library",
    components: {MediaItem, PlexImage},
    data: () => ({
        dirKey: 'all',
        sort: [
            {name: 'Title', property: 'title',},
            {name: 'Year', property: 'year',},
            {name: 'Release date', property: 'releaseDate',},
            {name: 'Critic rating', property: 'title',},
            {name: 'Date added', property: 'dateAdded',},
            {name: 'Date viewed', property: 'dateViewed',},
        ],
        sortProp: 'title',
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
            if (this.$route.params.directory !== this.dirKey)
                this.$router.replace({params: {directory: this.dirKey, key: this.key}})
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
    width: 250px;
    display: inline-flex;
}

.items {
    padding-bottom: 40px;
    text-align: center;
}

.item {
    margin: 8px 15px;
    display: inline-flex;
}
</style>