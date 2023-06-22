import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import Joi from 'joi';
import { signature } from '../../config.json';
import { Request, Response } from 'express';
import { validateHeaders } from '@tuukezu/joi-express';

/**
 * Persistent fields of jsonwebtoken. Every JWT token will contain these two fields.
 */
export interface JwtPayload {
    exp: Number,
    iat: Number,
}


/**
 * Wrapper for `jsonwebtoken` with stronger validation for the payload.
 */
export class JwtToken {
    #schema: Joi.Schema;
    #lifetime: number;

    constructor(schema: Joi.Schema, lifetime: number) {
        this.#schema = schema;
        this.#lifetime = lifetime;
    }

    /**
     * Sign a new token with specified payload
     * @param payload The payload for the token. Will be validated by the internal schema of the webtoken.
     * @returns `{ token: String | null, error: Object | null }`
     */
    sign(payload: Object) : {token: string | null, error: Object | null} {
        const data = this.#schema.validate(payload);

        if(data.error) 
            return {token: null, error: data.error};

        return {token: jwt.sign({...data.value, exp: Math.floor(Date.now() / 1000) + this.#lifetime }, signature), error: null};
    }

    /**
     * Validate token's signature
     * @param token Valid `jsonwebtoken`
     * @returns 
     */
    verify(token: string) : object | JsonWebTokenError {
        try {
            const data = jwt.verify(token, signature);
            return <object>data;
        } catch(e) {
            return <JsonWebTokenError>e;
        }
    }

    /**
     * Fetch auth-token from request and validate it. 
     * @param req `Request` Express request
     * @param res `Response` Express response
     * @returns `JwtPayload` or `null` depending on weather the token was valid
     */
    verifyRequest(req: Request, res: Response) : object | null {
        const schema = Joi.object({token: Joi.string().required()}).unknown(true);
        const request = validateHeaders(req, res, schema);

        if(!request) return null;
        
        try {
            const data = this.verify(request.token);
            return <object>data;
        } catch(e: any) {
            const err = <JsonWebTokenError>e;
            res.status(401).json({err: err.message, status: 401});
            return null;
        }
    }
}
