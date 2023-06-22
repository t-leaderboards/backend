import { Timestamp } from "mongodb";

export type Uuid = string;
export type DateTime = number;
export type Html = string;

export interface User {
    'id': Uuid,
    'login-history': DateTime[],
    'access-list': Access[]
}

export enum Role {
    Administrator = "ADMIN",
    Member = "MEMBER"
}

export interface Access {
    'id': Uuid,
    'role': Role
}

export interface Site {
    'id': Uuid,
    'name': string,
    'tags': Tag[],
    'entries': Blog[]
}

export interface Tag {
    'id': Uuid,
    'site-id': Uuid,
    'label': Uuid
}

export interface Blog {
    'id': Uuid,
    'public': boolean,
    'site-id': Uuid, 
    'title': string,
    'description': string,
    'content': Html,
    'tags': Uuid[],
    'published': DateTime | null,
    'edited': DateTime | null
}

export function formatTimestamp(timestamp: DateTime) : string {
    const d = new Date(timestamp);

    const date = d.toLocaleString('Fi-fi', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });

    const time = d.toLocaleString('Fi-fi', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `${date} klo ${time}`;
}

/*

export type Uuid = string;
export type DateTime = number;
export type PostRecord = Uuid;

export interface CommentRecord {
    comment: Uuid,
    post: Uuid
}

export enum Permission {
    Post = 'POST',
    Comment = 'COMMENT',
    Report = 'REPORT',
    ManageChannels = 'MANAGE_CHANNELS',
    ManagePosts = 'MANAGE_POSTS',
    ManageUsers = 'MANAGE_USERS'
}

export enum Visibility{
    Public = 'PUBLIC',
    Pending = 'PENDING',
    Deleted = 'DELETED',
}

export enum Report {

}

export interface User {
    'id': Uuid,
    'permissions': Permission[],
    'login-history': DateTime[],
    'channels': Uuid[],
    'posts': PostRecord[],
    'comments': CommentRecord[],
}

export interface Channel {
    'id': Uuid,
    'label': string,
    'posts': number,
    'members': number,
}

export interface Post {
    'id': Uuid,
    'visibility': Visibility,
    'channel': Uuid,
    'channel-label'?: string,
    'timestamp': DateTime,
    'content': string,
    'upvotes': Uuid[],
    'downvotes': Uuid[],
    'comments': Comment[],
    'reports': Report[],
}

export function formatPost(post: Post) {
    return {
        id: post.id,
        timestamp: formatTimestamp(post.timestamp),
        content: post.content,
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
    }
}

export interface Comment {
    'id': Uuid,
    'visibility': Visibility,
    'timestamp': DateTime,
    'content': string,
    'refer'?: Uuid,
    'upvotes': Uuid[],
    'downvotes': Uuid[],
    'reports': Report[]
}

export function formatComment(comment: Comment) {
    return {
        timestamp: formatTimestamp(comment.timestamp),
        content: comment.content,
        upvotes: comment.upvotes.length,
        refer: comment.refer ?? undefined,
        downvotes: comment.downvotes.length,
    }
}

export function formatTimestamp(timestamp: number) : string {
    const d = new Date(timestamp);

    const date = d.toLocaleString('Fi-fi', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });

    const time = d.toLocaleString('Fi-fi', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `${date} klo ${time}`;
}

*/