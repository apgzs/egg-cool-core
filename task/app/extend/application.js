'use strict';

module.exports = {
    fileName(filePathName) {
        return filePathName.substring(filePathName.lastIndexOf('/') + 1, filePathName.lastIndexOf('.'))
    }
};
