type ButtonProps = {
    children: React.ReactNode
    type?: 'submit' | 'button'
    color?: 'blue' | 'green'
    disabled?: boolean
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    className?: string
}

export default function FormButton({
    children,
    type = 'submit',
    color = 'blue',
    onClick,
    disabled = false,
    className = '',
}: ButtonProps) {
    const base =
        'px-14 py-4 text-white text-xl font-semibold rounded-2xl shadow-lg transition-colors duration-200 inline-block mx-auto'

    const bg = disabled
        ? 'bg-gray-400 cursor-not-allowed'
        : color === 'green'
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-blue-500 hover:bg-blue-600'

    return (
        <div className="text-center">
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`${base} ${bg} ${className}`}
            >
                {children}
            </button>
        </div>
    )
}