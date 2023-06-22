import express, { Request, Response } from "express";
import Joi from 'joi';
import { validateHeaders, validateQuery } from '@tuukezu/joi-express';
import { getGoogleAuthUrl, getGoogleUser } from "../authentication/google-auth";
import { JwtPayload, JwtToken  } from '../authentication/jwt';
import { clientCallBack } from '../../config.json';

import { login } from '../database/users';

const WEEK = (60 * 60 * 24 * 7);

const router = express.Router();
export const GoogleAuthToken = new JwtToken(Joi.object({ id: Joi.string().required() }), WEEK);
export interface GoogleAuthToken {
    id: string
}

router.get('/google', async (req: Request, res: Response) => {
    const url = getGoogleAuthUrl();

    if(!url) return res.json({err: "Failed to generate Google's auth-url", status: 500});

    return res.redirect(url);
})

router.get('/google/callback', async (req: Request, res: Response) => {
    const schema = Joi.object({
        code: Joi.string().required(),
        scope: Joi.string(),
        authuser: Joi.number(),
        hd: Joi.string(),
        locale: Joi.string(),
        prompt: Joi.string()
    });

    const { code } = validateQuery(req, res, schema) || {};
    if(!code) return;

    getGoogleUser(code)
        .then(user => {
            login(user.id)
            .then(() => {
                const { token, error } = GoogleAuthToken.sign({id: user.id});
    
                if (error) {
                    console.log(error);
                    return res.json({err: "Failed to generate jwt-token", status: 500});
                }
                
                return res.redirect(`${clientCallBack}?token=${token}`, 303);
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({err: 'Failed to login', status: 500});
            });
        })
        .catch(err => {
            return res.status(err.status ?? 500).json(err);
        });
});

router.get('/google/validate', (req: Request, res: Response) => {
    const data = <JwtPayload>GoogleAuthToken.verifyRequest(req, res);
    if (!data) return;

    res.json({exp: data.exp, iat: data.iat});
});

export {
    router
}

