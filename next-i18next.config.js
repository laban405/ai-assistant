// @ts-check

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
    // https://www.i18next.com/overview/configuration-options#logging
    // debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    keySeparator: false,
    nsSeparator: false,
    i18n: {
        defaultLocale: 'en', locales: ['en'],
    },
    /** To avoid issues when deploying to some paas (vercel...) */
    localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
    reloadOnPrerender: process.env.NODE_ENV === 'development', // saveMissing: false,
    // strictMode: true,
    // serializeConfig: false,
    // react: { useSuspense: false }
};