<template>
    <v-row class="frame-content">
        <v-col cols="10" offset="1">
            <v-card class="my-3">
                <v-toolbar color="primary" dark>Edit User</v-toolbar>
                <v-card-text>
                    <v-breadcrumbs :items="breadcrumbs" class="pa-0" />
                    <v-form ref="form">
                        <v-text-field
                            name="fullname"
                            label="Full Name"
                            type="text"
                            :rules="rules.fullname"
                            v-model="form.fullname" />
                        <v-text-field
                            name="email"
                            label="Email"
                            type="email"
                            :rules="rules.email"
                            v-model="form.email"
                            @keydown="checkEmailExist" />
                        <v-text-field
                            name="password"
                            label="Password"
                            type="password"
                            :rules="rules.password"
                            v-model="form.password" />
                        <v-text-field
                            name="retype_password"
                            label="Re-Password"
                            type="password"
                            :rules="rules.retype_password"
                            v-model="form.retype_password" />
                        <v-select
                            v-model="form.role"
                            :items="roles"
                            label="Role"
                        ></v-select>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                        @click="onSubmit" 
                        color="primary"
                        :loading="isDisable">
                        Update
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default({
    middleware: ['authenticated'],
    head: {
        title: 'Edit User'
    },        
    asyncData({ params }) {
        return {
            id: params.id
        }
    },
    data() {
        return {
            breadcrumbs: [
                { text: 'Users', disabled: false, to: '/users', exact: true },
                { text: 'Create', disabled: true  }
            ],
            emailExist: false,
            isDisable: false,
            roles: ['employee', 'cashier', 'admin'],
            form: {
                fullname: '',
                email: '',
                password: '',
                retype_password: '',
                role: '',
            },
            rules: {
                role: [
                    v => !!v || this.$t('FIELD_REQUIRED', { field: 'Role' }),
                ],
                fullname: [
                    v => !!v || this.$t('FIELD_REQUIRED', { field: 'Fullname' }),
                ],
                email: [
                    v => !!v ||  this.$t('FIELD_REQUIRED', { field: 'Email' }),
                    v => /.+@.+/.test(v) || this.$t('EMAIL_INVALID'),
                    v => !this.emailExist || this.$t('EMAIL_EXIST'),
                ],
                password: [
                    // v => v.length == 0 || !!v || this.$t('FIELD_REQUIRED', { field: 'Password' }),
                    v => v.length == 0 || v.length >= 6 || this.$t('FIELD_MIN', { field: 'Password', min: 6 }),
                ],
                retype_password: [
                    v => v === this.form.password || this.$t('FIELD_CONFIRM', { field: 'Password', confirm: 'Re-Password' })
                ]
            }
        }
    },
    methods: {
        checkEmailExist(){
            this.emailExist = false;
        },
        fetchData(){
           this.$axios.$get(`/users/${this.id}`)
           .then(response =>{
                this.form.fullname = response.user.fullname;
                this.form.email = response.user.email;
                this.form.role = response.user.role;
           })
           .catch(error =>{
                //REDIRECT TO users
                this.$router.push({
                    name: 'users___' + this.$i18n.locale,
                    params: { message: 'ID_NOT_FOUND' }
                });
           })
        },
        onSubmit() {
            if(this.$refs.form.validate()){
                this.isDisable = true
                
                this.$axios.$put(`/users/${this.id}`, this.form)
                .then(response => {
                    this.isDisable = false

                    //REDIRECT TO users
                    this.$router.push({
                        name: 'users___' + this.$i18n.locale,
                        params: { message: 'UPDATE_SUCCESS', fullname: this.form.fullname }
                    });
                })
                .catch(error => {
                    // console.log(error);
                    if(error.response.data.message == "EMAIL_EXIST") {
                        this.emailExist = true
                        this.$refs.form.validate()
                    }
                    this.isDisable = false
                })
            }
        }
    },
    mounted(){
        this.fetchData()
    }
})
</script>
