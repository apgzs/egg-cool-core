'use strict';

const os = require('os');

module.exports = {
    fileName(filePathName) {
        if (os.type().toLowerCase().includes('windows')) {
            return filePathName.substring(filePathName.lastIndexOf('\\') + 1, filePathName.lastIndexOf('.'))
        }
        return filePathName.substring(filePathName.lastIndexOf('/') + 1, filePathName.lastIndexOf('.'))
    }
};
