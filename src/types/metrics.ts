export type Metrics = {
    diskTotal: number
    diskUsed: number
    username: string
    cpuUsage: number
    ramUsed: number
    ramTotal: number
    netIn: number
    netOut: number
    diskIO: 'Низкая' | 'Средняя' | 'Высокая'
}