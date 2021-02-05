import electron, {remote, shell} from 'electron'
import path from "path";
import http from "http";
import qs from 'qs';

const express = window.require('express');

export default {
    state: {
        httpServer: null,
        type: 'electron',
        playingIcons: [],
        pausedIcons: [],
        port: 29672,
    },
    mutations: {
        httpServer: (state, httpServer) => state.httpServer = httpServer,
        playIcons(state, {playIcon, pauseIcon, prevIcon, nextIcon}) {
            state.playingIcons = [prevIcon, pauseIcon, nextIcon];
            state.pausedIcons = [prevIcon, playIcon, nextIcon];
        },
    },
    getters: {},
    actions: {
        async initializePlatform({state, commit, dispatch, getters, rootState}) {
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
        setPlatformPlaying: ({state}, playing, enabled = true) => {
            const win = remote.getCurrentWindow();
            return win.setThumbarButtons(enabled ? playing ? state.playingIcons : state.pausedIcons : []);
        },
        async openDevTools({}) {
            remote.getCurrentWindow().openDevTools();
        },
        async closeWindow({}) {
            remote.app.quit();
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