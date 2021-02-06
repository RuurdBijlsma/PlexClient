import Vue from 'vue'
import Vuex from 'vuex'
import theme from './theme-module'
import plex from './plex-module'
import search from './search-module'
import VuexPersistence from 'vuex-persist'
import localForage from 'localforage'

let isElectron = window && window.process !== undefined && window.process.type !== undefined;
const platform = require(isElectron ? './electron-module' : './web-module').default;
console.log("is electron?", isElectron);

const vuexLocal = new VuexPersistence({
    reducer: state => ({
        plex: {
            content: state.plex.content,
            publicIp: state.plex.publicIp,
            server: state.plex.server,
            services: state.plex.services,
            user: state.plex.user,
            auth: state.plex.auth,
        },
    }),
    storage: localForage,
    asyncStorage: true,
})

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        promiseCache: {},
        scrollY: window.scrollY,
        windowWidth: window.innerWidth,
    },
    mutations: {
        windowWidth: (state, windowWidth) => state.windowWidth=windowWidth,
        scrollY: (state, scrollY) => state.scrollY=scrollY,
        removePromiseCache: (state, key) => Vue.delete(state.promiseCache, key),
        setPromiseCache: (state, {key, date, promise}) => Vue.set(state.promiseCache, key, {promise, date}),
    },
    actions: {
        async getCached({state, getters, commit}, {fun, key, lifeTime = 1000 * 3}) {
            if (state.promiseCache.hasOwnProperty(key) && state.promiseCache[key].date + lifeTime > new Date) {
                let promise = state.promiseCache[key].promise;
                return await promise;
            }
            let promise = fun();
            commit('setPromiseCache', {key, date: +new Date, promise});
            return await promise;
        },
    },
    modules: {platform, theme, plex,search},
    plugins: [vuexLocal.plugin],
})
