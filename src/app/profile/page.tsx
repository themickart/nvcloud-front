'use client'
import DashboardLayout from '@/components/DashboardLayout'
import ErrorAlert from '@/components/ErrorAlert'
import { ArrowRightIcon, BuildingOfficeIcon, ListBulletIcon, PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const DOMAIN = 'nv-server.online'
const PORT_PREFIX = '22'
const BOT_USERNAME = 'nvcloud_bot'

type UserProfile = {
    email: string
    username: string
    full_name: string
    total_containers: number
    registration_date: string
    is_superuser: boolean
    tg_passcode: string
}

type ContainerInfo = {
    id: number
    name: string
    status: 'running' | 'stopped'
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [containers, setContainers] = useState<ContainerInfo[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                if (!token) {
                    throw new Error('Требуется авторизация')
                }

                // Загрузка профиля
                const profileResponse = await fetch('https://api.nv-server.online/api/v1/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!profileResponse.ok) {
                    if (profileResponse.status == 401) {
                        localStorage.removeItem('authToken')
                    }
                    throw new Error(`Ошибка загрузки профиля`)
                }

                const profileData: UserProfile = await profileResponse.json()
                setProfile(profileData)

                // Загрузка контейнеров
                const containersResponse = await fetch('https://api.nv-server.online/api/v1/proxmox/container', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!containersResponse.ok) {
                    throw new Error('Ошибка загрузки контейнеров')
                }

                const containersData: ContainerInfo[] = await containersResponse.json()
                setContainers(containersData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleClick = () => {
        const link = `https://t.me/${BOT_USERNAME}?start=${profile?.tg_passcode}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(link);
        } else {
            window.open(link, '_blank');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        return status === 'running' ? 'bg-green-500' : 'bg-red-500'
    }

    const getStatusText = (status: string) => {
        return status === 'running' ? 'Active' : 'Stopped'
    }

    if (loading) {
        return (
            <DashboardLayout title="Профиль">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Профиль">
            <div className="space-y-6">
                <ErrorAlert message={error} />

                {/* Блок с персональными данными */}
                {profile && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Личные данные</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">ФИО</label>
                                <p className="text-lg font-semibold text-gray-900">{profile.full_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                                <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Username</label>
                                <p className="text-lg font-semibold text-gray-900">{profile.username}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Дата регистрации</label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatDate(profile.registration_date)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Количество контейнеров</label>
                                <p className="text-lg font-semibold text-gray-900">{containers.length}</p>
                            </div>

                            {/* Кнопка привязки Telegram */}
                            <div className="pt-2">
                                {profile.tg_passcode ? (
                                    <a
                                        onClick={handleClick}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Привязать Telegram
                                    </a>
                                ) : (
                                    <button
                                        className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
                                        onClick={handleClick}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Привязано
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Список контейнеров */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Мои контейнеры</h3>
                    <div className="space-y-3">
                        {containers.map(container => (
                            <div key={container.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${getStatusColor(container.status)}`} />
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">
                                                {container.name}.{DOMAIN}:{PORT_PREFIX}{container.id}
                                            </p>
                                            <p className="text-sm text-gray-500">{getStatusText(container.status)}</p>
                                        </div>
                                    </div>
                                    <Link href={`/container/info/${container.id}`}>
                                        <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                                            Подробнее
                                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <Link href='/container/create'>
                        <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:transform active:scale-95 active:shadow-inner">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Создать новый контейнер
                        </button>
                    </Link>

                    {profile?.is_superuser && (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Админ-панель</h3>
                            <Link href='/container/moderation'>
                                <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:transform active:scale-95 active:shadow-inner">
                                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                                    Модерация
                                </button>
                            </Link>
                            <Link href='/container/list'>
                                <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:transform active:scale-95 active:shadow-inner">
                                    <ListBulletIcon className="h-5 w-5 mr-2" />
                                    Все контейнеры
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout >
    )
}