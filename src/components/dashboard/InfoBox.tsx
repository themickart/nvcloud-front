type Props = {
    label: string
    value: string
    color?: string
    bold?: boolean
}

export default function InfoBox({ label, value, color = 'text-gray-800', bold = true }: Props) {
    return (
        <div className="mb-4">
            <div className="font-medium text-gray-600">{label}</div>
            <div className="rounded-xl bg-white shadow-sm p-3 border border-gray-100">
                <span className={`${color} ${bold ? 'font-semibold' : ''}`}>
                    {value}
                </span>
            </div>
        </div>
    )
}