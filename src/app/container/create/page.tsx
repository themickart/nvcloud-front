'use client'
import CpuSelector from '@/components/CpuSelector'
import DashboardLayout from '@/components/DashboardLayout'
import ErrorAlert from '@/components/ErrorAlert'
import FormButton from '@/components/FormButton'
import ResourceSelector from '@/components/ResourceSelector'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const adjectives = ['fast', 'cloud', 'secure', 'static', 'smart', 'global', 'silent', 'active', 'cool', 'modern', 'cyber', 'swift', 'bright', 'sharp', 'solid', 'stable', 'clean', 'prime', 'nova', 'hyper', 'rapid', 'bright', 'alpha', 'micro', 'macro', 'vivid', 'simple', 'sonic', 'intel', 'power', 'rocket', 'lunar', 'urban', 'soft', 'green', 'sky', 'orbit', 'deep', 'sharp', 'crisp', 'light', 'neon', 'vapor', 'strong', 'iron', 'pixel', 'focus', 'bound', 'hasty', 'clear'];

const nouns = ['node', 'host', 'server', 'vm', 'core', 'unit', 'box', 'pod', 'hub', 'base', 'net', 'root', 'cube', 'rack', 'grid', 'zone', 'gate', 'farm', 'link', 'loop', 'pipe', 'load', 'core', 'blob', 'cell', 'byte', 'heap', 'stack', 'flux', 'data', 'code', 'bin', 'disk', 'vault', 'site', 'path', 'mesh', 'port', 'disk', 'tier', 'api', 'bus', 'bit', 'shell', 'repo', 'dns', 'ipv6', 'addr', 'stream', 'proxy'];

export default function CreateContainerPage() {
    const [cpu, setCpu] = useState<number>(1)
    const [ram, setRam] = useState<number>(1)
    const [error, setError] = useState<string | null>(null)
    const [storage, setStorage] = useState<number>(4)
    const [hostName, setHostName] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const generateRandomHostname = () => {
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
        const randomNum = Math.floor(Math.random() * 100)
        return `${randomAdj}-${randomNoun}-${randomNum}`
    }

    const handleRandomize = () => {
        setHostName(generateRandomHostname())
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hostName) {
            toast.error('Пожалуйста, укажите имя хоста', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            return
        }

        setIsLoading(true)

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            if (hostName.length < 4 || hostName.length > 20) {
                setError('Имя хоста должно содержать от 4 до 20 символов')
                return
            }
            if (!/^[a-zA-Z0-9-]+$/.test(hostName)) {
                setError('Имя хоста может содержать только латинские буквы, цифры и тире')
                return
            }

            const response = await fetch('https://api.nv-server.online/api/v1/proxmox/container/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    rom_bytes: storage * 1024 * 1024 * 1024,
                    ram_bytes: ram * 1024 * 1024 * 1024,
                    cpu_cores: cpu,
                    host_name: hostName
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 201) {
                toast.success(`Заявка на создание контейнера ${hostName} отправлена!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
            } else {
                toast.error(`Ошибка при создании заявки!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
                const errorData = await response.json()
                throw new Error(errorData.message || 'Ошибка при создании контейнера')
            }
        } catch {
            toast.error('API не доступен! Попробуйте позже.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DashboardLayout title="Создание контейнера">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Конфигурация контейнера</h3>
                    <ErrorAlert message={error || ''} className="mb-2" />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label htmlFor="hostname" className="block text-sm font-medium text-gray-700 mb-1">
                                Имя хоста
                            </label>
                            <div className="flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    id="hostname"
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                    className="text-black flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="my-container"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleRandomize}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    title="Сгенерировать случайное имя"
                                >
                                    <ArrowsRightLeftIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Используйте только буквы, цифры и дефисы
                            </p>
                        </div>

                        <CpuSelector value={cpu} onChange={setCpu} />

                        <ResourceSelector
                            label="RAM (ГБ)"
                            value={ram}
                            unit="ГБ"
                            onChange={setRam}
                            min={1}
                            max={4}
                            step={0.25}
                            quickSelect={[1, 2, 3, 4]}
                        />

                        <ResourceSelector
                            label="Хранилище (ГБ)"
                            value={storage}
                            unit="ГБ"
                            onChange={setStorage}
                            min={4}
                            max={15}
                            step={1}
                            quickSelect={[4, 5, 10, 15]}
                        />

                        <div className="pt-4">
                            <FormButton
                                type="submit"
                                color="blue"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Создание...' : 'Создать контейнер'}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    )
}