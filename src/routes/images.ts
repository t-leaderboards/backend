import express, { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";


const router = express.Router();
router.post('/upload', (req, res) => {
    const { image } = req.files ?? {};
    if (!image) return res.status(400).json({ err: 'Missing attachment', status: 400 });

    //console.log((<UploadedFile>image).mimetype);

    (<UploadedFile>image).mv(__dirname + '../../../static/' + (<UploadedFile>image).name);

    return res.status(200).json({ success: true });
});


export {
    router
}