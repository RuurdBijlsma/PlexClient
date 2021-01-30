import electron, {remote, shell} from 'electron'
import Directories from "../../js/Directories";
import path from "path";
import {PlexOauth} from "plex-oauth";
import http from "http";
import qs from 'qs';

const express = window.require('express');

export default {
    state: {
        server: null,
        type: 'electron',
        playingIcons: [],
        pausedIcons: [],
    },
    mutations: {
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
        async firstLogin({state, commit}) {
            const port = 29672;
            let info = {
                clientId: "RuurdPlexClient",            // This is a unique identifier used to identify your app with Plex.
                name: "Ruurd's Plex Client",                 // Name of your application
                device: "Plex Web",                             // The type of device your application is running on
                version: "0.1.0",                               // Version of your application
                forwardUrl: `http://localhost:${port}`,         // Url to forward back to after signing in.
                platform: "Web",                                // Optional - Platform your application runs on - Defaults to 'Web'
            }
            let auth = await fetch(
                `https://plex.tv/api/v2/pins?strong=true&X-Plex-Product=${info.name}&X-Plex-Client-Identifier=${info.clientId}`, {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                    },
                }).then(d => d.json());

            const authUrl = 'https://app.plex.tv/auth#?' +
                qs.stringify({
                    clientID: info.clientId,
                    code: auth.code,
                    forwardUrl: info.forwardUrl,
                    context: {
                        device: {
                            product: info.name,
                        },
                    },
                });

            console.log(authUrl)

            await shell.openExternal(authUrl)

            if (state.server !== null)
                state.server.close();

            const app = express();
            const server = http.createServer(app);

            return new Promise(resolve => {
                app.get('/', async (req, res) => {
                    resolve(auth);
                    server?.close();
                    remote.getCurrentWindow().focus();
                    res.send(`
                        <html lang="en">
                            <head><title>Logged in to Plex :)</title></head>
                            <body>
                                <h1>You can close this window</h1>
                                <script>
                                    window.close();
                                </script>
                            </body>
                        </html>
                    `);
                });

                commit('server', server);
                server.listen(port, () => {
                    console.log('listening on *:' + port);
                });
            })
        },
    },
}