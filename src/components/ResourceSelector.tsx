'use client'
import type { ReactNode } from 'react'

type ResourceSelectorProps = {
    label: string
    value: number
    unit: string
    onChange: (value: number) => void
    min: number
    max: number
    step: number
    quickSelect?: number[]
    children?: ReactNode
}

export default function ResourceSelector({
    label,
    value,
    unit,
    onChange,
    min,
    max,
    step,
    quickSelect,
    children
}: ResourceSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-lg font-medium text-gray-700">{label}</label>
                <span className="text-lg font-semibold text-gray-900">
                    {value} {unit}
                </span>
            </div>

            {children || (
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            )}

            <div className="flex justify-between text-sm text-gray-500">
                <span>{min} {unit}</span>
                <span>{max} {unit}</span>
            </div>

            {quickSelect && (
                <div className="flex flex-wrap gap-2">
                    {quickSelect.map((amount) => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => onChange(amount)}
                            className={`px-3 py-1 rounded-md ${value === amount
                                ? 'bg-blue-100 border border-blue-500 text-blue-700'
                                : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                                } text-sm font-medium transition-colors`}
                        >
                            {amount} {unit}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}