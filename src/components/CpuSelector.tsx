'use client'

type CpuSelectorProps = {
    value: number
    onChange: (value: number) => void
}

export default function CpuSelector({ value, onChange }: CpuSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-lg font-medium text-gray-700">CPU (ядра)</label>
                <span className="text-lg font-semibold text-gray-900">
                    {value} ядр{value > 1 ? 'а' : 'о'}
                </span>
            </div>

            <div className="flex space-x-4">
                {[1, 2].map((cores) => (
                    <button
                        key={cores}
                        type="button"
                        onClick={() => onChange(cores)}
                        className={`flex-1 py-3 px-4 rounded-lg border ${value === cores
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                            } font-medium transition-colors`}
                    >
                        {cores} ядр{cores > 1 ? 'а' : 'о'}
                    </button>
                ))}
            </div>
        </div>
    )
}