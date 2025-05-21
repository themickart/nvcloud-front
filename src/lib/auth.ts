export const storeAuthToken = (token: string) => {
    localStorage.setItem('authToken', token)
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export const handleAuthResponse = async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.username ||
            data.email ||
            'Произошла ошибка при авторизации'
        )
    }

    if (!data.access_token) {
        throw new Error('Ошибка при получении токена')
    }

    return data.access_token
}