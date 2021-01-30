import Vue from 'vue'
import Vuex from 'vuex'
import theme from './theme-module'
import plex from './plex-module'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
    reducer: state => ({
        plex: {
            host: state.plex.host,
            port: state.plex.host,
            credentials: state.plex.credentials,
        },
    }),
    storage: window.localStorage,
})


let isElectron = window && window.process !== undefined && window.process.type !== undefined;
const platform = require(isElectron ? './electron-module' : './web-module').default;
console.log("is electron?", isElectron);

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {platform, theme, plex},
    plugins: [vuexLocal.plugin],
})
