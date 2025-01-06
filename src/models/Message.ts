export enum MessageType {
    In = 0, // 用户输入
    Out, // 后台响应
}

export interface Message {
    id: number; // 消息id
    cid: string; // 隶属内容的id
    type: MessageType; // 消息类型
    text: string; // 消息内容
    approve: boolean; // true: 赞同, false 反对
    timestamp: number; // 消息产生时间
    rags?: string[]; // RAGs
    uid?: number[]; // 用户信息
}
