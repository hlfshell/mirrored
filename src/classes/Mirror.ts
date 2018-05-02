import * as WebSocket from 'ws';
import { getPort } from 'get-port';

import { Options } from '../interfaces/Options';

export class Mirror {

    private websocket : WebSocket;
    
    public core : object;

    private functions: string[];

    private awaitingResponse : {};

    constructor(core : any, options : Options){
        this.core = core;

        this.functions = this.getAllFunctionNames(core);

        this.awaitingResponse = {};
    }

    private getAllFunctionNames(core : any) : string[]{
        let properties = Object.getOwnPropertyNames(core).concat(Object.getOwnPropertyNames(core.__proto__));

        return properties.filter(attr => typeof core[attr] == "function" );
    }

    private getAllAttributeNames() : void{

    }

    private getAllAttributeValues() : { [key:string] : any } {

    }

    private executeFunction(funtion : string) : Promise<any> {
        let success : Function, error : Function = null;

        this.awaitingResponse[]

        //Check to see if it returned a promise
        // x && Object.prototype.toString.call(x) === "[object Promise]"
    }

    
}