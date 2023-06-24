import express, { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { GoogleAuthToken } from "./authentication";
import Joi from "joi";
import { validateParams } from "@tuukezu/joi-express";


const router = express.Router();
router.put('/:id/upload', (req, res) => {
    const auth = <GoogleAuthToken>GoogleAuthToken.verifyRequest(req, res);
    if(!auth) return;

    const params = Joi.object({
        id: Joi.string().required(),
    });

    const { id } = validateParams(req, res, params);
    if (!id) return;
    
    const { image } = req.files ?? {};
    if (!image) return res.status(400).json({ err: 'Missing attachment', status: 400 });

    console.log((<UploadedFile>image).mimetype);

    (<UploadedFile>image).mv(__dirname + '../../../static/' + id + '.webp');

    return res.status(200).json({ path: 'http://localhost:3000/static/' + id + '.webp' });
});


export {
    router
}