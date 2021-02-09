<template>
    <div class="results-page" v-if="restored">
        <h2>Search results for “{{ query }}”</h2>
        <item-row :size="(result.type === 'episode' ? 250 : 150) * uiScale"
                  :title="result.title"
                  show-context
                  class="mb-10"
                  :key="result.hubIdentifier" v-for="result in filteredResults"
                  :items="getChildren(result)"/>
    </div>
</template>

<script>
import ItemRow from "@/components/ItemRow";
import {mapActions, mapState} from "vuex";

export default {
    name: "Search",
    components: {ItemRow},
    data: () => ({
        restored: false,
    }),
    async mounted() {
        await this.$store.restored;
        this.restored = true;
        this.init();
    },
    methods: {
        init(){
            this.$store.commit('addRecentSearch', this.query);
            this.searchPlex({query: this.query}).then(results => {
                console.log(results);
                this.$store.commit('saveResults', {query: this.query, results})
            });
        },
        getChildren(hub) {
            return hub.Metadata ?? hub.Directory;
        },
        ...mapActions(['searchPlex']),
    },
    computed: {
        query() {
            return this.$route.query.query ?? '';
        },
        filteredResults() {
            let fr = this.staticResults?.results?.filter(r => r.size > 0) ?? [];
            console.log("Results", fr);
            return fr;
        },
        sectionKey() {
            return this.$route.params.sectionKey ?? undefined;
        },
        ...mapState({
            staticResults: state => state.search.staticResults,
            uiScale: state => state.uiScale,
        }),
    },
    watch: {
        query(){
            this.init();
        },
    },
}
</script>

<style scoped>
.results-page {
    padding: 30px 45px;
}
</style>