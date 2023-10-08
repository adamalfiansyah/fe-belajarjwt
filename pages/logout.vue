<template>
     <v-row>
        <v-col cols="10" offset="1" md="4" offset-md="4">
            <v-card class="mb-2">
                <v-card-text>
                    <h2>Logout <v-icon class="ml-3 spin-loading">mdi-loading</v-icon></h2>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>

import { mapMutations } from 'vuex'

export default {
    middleware: ['authenticated'],
    head: {
        title: 'Logout'
    },    
    methods: {
        ...mapMutations('auth', {
            logout: 'logout'
        })
    },
    mounted(){
        this.isDisable=true
        this.$axios.$post('/logout', this.form)
        .then(response => {
            //login success
            this.isDisable=false

            this.logout()
            
            //REDIRECT TO LOGIN PAGE
            this.$router.push('/login')
        })
        .catch(error => {
            this.message = error.response.data.message
            this.isError=true
            this.isDisable=false
        })
    }
}
</script>