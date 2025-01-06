import { Md5 } from 'ts-md5';

export const enum MessageType {
    In = 0, // 用户输入
    Out, // 后台响应
}

export const enum MessageStatus {
    default = 0,
    agree = 1, // 赞同
    reject = -1, // 反对
}

export interface Message {
    id: string; // 消息id
    text: string; // 消息内容
    type: MessageType; // 消息类型
    status: MessageStatus; // 消息状态
    cid: string; // 隶属内容的id
    uid: number; // 用户信息
    timestamp: number; // 消息产生时间 13位
    rags?: string[] | null; // RAGs
}

export function buildMessage(msg: Pick<Message, 'text' | 'type' | 'status' | 'cid' | 'uid' | 'rags'>): Message {
    return {
        ...msg,
        id: Md5.hashStr(msg.text),
        timestamp: new Date().getTime(),
    };
}
