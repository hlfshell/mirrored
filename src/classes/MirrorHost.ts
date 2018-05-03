import * as WebSocket from 'ws';
import { v4 } from 'node-uuid';
let getPort : any = require('get-port');

import { MirrorWrapper } from "./MirrorWrapper";

import { Attribute } from "../interfaces/Attribute";
import { FunctionCall } from "../interfaces/FunctionCall";
import { Message } from "../interfaces/Message";
import { ConnectionHandler } from "../interfaces/ConnectionHandler";
import { MirroredDescriptior } from "../interfaces/MirroredDescriptor";
import { FunctionResult } from "../interfaces/FunctionResult";

export class MirrorHost {

    private wss : WebSocket.Server;
    
    private mirroredHandler : { [key: string] : MirrorWrapper };

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
            this.handleIncomingMsg(id, data);
        });

        //Notify of all mirrored objects
        Object.keys(this.mirroredHandler).forEach(mirroredId =>{
            this.sendNewMirrored(id, mirroredId);
        });
    }

    public mirror(core : any) : void {
        let mirrored = new MirrorWrapper(core);
        this.mirroredHandler[mirrored.id] = mirrored;

        this.broadcastNewMirrored(mirrored.id);
    }

    private sendMessage(connectionId : string, message : Message) : void {
        let connection = this.connections[connectionId];
        if(!connection) return;

        if(!message.id) message.id = v4();

        let parsedMessage;
        try {
            parsedMessage = JSON.stringify(message);
        } catch(err){
            //Do something? for now, stop!
            return;
        }

        connection.send(parsedMessage);
    }

    private sendNewMirrored(connectionId : string, mirroredId : string) : void {
        let mirrorered : MirrorWrapper = this.mirroredHandler[mirroredId];

        let message : Message = {
            type: "Mirrored",
            payload: <MirroredDescriptior> {
                id: mirroredId,
                functions: mirrorered.getAllFunctionNames(),
                attributes: mirrorered.getAttributes()
            }
        }

        this.sendMessage(connectionId, message);
    }
    
    private broadcastNewMirrored(mirroredId : string){
        Object.keys(this.connections).forEach(connectionId =>{
            this.sendNewMirrored(connectionId, mirroredId);
        });
    }

    private handleIncomingMsg(connectionId : string, msg : Message) : void {
        switch(msg.type){
            case "Ping":
                this.handlePong(connectionId, msg);
            case "Authenticate":
                this.handleAuthentication(connectionId, msg)
            case "Execute":
                this.handleExecution(connectionId, msg);
        }
    }

    private handlePong(connectionId : string, msg : Message) : void {

    }

    private handleAuthentication(connectionId : string, msg : Message) : void {

    }

    private async handleExecution(fromConnection : string, msg : Message) : Promise<void> {
        let target = this.mirroredHandler[msg.target];
        let execution : FunctionCall = msg.payload;

        let responseMessage : Message = {
            type: "ExecutionResponse",
            responseTo: msg.id,
            payload: <FunctionResult> {
                success: false,
                result: null,
                attributes: []
            }
        }
     
        try {
            responseMessage.payload.result = await target.executeFunction(execution);

            responseMessage.payload.attributes = target.getAttributeValues();
            responseMessage.payload.success = true;

            this.sendMessage(fromConnection, responseMessage)
        } catch(err){
            //Something has gone wrong - report back that it all went bad!
            responseMessage.payload.success = false;
            responseMessage.payload.attributes = target.getAttributeValues();
            this.sendMessage(fromConnection, responseMessage);
        }
    }

}