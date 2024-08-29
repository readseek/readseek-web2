import path from 'path';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    i18n: {
        defaultLocale: 'zh',
        locales: ['en', 'zh'],
    },
    localePath:
        typeof window === 'undefined'
            ? path.resolve('./public/locales')
            : '/public/locales',
    ns: ['common'],
}

