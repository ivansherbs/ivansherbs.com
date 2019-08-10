const fs = require('fs');
const path = require('path');
const util = require('util');

const config = require('config');
const marked = require('marked');

const contentViewDir = global.BASEDIR + '/' + config.get('content.baseDir');
const contentSourceDir = config.get('content.sourceDir');

const fs_readFile = util.promisify(fs.readFile);
const fs_writeFile = util.promisify(fs.writeFile);
const fs_mkdir = util.promisify(fs.mkdir);

exports.generatePage = async function(contentView) {

    let viewSourcePath = contentSourceDir + '/' + contentView.replace(/\.html$/, '.md');
    let viewDestinationPath = contentViewDir + '/' + contentView;

    try {
        let viewSourceText = await fs_readFile(viewSourcePath);
        await fs_mkdir(path.dirname(viewDestinationPath), { recursive: true });
        await fs_writeFile(viewDestinationPath, marked(viewSourceText.toString()));
    } catch (err) {
        console.error(err);
        throw err;
    }
};
