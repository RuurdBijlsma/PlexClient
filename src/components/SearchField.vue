<template>
    <v-form @submit.prevent="goToSearchPage" class="search-form">
        <v-text-field rounded filled dense hide-details="auto"
                      prepend-icon="mdi-magnify"
                      clearable
                      v-click-outside="{
                          handler: hideResults,
                          include: include,
                      }"
                      ref="searchInput"
                      autocomplete="off"
                      @focus="showResults = true"
                      @click:clear="clearQuery"
                      v-model="$store.state.search.query"
                      placeholder="Search"/>
        <blur-card class="search-results" v-show="showResults && (query !== '' || recentSearches.length > 0)">
            <div v-if="query === '' || query === null">
                <h5 class="recent-title">Recent searches</h5>
                <v-list dense color="transparent">
                    <v-list-item :disabled="recentQuery === query"
                                 class="recent-list-item"
                                 exact :to="`/search?query=${recentQuery}`"
                                 v-for="recentQuery in recentSearches">
                        <v-list-item-title>
                            {{ recentQuery }}
                        </v-list-item-title>
                        <v-list-item-action>
                            <v-btn icon plain small @click.prevent="removeRecent(recentQuery)">
                                <v-icon small>mdi-close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </div>
            <div class="not-found" v-else-if="filteredResults.length === 0">
                <p>No results found</p>
            </div>
            <v-list v-else color="transparent" dense>
                <div v-for="result in filteredResults" :key="result.hubIdentifier">
                    <v-subheader inset>{{ result.title }}</v-subheader>
                    <media-list-item class="result-item mb-2"
                                     v-for="item in getChildren(result)" :key="item.ratingKey"
                                     :item="item"/>
                </div>
            </v-list>
        </blur-card>
    </v-form>
</template>

<script>
import {mapActions, mapState} from "vuex";
import MediaListItem from "@/components/MediaListItem";
import BlurCard from "@/components/BlurCard";

export default {
    name: "SearchField",
    components: {BlurCard, MediaListItem},
    data: () => ({
        showResults: false,
    }),
    mounted() {
    },
    methods: {
        include() {
            return [document.querySelector('.search-results')];
        },
        hideResults() {
            this.showResults = false;
        },
        getChildren(hub) {
            return hub.Metadata ?? hub.Directory;
        },
        clearQuery() {
            this.$store.commit('query', '');
        },
        removeRecent(query) {
            this.$store.commit('removeRecentSearch', query);
        },
        async goToSearchPage() {
            this.$refs.searchInput.blur();
            this.$store.commit('saveResults', {query: this.query, results: this.results});
            this.$store.commit('addRecentSearch', this.query);
            console.log(this.filteredResults);
            if (this.results.length === 0)
                await this.search({sectionId: this.sectionKey});

            console.log(this.$route.path, this.$route.query.query, this.query)
            if (this.$route.path !== '/search' || this.$route.query.query !== this.query)
                await this.$router.push({
                    path: '/search',
                    query: {query: this.query},
                });
        },
        ...mapActions(['search']),
    },
    computed: {
        filteredResults() {
            return this.results?.filter(r => r.size > 0) ?? [];
        },
        sectionKey() {
            return this.$route.params.sectionKey ?? undefined;
        },
        ...mapState({
            query: state => state.search.query,
            results: state => state.search.results,
            recentSearches: state => state.search.recentSearches,
        })
    },
    watch: {
        '$route'() {
            this.showResults = false;
            this.clearQuery();
        },
        '$store.state.search.query'() {
            this.search({sectionId: this.sectionKey});
        },
    },
}
</script>

<style scoped>
.search-form {
    position: relative;
}

.recent-title {
    margin-left: 15px;
    margin-top: 10px;
}

.recent-list-item:before {
    background-color: transparent !important;
}

.search-results {
    max-height: calc(100vh - 100px);
    position: absolute;
    width: 330px;
    overflow: hidden;
    overflow-y: auto;
    padding: 10px 6px;
    right: -20px;
    top: 45px;
}

.not-found {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
}
</style>