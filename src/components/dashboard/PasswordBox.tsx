'use client'
import { ClipboardDocumentIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

type Props = {
    label: string
    value: string
}

export default function PasswordBox({ label, value }: Props) {
    const [visible, setVisible] = useState(false)
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="mb-4">
            <div className="font-medium text-gray-800">{label}</div>
            <div className="relative rounded-2xl bg-white shadow-sm p-3 border border-gray-100 flex items-center justify-between">
                <div
                    className="flex-1 mr-2 overflow-hidden"
                    onClick={() => setVisible(!visible)}
                >
                    <span
                        className={`font-semibold text-gray-800 select-none transition-all duration-300 block whitespace-nowrap overflow-hidden text-ellipsis ${visible ? '' : 'filter blur-sm'
                            }`}
                    >
                        {visible ? value : '•••••••••••'}
                    </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={copyToClipboard}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Скопировать пароль"
                    >
                        <ClipboardDocumentIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setVisible(!visible)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {visible ? (
                            <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                        ) : (
                            <EyeIcon className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>
                {copied && (
                    <div className="absolute -bottom-6 right-0 text-sm text-green-600">
                        Скопировано!
                    </div>
                )}
            </div>
        </div>
    )
}