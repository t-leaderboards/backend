import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Hash } from '../database/schemas';

export function genereateHash(len: number) : string {
    return crypto.randomBytes(len).toString('hex')
};

export function encryptPassword(password: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return reject(err);

            return resolve(hash);
        });
    })
};

export function comparePassword(password: string, hash: Hash) : Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) return reject(err);

            return resolve(result);
        });
    })
};