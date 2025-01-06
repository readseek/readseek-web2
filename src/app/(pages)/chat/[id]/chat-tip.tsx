import { ErrorImage, LoadingImage } from '@/components/ImageView';

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
