import * as WebSocket from "ws";

export interface ConnectionHandler {
    connection : WebSocket
    pingNext: number // settimeout reveal
    lastHeardFrom: number
}