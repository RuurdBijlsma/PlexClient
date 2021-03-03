import Vue from 'vue'
import Vuex from 'vuex'
import theme from './theme-module'
import plex from './plex-module'
import search from './search-module'
import media from './media-module'
import VuexPersistence from 'vuex-persist'
import localForage from 'localforage'
import Utils from "@/js/Utils";

const isElectron = Utils.isElectron;
const platform = require(isElectron ? './electron-module' : './web-module').default;
console.log("is electron?", isElectron);

const vuexLocal = new VuexPersistence({
    reducer: state => ({
        uiScale: state.uiScale,
        fancyGraphics: state.fancyGraphics,
        plex: {
            content: state.plex.content,
            publicIp: state.plex.publicIp,
            server: state.plex.server,
            services: state.plex.services,
            user: state.plex.user,
            auth: state.plex.auth,
        },
        search: {
            recentSearches: state.search.recentSearches,
        },
        media: {
            currentTime: state.media.currentTime,
            context: state.media.context,
            volume: state.media.volume,
            muted: state.media.muted,
            shuffle: state.media.shuffle,
            repeat: state.media.repeat,
        },
    }),
    storage: localForage,
    asyncStorage: true,
})

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        fancyGraphics: true,
        promiseCache: {},
        scrollY: window.scrollY,
        windowWidth: window.innerWidth,
        uiScale: 1,
        textPrompt: {
            show: false,
            title: '',
            subtitle: '',
            label: '',
            value: '',
            cancelText: '',
            confirmText: '',
            onConfirm: () => 0,
            onCancel: () => 0,
        },
        prompt: {
            show: false,
            title: '',
            subtitle: '',
            cancelText: '',
            confirmText: '',
            onConfirm: () => 0,
            onCancel: () => 0,
        },
        snackbars: [],
    },
    mutations: {
        fancyGraphics: (state, fancyGraphics) => state.fancyGraphics = fancyGraphics,
        windowWidth: (state, windowWidth) => state.windowWidth = windowWidth,
        scrollY: (state, scrollY) => state.scrollY = scrollY,
        removePromiseCache: (state, key) => Vue.delete(state.promiseCache, key),
        setPromiseCache: (state, {key, date, promise}) => Vue.set(state.promiseCache, key, {promise, date}),
        hideTextPrompt: state => state.textPrompt.show = false,
        showTextPrompt: (state, {title, subtitle, value, label, cancelText, confirmText, onConfirm, onCancel,}) => {
            state.textPrompt.show = true;
            state.textPrompt.title = title;
            state.textPrompt.subtitle = subtitle;
            state.textPrompt.value = value;
            state.textPrompt.label = label;
            state.textPrompt.cancelText = cancelText;
            state.textPrompt.confirmText = confirmText;
            state.textPrompt.onConfirm = onConfirm;
            state.textPrompt.onCancel = onCancel;
        },
        hidePrompt: state => state.prompt.show = false,
        showPrompt: (state, {title, subtitle, cancelText, confirmText, onConfirm, onCancel}) => {
            state.prompt.show = true;
            state.prompt.title = title;
            state.prompt.subtitle = subtitle;
            state.prompt.cancelText = cancelText;
            state.prompt.confirmText = confirmText;
            state.prompt.onConfirm = onConfirm;
            state.prompt.onCancel = onCancel;
        },
        addSnackObject: (state, snack) => state.snackbars.push(snack),
        removeSnack: (state, snack) => state.snackbars.splice(state.snackbars.indexOf(snack), 1),
    },
    getters: {
        notFoundImg: (_, getters) => item => {
            let type = '';
            switch (item.type) {
                case 'actor':
                    type = 'person';
                    break;
                default:
                    type = 'person';
                    break;
            }
            return getters.notFoundImgOfType(item, type);
        },
        notFoundImgOfType: () => (item, type) => `img/notfound/${type}/${Math.floor(Math.random() * 18) + 1}.png`,
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
        addSnack: async ({state, commit}, {
            text,
            to,
            linkText = 'visit',
            timeout = 3000,
            id = Math.random().toString(),
        }) => {
            let snack = {text, to, linkText, open: true, timeout, id};
            commit('addSnackObject', snack);
            return new Promise(resolve => {
                setTimeout(() => {
                    commit('removeSnack', snack);
                    resolve();
                }, timeout + 500);
            });
        },
        async showTextPrompt({commit, state}, {
            title = 'Input',
            subtitle = '',
            value = '',
            label = '',
            cancelText = 'Cancel',
            confirmText = 'Confirm',
        }) {
            return new Promise((resolve => {
                commit('showTextPrompt', {
                    title,
                    subtitle,
                    label,
                    value,
                    cancelText,
                    confirmText,
                    onConfirm: () => resolve({confirmed: true, value: state.textPrompt.value}),
                    onCancel: () => resolve({confirmed: false, value: state.textPrompt.value}),
                })
            }));
        },
        async showPrompt({commit}, {
            title = 'Are you sure?',
            subtitle = 'This will discard all unsaved changes',
            cancelText = 'Cancel',
            confirmText = 'Confirm',
        }) {
            return new Promise((resolve => {
                commit('showPrompt', {
                    title,
                    subtitle,
                    cancelText,
                    confirmText,
                    onConfirm: () => resolve(true),
                    onCancel: () => resolve(false),
                })
            }));
        },
    },
    modules: {platform, theme, plex, search, media},
    plugins: [vuexLocal.plugin],
})
