export interface Message {
    id: string; // 消息本身id
    cid: string; // 消息隶属内容的id
    input: string; // 输入信息
    output: string; // 响应信息
    timestamp: number; // 消息产生时间
    hot: number; // 热度，该消息出现过多少次
}
