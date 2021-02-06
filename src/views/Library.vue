<template>
    <v-lazy>
        <div class="library">
            <div class="top-buttons">
                <div class="left-buttons">
                    <v-menu offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="mr-3" icon v-bind="attrs" v-on="on">
                                <v-icon>mdi-filter-outline</v-icon>
                            </v-btn>
                        </template>
                        <v-list dense class="filter-list">
                            <v-list-group sub-group v-for="filterObj in filters" @click="showFilter(filterObj.filter)">
                                <template v-slot:activator>
                                    <v-list-item-title>{{ filterObj.title }}</v-list-item-title>
                                </template>
                                <v-list-item @click="selectSubFilter(filterObj.filter, subFilter)" class="sub-item"
                                             v-for="subFilter in getFilter(filterObj.filter)">
                                    <v-list-item-icon>
                                        <v-icon
                                            v-if="filter.hasOwnProperty(filterObj.filter) && filter[filterObj.filter] === subFilter">
                                            mdi-check
                                        </v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>
                                        {{ subFilter.title }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list-group>
                        </v-list>
                    </v-menu>
                    <v-chip class="mr-3" v-if="filter.length === 2" close @click:close="filter = []">{{ filterName }}:
                        {{ subFilterName }}
                    </v-chip>
                    <v-select class="directory-select mr-3" v-model="dirKey"
                              :items="directory.filter(d => !d.secondary && !d.search)" item-text="title"
                              item-value="key" outlined
                              rounded dense/>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :loading="sortLoading" @click="toggleSortDirection" class="mr-3" icon v-bind="attrs"
                                   v-on="on">
                                <v-icon v-if="descendingSort">mdi-sort-numeric-descending</v-icon>
                                <v-icon v-else>mdi-sort-numeric-ascending</v-icon>
                            </v-btn>
                        </template>
                        <span v-if="descendingSort">Descending order</span>
                        <span v-else>Ascending order</span>
                    </v-tooltip>
                    <v-select class="directory-select" v-model="sort"
                              :items="sorts" item-text="title"
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
                <media-item :sort-prop="sort" :item="item" :type="dirKey === 'folder' ? 'folder' : null" :size="160"
                            v-for="item in libraryItems" :key="item.guid" class="item"/>
            </div>
        </div>
    </v-lazy>
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
        sort: '',
        descendingSort: false,
        filter: [],
        sortLoading: false,
        hasInitialized: false,
        subFilters: {},
    }),
    async mounted() {
        this.hasInitialized = false;
        await this.$store.restored;
        await this.init();
    },
    methods: {
        async init() {
            this.filter = this.$route.query.filter?.split('~') ?? [];
            this.sort = this.$route.query.sort ?? 'titleSort';
            if (this.sort.includes(':desc')) {
                this.descendingSort = true;
                this.sort = this.sort.substr(0, this.sort.length - 5);
            } else {
                this.descendingSort = this.$route.query.dir === 'desc';
            }
            this.dirKey = this.$route.params.directory ?? 'all';

            this.hasInitialized = true;
            console.log("Update", this.filter[0]);
            this.updateSectionFilter({key: this.sectionKey, filter: this.filter[0]}).then();
            this.updateSectionLibrary(this.sectionKey).then();
            this.updateDirectory().then(e => console.log('section library', e));
            this.updateSectionSorts(this.sectionKey).then();
            this.updateSectionFilters(this.sectionKey).then();
            console.log({
                filters: this.filters,
                sorts: this.sorts,
                libraryItems: this.libraryItems,
                directory: this.directory,
            });
        },
        selectSubFilter(filter, subFilter) {
            this.filter = [filter, subFilter.key];
        },
        getFilter(filter) {
            return this.$store.state.plex.content['sectionFilter' + this.sectionKey + '|' + filter] ?? [];
        },
        showFilter(filter) {
            this.updateSectionFilter({key: this.sectionKey, filter});
        },
        async toggleSortDirection() {
            this.descendingSort = !this.descendingSort;
        },
        async updateDirectory() {
            if (!this.hasInitialized)
                return;
            return await this.updateLibraryDirectory({
                sectionKey: this.sectionKey,
                directory: this.dirKey,
                sort: this.sortQuery,
                filter: this.filter,
            })
        },
        async updateRoute() {
            await this.$router.replace({
                params: {
                    directory: this.dirKey,
                    sectionKey: this.sectionKey,
                },
                query: {
                    filter: this.filter.join('~'),
                    sort: this.sort,
                    dir: this.descendingSort ? 'desc' : 'asc',
                },
            });
        },
        ...mapActions(['updateSectionLibrary', 'updateLibraryDirectory', 'updateSectionFilters', 'updateSectionSorts', 'updateSectionFilter']),
    },
    computed: {
        filterName() {
            let filter = this.filters.find(f => f.filter === this.filter[0]);
            return filter?.title ?? this.filter[0];
        },
        subFilterName() {
            let subFilters = this.getFilter(this.filter[0]);
            let subFilter = subFilters.find(s => s.key === this.filter[1]);
            return subFilter?.title ?? this.filter[1];
        },
        sortQuery() {
            return this.sort + (this.descendingSort ? ':desc' : '');
        },
        filters() {
            return this.$store.state.plex.content['sectionFilters' + this.sectionKey] ?? [];
        },
        sorts() {
            return this.$store.state.plex.content['sectionSorts' + this.sectionKey] ?? [];
        },
        sectionKey() {
            return this.$route.params.sectionKey ?? '1';
        },
        directory() {
            return this.$store.state.plex.content['libraryChildren' + this.sectionKey] ?? [];
        },
        libraryItems() {
            return this.$store.state.plex.content['sectionLibrary' + this.sectionKey + '|' + this.dirKey + '|' + this.sortQuery + JSON.stringify(this.filter)] ?? [];
        },
    },
    watch: {
        sectionKey() {
            this.init();
        },
        descendingSort() {
            if (this.$route.query.dir !== (this.descendingSort ? 'desc' : 'all'))
                this.updateRoute();
            this.updateDirectory();
        },
        sort() {
            if (this.$route.query.sort !== this.sort)
                this.updateRoute();
            this.updateDirectory();
        },
        filter() {
            if (this.$route.query.filter !== this.filter.join('~'))
                this.updateRoute();
            this.updateDirectory();
        },
        dirKey() {
            if (this.$route.params.directory !== this.dirKey)
                this.updateRoute();
            this.updateDirectory();
        },
        '$route'() {
        },
    },
}
</script>

<style scoped>
.library {

}

.filter-list {
    max-height: 400px;
    width: 300px;
    overflow-y: auto;
}

.sub-item {
    font-size: 12px;
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
    padding: 0 35px;
    padding-bottom: 40px;
}

.item {
    margin: 8px 0 8px 30px;
    display: inline-flex;
}
</style>