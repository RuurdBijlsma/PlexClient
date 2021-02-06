<template>
    <v-form @submit.prevent="goToSearchPage" class="search-form">
        <v-text-field rounded filled dense hide-details="auto"
                      prepend-icon="mdi-magnify"
                      clearable
                      autocomplete="off"
                      @focus="showResults = true"
                      @blur="hideResults"
                      @click:clear="clearQuery"
                      v-model="$store.state.search.query"
                      placeholder="Search"/>
        <div class="search-results" v-show="showResults && !!query" :style="{
            backdropFilter: `blur(60px) brightness(${$vuetify.theme.dark ? '70' : '130'}%) saturate(130%)`,
            boxShadow: `0 15px 40px 0 rgba(${$vuetify.theme.dark ? '100,100,100' : '0,0,0'}, 0.3)`,
            backgroundImage: `linear-gradient(transparent, rgba(${$vuetify.theme.dark ? '50,50,50' : '255,255,255'}, 0.4))`,
        }">
            <div class="not-found" v-if="filteredResults.length === 0">
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
        </div>
    </v-form>
</template>

<script>
import {mapActions, mapState} from "vuex";
import MediaListItem from "@/components/MediaListItem";

export default {
    name: "SearchField",
    components: {MediaListItem},
    data: () => ({
        showResults: false,
    }),
    methods: {
        hideResults() {
            setTimeout(() => this.showResults = false, 100);
        },
        getChildren(hub) {
            return hub.Metadata ?? hub.Directory;
        },
        clearQuery() {
            this.$store.commit('query', '');
        },
        async goToSearchPage() {
            console.log(this.filteredResults);
            if (!this.filteredResults)
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
        })
    },
    watch: {
        '$route'() {
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

.search-results {
    max-height: calc(100vh - 100px);
    position: absolute;
    width: 330px;
    border-radius: 10px;
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