# PleX

For now mpv is not packaged, meaning you need to install the mpv library when using the desktop application:
* Windows: download [mpv-dev](https://sourceforge.net/projects/mpv-player-windows/files/libmpv/mpv-dev-i686-20211031-git-4a80de9.7z/download), unpack, put corresponding `mpv-1.dll` to `C:\Windows\system32`
* macOS: `brew install mpv`
* Linux: `apt-get install libmpv1 libavformat-dev`
### Home
![Home](https://github.com/ruurdbijlsma/PlexClient/blob/master/.gh/home.png?raw=true)

### Player
![Player](https://github.com/ruurdbijlsma/PlexClient/blob/master/.gh/player.png?raw=true)

### Show
![Show](https://github.com/ruurdbijlsma/PlexClient/blob/master/.gh/show.png?raw=true)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
Browser:
```
npm run serve
```
Electron:
```
npm run electron:serve
```

### Compiles and minifies for production
Browser:
```
npm run build
```
Electron:
```
npm run electron:build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
