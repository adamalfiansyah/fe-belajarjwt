export default function ({ $axios, store, redirect }) {
  $axios.onRequest((config) => {
    if (store.getters['auth/authenticated']) {
      config.headers[
        'Authorization'
      ] = `Bearer ${store.state.auth.access_token}`
    }
  })

  $axios.onResponseError((error) => {
    console.log(error.response)
    if (
      error.response.status === 401 &&
      error.response.data.message == 'TOKEN_FROM_OTHER_DEVICES'
    ) {
      store.commit('auth/logout')
      return redirect('/login')
    } else if (
      error.response.status === 401 &&
      (error.response.data.message == 'TOKEN_EXPIRED' ||
        error.response.data.message == 'TOKEN_IS_NOT_VALID')
    ) {
      return $axios
        .$post('refresh-token', {
          refreshToken: store.state.auth.refresh_token,
        })
        .then((response) => {
          store.commit('auth/setAccessToken', response.accessToken)
          store.commit('auth/setRefreshToken', response.refreshToken)
          const originalRequest = error.config
          originalRequest.headers[
            'Authorization'
          ] = `Bearer ${response.accessToken}`
          return $axios(originalRequest)
        })
        .catch((error) => {
          if (
            error.response.data.message === 'REFRESH_TOKEN_EXPIRED' ||
            error.response.data.message === 'REFRESH_TOKEN_INVALID' ||
            error.response.data.message === 'TOKEN_IS_NOT_VALID' ||
            error.response.data.message === 'TOKEN_FROM_OTHER_DEVICES'
          ) {
            store.commit('auth/logout')
            return redirect('/login')
          }
        })
    } else if (
      error.response.data.message === 'REFRESH_TOKEN_EXPIRED' ||
      error.response.data.message === 'REFRESH_TOKEN_INVALID'
    ) {
      store.commit('auth/logout')
      return redirect('/login')
    }
  })
}
