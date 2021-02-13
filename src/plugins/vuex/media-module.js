import Utils from "@/js/Utils";

export default {
    state: {
        context: {
            key: '',
            item: null,
            queueLoading: false,
            queue: [],
            shuffledQueue: [],
        },
        currentTime: 0,
        duration: 0,
        volume: 1,
        muted: false,
        shuffle: false,
        repeat: true,

        buffers: [],
        videoRatio: 16 / 9,
        srcLoading: false,
        playing: false,
        controlsHeight: 150,
    },
    mutations: {
        context: (state, {item, key, queueLoading = true}) => {
            // If the queue isn't already loaded for this context, set loading to true
            if (state.context.key !== key) {
                state.context.queueLoading = queueLoading;
                state.context.queue = [item];
                state.context.shuffledQueue = [item];
            }
            state.context.key = key;
            state.context.item = item;
        },
        queue: (state, {key, queue}) => {
            if (state.context.key === key) {
                state.context.queue = queue;
                state.context.shuffledQueue = Utils.shuffleArray([...queue]);
                state.context.queueLoading = false;
            }
        },
        currentTime: (state, currentTime) => state.currentTime = currentTime,
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
        videoWidth: (state, getters) => {
            return Math.round(getters.videoHeight * state.videoRatio * 100) / 100;
        },
        videoHeight: (state) => {
            return state.controlsHeight - 10;
        },
        usePlayer: (state, getters, rootState) => {
            return 'hls';
            if (rootState.platform.type === 'electron') {
                return 'vlc';
            } else {
                return 'hls';
            }
        },
    },
    actions: {
        async playItem({dispatch, commit, state, getters, rootState}, {item, shuffle = false}) {
            // get children / parents of item
            if (['episode', 'season', 'show'].includes(item.type)) {
                let showKey, showTitle, showThumb, episode, updateSeasonKey;
                if (item.type === 'episode') {
                    episode = item;
                    showKey = item.grandparentRatingKey;
                    showTitle = item.grandparentTitle;
                    showThumb = item.grandparentThumb;
                    updateSeasonKey = '';
                } else if (item.type === 'season') {
                    showKey = item.parentRatingKey;
                    showTitle = item.parentTitle;
                    showThumb = item.parentThumb;
                    updateSeasonKey = item.ratingKey;
                } else {
                    showKey = item.ratingKey;
                    showTitle = item.title;
                    showThumb = item.thumb;
                }
                let seasons = await dispatch('updateMetadataChildren', showKey);
                if (item.type === 'show')
                    updateSeasonKey = seasons[shuffle ? Math.floor(seasons.length * Math.random()) : 0].ratingKey
                if (['show', 'season'].includes(item.type)) {
                    let episodes = await dispatch('updateMetadataChildren', updateSeasonKey);
                    episode = episodes[shuffle ? Math.floor(episodes.length * Math.random()) : 0];
                }
                Promise.all(seasons
                    .filter(s => s.ratingKey !== updateSeasonKey)
                    .map(s => dispatch('updateMetadataChildren', s.ratingKey))
                ).then(() => {
                    let allEpisodes = seasons.flatMap(s => rootState.plex.content['metadataChildren' + s.ratingKey]);
                    commit('queue', {key: showKey, queue: allEpisodes});
                });
                commit('context', {key: showKey, item: episode})
            } else if (item.type === 'movie') {
                commit('context', {key: item.ratingKey, item: item, queueLoading: false});
            }
        },
    },
}
