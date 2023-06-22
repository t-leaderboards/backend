import crypto from 'crypto';

export function genereateHash() : string {
    return crypto.randomBytes(16).toString('hex')
};