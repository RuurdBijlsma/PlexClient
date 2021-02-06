export default {
    state: {
        query: '',
        results: [],
    },
    mutations: {
        query: (state, query) => state.query = query,
        results: (state, results) => state.results = results,
    },
    getters: {},
    actions: {
        async search({dispatch, commit, state}, {query, sectionId}) {
            if (!query)
                query = state.query;
            if (!query)
                return commit('results', results);
            let results = await dispatch('searchPlex', {query, sectionId});
            commit('results', results);
        },
    },
    modules: {}
}
