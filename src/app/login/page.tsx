'use client'
import AuthLayout from '@/components/AuthLayout'
import ErrorAlert from '@/components/ErrorAlert'
import FormButton from '@/components/FormButton'
import Input from '@/components/Input'
import { handleAuthResponse, storeAuthToken } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('https://api.nv-server.online/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: identifier,
                    password: password
                }),
            })

            const token = await handleAuthResponse(response)
            storeAuthToken(token)
            router.push('/profile')

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка')
            console.error('Ошибка авторизации:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout title="Вход">
            <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                <ErrorAlert message={error} className="mb-2" />

                <div className='py-4'>
                    <Input
                        label="Имя пользователя:"
                        placeholder="Введите имя пользователя"
                        value={identifier}
                        onChange={setIdentifier}
                    />
                    <Input
                        label="Пароль:"
                        type="password"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={setPassword}
                    />
                </div>

                <FormButton disabled={loading}>
                    {loading ? 'Загрузка...' : 'Войти'}
                </FormButton>

                <div className="text-center text-gray-400 font-medium">или</div>

                <Link href="/register">
                    <FormButton color="green" type="button">Зарегистрироваться</FormButton>
                </Link>
            </form>
        </AuthLayout >
    )
}