'use client'
import AuthLayout from '@/components/AuthLayout'
import ErrorAlert from '@/components/ErrorAlert'
import FormButton from '@/components/FormButton'
import Input from '@/components/Input'
import { handleAuthResponse, storeAuthToken } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!/^[a-zA-Z_]+$/.test(username)) {
            setError('Имя пользователя должно содержать только латинские буквы')
            return
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }

        const nameParts = fullName.trim().split(/\s+/)
        if (nameParts.length !== 3) {
            setError('ФИО должно состоять из трёх слов')
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch('https://api.nv-server.online/api/v1/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    full_name: fullName
                })
            })

            const token = await handleAuthResponse(response)
            storeAuthToken(token)
            router.push('/profile')

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка сети или сервера')
            console.error('Registration error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout title="Регистрация">
            <form onSubmit={handleRegister} className="flex flex-col space-y-4">
                <ErrorAlert message={error || ''} className="mb-2" />

                <Input
                    label="Email-почта:"
                    type="email"
                    placeholder="Введите Email почту"
                    value={email}
                    onChange={setEmail}
                />

                <Input
                    type='username'
                    label="Имя пользователя:"
                    placeholder="Введите имя пользователя"
                    value={username}
                    onChange={setUsername}
                />

                <Input
                    label="Пароль:"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={setPassword}
                />

                <Input
                    label="Повторите пароль:"
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                />

                <Input
                    label="ФИО:"
                    placeholder="Введите Ваше ФИО"
                    value={fullName}
                    onChange={setFullName}
                />

                <FormButton
                    color="green"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </FormButton>

                <div className="text-center text-gray-400 font-medium">или</div>

                <Link href="/login">
                    <FormButton type="button">Войти</FormButton>
                </Link>
            </form>
        </AuthLayout>
    )
}