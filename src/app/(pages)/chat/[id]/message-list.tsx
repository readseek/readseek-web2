import { LocalImage } from '@/components/ImageView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        <div className="no-scrollbar my-5 w-[70%] overflow-y-scroll">
            {data.map((m: Message, i: number) => {
                if (m.type === MessageType.In) {
                    return (
                        <div key={`in_${m.id}#${i}`} className="mb-3 flex w-full flex-row items-center justify-end">
                            <div className="rounded-md bg-blue-50 px-2 pt-1 text-right">
                                <div className="text-base text-black">{m.text}</div>
                                <div className="mt-2 text-xs font-light italic">{new Date(m.timestamp).toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <Avatar className="ml-4">
                                    <AvatarImage src={'https://tangkunyin.com/images/avatar.webp'} alt={`@user`} />
                                    <AvatarFallback>avatar</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={`out_${m.id}#${i}`} className="mb-3 flex flex-row items-center justify-start" style={{ width: 'calc(100% - 3.5rem)' }}>
                        <div className="mr-4 aspect-square h-10 w-10">
                            <LocalImage file="conference_speaker" />
                        </div>
                        <div className="w-full rounded-md bg-gray-100 px-2 pt-1 text-left">
                            <div className="text-base text-black">{m.text}</div>
                            <div className="mt-2 text-xs font-light italic">{new Date(m.timestamp).toLocaleString()}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
