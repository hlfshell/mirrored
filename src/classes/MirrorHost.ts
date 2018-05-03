import * as WebSocket from 'ws';
import { v4 } from 'node-uuid';
let getPort : any = require('get-port');

import { MirrorWrapper } from "./MirrorWrapper";

import { Attribute } from "../interfaces/Attribute";
import { FunctionCall } from "../interfaces/FunctionCall";
import { Message } from "../interfaces/Message";
import { ConnectionHandler } from "../interfaces/ConnectionHandler";

export class MirrorHost {

    private wss : WebSocket.Server;
    
    private mirrored : { [key: string] : MirrorWrapper };

    private connections : { [key: string] : WebSocket }

    private id : string;
    
    constructor(){
        this.id = v4();
    }

    public async listen() : Promise<{}>{
        let success : Function, error : Function;
        let promise = new Promise((resolve, reject)=>{
            success = resolve;
            error = reject;
        });

        let port :number = await getPort();

        this.wss = new WebSocket.Server({
            port: port
        });

        this.wss.on('open', ()=>{
            success();
        });

        this.wss.on('connection', (conn : WebSocket, request : any)=>{
            this.onConnection(conn, request);
        });

        return promise;
    }

    private onConnection(conn : WebSocket, request: any) : void {
        //Check the headers for relevant info
        
        //You would check auth here in the future

        let id = request.headers['client-id'];

        //Store the connection
        this.connections[id] = conn;

        //Handle incoming messages
        conn.on('message', (data : Message) =>{
            this.handleIncomingMsg(data);
        });

        //Notify of all mirrored objects
        Object.keys(this.mirrored).forEach(mirroredId =>{
            this.sendNewMirrored(id, mirroredId);
        });
    }

    private sendMessage(connectionId : string, message : Message) : void {

    }

    private sendNewMirrored(connectionId : string, mirroredId : string) : void {
        let mirrorered : MirrorWrapper = this.getMirroredById(mirroredId);

        let message : Message = {
            Type: "Mirrored",
            Payload: {
                id: mirroredId,
                functions: mirrorered.getAllFunctionNames(),
                attributes: mirrorered.getAttributes()
            }
        }
    }

    private handleIncomingMsg(msg : Message) : void {
        switch(msg.Type){
            case "Ping":
                this.handlePong(msg);
            case "Authenticate":
                this.handleAuthentication(msg)
            case "Execute":
                this.handleExecution(msg);
        }
    }

    private handlePong(msg : Message) : void {

    }

    private handleAuthentication(msg : Message) : void {

    }

    private handleExecution(msg : Message) : void {
        let target = this.getMirroredById(msg.Target);
    }
    
    public getMirroredById(id : string) : MirrorWrapper {
        return null;
    }

}