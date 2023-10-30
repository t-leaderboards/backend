
import { host, port, user, password } from './secret.json';
import { MongoClient, MongoServerError } from 'mongodb';
import { Uuid, Project, User, UserType, EntryStatus } from './schemas';
import { comparePassword, encryptPassword, genereateHash } from '../authentication/cryptography';
import { getProject } from './projects';

const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT`;



export function login(project: Project, username: string, password: string | null): Promise<User> {
    return new Promise(async (resolve, reject) => {
        getUser(project, { username })
        .then(async user => {
            if (!user) return resolve(await createUser(project, username, password));

            const success = !(!user.password) ? await comparePassword(<string>password, user.password) : true
            if (!success) return reject({ status: 401, err: 'invalid credentials' });

            return resolve(user);
        })
        .catch(err => {
            return reject(err);
        })
    })
}


export function createUser(project: Project, username: string, password: string | null) : Promise<User> {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();
    
        const db = client.db(project.name);
        const users = db.collection('user-schema');

        const hash: string | null = !password ? null : await encryptPassword(<string>password)
        if (project.require_login && !hash) return reject({ status: 400, err: '\"password\" is required' });

        const user: User = {
            username,
            id: genereateHash(16),
            type: project.require_login ? UserType.Registered : UserType.Unregistered,
            password: project.require_login ? hash : null,
            entries: [],
            created: (new Date()).getTime()
        }

        try {
            await users.insertOne(user);
            return resolve(user);
        } catch (err) {
            return reject(err);
        }
    })
}


export function getUser(project: Project, query: object) : Promise<User | null> {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();
    
        const db = client.db(project.name);
        const users = db.collection('user-schema');

        try {
            const user = <User |null>(await users.findOne(query));
            return resolve(user);
        } catch (err) {
            return reject(err);
        }
    })
}

export function getUsers(privateKey: string, offset: number, limit: number) : Promise<User[]> {
    return new Promise(async (resolve, reject) => {
        getProject({ privateKey })
        .then(async project => {
            if (!project) return reject({ status: 400, err: 'No such project exists' });

            const client = new MongoClient(url);
            client.connect();
        
            const main = client.db(project.name);
            const users = main.collection('user-schema');
            
            const list = <User[]><unknown>(users.find({}).skip(offset).limit(limit).project({'_id': 0, 'password': 0})).toArray();
            return resolve(list);
        })
        .catch(err => {
            return reject(err);
        })
    })
}

export function setUserSubmissionsStatus(privateKey: string, query: object, status: EntryStatus) : Promise<EntryStatus> {
    return new Promise(async (resolve, reject) => {
        getProject({ privateKey })
        .then(async project => {
            if (!project) return reject({ status: 400, err: 'No such project exists' });

            getUser(project, query) 
            .then(async user => {
                if (!user) return reject({ status: 400, err: 'No such user exists' });

                const client = new MongoClient(url);
                client.connect();
            
                const db = client.db(project.name);
                const entries = db.collection('entries');
        
                try {
                    await entries.updateMany({ user_id: user.id }, { $set: { status }})

                    return resolve(status)
                } catch (err) {
                    return reject(err);
                }

            })
            .catch(err => {
                return reject(err);
            })
        })
        .catch(err => {
            return reject(err);
        })
    })
}