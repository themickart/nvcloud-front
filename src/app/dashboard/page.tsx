'use client'
import ClipboardBox from '@/components/dashboard/ClipboardBox'
import MetricBar from '@/components/dashboard/MetricBar'
import PasswordBox from '@/components/dashboard/PasswordBox'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

const formatBytes = (bytes: number) => {
    const GB = bytes / (1024 * 1024 * 1024)
    return GB > 1 ? `${GB.toFixed(1)}GB` : `${Math.round(bytes / (1024 * 1024))}MB`
}

const formatCores = (cores: number) => {
    return `${cores} яд${cores % 10 === 1 ? 'ро' : 'ра'}`
}

type Metrics = {
    server: {
        connect: string
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

function getMockMetrics(): Metrics {
    return {
        server: {
            connect: 'con1.nv-server.online:2201',
        },
        user: {
            username: 'container_admin',
            password: 'P@ssw0rdSecure!123'
        },
        cpu: {
            cpu_cores: 8,
            free_cpu: 0.75
        },
        ram: {
            ram_bytes: 17179869184,
            free_ram_bytes: 8589934592
        },
        rom: {
            rom_bytes: 107374182400,
            free_rom_bytes: 53687091200
        },
        io: {
            io_operations: 12458
        },
        network: {
            incoming_total_bytes: 5368709120,
            outgoing_total_bytes: 2147483648,
            incoming_current_bytes: 1524288,
            outgoing_current_bytes: 2262144
        }
    }
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)

    useEffect(() => {
        setMetrics(getMockMetrics())
    }, [])

    if (!metrics) return null

    return (
        <DashboardLayout title="Общая информация">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1 max-w-5xl mx-auto">
                {/* Credentials Card */}
                <div className="col-span-full bg-white rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Учетные данные</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ClipboardBox label="Подключение к серверу" value={metrics.server.connect} />
                        <ClipboardBox label="Имя пользователя | Логин" value={metrics.user.username} />
                        <PasswordBox label="Пароль" value={metrics.user.password} />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Мониторинг ресурсов</h3>
                {/* CPU Card */}
                <div className="bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800">Процессор</h3>
                        <span className="text-sm text-gray-500">
                            {formatCores(metrics.cpu.cpu_cores)}
                        </span>
                    </div>
                    <MetricBar
                        valueText={`${Math.round((1 - metrics.cpu.free_cpu) * 100)}%`}
                        percentage={(1 - metrics.cpu.free_cpu) * 100}
                        color="bg-purple-500"
                        label=''
                    />
                </div>

                {/* RAM Card */}
                <div className="bg-white">
                    <h3 className="font-bold text-gray-800 mb-2">Оперативная память (RAM)</h3>
                    <MetricBar
                        valueText={`${formatBytes(metrics.ram.ram_bytes - metrics.ram.free_ram_bytes)} / ${formatBytes(metrics.ram.ram_bytes)}`}
                        percentage={((metrics.ram.ram_bytes - metrics.ram.free_ram_bytes) / metrics.ram.ram_bytes) * 100}
                        color="bg-blue-500"
                        label=''
                    />
                </div>

                {/* ROM Card */}
                <div className="bg-white">
                    <h3 className="font-bold text-gray-800 mb-2">Диск (ROM)</h3>
                    <MetricBar
                        valueText={`${formatBytes(metrics.rom.rom_bytes - metrics.rom.free_rom_bytes)} / ${formatBytes(metrics.rom.rom_bytes)}`}
                        percentage={((metrics.rom.rom_bytes - metrics.rom.free_rom_bytes) / metrics.rom.rom_bytes) * 100}
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
                                    {formatBytes(metrics.network.incoming_current_bytes)}/s
                                </div>
                                <div className="text-xs text-gray-600">
                                    Всего {formatBytes(metrics.network.incoming_total_bytes)}
                                </div>
                            </div>
                        </div>

                        {/* Исходящий трафик */}
                        <div className="flex items-center gap-2 p-2 bg-gray-0 rounded">
                            <ArrowUpIcon className="h-4 w-4 text-gray-600" />
                            <div>
                                <div className="text-sm font-medium text-gray-500">
                                    {formatBytes(metrics.network.outgoing_current_bytes)}/s
                                </div>
                                <div className="text-xs text-gray-600">
                                    Всего {formatBytes(metrics.network.outgoing_total_bytes)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* IO Card */}
                <div className="bg-white">
                    <h3 className="font-bold text-gray-800 mb-1">Дисковые операции</h3>
                    <div className={`text-center py-4 shadow-md border border-gray-100 rounded-xl
                        ${metrics.io.io_operations < 50000 ? 'bg-yellow-300' :
                            metrics.io.io_operations < 100000 ? 'bg-orange-500' :
                                'bg-red-500'
                        }`}>
                        <div className="text-5xl text-gray-600 font-bold">
                            {(metrics.io.io_operations / 1000).toFixed(1)}K
                        </div>
                        <div className="text-md p-1 text-gray-700">операций в секунду</div>
                    </div>
                </div>s


                {/* Кнопка выхода */}
                <div className="col-span-full mt-2">
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-semibold shadow transition-colors">
                        Завершить сессию
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}