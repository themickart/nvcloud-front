'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type Props = {
    label: string
    valueText: string | React.ReactNode
    percentage: number
    color?: string
}

export default function MetricBar({
    valueText,
    percentage,
    color = 'bg-blue-600',
    label = ''
}: Props) {
    const [prevPercentage, setPrevPercentage] = useState(percentage)
    const [displayPercentage, setDisplayPercentage] = useState(percentage)

    useEffect(() => {
        if (percentage !== prevPercentage) {
            const duration = Math.min(1, Math.abs(percentage - prevPercentage) * 0.01)

            const animate = () => {
                let start: number | null = null
                const step = (timestamp: number) => {
                    if (!start) start = timestamp
                    const progress = Math.min((timestamp - start) / (duration * 1000), 1)
                    const currentValue = prevPercentage + (percentage - prevPercentage) * progress
                    setDisplayPercentage(currentValue)
                    if (progress < 1) {
                        requestAnimationFrame(step)
                    } else {
                        setDisplayPercentage(percentage)
                        setPrevPercentage(percentage)
                    }
                }
                requestAnimationFrame(step)
            }

            animate()
        }
    }, [percentage, prevPercentage])

    return (
        <div className="mb-4">
            {label && (
                <div className="font-semibold text-gray-700 mb-1">
                    {label}
                </div>
            )}
            <div className="relative rounded-xl bg-white shadow-lg p-2.5 overflow-hidden border border-gray-100">
                <motion.div
                    className={`absolute top-0 left-0 bottom-0 ${color} rounded-l-xl`}
                    initial={{ width: `${prevPercentage}%` }}
                    animate={{ width: `${displayPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.div
                    className="relative z-10 font-bold text-gray-800 pl-2 drop-shadow-sm"
                    key={String(valueText)}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {valueText}
                </motion.div>
            </div>
        </div>
    )
}