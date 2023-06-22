import express, { Request, Response } from "express";
import Joi from 'joi';
import { validateBody, validateParams } from '@tuukezu/joi-express';
import { JwtPayload, JwtToken  } from '../authentication/jwt';

import { createSite, createTag, getBlogs, getSites, getTags, removeTag } from '../database/sites';
import { GoogleAuthToken } from "./authentication";

const router = express.Router();

router.post('/create', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const body = Joi.object({
        name: Joi.string().required(),
    });

    const request = validateBody(req, res, body);
    if(!request) return;

    createSite(auth.id, request.name)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/list', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    getSites(auth.id)
        .then(list => {
            return res.json(list);
        })
        .catch(err => {
            console.log(err);
        })
});

router.post('/:site/create-tag', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        site: Joi.string().required(),
    });

    const body = Joi.object({
        label: Joi.string().required(),
    });

    const { site } = validateParams(req, res, params) || {};
    const { label } = validateBody(req, res, body) || {};
    if(!label || !site) return;

    createTag(auth.id, site, label)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

router.post('/:site/remove-tag', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        site: Joi.string().required(),
    });

    const body = Joi.object({
        tag: Joi.string().required(),
    });

    const { site } = validateParams(req, res, params) || {};
    const { tag } = validateBody(req, res, body) || {};
    if(!tag || !site) return;

    removeTag(auth.id, site, tag)
        .then(hash => {
            return res.json(hash);
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/:site/tags', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        site: Joi.string().required(),
    });

    const { site } = validateParams(req, res, params) || {};
    if(!site) return;

    getTags(auth.id, site)
        .then(data => {
            return res.json(data);
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/:site/blogs', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        site: Joi.string().required(),
    });

    const { site } = validateParams(req, res, params) || {};
    if(!site) return;

    getBlogs(auth.id, site)
        .then(data => {
            return res.json(data);
        })
        .catch(err => {
            console.log(err);
        })
});


export {
    router
}