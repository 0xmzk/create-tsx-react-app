// require path
const path = require('path');

const createPath = (relativePath) => {
    return path.join(process.cwd(), relativePath);
}

module.exports = {
    appEntry: createPath('./src/index.tsx'),
    appIndexHtml: createPath('./src/index.html'),
    appStatic: createPath('./public/'),
    appBuild: createPath('./build/'),
    devConfig: {
        tsconfigJson: createPath('./config/tsconfig.dev.json'),
    },
    prodConfig: {
        tsconfigJson: createPath('./config/tsconfig.prod.json'),
    }
}