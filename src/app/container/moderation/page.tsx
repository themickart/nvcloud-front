'use client'
import DashboardLayout from '@/components/DashboardLayout'
import FormButton from '@/components/FormButton'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ContainerTicket {
    id: string
    created_at: string
    updated_at: string | null
    name: string
    owner_id: string
    closed: boolean
    rom_bytes: number
    ram_bytes: number
    cpu_cores: number
    last_modified: string | null
    owner_username: string
}

export default function ContainerModerationPage() {
    const [tickets, setTickets] = useState<ContainerTicket[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)
    const [processing, setProcessing] = useState<string | null>(null)
    const [expandedSection, setExpandedSection] = useState<'open' | 'closed' | null>(null)

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const response = await fetch('https://api.nv-server.online/api/v1/proxmox/container/ticket', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            } else {
                throw new Error('Failed to fetch tickets')
            }
        } catch {
            toast.error('Ошибка при загрузке заявок', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (ticket: ContainerTicket) => {
        setProcessing(ticket.id)
        try {
            const response = await fetch(`https://api.nv-server.online/api/v1/proxmox/container/${ticket.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })

            if (response.status === 201) {
                toast.success(`Контейнер ${ticket.name} успешно создан!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
                setTickets(tickets.filter(t => t.id !== ticket.id))
                if (expandedTicketId === ticket.id) setExpandedTicketId(null)
            } else {
                throw new Error('Failed to approve container')
            }
        } catch {
            toast.error('Ошибка при создании контейнера', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (ticketId: string) => {
        setProcessing(ticketId)
        try {
            const response = await fetch(`https://api.nv-server.online/api/v1/proxmox/container/ticket/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })

            if (response.ok) {
                toast.success('Заявка отклонена', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
                setTickets(tickets.filter(t => t.id !== ticketId))
                if (expandedTicketId === ticketId) setExpandedTicketId(null)
            } else {
                throw new Error('Failed to reject ticket')
            }
        } catch {
            toast.error('Ошибка при отклонении заявки', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        } finally {
            setProcessing(null)
        }
    }

    const toggleTicketExpand = (id: string) => {
        setExpandedTicketId(expandedTicketId === id ? null : id)
    }

    const toggleSectionExpand = (section: 'open' | 'closed') => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    const formatBytes = (bytes: number) => {
        if (bytes >= 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} ГБ`
        } else if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
        } else if (bytes >= 1024) {
            return `${(bytes / 1024).toFixed(1)} КБ`
        }
        return `${bytes} Б`
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('ru-RU')
    }

    const openTickets = tickets.filter(ticket => !ticket.closed)
    const closedTickets = tickets.filter(ticket => ticket.closed)

    return (
        <DashboardLayout title="Модерация контейнеров">
            <div className="max-w-4xl mx-auto space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
                        <p className="text-gray-500">Нет заявок на модерацию</p>
                    </div>
                ) : (
                    <>
                        {/* Open Tickets Section */}
                        {openTickets.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                                <div
                                    className="p-6 cursor-pointer flex justify-between items-center"
                                    onClick={() => toggleSectionExpand('open')}
                                >
                                    <div className="flex items-center">
                                        <h3 className="font-medium text-gray-800 text-lg">Открытые заявки</h3>
                                        <span className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {openTickets.length}
                                        </span>
                                    </div>
                                    {expandedSection === 'open' ? (
                                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${expandedSection === 'open' ? 'max-h-[2000px]' : 'max-h-0'}`}>
                                    <div className="divide-y divide-gray-200">
                                        {openTickets.map(ticket => (
                                            <div key={ticket.id} className="px-6 pb-4 pt-2">
                                                <div
                                                    className="py-4 cursor-pointer flex justify-between items-center"
                                                    onClick={() => toggleTicketExpand(ticket.id)}
                                                >
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">{ticket.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {formatBytes(ticket.ram_bytes)} RAM • {ticket.cpu_cores} CPU • {formatBytes(ticket.rom_bytes)} HDD
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                                                            Ожидание
                                                        </span>
                                                        {expandedTicketId === ticket.id ? (
                                                            <ChevronUpIcon className="h-5 w-5 ml-4 text-gray-400" />
                                                        ) : (
                                                            <ChevronDownIcon className="h-5 w-5 ml-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`overflow-hidden transition-all duration-300 ${expandedTicketId === ticket.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="grid grid-cols-2 gap-4 mb-4 pl-4 pr-8 py-2">
                                                        <div>
                                                            <p className="text-sm text-gray-400">Владелец</p>
                                                            <p className="font-medium text-gray-800">{ticket.owner_username}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">Дата создания</p>
                                                            <p className="font-medium text-gray-800">{formatDate(ticket.created_at)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">CPU ядер</p>
                                                            <p className="font-medium text-gray-800">{ticket.cpu_cores}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">RAM</p>
                                                            <p className="font-medium text-gray-800">{formatBytes(ticket.ram_bytes)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">Хранилище</p>
                                                            <p className="font-medium text-gray-800">{formatBytes(ticket.rom_bytes)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8 scale-[0.9] sm:scale-100">
                                                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-full">
                                                            {processing === ticket.id ? (
                                                                <FormButton disabled={true} className="text-xs sm:text-sm md:text-base px-3 py-1 sm:px-4 sm:py-2">
                                                                    Обработка...
                                                                </FormButton>
                                                            ) : (
                                                                <>
                                                                    <FormButton
                                                                        color="green"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleApprove(ticket)
                                                                        }}
                                                                        className="text-xs sm:text-sm md:text-base px-3 py-1 sm:px-4 sm:py-2"
                                                                    >
                                                                        Одобрить
                                                                    </FormButton>
                                                                    <FormButton
                                                                        color="blue"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleReject(ticket.id)
                                                                        }}
                                                                        className="text-xs sm:text-sm md:text-base px-3 py-1 sm:px-4 sm:py-2"
                                                                    >
                                                                        Отклонить
                                                                    </FormButton>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Closed Tickets Section */}
                        {closedTickets.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                                <div
                                    className="p-6 cursor-pointer flex justify-between items-center"
                                    onClick={() => toggleSectionExpand('closed')}
                                >
                                    <div className="flex items-center">
                                        <h3 className="font-medium text-gray-800 text-lg">Закрытые заявки</h3>
                                        <span className="ml-3 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                            {closedTickets.length}
                                        </span>
                                    </div>
                                    {expandedSection === 'closed' ? (
                                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${expandedSection === 'closed' ? 'max-h-[2000px]' : 'max-h-0'}`}>
                                    <div className="divide-y divide-gray-200">
                                        {closedTickets.map(ticket => (
                                            <div key={ticket.id} className="px-6 pb-4 pt-2">
                                                <div
                                                    className="py-4 cursor-pointer flex justify-between items-center"
                                                    onClick={() => toggleTicketExpand(ticket.id)}
                                                >
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">{ticket.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {formatBytes(ticket.ram_bytes)} RAM • {ticket.cpu_cores} CPU • {formatBytes(ticket.rom_bytes)} HDD
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-full">
                                                            Закрыта
                                                        </span>
                                                        {expandedTicketId === ticket.id ? (
                                                            <ChevronUpIcon className="h-5 w-5 ml-4 text-gray-400" />
                                                        ) : (
                                                            <ChevronDownIcon className="h-5 w-5 ml-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`overflow-hidden transition-all duration-300 ${expandedTicketId === ticket.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="grid grid-cols-2 gap-4 mb-4 pl-4 pr-8 py-2">
                                                        <div>
                                                            <p className="text-sm text-gray-400">Владелец</p>
                                                            <p className="font-medium text-gray-800">{ticket.owner_username}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">Дата создания</p>
                                                            <p className="font-medium text-gray-800">{formatDate(ticket.created_at)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">CPU ядер</p>
                                                            <p className="font-medium text-gray-800">{ticket.cpu_cores}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">RAM</p>
                                                            <p className="font-medium text-gray-800">{formatBytes(ticket.ram_bytes)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-400">Хранилище</p>
                                                            <p className="font-medium text-gray-800">{formatBytes(ticket.rom_bytes)}</p>
                                                        </div>
                                                        {ticket.updated_at && (
                                                            <div>
                                                                <p className="text-sm text-gray-400">Дата закрытия</p>
                                                                <p className="font-medium text-gray-800">{formatDate(ticket.updated_at)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}