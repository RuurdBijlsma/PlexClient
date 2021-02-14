import PlexAPI from 'plex-api';
import qs from "qs";
import publicIp from "public-ip";
import Vue from 'vue';

export default {
    state: {
        deletedKeys: {},
        watchedKeys: {},
        content: {
            library: null,
            sections: null,
            onDeck: null,
            recentlyAdded: null,
        },
        publicIp: '',
        server: null,
        services: [],
        user: {
            email: '',
            profile: null,
            services: null,
            image: '',
            title: '',
            username: '',
            uuid: '',
        },
        auth: null,
    },
    mutations: {
        addDeletedKey: (state, key) => Vue.set(state.deletedKeys, key, true),
        clearDeletedKeys: state => state.deletedKeys = {},
        setWatchedKey: (state, {key, value}) => Vue.set(state.watchedKeys, key, value),
        clearWatchedKeys: state => state.watchedKeys = {},
        resetContent: state => state.content = {
            library: null,
            sections: null,
            onDeck: null,
            recentlyAdded: null,
        },
        content: (state, {key, content}) => Vue.set(state.content, key, content),
        publicIp: (state, publicIp) => state.publicIp = publicIp,
        services: (state, services) => state.services = services,
        server: (state, server) => state.server = server,
        user: (state, user) => state.user = user,
        auth: (state, auth) => state.auth = auth,
    },
    getters: {
        getServerPort: () => server => server?.connections?.slice()
            ?.sort((a, b) => a?.relay - b?.relay)
            ?.sort((a, b) => b?.local - a?.local)?.[0]?.port,
        port: (state, getters) => getters.getServerPort(state.server),
        token: state => state.server?.accessToken,
        canQuery: (state, getters) => getters.port &&
            state.server.publicAddress &&
            state.server?.accessToken !== null &&
            state.server?.accessToken !== undefined,
        tvServers: state => state.services.filter(s => s.provides.includes('server')),
        tvAuth: state => state.auth,
        tvLoggedIn: (state, getters) => getters.tvAuth !== null &&
            getters.tvAuth.authToken !== null &&
            new Date(getters.tvAuth.expiresAt) > new Date(),
        plexApi: (state, getters) => {
            let api = new PlexAPI({
                hostname: state.server?.publicAddress,
                port: getters.port,
                token: getters.token,
            });
            console.log(api);
            return api;
        },
        plexUrl: (state, getters) => url => {
            let base = getters.plexApi._generateRelativeUrl(url);
            base += base.includes('?') ? '&' : '?';
            return base + qs.stringify(({'X-Plex-Token': state.server?.accessToken}))
        },
        transcodeImage: (state, getters) => ({url, width, height, upscale = true}) =>
            getters.plexUrl('/photo/:/transcode/?' + qs.stringify({width, height, url, upscale: +upscale})),
        originalDash: (state, getters) => item =>
            getters.plexUrl(`/video/:/transcode/universal/start.mpd`) + '&' + qs.stringify({
                protocol: 'dash',
                mediaIndex: 0,
                offset: 0,
                path: item.key,
                directPlay: 1,
                directStream: 1,
                fastSeek: 1,
                "X-Plex-Platform": "Chrome",
            }),
        originalHls: (state, getters) => item =>
            getters.plexUrl(`/video/:/transcode/universal/start.m3u8`) + '&' + qs.stringify({
                protocol: 'hls',
                mediaIndex: 0,
                offset: 0,
                path: item.key,
                directPlay: 1,
                directStream: 1,
                fastSeek: 1,
                "X-Plex-Platform": "Chrome",
            }),
        originalMkv: (state, getters) => (item) =>
            getters.plexUrl(item?.Media?.[0]?.Part?.[0]?.key),
        itemWatched: () => item => {
            if (item.type === 'show' || item.type === 'season') {
                return item.leafCount === item.viewedLeafCount
            } else {
                if (item.type === 'episode' || item.type === 'movie') {
                    return item.viewCount > 0
                } else {
                    return false
                }
            }
        }
    },
    actions: {
        async deleteItem({commit, dispatch}, item) {
            commit('addDeletedKey', item.ratingKey);
            if (item.type === 'playlist') {
                await dispatch('deletePlaylist', item.ratingKey);
            } else {
                await dispatch('deleteMetadata', item.ratingKey);
            }
        },
        async toggleWatched({dispatch, getters, state}, item) {
            let override = state.watchedKeys[item.ratingKey];
            if (override !== undefined ? override : getters.itemWatched(item))
                await dispatch('markUnwatched', item.ratingKey);
            else
                await dispatch('markWatched', item.ratingKey);
        },
        async updatePublicIp({commit}) {
            let ip = await publicIp.v4();
            commit('publicIp', ip);
        },
        // ----------------------------------------------------------------------- //
        // ------------------------- Local plex API ------------------------------ //
        // ----------------------------------------------------------------------- //
        async getQueue({dispatch, commit, getters}, queueKey) {
            let query = qs.stringify({
                repeat: 0,
                own: 1,
                includeChapters: 1,
                includeMarkers: 1,
                includeGeolocation: 1,
                includeExternalMedia: 1,
            });
            return (await getters.plexApi.query(`/playQueues/${queueKey}?${query}`)).MediaContainer;
        },
        async createQueue({dispatch, getters, commit, state}, fullKey) {
            let query = qs.stringify({
                type: 'video',
                continuous: '1',
                uri: `server://${state.server.clientIdentifier}/com.plexapp.plugins.library${fullKey}`,
                repeat: '0',
                own: '1',
                includeChapters: '1',
                includeMarkers: '1',
                includeGeolocation: '1',
                includeExternalMedia: '1',
            });
            return (await getters.plexApi.postQuery(`/playQueues?${query}`)).MediaContainer;
        },
        async setTimeline({dispatch, getters}, {ratingKey, key, playbackTime, duration, state, time,playQueueItemID}) {
            let query = qs.stringify({
                ratingKey,
                key,
                playbackTime,
                state,
                hasMDE: `1`,
                time,
                duration,
                playQueueItemID,
            });
            return await getters.plexApi.query(`/:/timeline?${query}`);
        },
        async movePlaylistItem({dispatch, getters}, {playlistKey, playlistItemID, afterItemId}) {
            let query = qs.stringify({
                after: afterItemId,
            });
            return await getters.plexApi.putQuery(`/playlists/${playlistKey}/items/${playlistItemID}/move?${query}`);
        },
        async removeFromPlaylist({dispatch, getters}, {playlistKey, playlistItemID}) {
            return await getters.plexApi.deleteQuery(`/playlists/${playlistKey}/items/${playlistItemID}`);
        },
        async addToPlaylist({state, getters}, {key, playlistKey}) {
            let query = qs.stringify({
                type: `video`,
                uri: `server://${state.server.clientIdentifier}/com.plexapp.plugins.library/library/metadata/${key}`,
                smart: 0,
            });
            return await getters.plexApi.putQuery(`/playlists/${playlistKey}/items?` + query);
        },
        async createPlaylist({state, getters, commit}, {title, key}) {
            let query = qs.stringify({
                type: `video`,
                title,
                uri: `server://${state.server.clientIdentifier}/com.plexapp.plugins.library/library/metadata/${key}`,
                smart: 0,
            });
            let {MediaContainer} = await getters.plexApi.postQuery(`/playlists?` + query);
            console.log("create playlist returned", MediaContainer);
            commit('content', {key: 'playlist' + key, content: MediaContainer.Metadata[0]});
            return MediaContainer.Metadata[0];
        },
        async deleteMetadata({getters, dispatch}, key) {
            return await getters.plexApi.deleteQuery(`/library/metadata/${key}`);
        },
        async deletePlaylist({getters}, key) {
            return await getters.plexApi.deleteQuery(`/playlists/${key}`);
        },
        async markUnwatched({getters, commit}, key) {
            commit('setWatchedKey', {key, value: false});
            return await getters.plexApi.query(`/:/unscrobble?key=${key}&identifier=com.plexapp.plugins.library`);
        },
        async markWatched({getters, commit}, key) {
            commit('setWatchedKey', {key, value: true});
            return await getters.plexApi.query(`/:/scrobble?key=${key}&identifier=com.plexapp.plugins.library`);
        },
        async updatePlaylist({dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/playlists/${key}`});
            commit('content', {key: 'playlist' + key, content: content.Metadata[0]});
            return content.Metadata[0];
        },
        async updatePlaylistItems({dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/playlists/${key}/items`});
            commit('content', {key: 'playlistItems' + key, content: content.Metadata});
            return content.Metadata;
        },
        async updatePlaylists({dispatch, commit}) {
            let content = await dispatch('query', {url: `/playlists`});
            commit('content', {key: 'playlists', content: content.Metadata});
            return content.Metadata;
        },
        async searchPlex({dispatch, commit}, {query, sectionId}) {
            const urlQuery = qs.stringify({
                includeCollections: 1,
                contextual: 1,
                sectionId,
                query,
            });
            return (await dispatch('query', {url: `/hubs/search?${urlQuery}`})).Hub;
        },
        async updateHub({dispatch, commit}, key) {
            let query = qs.stringify({
                count: 17,
                includeEmpty: 1,
                includeFeaturedTags: 1,
                includeTypeFirst: 1,
                includeStations: 1,
                includeExternalMetadata: 1,
                includeRecentChannels: 1,
                excludePlaylists: 1,
            });
            let content = await dispatch('query', {url: `/hubs/sections/${key}?${query}`});
            commit('content', {key: 'hub' + key, content: content.Hub});
            return content.Hub;
        },
        async updateContinueWatching({dispatch, commit}) {
            let content = await dispatch('query', {url: `/hubs?identifier=home.continue&excludeFields=summary`});
            commit('content', {key: 'continueWatching', content: content.Hub[0]});
            return content.Hub[0];
        },
        async updateSectionFilter({state, dispatch, commit}, {key, filter}) {
            let content = await dispatch('query', {url: `/library/sections/${key}/${filter}`});
            commit('content', {key: 'sectionFilter' + key + '|' + filter, content: content.Directory});
            return content.Directory;
        },
        async updateSectionSorts({state, dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/library/sections/${key}/sorts`});
            commit('content', {key: 'sectionSorts' + key, content: content.Directory});
            return content.Directory;
        },
        async updateSectionFilters({state, dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/library/sections/${key}/filters`});
            commit('content', {key: 'sectionFilters' + key, content: content.Directory});
            return content.Directory;
        },
        async updateMetadata({state, dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/library/metadata/${key}`});
            commit('content', {key: 'metadata' + key, content: content.Metadata[0]});
            return content.Metadata[0];
        },
        async updateMetadataRelated({state, dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/library/metadata/${key}/related`});
            commit('content', {key: 'metadataRelated' + key, content: content.Hub});
            return content.Hub;
        },
        async updateMetadataChildren({state, dispatch, commit}, key) {
            let content = await dispatch('query', {url: `/library/metadata/${key}/children`});
            commit('content', {key: 'metadataChildren' + key, content: content.Metadata});
            return content.Metadata;
        },
        async updateLibraryDirectory({state, dispatch, commit}, {sectionKey, directory, sort, filter}) {
            let content = await dispatch('query', {
                url: `/library/sections/${sectionKey}/${directory}?` + qs.stringify({
                    sort,
                    [filter[0]]: filter[1],
                }),
            });
            commit('content', {
                key: 'sectionLibrary' + sectionKey + '|' + directory + '|' + sort + JSON.stringify(filter),
                content: content.Metadata,
            });
            return content.Metadata;
        },
        async updateSectionLibrary({state, dispatch, commit}, sectionKey) {
            let content = await dispatch('query', {url: `/library/sections/${sectionKey}`});
            commit('content', {key: 'libraryChildren' + sectionKey, content: content.Directory});
            return content.Directory;
        },
        async updateRecentlyAdded({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library/recentlyAdded'});
            commit('content', {key: 'recentlyAdded', content: content.Metadata});
            return content.Metadata;
        },
        async updateOnDeck({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library/onDeck'});
            commit('content', {key: 'onDeck', content: content.Metadata});
            return content.Metadata;
        },
        async updateSections({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library/sections', timeout: 1000 * 60 * 60 * 2});
            commit('content', {key: 'sections', content: content.Directory});
            return content.Directory;
        },
        async updateLibrary({dispatch, commit}) {
            let content = await dispatch('query', {url: '/library'});
            commit('content', {key: 'library', content: content.Directory});
            return content.Directory;
        },
        async find({getters, dispatch}, {url, criteria}) {
            if (!getters.canQuery)
                return console.warn("Can't find query :(, todo, do something here (redirect to settings? tell user)");
            try {
                let key = 'find' + JSON.stringify({url, criteria});
                let fun = getters.plexApi.find(url, criteria);
                return await dispatch('getCached', {fun, key});
            } catch (e) {
                console.warn("Error in find to:", url, e);
                return false;
            }
        },
        async query({state, getters, commit, dispatch}, {url, method = 'GET', lifetime = 3000}) {
            if (!getters.canQuery)
                return console.warn(`Can't query :(, server probably null`);
            // console.log('query: ', url);
            try {
                method = method.toUpperCase();
                let key = 'query' + method + JSON.stringify(url);
                let fun = async () => {
                    let result = await getters.plexApi[{
                        PERFORM: 'perform',
                        GET: 'query',
                        POST: 'postQuery',
                        PUT: 'putQuery',
                        DELETE: 'deleteQuery'
                    }[method]](url);
                    return result.MediaContainer;
                };
                return await dispatch('getCached', {fun, key, lifetime});
            } catch (e) {
                console.warn(`Error in ${method} query to:`, url, {e});
                throw new Error(e);
            }
        },
        async offlinePlexImg({}, url) {
            const cacheStorage = await caches.open('plex-img');
            let res = await cacheStorage.match(url);
            if (!res)
                return null;
            return URL.createObjectURL(await res.blob())
        },
        async onlinePlexImg({state, dispatch, commit, getters}, url) {
            const cacheStorage = await caches.open('plex-img');
            let fresh = await fetch(url);
            await cacheStorage.put(url, fresh);
            let res = await cacheStorage.match(url);
            return URL.createObjectURL(await res.blob());
        },
        // -------------------------------------------------------------------- //
        // ------------------------- plex.tv API ------------------------------ //
        // -------------------------------------------------------------------- //
        markPrimaryServer({commit, getters}, server) {
            commit('server', server);
            // Todo maybe check if auth token of server works and give feedback of this async checking
        },
        async updateServices({state, commit, dispatch, getters}) {
            // this is how we get servers and players connected to this account
            let services = await dispatch('tvQuery', {endpoint: 'resources'});
            commit('services', services);
            if (state.server === null && getters.tvServers.length > 0) {
                commit('server', getters.tvServers[0]);
            }
            return services;
        },
        async updateUserInfo({commit, dispatch}) {
            let userInfo = await dispatch('tvQuery', {endpoint: 'user'});
            const user = {
                email: userInfo.email,
                profile: userInfo.profile,
                services: userInfo.services,
                image: userInfo.thumb,
                title: userInfo.title,
                username: userInfo.username,
                uuid: userInfo.uuid,
            };
            commit('user', user);
            return user;
        },
        async tvQuery({getters}, {endpoint = 'user', method = 'GET', extraHeaders = {}, extraQuery = {}}) {
            if (!getters.tvLoggedIn)
                return console.warn("Not logged in; can't query", {endpoint, method, extraHeaders, extraQuery});
            return await fetch(`https://plex.tv/api/v2/${endpoint}?` + qs.stringify({
                'X-Plex-Product': getters.tvAuth.product,
                'X-Plex-Client-Identifier': getters.tvAuth.clientIdentifier,
                'X-Plex-Token': getters.tvAuth.authToken,
                ...extraQuery,
            }), {
                headers: {
                    accept: 'application/json',
                    ...extraHeaders,
                }
            }).then(d => d.json());
        },
        async logout({commit}) {
            commit('user', {
                email: '',
                profile: null,
                services: null,
                image: '',
                title: '',
                username: '',
                uuid: '',
            });
            commit('server', null);
            commit('auth', null)
            commit('services', []);
            commit('resetContent');
            commit('recentSearches', []);
        },
        async login({dispatch}) {
            let info = {
                clientId: "RuurdPlexClient",
                name: "Ruurd's Plex Client",
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
                    forwardUrl: await dispatch('getRedirectUrl'),
                    context: {
                        device: {
                            product: info.name,
                        },
                    },
                });
            console.log(authUrl);
            await dispatch('goToUrl', authUrl);
            return auth;
        },
        async ensureAuth({commit, dispatch, getters}) {
            console.log("ENSURING AUTH");
            if (getters.tvLoggedIn)
                return;

            let auth = await dispatch('login')
            console.log("AUTH", auth);
            if (auth.errors)
                return console.warn("AUTH ERROR", auth);
            else
                commit('auth', auth);

            auth = await fetch(`https://plex.tv/api/v2/pins/${auth.id}?` + qs.stringify({
                code: auth.code,
                'X-Plex-Client-Identifier': auth.clientIdentifier,
            }), {
                headers: {
                    accept: 'application/json',
                },
            }).then(d => d.json());
            if (auth.errors) {
                console.warn("AUTH ERROR", auth);
            } else {
                commit('auth', auth);
            }
        },
    },
    modules: {}
}
