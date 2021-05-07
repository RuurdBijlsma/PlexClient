import electron, {remote, shell, nativeImage} from 'electron'
import path from "path";

const nodeFetch = window.require('node-fetch');
const express = window.require('express');
import http from 'http';

export default {
    state: {
        httpServer: null,
        type: 'electron',
        port: 29672,
        images: {
            play: {enabled: null, disabled: null},
            pause: {enabled: null, disabled: null},
            prev: {enabled: null, disabled: null},
            next: {enabled: null, disabled: null},
        },
    },
    mutations: {
        images: (state, images) => state.images = images,
        httpServer: (state, httpServer) => state.httpServer = httpServer,
    },
    getters: {
        betterFetch: () => () => nodeFetch,
    },
    actions: {
        async initializePlatform({commit, dispatch, state}) {
            const getIcon = icon => nativeImage.createFromPath(path.join(__static, `img/${icon}.png`));
            commit('images', {
                play: {enabled: getIcon('playicon'), disabled: getIcon('playicon-disabled')},
                pause: {enabled: getIcon('pauseicon'), disabled: getIcon('pauseicon-disabled')},
                prev: {enabled: getIcon('previcon'), disabled: getIcon('previcon-disabled')},
                next: {enabled: getIcon('nexticon'), disabled: getIcon('nexticon-disabled')},
            });
            await dispatch('updateThumbar');
        },
        updateThumbar: ({state, getters, rootState, dispatch, commit}) => {
            const win = remote.getCurrentWindow();
            const enabled = rootState.media.context.item !== null;
            let icons = [];
            if (enabled) {
                const enabledFlags = [];
                const disabledFlags = ['disabled'];
                let prevIcon = {
                    tooltip: getters.canSkipBackwards ? 'Previous' : undefined,
                    flags: getters.canSkipBackwards ? enabledFlags : disabledFlags,
                    icon: state.images.prev[getters.canSkipBackwards ? 'enabled' : 'disabled'],
                    click: () => dispatch('skip', false),
                };
                let middleIcon = {
                    tooltip: rootState.media.srcLoading ? undefined : rootState.media.playing ? 'Pause' : 'Play',
                    flags: rootState.media.srcLoading ? disabledFlags : enabledFlags,
                    icon: state.images[rootState.media.playing ? 'pause' : 'play']
                        [rootState.media.srcLoading ? 'disabled' : 'enabled'],
                    click: () => commit('playing', !rootState.media.playing),
                };
                let nextIcon = {
                    tooltip: getters.canSkipForwards ? 'Next' : undefined,
                    flags: getters.canSkipForwards ? enabledFlags : disabledFlags,
                    icon: state.images.next[getters.canSkipForwards ? 'enabled' : 'disabled'],
                    click: () => dispatch('skip', true),
                };
                icons.push(prevIcon, middleIcon, nextIcon);
            }
            if (icons.includes(null))
                return;
            let success = win.setThumbarButtons(icons);
            return success;
        },
        async openDevTools({}) {
            remote.getCurrentWindow().openDevTools();
        },
        async closeWindow({}) {
            remote.getCurrentWindow().close();
        },
        async minimizeWindow({}) {
            remote.getCurrentWindow().minimize();
        },
        resetPlexLogin({state, commit}) {
            if (state.server) {
                state.server.close();
                commit('server', null);
            }
        },
        getRedirectUrl({state}) {
            return `http://localhost:${state.port}`;
        },
        async goToUrl({state, commit}, url) {
            await shell.openExternal(url)

            if (state.httpServer !== null)
                state.httpServer.close();

            const app = express();
            const httpServer = http.createServer(app);

            return new Promise(resolve => {
                app.get('/', async (req, res) => {
                    resolve();
                    httpServer?.close();
                    remote.getCurrentWindow().focus();
                    res.send(`
                        <html lang="en">
                            <head><title>Logged in to Plex :)</title></head>
                            <body>
                                <script>
                                    window.close();
                                </script>
                            </body>
                        </html>
                    `);
                });

                commit('httpServer', httpServer);
                httpServer.listen(state.port, () => {
                    console.log('listening on *:' + state.port);
                });
            })
        },
    },
}
