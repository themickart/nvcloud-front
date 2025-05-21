'use client'
import ClipboardBox from '@/components/dashboard/ClipboardBox'
import MetricBar from '@/components/dashboard/MetricBar'
import PasswordBox from '@/components/dashboard/PasswordBox'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { ArrowPathIcon, ExclamationTriangleIcon, PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/20/solid'

const formatBytes = (bytes: number) => {
    const GB = bytes / (1024 * 1024 * 1024)
    return GB > 1 ? `${GB.toFixed(1)}GB` : `${Math.round(bytes / (1024 * 1024))}MB`
}

const formatCores = (cores: number) => {
    return `${cores} яд${cores % 10 === 1 ? 'ро' : 'ра'}`
}

type ContainerTelemetry = {
    container: {
        id: number
        name: string
        status: 'running' | 'stopped'
    }
    user: {
        username: string
        password: string
    }
    cpu: {
        cpu_cores: number
        free_cpu: number
    }
    ram: {
        ram_bytes: number
        free_ram_bytes: number
    }
    rom: {
        rom_bytes: number
        free_rom_bytes: number
    }
    io: {
        io_operations: number
    }
    network: {
        incoming_total_bytes: number
        outgoing_total_bytes: number
        incoming_current_bytes: number
        outgoing_current_bytes: number
    }
}

const AnimatedNumber = ({ value, format = (v: number) => v.toString() }: { value: number; format?: (v: number) => string }) => {
    const prevValueRef = useRef(value)
    const [displayValue, setDisplayValue] = useState(value)
    const [key, setKey] = useState(0)

    useEffect(() => {
        if (value !== prevValueRef.current) {
            setDisplayValue(prevValueRef.current)
            const diff = Math.abs(value - prevValueRef.current)
            const duration = Math.min(0.5, diff * 0.001) // Динамическая длительность

            const animate = () => {
                let start: number | null = null
                const step = (timestamp: number) => {
                    if (!start) start = timestamp
                    const progress = Math.min((timestamp - start) / (duration * 1000), 1)
                    const currentValue = prevValueRef.current + (value - prevValueRef.current) * progress
                    setDisplayValue(Math.floor(currentValue))
                    if (progress < 1) {
                        requestAnimationFrame(step)
                    } else {
                        setDisplayValue(value)
                        prevValueRef.current = value
                        setKey(prev => prev + 1)
                    }
                }
                requestAnimationFrame(step)
            }

            animate()
        } else {
            prevValueRef.current = value
        }
    }, [value])

    return (
        <motion.span
            key={key}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {format(displayValue)}
        </motion.span>
    )
}

export default function ContainerDetailsPage() {
    const params = useParams()
    const vmid = params.vmid as string
    const [telemetry, setTelemetry] = useState<ContainerTelemetry | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [containerNameInput, setContainerNameInput] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    const handleContainerAction = async (action: 'start' | 'stop' | 'restart') => {
        try {
            setIsProcessing(true)
            const token = localStorage.getItem('authToken')
            if (!token) {
                throw new Error('Требуется авторизация')
            }

            const response = await fetch(`https://api.nv-server.online/api/v1/proxmox/container/${action}?vmid=${vmid}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Ошибка при выполнении: ${action}`)
            }

            toast.success(`Контейнер ${action === 'start' ? 'запущен' : action === 'stop' ? 'остановлен' : 'перезапущен'}`)
            fetchTelemetry()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Неизвестная ошибка')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteContainer = async () => {
        try {
            if (telemetry?.container.status === 'running') {
                toast.error('Контейнер должен быть выключенным')
                return
            }

            if (containerNameInput !== telemetry?.container.name) {
                toast.error('Название контейнера не совпадает')
                return
            }

            setIsProcessing(true)
            const token = localStorage.getItem('authToken')
            if (!token) {
                throw new Error('Требуется авторизация')
            }

            const response = await fetch(`https://api.nv-server.online/api/v1/proxmox/container/delete?vmid=${vmid}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Ошибка при удалении контейнера')
            }

            toast.success('Контейнер успешно удален')
            window.location.href = '/profile' // Перенаправляем после удаления
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Неизвестная ошибка')
        } finally {
            setIsProcessing(false)
            setIsDeleteModalOpen(false)
        }
    }

    const fetchTelemetry = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) {
                throw new Error('Требуется авторизация')
            }

            const response = await fetch(`https://api.nv-server.online/api/v1/proxmox/container/telemetry/${vmid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken')
                }
                throw new Error(`Ошибка загрузки телеметрии контейнера`)
            }

            const data: ContainerTelemetry = await response.json()
            setTelemetry(prev => {
                // Сохраняем предыдущие значения для анимаций
                if (!prev) return data
                return {
                    ...data,
                    network: {
                        ...data.network,
                        incoming_current_bytes: data.network.incoming_current_bytes,
                        outgoing_current_bytes: data.network.outgoing_current_bytes,
                    }
                }
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        } finally {
            setLoading(false)
        }
    }, [vmid])

    useEffect(() => {
        fetchTelemetry()
        const interval = setInterval(fetchTelemetry, 5000)
        return () => clearInterval(interval)
    }, [vmid, fetchTelemetry])

    if (loading) {
        return (
            <DashboardLayout title="Загрузка...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!telemetry) {
        return (
            <DashboardLayout title="Ошибка">
                <div className="text-center py-10">
                    <p className="text-red-500">{error || 'Не удалось загрузить данные контейнера'}</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={`Контейнер ${telemetry.container.name}`}>
            {/* Модальное окно удаления */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900">Удаление контейнера</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                        Это действие необратимо. Все данные контейнера будут удалены.
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Для подтверждения введите название контейнера: <strong>{telemetry.container.name}</strong>
                                    </p>
                                    <input
                                        type="text"
                                        className="text-gray-800 mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Введите название контейнера"
                                        value={containerNameInput}
                                        onChange={(e) => setContainerNameInput(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => {
                                    setIsDeleteModalOpen(false)
                                    setContainerNameInput('')
                                }}
                                disabled={isProcessing}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md text-white ${containerNameInput === telemetry.container.name ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 cursor-not-allowed'} transition-colors`}
                                onClick={handleDeleteContainer}
                                disabled={containerNameInput !== telemetry.container.name || isProcessing}
                            >
                                {isProcessing ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1 max-w-5xl mx-auto">
                {/* Credentials Card */}
                <div className="col-span-full bg-white rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Учетные данные</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ClipboardBox
                            label="Подключение к серверу"
                            value={`ssh root@${telemetry.container.name}.nv-server.online -p 22${telemetry.container.id}`}
                        />
                        <ClipboardBox
                            label="Имя пользователя | Логин"
                            value={telemetry.user.username}
                        />
                        <PasswordBox
                            label="Пароль"
                            value={telemetry.user.password}
                        />
                    </div>
                </div>

                <div className="col-span-full bg-white rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Мониторинг ресурсов</h3>
                    {/* CPU Card */}
                    <div className="bg-white">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-800">Процессор</h3>
                            <span className="text-sm text-gray-500">
                                {formatCores(telemetry.cpu.cpu_cores)}
                            </span>
                        </div>
                        <MetricBar
                            valueText={<AnimatedNumber value={Math.round((1 - telemetry.cpu.free_cpu) * 100)} format={(v) => `${v}%`} />}
                            percentage={Math.max((1 - telemetry.cpu.free_cpu) * 100, 0)}
                            color="bg-purple-500"
                            label=''
                        />
                    </div>

                    {/* RAM Card */}
                    <div className="bg-white">
                        <h3 className="font-bold text-gray-800 mb-2">Оперативная память (RAM)</h3>
                        <MetricBar
                            valueText={
                                <>
                                    <AnimatedNumber value={telemetry.ram.ram_bytes - telemetry.ram.free_ram_bytes} format={formatBytes} /> / {formatBytes(telemetry.ram.ram_bytes)}
                                </>
                            }
                            percentage={((telemetry.ram.ram_bytes - telemetry.ram.free_ram_bytes) / telemetry.ram.ram_bytes) * 100}
                            color="bg-blue-500"
                            label=''
                        />
                    </div>

                    {/* ROM Card */}
                    <div className="bg-white">
                        <h3 className="font-bold text-gray-800 mb-2">Диск (ROM)</h3>
                        <MetricBar
                            valueText={
                                <>
                                    <AnimatedNumber value={telemetry.rom.rom_bytes - telemetry.rom.free_rom_bytes} format={formatBytes} /> / {formatBytes(telemetry.rom.rom_bytes)}
                                </>
                            }
                            percentage={((telemetry.rom.rom_bytes - telemetry.rom.free_rom_bytes) / telemetry.rom.rom_bytes) * 100}
                            color="bg-green-500"
                            label=''
                        />
                    </div>

                    {/* Network Card */}
                    <div className="col-span-full bg-white">
                        <h3 className="font-bold text-gray-800 mb-1">Сетевой трафик</h3>
                        <div className="grid grid-cols-2 gap-2 shadow-md p-4 rounded-xl border border-gray-100">
                            {/* Входящий трафик */}
                            <div className="flex items-center gap-2 p-2 bg-gray-0 rounded">
                                <ArrowDownIcon className="h-4 w-4 text-gray-600" />
                                <div>
                                    <div className="text-sm font-medium text-gray-500">
                                        <AnimatedNumber value={telemetry.network.incoming_current_bytes} format={formatBytes} />/s
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Всего <AnimatedNumber value={telemetry.network.incoming_total_bytes} format={formatBytes} />
                                    </div>
                                </div>
                            </div>

                            {/* Исходящий трафик */}
                            <div className="flex items-center gap-2 p-2 bg-gray-0 rounded">
                                <ArrowUpIcon className="h-4 w-4 text-gray-600" />
                                <div>
                                    <div className="text-sm font-medium text-gray-500">
                                        <AnimatedNumber value={telemetry.network.outgoing_current_bytes} format={formatBytes} />/s
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Всего <AnimatedNumber value={telemetry.network.outgoing_total_bytes} format={formatBytes} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* IO Card */}
                    <div className="bg-white">
                        <h3 className="font-bold text-gray-800 mb-1">Дисковые операции</h3>
                        <div className={`text-center py-4 shadow-md border border-gray-100 rounded-xl
                        ${telemetry.io.io_operations < 50000 ? 'bg-yellow-300' :
                                telemetry.io.io_operations < 100000 ? 'bg-orange-500' :
                                    'bg-red-500'
                            }`}>
                            <div className="text-5xl text-gray-600 font-bold">
                                <AnimatedNumber value={telemetry.io.io_operations} format={(v) => `${(v / 1000).toFixed(1)}K`} />
                            </div>
                            <div className="text-md p-1 text-gray-700">операций в секунду</div>
                        </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="col-span-full mt-2 grid grid-cols-2 gap-3">
                        <div className="col-span-full mt-2 grid grid-cols-3 gap-3">
                            <button
                                onClick={() => telemetry.container.status === 'running'
                                    ? handleContainerAction('stop')
                                    : handleContainerAction('start')}
                                className={`py-2.5 rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2
                            ${telemetry.container.status === 'running'
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : telemetry.container.status === 'running' ? (
                                    <>
                                        <StopIcon className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleContainerAction('restart')}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2"
                                disabled={isProcessing || telemetry.container.status !== 'running'}
                            >
                                {isProcessing ? (
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2"
                                disabled={isProcessing}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}