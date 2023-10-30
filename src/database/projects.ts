
import { host, port } from './secret.json';
import { MongoClient, MongoServerError } from 'mongodb';
import { Uuid, Project, ProjectInfo } from './schemas';
import { genereateHash } from '../authentication/cryptography';

const url = `mongodb://${host}:${port}/t-leaderboards`;

export function createProject(name: string) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const publicKey = genereateHash(16);
        const privateKey = genereateHash(24);

        const project: Project = {
            name,
            privateKey,
            require_login: false
        };
    
        const main = client.db('t-leaderboards');
        const projects = main.collection('projects');

        const db = client.db(name);

        try {
            await projects.insertOne(project);
            await db.createCollection('user-schema');
            await db.createCollection('entries');

            return resolve({ privateKey, publicKey });
        } catch (err) {
            return reject(err);
        }
    })
}

export function getProject(query: object) : Promise<Project | null> {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();
    
        const main = client.db('t-leaderboards');
        const projects = main.collection('projects');

        try {
            const leaderboard = <Project | null>(await projects.findOne(query, { projection: { '_id': 0 }}));
            return resolve(leaderboard);
        } catch (err) {
            return reject(err);
        }
    })
}

export function getProjectInfo(query: object) : Promise<ProjectInfo | null> {
    return new Promise(async (resolve, reject) => {
        getProject(query)
        .then(async project => {
            if (!project) return resolve(null);

            const client = new MongoClient(url);
            client.connect();

            const db = client.db(project.name);
            const leaderboards = db.collection('entries');
            const users = db.collection('user-schema');

            try {
                const result: ProjectInfo = {
                    name: project.name,
                    require_login: project.require_login,
                    entries_count: await leaderboards.countDocuments({}),
                    users_count: await users.countDocuments({})
                }
    
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
}