import { Md5 } from 'ts-md5';

export type MessageRole = 'bot' | 'user';

export const enum MessageAttitude {
    none = 0, // 不表态
    agree = 1, // 赞同
    oppose = -1, // 反对
}

export interface Message {
    id: string; // 消息id
    role: MessageRole; // 消息类型
    content: string; // 消息内容
    timestamp: number; // 消息产生时间 13位
    ma?: MessageAttitude; // 消息状态，用户消息没有状态
    rags?: string[] | null; // RAGs
}

export interface Conversation {
    id: number;
    name: string;
    cid: string; // 隶属内容的Id
    uid: number; // 用户Id（记录谁产生这条会话）
    gid: number; // 会话分组Id, -1表示没有分组
    createAt: number; // 会话产生时间，时间戳13位
    updateAt: number; // 会话再次更新时间，时间戳13位
    prompt: string;
    messages: Message[];
}

export function packingMessage(msg: Pick<Message, 'role' | 'content' | 'ma' | 'rags'>): Message {
    return {
        ...msg,
        id: msg.content && msg.content.trim().length ? Md5.hashStr(msg.content) : '响应失败，请稍后再试~',
        timestamp: new Date().getTime(),
    };
}
