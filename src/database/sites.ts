import { host, port } from './secret.json';
import { MongoClient, MongoServerError } from 'mongodb';
import { Uuid, Site, Tag, User } from './schemas';
import { genereateHash } from '../authentication/cryptography';
import { getUser } from './users';

const url = `mongodb://${host}:${port}/google-auth`;

export function createSite(auth: string, name: string) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const hash = genereateHash();

        const site: Site = {
            id: hash,
            name,
            entries: [],
            tags: [],
        };
    
        const db = client.db('do-it-myself');
        //const users = db.collection('user-schema');
        const sites = db.collection('sites');

        try {
            await sites.insertOne(site);
            return resolve(hash);
        } catch (err) {
            return reject(err);
        }
    })
}

export function createTag(auth: string, site: Uuid, label: string) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const hash = genereateHash();

        const tag: Tag = {
            id: hash,
            'site-id': site,
            label
        };
    
        const db = client.db('do-it-myself');
        const sites = db.collection('sites');

        try {
            await sites.updateOne({ 'id': site}, { $push: { 'tags': tag } });
            return resolve(hash);
        } catch (err) {
            return reject(err);
        }
    })
}

export function removeTag(auth: string, site: Uuid, tag: Uuid) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const hash = genereateHash();
    
        const db = client.db('do-it-myself');
        const sites = db.collection('sites');

        try {
            await sites.updateOne({ 'id': site}, { $pull: { 'tags': { 'id': tag } } });
            return resolve(hash);
        } catch (err) {
            return reject(err);
        }
    })
}

function getSite(auth: string, id: Uuid) : Promise<Site | null> {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const hash = genereateHash();
    
        const db = client.db('do-it-myself');
        const sites = db.collection('sites');

        try {
            const site = <Site | null>(await sites.findOne({ 'id': id}));
            return resolve(site);
        } catch (err) {
            return reject(err);
        }
    })
}

export function getSites(auth: string) {
    return new Promise((resolve, reject) => {
        getUser(auth)
        .then(async user => {
            if (!user) return;
            
            const client = new MongoClient(url);
            client.connect();
        
            const db = client.db('do-it-myself');
            const sites = db.collection('sites');

            const projection = {
                '_id': 0,
                'id': 1,
                'name': 1,
            }
    
            try {
                const list = (await sites.find({'id': { $in: user['access-list'].map(site => site.id) }}, { projection }).toArray());
                console.log(list);
                return resolve(list);
            } catch (err) {
                return reject(err);
            }
            
        })
        .catch(err => {
            return reject(err);
        })

    });
}

export function getTags(auth: string, id: Uuid) {
    return new Promise(async (resolve, reject) => {
        getSite(auth, id)
        .then(site => {
            return resolve((<Site>site).tags);
        })
        .catch(err => {
            return reject(err);
        })
    })
}

export function getBlogs(auth: string, id: Uuid) {
    return new Promise(async (resolve, reject) => {
        getSite(auth, id)
        .then(site => {
            const blogs = (<Site>site).entries.map(blog => ({title: blog.title, description: blog.description}));
            return resolve(blogs);
        })
        .catch(err => {
            return reject(err);
        })
    })
}