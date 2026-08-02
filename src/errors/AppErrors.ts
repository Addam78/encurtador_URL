// src/errors/AppErrors.ts
export class NotFoundError extends Error {
    statusCode = 404
    constructor(message:string){
        super(message)
    }
}
export class ExpiredError extends Error {
    statusCode=410

    constructor(message:string){
         super(message)
    }
   
}