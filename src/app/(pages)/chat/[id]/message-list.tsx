import { LocalImage } from '@/components/ImageView';
import { MessageType, MessageStatus, buildMessage, Message } from '@/models/Message';

interface MsgListProps {
    data: Message[];
    onFeedback?: (id: string) => void;
}

export function MessageList({ data, onFeedback }: MsgListProps) {
    if (!data || data.length === 0) {
        return (
            <div className="mt-16 h-72 w-1/2">
                <LocalImage file="chat_bot" />
                <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500">{'阁下还未与该内容产生过深入的交流...'}</h3>
            </div>
        );
    }

    return (
        <div className="no-scrollbar my-5 w-[75%] overflow-y-scroll">
            {data.map((m: Message, i: number) => {
                if (m.type === MessageType.In) {
                    return (
                        <div key={`in_${m.id}#${i}`} className="rounded-md bg-gray-100 p-4 text-right">
                            <span className="text-black">{m.text}</span>
                        </div>
                    );
                }
                return (
                    <div key={`out_${m.id}#${i}`} className="my-3 rounded-md bg-gray-200 p-4 text-left">
                        <span className="text-black">{m.text}</span>
                    </div>
                );
            })}
        </div>
    );
}
