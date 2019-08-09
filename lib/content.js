const fs = require('fs');
const util = require('util');

const config = require('config');
const marked = require('marked');

const contentViewDir = global.BASEDIR + '/' + config.get('content.baseDir');
const contentSourceDir = config.get('content.sourceDir');

const fs_stat = util.promisify(fs.stat);
const fs_readFile = util.promisify(fs.readFile);
const fs_writeFile = util.promisify(fs.writeFile);

exports.generatePage = async function(contentView) {

    let viewSourcePath = contentSourceDir + '/' + contentView.replace(/\.html$/, '.md');
    let viewDestinationPath = contentViewDir + '/' + contentView;

    try {
        let viewSourceText = await fs_readFile(viewSourcePath);
        let dummy = await fs.writeFile(viewDestinationPath, marked(viewSourceText.toString()), (err) => {});
    } catch (err) {
        console.error(err);
        throw err;
    }
};
