import express from "express";
import cors from 'cors';
import path from 'node:path';

import { router as auth } from './routes/authentication';
import { getGoogleAuthUrl } from "./authentication/google-auth";

import { router as sites } from './routes/sites';
import { router as blogs } from './routes/blogs';
import { router as images } from './routes/images';
import fileUpload from "express-fileupload";

const app = express();
const port = 3000;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

app.use('/auth', auth);
app.use('/api/sites', sites);
app.use('/api/blogs', blogs);
app.use('/api/blogs', images);

app.use('/static', express.static('static'));

// static file fallback
app.get('/static/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../static', 'placeholder.webp'), err => {
        if (err) return res.status(500);
        res.end();
    });
})


app.listen(port, () => {
    console.log(`App listening on ${port}`);
})
