import Vue from "vue";

export default {
    state: {
        context: {
            key: '',
            keys: {
                show: '',
                season: '',
                episode: '',
            },
            type: '',
            item: null,
            queue: {
                index: 0,
                length: 0,
                loading: false,
                playQueueSelectedItemID: -1,
                playQueueID: -1,
                Metadata: [],
            },
        },
        volume: 1,
        muted: false,
        shuffle: false,
        repeat: true,

        playbackTime: 0,
        currentTime: 0,
        duration: 0,
        buffers: [],
        videoRatio: 16 / 9,
        srcLoading: false,
        playing: false,
        playOnLoad: false,
        controlsHeight: 150,
    },
    mutations: {
        playbackTime: (state, playbackTime) => state.playbackTime = playbackTime,
        playOnLoad: (state, value) => state.playOnLoad = value,
        clearContext: state => {
            state.currentTime = 0;
            state.duration = 0;
            state.playing = false;
            state.srcLoading = false;
            state.videoRatio = 16 / 9;
            state.buffers = [];
            state.context = {
                key: '',
                keys: {
                    show: '',
                    season: '',
                    episode: '',
                },
                type: '',
                item: null,
                queue: {
                    index: 0,
                    length: 0,
                    loading: false,
                    playQueueSelectedItemID: -1,
                    playQueueID: -1,
                    Metadata: [],
                },
            };
        },
        context: (state, {key, type, keys, queueLoading = true}) => {
            // If the queue isn't already loaded for this context, set loading to true
            if (state.context.key !== key) {
                state.context.queue.loading = queueLoading;
            }
            if (keys) {
                state.context.keys.show = keys.show;
                state.context.keys.season = keys.season;
                state.context.keys.episode = keys.episode;
            }

            if (type !== undefined)
                state.context.type = type;
            if (key !== undefined)
                state.context.key = key;
        },
        item: (state, {item, play = false}) => {
            state.context.item = item;
            state.playOnLoad = play;
        },
        queue: (state, queue) => {
            state.context.queue.loading = false;
            state.context.queue.length = queue.Metadata.length;
            state.context.queue.Metadata = queue.Metadata;
            state.context.queue.playQueueSelectedItemID = queue.playQueueSelectedItemID;
            state.context.queue.playQueueID = queue.playQueueID;
            state.context.queue.index = queue.Metadata
                .findIndex(i => i.playQueueItemID === queue.playQueueSelectedItemID);
        },
        queueIndex: (state, index) => state.context.queue.index = index,
        currentTime: (state, currentTime) => {
            if (state.duration !== Infinity && !isNaN(state.duration) && !isNaN(currentTime) && currentTime !== Infinity) {
                navigator?.mediaSession?.setPositionState?.({
                    duration: state.duration,
                    playbackRate: 1,
                    position: currentTime,
                });
            }
            state.currentTime = currentTime
        },
        duration: (state, duration) => state.duration = duration,
        volume: (state, volume) => state.volume = volume,
        muted: (state, muted) => state.muted = muted,
        buffers: (state, buffers) => state.buffers = buffers,
        videoRatio: (state, videoRatio) => state.videoRatio = videoRatio,
        srcLoading: (state, srcLoading) => state.srcLoading = srcLoading,
        playing: (state, playing) => state.playing = playing,
        shuffle: (state, shuffle) => state.shuffle = shuffle,
        repeat: (state, repeat) => state.repeat = repeat,
    },
    getters: {
        canSeekLeft: state => state.currentTime > 10,
        canSeekRight: state => state.currentTime + 10 < state.duration,
        canSkipBackwards: state => state.context.queue.index > 0,
        canSkipForwards: state => state.context.queue.index < state.context.queue.length - 1,
        itemTimelineConfig: state => item => ({
            ratingKey: item.ratingKey,
            key: item.key,
            playQueueItemID: item.playQueueItemID,
            playbackTime: Math.round(state.playbackTime * 1000),
            duration: Math.round(state.duration * 1000),
            state: state.playing ? 'playing' : 'paused',
            time: Math.floor(state.currentTime / 10) * 10000,
        }),
        itemIsActive: state => item => {
            if (item.type === 'playlist')
                return item.ratingKey === state.context.key;
            if (state.context.type === 'playlist')
                return item.ratingKey === state.context.item.ratingKey;
            if (state.context.type === 'movie' || item.type === 'show')
                return item.ratingKey === state.context.key;
            if (item.type === 'season')
                return item.ratingKey === state.context.keys.season;
            if (item.type === 'episode')
                return item.ratingKey === state.context.keys.episode;
        },
        itemCanPlay: () => item => {
            return ['show', 'season', 'movie', 'episode', 'playlist'].includes(item.type);
        },
        videoWidth: (state, getters) => {
            return Math.round(getters.videoHeight * state.videoRatio * 100) / 100;
        },
        videoHeight: (state) => {
            return state.controlsHeight - 10;
        },
        usePlayer: (state, getters, rootState) => {
            if (rootState.platform.type === 'electron') {
                return 'mpv';
            } else {
                return 'hls';
            }
        },
    },
    actions: {
        async toggleShuffle({state, dispatch, commit}) {
            commit('shuffle', !state.shuffle);
            let nextQueue = await dispatch('shuffleQueue', {
                queueKey: state.context.queue.playQueueID,
                shuffle: state.shuffle,
            });
            console.log('toggleShuffle queue', nextQueue);
            commit('queue', nextQueue);
        },
        async stopPlaying({commit, dispatch, state}) {
            let item = state.context.item;
            commit('clearContext');
            await dispatch('markStop', item);
        },
        async skip({state, commit, dispatch, getters}, forward = true) {
            let currentIndex = state.context.queue.index;
            console.log("currentIndex", currentIndex);
            let newIndex = currentIndex + (forward ? 1 : -1);
            newIndex = (newIndex + state.context.queue.length * 2) % state.context.queue.length;
            let nextInQueue = state.context.queue.Metadata[newIndex];
            console.log("next in queue", nextInQueue);
            if (!nextInQueue) return;
            dispatch('commitItem', {item: nextInQueue, play: true});
            commit('queueIndex', newIndex);
            await dispatch('setTimeline', {
                ...getters.itemTimelineConfig(nextInQueue),
                state: 'playing',
                time: 0,
                playbackTime: 0,
                duration: nextInQueue.duration
            });
            let nextQueue = await dispatch('getQueue', state.context.queue.playQueueID);
            console.log('nextQueue', nextQueue);
            commit('queue', nextQueue);
        },
        async updateTimeline({dispatch, getters, state}) {
            return dispatch('setTimeline', getters.itemTimelineConfig(state.context.item));
        },
        async markStop({dispatch, getters, state}, item) {
            let stoppedItem = item ?? state.context.item;
            return dispatch('setTimeline', {...getters.itemTimelineConfig(stoppedItem), state: 'stopped'});
        },
        async playItem({dispatch, commit, state, getters, rootState}, {item, shuffle = false, containingPlaylist}) {
            console.log("Containing playlist", containingPlaylist);
            if (containingPlaylist) {
                commit('context', {
                    type: 'playlist',
                    key: containingPlaylist.ratingKey,
                });
            } else if (item.type === 'playlist') {
                commit('context', {
                    type: 'playlist',
                    key: item.ratingKey,
                });
            } else if (['episode', 'season', 'show'].includes(item.type)) {
                let showKey, episode, seasonKey;
                if (item.type === 'episode') {
                    episode = item;
                    showKey = item.grandparentRatingKey;
                    seasonKey = item.parentRatingKey;
                } else if (item.type === 'season') {
                    showKey = item.parentRatingKey;
                    seasonKey = item.ratingKey;
                } else {
                    showKey = item.ratingKey;
                }
                commit('context', {
                    type: 'show',
                    key: showKey,
                    keys: {
                        show: showKey,
                        season: seasonKey,
                        episode: episode?.key
                    },
                });
            } else if (item.type === 'movie') {
                commit('context', {type: 'movie', key: item.ratingKey, item: null});
            }
            let queue = await dispatch('createQueue', containingPlaylist?.key ?? item.key);
            commit('queue', queue);
            let playItem = queue.Metadata.find(i =>
                containingPlaylist ?
                    i.ratingKey === item.ratingKey :
                    i.playQueueItemID === queue.playQueueSelectedItemID
            );
            commit('context', {
                queueLoading: false,
                keys: playItem.type === 'episode' ? {
                    show: playItem.grandparentRatingKey,
                    season: playItem.parentRatingKey,
                    episode: playItem.ratingKey
                } : {},
            });
            dispatch('commitItem', {item: playItem});
            console.log(queue);
        },
        async commitItem({commit, dispatch}, {item, play = true}) {
            commit('item', {
                item,
                play,
            });
            await dispatch('setMetadata', item);
        },
        async updateMediaData({dispatch, state}) {
            dispatch('setMetadata', state.context.item);
        },
        async setMetadata({dispatch, getters, state, commit}, item) {
            console.log('setting metadata');
            let subtitle = item.type === 'movie' ? item.year : item.grandparentTitle;
            document.title = 'PleX • ' + subtitle + ' - ' + item.title;

            if (!('mediaSession' in navigator))
                return;

            let artwork = [{
                src: getters.notFoundImg(item),
                type: 'image/png',
                sizes: '512x512',
            }];
            let art = item.type === 'movie' ? (item.thumb ?? item.art) : (item.thumb ?? item.art);
            let sizes = [128, 512, 1024];
            artwork = sizes.map(s => ({
                src: getters.transcodeImage({
                    url: art,
                    width: s,
                    height: s,
                }),
                sizes: `${s}x${s}`,
                type: 'image/png',
            }))

            navigator.mediaSession.metadata = new MediaMetadata({
                title: item.title,
                artist: subtitle,
                album: item.type === 'movie' ? '' : item.parentTitle,
                artwork
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                dispatch('skip', false);
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                dispatch('skip', true);
            });

            let defaultSkipTime = 10;
            navigator.mediaSession.setActionHandler('seekbackward', (event) => {
                const skipTime = event.seekOffset || defaultSkipTime;
                commit('currentTime', Math.max(state.currentTime - skipTime, 0));
            });

            navigator.mediaSession.setActionHandler('seekforward', (event) => {
                const skipTime = event.seekOffset || defaultSkipTime;
                commit('currentTime', Math.min(state.currentTime + skipTime, state.duration));
            });

            navigator.mediaSession.setActionHandler('play', () => {
                commit('playing', true);
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                commit('playing', false);
            });

            try {
                navigator.mediaSession.setActionHandler('stop', () => {
                    dispatch('stopPlaying');
                });
            } catch (error) {
                console.warn('Warning! The "stop" media session action is not supported.');
            }

            try {
                navigator.mediaSession.setActionHandler('seekto', (event) => {
                    commit('currentTime', event.seekTime);
                });
            } catch (error) {
                console.warn('Warning! The "seekto" media session action is not supported.');
            }
        },
    },
}
