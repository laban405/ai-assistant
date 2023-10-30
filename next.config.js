const {i18n} = require("./next-i18next.config");
const nextConfig = {
    // reactStrictMode: true,
    // output: 'standalone',
    swcMinify: true, images: {
        // disableStaticImages: true,
        domains: ['localhost', 'localhost:3000', 'oaidalleapiprodscus.blob.core.windows.net', 'nextai.s3.amazonaws.com', 'res.cloudinary.com'],
    }, i18n, webpack: (config, {isServer}) => {
        // fs module is not available in the browser
        if (!isServer) {
            config.resolve.fallback = {
                fs: false, path: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
