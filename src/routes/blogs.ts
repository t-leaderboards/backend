import express, { Request, Response } from "express";
import Joi from 'joi';
import { validateBody, validateParams } from '@tuukezu/joi-express';
import { JwtPayload, JwtToken  } from '../authentication/jwt';

import { createBlog, publishBlog, unpublishBlog, updateBlog } from '../database/blogs';
import { GoogleAuthToken } from "./authentication";

const router = express.Router();

router.post('/create', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const body = Joi.object({
        'site-id': Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        content: Joi.string().required(),
        tags: Joi.array().items(Joi.string())
    });

    const request = validateBody(req, res, body);
    if(!request) return;

    createBlog(auth.id, request['site-id'], request.title, request.description, request.content, request.tags)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

router.post('/:id/update', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        id: Joi.string().required(),
    });

    const body = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        content: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).allow()
    });

    const { id } = validateParams(req, res, params);
    const request = validateBody(req, res, body);
    if(!request || !id) return;

    updateBlog(auth.id, id, request.title, request.description, request.content, request.tags)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

router.post('/:id/publish', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        id: Joi.string().required(),
    });
    const { id } = validateParams(req, res, params);
    if(!id) return;

    publishBlog(auth.id, id)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

router.post('/:id/unpublish', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        id: Joi.string().required(),
    });
    const { id } = validateParams(req, res, params);
    if(!id) return;

    unpublishBlog(auth.id, id)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

export {
    router
}