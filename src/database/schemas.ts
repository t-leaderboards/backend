
export type Uuid = string;
export type Hash = string;
export type DateTime = number;

export interface Project {
    'name': string,
    'privateKey': Uuid,
    'require_login': Boolean
}

export interface ProjectInfo {
    'name': string,
    'require_login': Boolean,
    'entries_count': Number,
    'users_count': Number
}

export interface User {
    'username': string,
    'id': Uuid,
    'type': UserType,
    'password': Hash | null,
    'entries': Uuid[],
    'created': DateTime,
}

export interface Entry {
    'status': EntryStatus,
    'username': string,
    'user_id': Uuid,
    'id': Uuid,
    'value': number,
    'datetime': DateTime,
}

export enum EntryStatus {
    Verified = 'VERIFIED',
    Unverified = 'UNVERIFIED'
}

export enum UserType {
    Unregistered = 'UNREGISTERED',
    Registered = 'REGISTERED',
}

export enum OrderBy {
    Ascending = 'ASC',
    Descending = 'DESC'
}

export enum Format {
    Json = 'JSON',
    Pipe = 'PIPE',
    CSV = 'CSV'
}
