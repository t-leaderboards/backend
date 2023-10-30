
import { host, port } from './secret.json';
import { MongoClient, MongoServerError } from 'mongodb';
import { Uuid, Entry, OrderBy, EntryStatus } from './schemas';
import { genereateHash } from '../authentication/cryptography';
import { getProject } from './projects';
import { createUser, getUser, login } from './users';

const url = `mongodb://${host}:${port}/t-leaderboards`;

/*
        getProject({ publicKey })
        .then(project => {

        })
        .catch(err => {
            return reject(err);
        })
*/


export function insertIntoLeaderboard(privateKey: Uuid, value: number, username: string, password: string | null) : Promise<Entry> {
    return new Promise(async (resolve, reject) => {
        getProject({ privateKey })
        .then(async project => {
            if (!project) return reject({ status: 400, err: 'Invalid privateKey' });

            login(project, username, password)
            .then(async user => {
                const entry: Entry = {
                    status: EntryStatus.Verified,
                    username: user.username,
                    user_id: user.id,
                    id: genereateHash(8),
                    value,
                    datetime: (new Date()).getTime(),
                }

                user.entries = [...user.entries, entry.id]

                const client = new MongoClient(url);
                client.connect();
            
                const db = client.db(project.name);
                const entries = db.collection('entries');
                const users = db.collection('user-schema');
        
                try {
                    await entries.insertOne(entry);
                    await users.replaceOne({ id: user.id }, user, { upsert: true });

                    return resolve(entry)
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


export function getEntries(query: object, order: OrderBy, offset: number, limit: number, verified: Boolean) : Promise<Entry[]> {
    return new Promise(async (resolve, reject) => {
        getProject(query)
        .then(async project => {
            if (!project) return reject({ status: 400, err: 'No such project exists' });

            const sort = order === OrderBy.Ascending ? 1 : -1;

            const client = new MongoClient(url);
            client.connect();
        
            const main = client.db(project.name);
            const entries = main.collection('entries');

            let pipeline = [
                {
                    $sort:{ 'value': sort }
                },
                {
                    $group: {
                        _id: '$username',
                        id: { $first: '$id' },
                        status: { $first: '$status' },
                        user_id: { $first: '$user_id' },
                        datetime: { $first: '$datetime' },
                        username: { $first: '$username' },
                        value: order === OrderBy.Ascending ? { $min: '$value' } : { $max: '$value' },
                    }
                }, 
                {
                    $sort:{ 'value': sort }
                }
            ]


            const list = <Entry[]><unknown>(await entries.aggregate(verified ? [{$match: { 'status': EntryStatus.Verified }}, ...pipeline] : pipeline)
            .skip(offset)
            .limit(limit)
            .project({'_id': 0})
            .toArray())

            return resolve(list);
        })
        .catch(err => {
            return reject(err);
        })
    })
}

export function getEntry(query: object, id: Uuid) : Promise<Entry | null> {
    return new Promise(async (resolve, reject) => {
        getProject(query)
        .then(async project => {
            if (!project) return reject({ status: 400, err: 'No such project exists' });

            const client = new MongoClient(url);
            client.connect();
        
            const db = client.db(project.name);
            const entries = db.collection('entries');
    
            try {
                const entry = <Entry |null>(await entries.findOne({ id }, { projection: { '_id': 0 }}));
                return resolve(entry);
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
    
}

export function setEntryStatus(query: object, id: Uuid, status: EntryStatus) : Promise<EntryStatus> {
    return new Promise(async (resolve, reject) => {
        getProject(query)
        .then(async project => {
            if (!project) return reject({ status: 400, err: 'No such project exists' });

            const client = new MongoClient(url);
            client.connect();
        
            const db = client.db(project.name);
            const entries = db.collection('entries');

    
            try {
                await entries.updateOne({ id }, { $set: { status }})
                return resolve(status);
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
    
}