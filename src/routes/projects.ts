import express, { Request, Response } from "express";
import Joi from 'joi';
import { validateBody, validateParams, validateQuery } from '@tuukezu/joi-express';
import { getEntries, getEntry, insertIntoLeaderboard, setEntryStatus } from "../database/leaderboards";
import { Entry, EntryStatus, Format, OrderBy } from "../database/schemas";
import { Sort } from "mongodb";
import { listToCSV, listToPipe } from "../utility/utility";
import { createProject, getProject, getProjectInfo } from "../database/projects";
import { getUsers, setUserSubmissionsStatus } from "../database/users";


const router = express.Router();

router.post('/create/:name', (req, res) => {
    const params = Joi.object({
        'name': Joi.string().required().min(3)
    });

    const request = validateParams(req, res, params);
    if(!request) return;

    createProject(request.name)
    .then(details => {
        res.json(details);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.get('/:privateKey/info', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required().min(3)
    });

    const request = validateParams(req, res, params);
    if(!request) return;

    getProjectInfo({ privateKey: request.privateKey })
    .then(info => {
        if (!info) return res.status(400).json({ status: 400, err: 'No such project exists'});

        res.json(info);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.get('/:privateKey/users', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required().min(3)
    });

    const query = Joi.object({
        'order': Joi.string().valid('ASC', 'DESC'),
        'limit': Joi.number().min(1),
        'offset': Joi.number().min(0),
        'format': Joi.string().valid('JSON', 'PIPE', 'CSV')
    });

    const { privateKey } = validateParams(req, res, params);
    if (!privateKey) return;

    const { limit, offset } = validateQuery(req, res, query) ?? {};
    if (req.query.limit && !limit) return;
    if (req.query.offset && !offset) return;

    getUsers(privateKey, offset ?? 0, limit ?? 10)
    .then(list => {
        res.json(list);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.post('/:privateKey/user/:user_id/verify', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required(),
        'user_id': Joi.string().required()
    });

    const request = validateParams(req, res, params);
    if (!request) return;

    setUserSubmissionsStatus(request.privateKey, { id: request.user_id }, EntryStatus.Verified)
    .then(entry => {
        return res.json(entry);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.post('/:privateKey/user/:user_id/unverify', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required(),
        'user_id': Joi.string().required()
    });

    const request = validateParams(req, res, params);
    if (!request) return;

    setUserSubmissionsStatus(request.privateKey, { id: request.user_id }, EntryStatus.Unverified)
    .then(entry => {
        return res.json(entry);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.get('/:privateKey/entries', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required()
    });

    const query = Joi.object({
        'order': Joi.string().valid('ASC', 'DESC'),
        'limit': Joi.number().min(1),
        'offset': Joi.number().min(0),
        'format': Joi.string().valid('JSON', 'PIPE', 'CSV'),
        'verified': Joi.bool()
    });

    const { privateKey } = validateParams(req, res, params);
    if (!privateKey) return;

    const { order, limit, offset, format, verified } = validateQuery(req, res, query) ?? {};
    if (req.query.order && !order) return;
    if (req.query.limit && !limit) return;
    if (req.query.offset && !offset) return;
    if (req.query.format && !format) return;


    getEntries({ privateKey }, <OrderBy>(order ?? 'ASC'), offset ?? 0, limit ?? 10, verified ?? true)
    .then(entries => {

        switch (<Format>(format ?? 'JSON')) {
            case Format.Json:
                return  res.json(entries);
            case Format.Pipe:
                return res.send(listToPipe(entries));
            case Format.CSV:
                return res.send(listToCSV(entries));
        }
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});



router.post('/:privateKey/entries/insert', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required().length(48)
    });

    const body = Joi.object({
        'username': Joi.string().required().min(3),
        'password': Joi.string().min(3).allow(null),
        'value': Joi.number().required()
    });

    const { privateKey } = validateParams(req, res, params) ?? {};
    if (!privateKey) return;

    const request = validateBody(req, res, body);
    if(!request) return;

    insertIntoLeaderboard(privateKey, request.value, request.username, request.password)
    .then(entry => {
        res.json(entry);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.get('/:name/leaderboard', (req, res) => {
    const params = Joi.object({
        'name': Joi.string().required()
    });

    const query = Joi.object({
        'order': Joi.string().valid('ASC', 'DESC'),
        'limit': Joi.number().min(1),
        'offset': Joi.number().min(0),
        'format': Joi.string().valid('JSON', 'PIPE', 'CSV'),
        'verified': Joi.bool()
    });

    const { name } = validateParams(req, res, params);
    if (!name) return;

    const { order, limit, offset, format, verified } = validateQuery(req, res, query) ?? {};
    if (req.query.order && !order) return;
    if (req.query.limit && !limit) return;
    if (req.query.offset && !offset) return;
    if (req.query.format && !format) return;


    getEntries({ name }, <OrderBy>(order ?? 'ASC'), offset ?? 0, limit ?? 10, verified ?? true)
    .then(entries => {

        switch (<Format>(format ?? 'JSON')) {
            case Format.Json:
                return  res.json(entries);
            case Format.Pipe:
                return res.send(listToPipe(entries));
            case Format.CSV:
                return res.send(listToCSV(entries));
        }
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.get('/:name/entry/:id', (req, res) => {
    const params = Joi.object({
        'name': Joi.string().required(),
        'id': Joi.string().required()
    });

    const query = Joi.object({
        'format': Joi.string().valid('JSON', 'PIPE', 'CSV')
    });

    const request = validateParams(req, res, params);
    if (!request) return;

    const { format } = validateQuery(req, res, query) ?? {};

    getEntry({name: request.name}, request.id)
    .then(entry => {
        if(!entry) return res.status(400).json({ status: 400, err: 'No entry with specified id exists'})

        switch (<Format>(format ?? 'JSON')) {
            case Format.Json:
                return  res.json(entry);
            case Format.Pipe:
                return res.send(listToPipe([entry]));
            case Format.CSV:
                return res.send(listToCSV([entry]));
        }
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.post('/:privateKey/entry/:id/unverify', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required(),
        'id': Joi.string().required()
    });

    const request = validateParams(req, res, params);
    if (!request) return;

    setEntryStatus({privateKey: request.privateKey}, request.id, EntryStatus.Unverified)
    .then(entry => {
        return  res.json(entry);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

router.post('/:privateKey/entry/:id/verify', (req, res) => {
    const params = Joi.object({
        'privateKey': Joi.string().required(),
        'id': Joi.string().required()
    });

    const request = validateParams(req, res, params);
    if (!request) return;

    setEntryStatus({privateKey: request.privateKey}, request.id, EntryStatus.Verified)
    .then(entry => {
        return  res.json(entry);
    })
    .catch(err => {
        console.log(err);
        res.status(err.status ?? 500).json(err)
    })
});

export { router }