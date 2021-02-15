module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    pluginOptions: {
        electronBuilder: {
            externals: ['wcjs-prebuilt'],
            nodeIntegration: true,
            builderOptions: {
                publish: ['github'],
                artifactName: "${productName} Setup.${ext}",
                appId: "dev.ruurd.plex",
                productName: "PleX",
            },
        }
    },
    publicPath: '/plex',
    pwa: {
        name: 'PleX',
        themeColor: '#e4703f',
        msTileColor: "#1b1845",
        manifestOptions: {
            "short_name": "PleX",
            "name": "PleX",
            "lang": "en",
            "description": "Browse your Plex library and watch your movies or tv shows.",
            "start_url": "/",
            "background_color": "#1b1845",
            "theme_color": "#e4703f",
            "dir": "ltr",
            "display": "standalone",
            "orientation": "any",
            "icons": [
                {
                    "src": "img/icons/android-icon-192x192-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "192x192"
                },
                {
                    "src": "img/icons/apple-icon-180x180-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "180x180"
                },
                {
                    "src": "img/icons/apple-icon-152x152-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "152x152"
                },
                {
                    "src": "img/icons/apple-icon-144x144-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "144x144"
                },
                {
                    "src": "img/icons/apple-icon-120x120-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "120x120"
                },
                {
                    "src": "img/icons/apple-icon-114x114-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "114x114"
                },
                {
                    "src": "img/icons/favicon-96x96-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "96x96"
                },
                {
                    "src": "img/icons/apple-icon-76x76-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "76x76"
                },
                {
                    "src": "img/icons/apple-icon-72x72-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "72x72"
                },
                {
                    "src": "img/icons/apple-icon-60x60-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "60x60"
                },
                {
                    "src": "img/icons/apple-icon-57x57-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "57x57"
                },
                {
                    "src": "img/icons/favicon-32x32-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "32x32"
                },
                {
                    "src": "img/icons/favicon-16x16-dunplab-manifest-27929.png",
                    "type": "image/png",
                    "sizes": "16x16"
                }
            ],
            "prefer_related_applications": false,
        },
    },
}
