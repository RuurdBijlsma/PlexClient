export default {
    state: {
        query: '',
        results: [],
        staticResults: {query: '', results: []},
    },
    mutations: {
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
