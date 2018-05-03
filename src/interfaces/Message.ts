export interface Message {
    Type: string,
    Target?: string | null,
    Payload: any | null
}