export default {
    state: {
        query: '',
        results: [],
        staticResults: {query: '', results: []},
        recentSearches: [],
    },
    mutations: {
        removeRecentSearch: (state, query) => {
            state.recentSearches = state.recentSearches.filter(s => s !== query);
        },
        recentSearches: (state, recentSearches) => state.recentSearches = recentSearches,
        addRecentSearch: (state, query) => {
            const maxLength = 8;
            state.recentSearches = [query, ...state.recentSearches.filter(s => s !== query).slice(0, (maxLength - 1))];
        },
        query: (state, query) => state.query = query,
        results: (state, results) => state.results = results,
        saveResults: (state, {query, results}) => state.staticResults = {query, results: [...results]},
    },
    getters: {},
    actions: {
        async search({dispatch, commit, state}, {query, sectionId}) {
            if (!query)
                query = state.query;
            if (!query)
                return commit('results', []);
            let results = await dispatch('searchPlex', {query, sectionId});
            commit('results', results);
        },
    },
    modules: {}
}
