<template>
    <v-app>
        <v-app-bar app>
            App
        </v-app-bar>
        <v-main>
            <router-view/>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    data: () => ({}),
};
</script>
