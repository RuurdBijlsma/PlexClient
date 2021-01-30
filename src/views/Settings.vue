<template>
    <div class="login">
        <v-form class="login-form" ref="form" @submit.prevent="submit">
            <h1 class="mb-4">Settings</h1>
            <div class="login-flex">
                <v-text-field v-model="$store.state.plex.host"
                              :rules="rules.host"
                              class="mb-4 mr-2"
                              outlined
                              hide-details="auto"
                              label="Host"/>
                <v-text-field v-model="$store.state.plex.port"
                              :rules="rules.port"
                              class="mb-4 ml-2"
                              outlined
                              type="number"
                              hide-details="auto"
                              label="Port"/>
            </div>
            <v-text-field v-model="$store.state.plex.credentials.username"
                          :rules="rules.name"
                          class="mb-4"
                          outlined
                          hide-details="auto"
                          label="Username"/>
            <v-text-field v-model="$store.state.plex.credentials.password"
                          :rules="rules.pass"
                          class="mb-4"
                          outlined
                          hide-details="auto"
                          label="Password"/>
            <p class="caption" v-if="authFailed">Authentication failed</p>
            <div class="login-flex">
                <v-spacer/>
                <v-btn type="submit" text>Login</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data: () => ({
        rules: {
            host: [v => !!v || 'Required'],
            port: [v => !!v || 'Required'],
            name: [v => !!v || 'Required'],
            pass: [v => !!v || 'Required'],
        },
        authFailed: false,
    }),
    methods: {
        async submit() {
            await this.$store.dispatch('initializeAuth');
        },
    },
}
</script>
<style scoped>
.login {
    padding: 20px;
}

.login-form {
    max-width: 500px;
}

.login-flex {
    display: flex;
}
</style>