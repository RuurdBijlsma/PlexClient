import electron, {remote} from 'electron'
import Directories from "../../js/Directories";
import path from "path";

export default {
    state: {
        type: 'electron',
        playingIcons: [],
        pausedIcons: [],
    },
    mutations: {
        playIcons: (state, {playIcon, pauseIcon, prevIcon, nextIcon}) => {
            state.playingIcons = [prevIcon, pauseIcon, nextIcon];
            state.pausedIcons = [prevIcon, playIcon, nextIcon];
        },
    },
    getters: {},
    actions: {
        initializePlatform: async ({state, commit, dispatch, getters, rootState}) => {
            let playIcon = {
                tooltip: 'Play',
                icon: path.join(__static, '/img/playicon.png'),
                click: () => dispatch('play'),
            };
            let pauseIcon = {
                tooltip: 'Play',
                icon: path.join(__static, '/img/pauseicon.png'),
                click: () => dispatch('pause'),
            };
            let prevIcon = {
                tooltip: 'Previous Song',
                icon: path.join(__static, '/img/previcon.png'),
                click: () => dispatch('skip', -1),
            };
            let nextIcon = {
                tooltip: 'Next Song',
                icon: path.join(__static, '/img/nexticon.png'),
                click: () => dispatch('skip', 1),
            };
            commit('playIcons', {playIcon, pauseIcon, prevIcon, nextIcon});
        },
        setPlatformPlaying: ({state}, playing, enabled=true) => {
            const win = remote.getCurrentWindow();
            return win.setThumbarButtons(enabled ? playing ? state.playingIcons : state.pausedIcons : []);
        },
        openDevTools: async ({}) => {
            remote.getCurrentWindow().openDevTools();
        },
        closeWindow: async ({}) => {
            remote.getCurrentWindow().close();
        },
        minimizeWindow: async ({}) => {
            remote.getCurrentWindow().minimize();
        },
    },
}