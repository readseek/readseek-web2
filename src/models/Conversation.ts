import { Md5 } from 'ts-md5';

// @ts-ignore
// https://github.com/prisma/studio/issues/614
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

export type MessageRole = 'bot' | 'human';

export interface Message {
    id: string; // 消息id
    role: MessageRole; // 消息类型
    content: string; // 消息内容
    timestamp: string; // 消息产生时间 13位
    rags?: string[] | null; // RAGs
    option?: Record<string, any>; // 对消息的操作，点赞、分享、收藏等(保留字段)
    conversationId?: string; // 会话id
}

export interface Conversation {
    id: string; // 会话id(uuid，数据库自动生成)
    name: string; // 会话名称
    cid: string; // 隶属内容的Id
    uid: number; // 用户Id（记录谁产生这条会话）
    gid: number; // 会话分组Id, -1表示没有分组
    prompt: string;
    messages: Message[];
    createAt: string; // 会话产生时间，时间戳13位
    updateAt: string; // 会话再次更新时间，时间戳13位
}

export function createMessageEntity(msg: Pick<Message, 'role' | 'content' | 'rags'>): Message {
    const timestamp = `${Date.now()}`;
    if (!msg.content || msg.content.trim().length === 0 || msg.content === 'null' || msg.content === 'undefined') {
        msg.content = '抱歉，没太明白你的意思，请重再试~';
    }
    return {
        ...msg,
        timestamp,
        id: Md5.hashStr(`${timestamp}: ${msg.content}`) as string,
        rags: msg.rags ?? [],
    };
}
