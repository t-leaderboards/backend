import { host, port } from './secret.json';
import { MongoClient, MongoServerError } from 'mongodb';
import { Uuid, Site, Tag, Blog } from './schemas';
import { genereateHash } from '../authentication/cryptography';
import { func } from 'joi';

const url = `mongodb://${host}:${port}/google-auth`;

export function createBlog(auth: string, site: Uuid, title: string, description: string, content: string, tags: Uuid[]) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const hash = genereateHash();

        const blog: Blog = {
            id: hash,
            'site-id': site,
            title,
            description,
            content,
            public: false,
            tags,
            published: null,
            edited: null,
        };
    
        const db = client.db('do-it-myself');
        //const users = db.collection('user-schema');
        const blogs = db.collection('blogs');

        try {
            await blogs.insertOne(blog);
            return resolve(hash);
        } catch (err) {
            return reject(err);
        }
    })
}

function getBlog(auth: string, id: Uuid) : Promise<Blog | null> {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);
        client.connect();

        const hash = genereateHash();
    
        const db = client.db('do-it-myself');
        //const users = db.collection('user-schema');
        const blogs = db.collection('blogs');

        try {
            const blog = <Blog | null>(await blogs.findOne({'id': id}));
            return resolve(blog);
        } catch (err) {
            return reject(err);
        }
    })
}

export function publishBlog(auth: string, id: Uuid) {
    return new Promise((resolve, reject) => {
        getBlog(auth, id)
        .then(async blog => {
            if(!blog) return;
    
            blog['public'] = true;
    
            const client = new MongoClient(url);
            client.connect();
        
            const db = client.db('do-it-myself');
            //const users = db.collection('user-schema');
            const blogs = db.collection('blogs');
    
            try {
                await blogs.replaceOne({'id': id}, blog);
                return resolve(id);
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
}

export function unpublishBlog(auth: string, id: Uuid) {
    return new Promise((resolve, reject) => {
        getBlog(auth, id)
        .then(async blog => {
            if(!blog) return;
    
            blog['public'] = false;
    
            const client = new MongoClient(url);
            client.connect();
        
            const db = client.db('do-it-myself');
            //const users = db.collection('user-schema');
            const blogs = db.collection('blogs');
    
            try {
                await blogs.replaceOne({'id': id}, blog);
                return resolve(id);
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
}

export function updateBlog(auth: string, id: Uuid, title: string, description: string, content: string, tags: Uuid[]) {
    return new Promise(async (resolve, reject) => {
        getBlog(auth, id)
        .then(async blog => {
            if(!blog) return;

            const client = new MongoClient(url);
            client.connect();

    
            const update: Blog = {
                id,
                'site-id': blog['site-id'],
                title,
                description,
                content,
                public: blog['public'],
                tags,
                published: blog['published'],
                edited: (new Date()).getTime()
            };
        
            const db = client.db('do-it-myself');
            //const users = db.collection('user-schema');
            const blogs = db.collection('blogs');
    
            try {
                await blogs.replaceOne({'id': id}, update);
                return resolve(id);
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
}