import axios from 'axios';
import { google } from 'googleapis';
import { GoogleCLientID, GoogleClientSecret, GoogleClientCallback } from '../../config.json';

export interface GoogleProfile {
    id: string,
    email: string,
    verified_email: boolean,
    name?: string,
    given_name?: string,
    family_name?: string,
    locale?: string,
    picture?: string,
    hd?: string
}

export const oauth2Client = new google.auth.OAuth2(
    GoogleCLientID,
    GoogleClientSecret,
    GoogleClientCallback
);

export function getGoogleAuthUrl(): string | undefined {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
    });
}

export function getGoogleUser(code: string) : Promise<GoogleProfile> {
    return new Promise(async (resolve, reject) => {
        const { tokens } = await oauth2Client.getToken(code).then(res => res).catch(err => null) || {};

        if(!tokens) {
            return reject({err: "Authentication failed - Failed to generate tokens", status: 400});
        }

        axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${tokens.id_token}`,
                }
            }
        )
        .then(res => {
            switch (res.status) {
                case 200:
                    return resolve(res.data);
                default:
                    return reject({err: `Authentication failed - Google responded with status ${res.status}`, status: res.status});
            }
        })
        .catch(err => {
            return reject({err: "Failed to connect to Google's API's", status: 404});
        })
    });
}

