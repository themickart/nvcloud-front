type InputProps = {
    label: string
    type?: string
    placeholder: string
    value: string
    onChange: (v: string) => void
    required?: boolean
}

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = true
}: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-black font-semibold">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                className="w-full p-2 rounded-xl bg-[#f5f5f5] text-black placeholder:text-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)] outline-none"
            />
        </div>
    )
}