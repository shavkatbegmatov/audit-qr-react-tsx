// authService.ts
import api from './api'

interface TokenResponse {
    success: boolean
    data?: {
        accessToken: string
        refreshToken: string
    }
    error?: {
        code: number
        message: string
    }
    timestamp: string
}

const authService = {
    login: async (username: string, password: string) => {
        const { data } = await api.post<TokenResponse>('/login', { username, password })
        if (!data.success) {
            throw new Error(data.error?.message || 'Login failed')
        }

        const { accessToken, refreshToken } = data.data!
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        return { accessToken, refreshToken }
    },

    logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
    },

    refreshToken: async () => {
        const token = localStorage.getItem('refreshToken')
        if (!token) {
            // нет refreshToken — выходим сразу в логин
            authService.logout()
            throw new Error('No refresh token stored')
        }

        try {
            const { data } = await api.post<TokenResponse>('/refresh', { refreshToken: token })
            if (!data.success) {
                throw new Error(data.error?.message ?? 'Token refresh failed')
            }

            const newAccess = data.data!.accessToken
            const newRefresh = data.data!.refreshToken
            localStorage.setItem('accessToken', newAccess)
            localStorage.setItem('refreshToken', newRefresh)
            return { accessToken: newAccess, refreshToken: newRefresh }
        } catch (e: any) {
            // сначала очищаем, потом кидаем ошибку
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            throw new Error(
                `Token refresh failed: ${
                    e.response?.data?.error?.message ?? e.message ?? 'Unknown error'
                }`
            )
        }
    },
}

export default authService
