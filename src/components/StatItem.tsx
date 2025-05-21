'use client'

type StatItemProps = {
    icon: string
    label: string
    value: string | number
    description?: string
    color?: string
    className?: string
}

export default function StatItem({
    icon,
    label,
    value,
    description,
    color = '',
    className = ''
}: StatItemProps) {
    return (
        <div className={`flex items-start gap-2 p-2 rounded-lg bg-gray-50 ${className}`}>
            <span className="text-xl">{icon}</span>
            <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs text-gray-500 truncate">{label}</span>
                <span className={`font-bold text-base ${color}`}>{value}</span>
                {description && (
                    <span className="text-xs text-gray-400 truncate">{description}</span>
                )}
            </div>
        </div>
    )
}