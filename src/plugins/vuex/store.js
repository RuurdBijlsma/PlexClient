import Vue from 'vue'
import Vuex from 'vuex'

let isElectron = window && window.process !== undefined && window.process.type !== undefined;
console.log("is electron?", isElectron);
const platform = require(isElectron ? './electron-module' : './web-module').default;

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {platform}
})
