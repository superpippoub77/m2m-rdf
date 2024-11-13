export interface WheelItem {
    value: string
    bgcolor: string
    color: string
    nrRepeat: number
    action: typeRDF
}

export interface Frase {
    frase: string
    category: string
}

export interface Partecipant {
    name: string
    totalPrize: number
    partialPrize: number
}
export interface SnackMessage {
    open: boolean
    message: string
}
export enum typeRDF {
    none = "NONE",
    passa = "PASSA",
    perde = "PERDE",
    express = "EXPRESS"
}