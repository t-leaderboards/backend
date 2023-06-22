import { host, port } from './secret.json';
import { MongoClient, MongoServerError } from 'mongodb';
import { User } from './schemas';

const url = `mongodb://${host}:${port}/google-auth`;

export function login(id: string) {
    return new Promise(async (resolve, reject) : Promise<User | void> => {
        const client = new MongoClient(url);
        client.connect();
    
        const db = client.db('do-it-myself');
        const query = { id: id };
        const collection = db.collection('user-schema');
        
        try {
            const user = <User | null>(await collection.findOne(query));
            
            if (!user) {
                const data: User = {
                    'id': id,
                    'login-history': [Date.now()],
                    'access-list': []
                }
                
                await collection.insertOne(data);
                
                client.close();
                return resolve(data);
            }
            
            const history = user['login-history'].length >= 10 ? user['login-history'].slice(1) : user['login-history'];
            const update = { $set: { 'login-history': [...history, Date.now()] } };

            await collection.updateOne(query, update);

            client.close();
            return resolve(user);

        } catch (e) {
            return reject(e);
        }
    })
}

export function getUser(auth: string) : Promise<User | null> {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();
    
        const db = client.db('do-it-myself');
        const users = db.collection('user-schema');

        try {
            const site = <User | null>(await users.findOne({ 'id': auth }));
            return resolve(site);
        } catch (err) {
            return reject(err);
        }
    })
}