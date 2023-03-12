const path = require('path');

module.exports = {
    entry: './src/portfolio.js',
    output: {
        filename: 'portfolio.js',
        path: path.resolve(__dirname, 'dist')
    }
};