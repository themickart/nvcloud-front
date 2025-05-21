'use client'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

type BackButtonProps = {
    href: string
    className?: string
}

export default function BackButton({
    href,
    className = ''
}: BackButtonProps) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors ${className}`}
        >
            <span className="bg-blue-100 hover:bg-blue-200 p-2 rounded-lg mr-2 transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
            </span>
        </Link>
    )
}