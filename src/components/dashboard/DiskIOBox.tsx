type Props = {
    value: string
}

export default function DiskIOBox({ value }: Props) {
    return (
        <div>
            <div className="font-meduim text-xl text-gray-800 mt-2">IO / Дисковая активность</div>
            <div className="rounded-xl bg-yellow-300 text-center font-bold py-2">{value}</div>
        </div>
    )
}