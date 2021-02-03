import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings')
    },
    {
        path: '/show/:key',
        name: 'Show',
        component: () => import('../views/Show')
    },
    {
        path: '/season/:key',
        name: 'Season',
        component: () => import('../views/Season')
    },
    {
        path: '/library/:key/:directory?',
        name: 'Library',
        component: () => import('../views/Library')
    },
]

const router = new VueRouter({
    routes
})

export default router
