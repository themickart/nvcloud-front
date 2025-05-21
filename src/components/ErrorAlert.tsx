'use client'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

type ErrorAlertProps = {
    message: string
    duration?: number
    className?: string
}

export default function ErrorAlert({
    message,
    duration = 5000,
    className = ''
}: ErrorAlertProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (message) {
            setIsVisible(true)
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, duration)

            return () => clearTimeout(timer)
        } else {
            setIsVisible(false)
        }
    }, [message, duration])

    if (!isVisible || !message) return null

    return (
        <div className={`fixed inset-x-0 top-4 z-50 flex justify-center ${className}`}>
            <div className="animate-fade-in-down rounded-md bg-red-50 p-4 shadow-lg ring-1 ring-red-100">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}