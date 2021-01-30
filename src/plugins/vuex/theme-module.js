import Vuetify from "../vuetify";

export default {
    state: {},
    mutations: {},
    getters: {
        themeColors() {
            return Vuetify.framework.theme.themes[Vuetify.framework.theme.isDark ? 'dark' : 'light'];
        },
    },
    actions: {},
    modules: {}
}
