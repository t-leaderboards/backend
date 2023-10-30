import express from "express";
import cors from 'cors';

import { router as projects } from './routes/projects'

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/projects', projects);


app.listen(port, async () => {
    console.log(`App listening on ${port}`);
})
