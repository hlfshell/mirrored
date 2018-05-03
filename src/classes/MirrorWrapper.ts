import { v4 } from 'node-uuid';

import { FunctionCall } from "../interfaces/FunctionCall";
import { Attribute } from "../interfaces/Attribute";

export class MirrorWrapper {

    public core : any;

    private functions: string[];
    private attributes : string[];

    private attributesHandler : { [key : string] : Attribute } = {};

    constructor(core : any){
        this.core = core;

        this.functions = this.getAllFunctionNames();
        this.attributes = this.getAllAttributeNames();

        let time = new Date().getTime();

        this.attributes.forEach(attribute =>{
            this.assignAttributeValue({
                key: attribute,
                value: this.getAttributeValue(attribute),
                lastUpdated: time
            });
        });
    }

    public getAllFunctionNames() : string[]{
        let properties = Object.getOwnPropertyNames(this.core).concat(Object.getOwnPropertyNames(this.core.__proto__));

        return properties.filter(attr => typeof this.core[attr] == "function" );
    }

    public getAllAttributeNames() : string[]{
        let properties = Object.getOwnPropertyNames(this.core).concat(Object.getOwnPropertyNames(this.core.__proto__));

        return properties.filter(attr => typeof this.core[attr] != "function" );
    }

    private getAttributeValue(key : string) : any {
        let value = this.core[key];
        if(!key) return null;
        else if(typeof value == "string"){
            try{
                value = JSON.parse(value);
            } catch(err){
                //Do nothing, just catch parse error
            }
        }

        return value;
    }

    public assignAttributeValue(attr : Attribute) : void{
        let currentAttr = this.attributesHandler[attr.key];

        if(!currentAttr)
            this.attributesHandler[attr.key] = attr;
        else if(currentAttr.lastUpdated < attr.lastUpdated)
            this.attributesHandler[attr.key] = attr;
    }

    public getAttributes() : Attribute[] {
        let attributes : Attribute[] = [];
        for(var key in this.attributesHandler){
            attributes.push(this.attributesHandler[key]);
        };
        return attributes;
    }

    public async executeFunction(call : FunctionCall) : Promise<any> {
        let success : Function, error : Function = null;
        let promise = new Promise((resolve, reject)=>{
            success = resolve;
            error = reject;
        });

        if(!this.getAllFunctionNames().includes(call.function)){
            throw new Error("The requested function was not part of the mirrored object");
        }

        let executionId = v4();
        
        if(call.callback){
            //This must be defined as a function
            //as anonymous functions don't get arguments
            //attribute
            call.payload.push(function(...payload : any[]){
                let err = payload.shift();
                
                if(err){
                    error(err);
                } else {
                    success(payload);
                }
            });
        }

        let response : any = await this.core[call.function].apply(call.payload);

        if(!call.callback) return response;
        else return promise;
    }

    
}