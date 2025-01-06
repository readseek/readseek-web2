import { ErrorImage, LoadingImage, LocalImage } from '@/components/ImageView';

export function ContentPending() {
    return (
        <div className="main-content">
            <LoadingImage />
        </div>
    );
}

export function ContentError() {
    return (
        <div className="main-content">
            <ErrorImage />
        </div>
    );
}

export function ConversationNone() {
    return (
        <div className="mt-16 h-72 w-1/2">
            <LocalImage file="chat_bot" />
            <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500">{'阁下还未与该内容产生过深入的交流...'}</h3>
        </div>
    );
}
