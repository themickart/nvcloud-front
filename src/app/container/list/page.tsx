'use client'

import DashboardLayout from '@/components/DashboardLayout'
import StatItem from '@/components/StatItem'
import { ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Container = {
    id: number
    name: string
    owner_username: string
    rom_bytes: number
    ram_bytes: number
    cpu_cores: number
    status: 'running' | 'stopped'
}

export default function AdminContainersPage() {
    const [containers, setContainers] = useState<Container[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRam: 0,
        totalRom: 0,
        running: 0
    })
    const [expandedId, setExpandedId] = useState<number | null>(null)

    useEffect(() => {
        fetchContainers()
    }, [])

    const fetchContainers = async () => {
        try {
            //setLoading(true)
            const token = localStorage.getItem('authToken')

            const response = await fetch('https://api.nv-server.online/api/v1/proxmox/container/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 401) {
                toast.error('Требуется авторизация')
                return
            }

            if (response.status === 405) {
                toast.error('Недостаточно прав для просмотра контейнеров')
                return
            }

            if (!response.ok) {
                throw new Error('Ошибка сервера')
            }

            const data: Container[] = await response.json()
            setContainers(data)

            // Calculate stats
            const totalRam = data.reduce((sum, c) => sum + c.ram_bytes, 0)
            const totalRom = data.reduce((sum, c) => sum + c.rom_bytes, 0)
            const running = data.filter(c => c.status === 'running').length

            setStats({
                totalRam,
                totalRom,
                running
            })

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Неизвестная ошибка')
        } finally {
            setLoading(false)
        }
    }

    const handleContainerAction = async (vmid: number, action: 'start' | 'stop' | 'restart' | 'delete') => {
        try {
            const token = localStorage.getItem('authToken')

            setContainers(prev => prev.map(c =>
                c.id === vmid ? {
                    ...c,
                    status: action === 'start' ? 'running' :
                        action === 'stop' ? 'stopped' :
                            c.status
                } : c
            ))
            const url = `https://api.nv-server.online/api/v1/proxmox/container/${action}?vmid=${vmid}`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })

            if (!response.ok) {
                throw new Error(`Ошибка при выполнении: ${action}`)
            }

            toast.success(`Контейнер ${action === 'start' ? 'запущен' :
                action === 'stop' ? 'остановлен' :
                    action === 'restart' ? 'перезапущен' : 'удалён'}`)

            // Обновляем только изменённый контейнер
            if (action === 'delete') {
                setContainers(prev => prev.filter(c => c.id !== vmid))
                setExpandedId(null)
            }

            // Обновляем статистику
            const runningCount = containers.filter(c => c.status === 'running').length
            setStats(prev => ({
                ...prev,
                running: action === 'start' ? runningCount + 1 :
                    action === 'stop' ? runningCount - 1 :
                        runningCount
            }))
            setTimeout(() => {
                fetchContainers()
            }, 3000)

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка выполнения действия')
            fetchContainers()
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const totalRam = 16 * 1024 ** 3
    const totalRom = 343 * 1024 ** 3

    const ramUsed = stats.totalRam
    const romUsed = stats.totalRom

    const ramPercent = ((ramUsed / totalRam) * 100).toFixed(0)
    const romPercent = ((romUsed / totalRom) * 100).toFixed(0)

    if (loading) {
        return (
            <DashboardLayout title="Админ-панель">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Админ-панель">
            <div className="space-y-6">
                {/* Summary stats */}
                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Общая статистика</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm text-gray-700">
                        <StatItem
                            icon="📦"
                            label="Контейнеров"
                            value={containers.length}
                            color="text-blue-600"
                        />
                        <StatItem
                            icon="🟢"
                            label="Запущено"
                            value={stats.running}
                            color="text-green-600"
                        />
                        <StatItem
                            icon="🧠"
                            label="RAM"
                            value={`${ramPercent}%`}
                            description={`${formatBytes(ramUsed)} / 16 ГБ`}
                            color="text-purple-600"
                        />
                        <StatItem
                            icon="💾"
                            label="ROM"
                            value={`${romPercent}%`}
                            description={`${formatBytes(romUsed)} / 343 ГБ`}
                            color="text-yellow-600"
                        />
                    </div>
                </div>

                {/* Containers list */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Все контейнеры</h3>
                        <button
                            onClick={fetchContainers}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition-all"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Обновить список</span>
                        </button>
                    </div>

                    {containers.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-200 animate-fade-in">
                            <p className="text-lg text-gray-500">Контейнеры не найдены</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {containers.map(container => {
                                if (!container) return null;
                                return (
                                    <div
                                        key={container.id}
                                        className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg"
                                    >
                                        <div
                                            className="flex justify-between items-center p-5 cursor-pointer"
                                            onClick={() => toggleExpand(container.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-3 w-3 rounded-full ${container.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {container.name} <span className="text-gray-500">(ID: {container.id})</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">Владелец: {container.owner_username}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Кнопки действий скрытые на мобильных устройствах */}
                                                <div className="hidden md:flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleContainerAction(container.id, 'restart')
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                                        title="Перезапустить"
                                                    >
                                                        <ArrowPathIcon className="h-5 w-5" />
                                                    </button>

                                                    {container.status === 'running' ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleContainerAction(container.id, 'stop')
                                                            }}
                                                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            <StopIcon className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Остановить</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleContainerAction(container.id, 'start')
                                                            }}
                                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            <PlayIcon className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Запустить</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleContainerAction(container.id, 'delete')
                                                        }}
                                                        className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Удалить</span>
                                                    </button>
                                                </div>

                                                {/* Индикатор раскрытия/закрытия */}
                                                {expandedId === container.id ? (
                                                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Детали контейнера с анимацией */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === container.id ? 'max-h-96' : 'max-h-0'}`}
                                        >
                                            <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                                                {/* Кнопки действий для мобильных устройств */}
                                                <div className="md:hidden flex flex-wrap gap-2 mb-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleContainerAction(container.id, 'restart')
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors bg-gray-100 rounded-lg"
                                                        title="Перезапустить"
                                                    >
                                                        <ArrowPathIcon className="h-5 w-5" />
                                                        <span className="sr-only">Перезапустить</span>
                                                    </button>

                                                    {container.status === 'running' ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleContainerAction(container.id, 'stop')
                                                            }}
                                                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
                                                        >
                                                            <StopIcon className="h-4 w-4" />
                                                            <span>Остановить</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleContainerAction(container.id, 'start')
                                                            }}
                                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
                                                        >
                                                            <PlayIcon className="h-4 w-4" />
                                                            <span>Запустить</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleContainerAction(container.id, 'delete')
                                                        }}
                                                        className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        <span>Удалить</span>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 mt-4">
                                                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                                                        <p className="font-semibold text-gray-800 mb-3">Ресурсы</p>
                                                        <ul className="space-y-2 text-sm text-gray-700">
                                                            <li className="flex items-center justify-between border-b border-gray-200 pb-1">
                                                                <span className="text-gray-500">CPU</span>
                                                                <span className="font-medium text-gray-800">{container.cpu_cores} core</span>
                                                            </li>
                                                            <li className="flex items-center justify-between border-b border-gray-200 pb-1">
                                                                <span className="text-gray-500">RAM</span>
                                                                <span className="font-medium text-gray-800">{formatBytes(container.ram_bytes)}</span>
                                                            </li>
                                                            <li className="flex items-center justify-between">
                                                                <span className="text-gray-500">ROM</span>
                                                                <span className="font-medium text-gray-800">{formatBytes(container.rom_bytes)}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}