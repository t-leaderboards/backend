import express from "express";
import cors from 'cors';

import { router as auth } from './routes/authentication';
import { getGoogleAuthUrl } from "./authentication/google-auth";

import { router as sites} from './routes/sites';
import { router as blogs} from './routes/blogs';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', auth);
app.use('/api/sites', sites);
app.use('/api/blogs', blogs);

app.listen(port, () => {
    console.log(`App listening on ${port}`);
})
