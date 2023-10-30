import express from "express";
import cors from 'cors';

import { port } from '../config.json';

import { router as projects } from './routes/projects'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/projects', projects);

app.use('/', (req, res) => {
    res.json("https://github.com/t-leaderboards")
});


app.listen(port, async () => {
    console.log(`App listening on ${port}`);
})
