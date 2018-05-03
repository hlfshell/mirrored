export interface Message {
    id?: string,
    type: string,
    target?: string,
    responseTo?: string, 
    payload?: any
}