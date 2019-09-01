const fs = require('fs');
const path = require('path');
const util = require('util');

const config = require('config');
const marked = require('marked');
const renderer = new marked.Renderer();

const contentViewDir = global.BASEDIR + '/' + config.get('content.baseDir');
const contentSourceDir = config.get('content.sourceDir');
const contentRoutePath = contentSourceDir + '/routes.json';

var contentRoutes = require(contentRoutePath);

const fs_readFile = util.promisify(fs.readFile);
const fs_writeFile = util.promisify(fs.writeFile);
const fs_mkdir = util.promisify(fs.mkdir);

const originalLink = renderer.link;


// ******************
// internal functions
// ******************

renderer.link = function(href, title, text) {
    // generate the link by the original renderer
    let html = originalLink.call(this, href, title, text);

    // external links should be opened in a new tab
    if (['/', '#'].indexOf(href[0]) === -1 && href.indexOf('www.ivansherbs.com') === -1) {
        html = html.replace('<a href', '<a target="_blank" href');
    }

    return html;
};


fs.watchFile(contentRoutePath, (curr, prev) => {
    // TODO validation checks
    console.log(`Updating routes. Content route file changed: ${contentRoutePath}`);

    fs.readFile(contentRoutePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        try {
            exports.routes = contentRoutes = JSON.parse(data);
        } catch (err) {
            console.error(`Error while loading the new content routes from file: ${contentRoutePath}`);
            console.error(err);
        }
    });
});


// *******
// exports
// *******

exports.routes = contentRoutes;

exports.generatePage = async function(contentView) {

    let viewSourcePath = contentSourceDir + '/' + contentView.replace(/\.html$/, '.md');
    let viewDestinationPath = contentViewDir + '/' + contentView;

    try {
        let viewSourceText = await fs_readFile(viewSourcePath);
        await fs_mkdir(path.dirname(viewDestinationPath), { recursive: true });
        await fs_writeFile(viewDestinationPath, marked(viewSourceText.toString(), { renderer: renderer }));
    } catch (err) {
        console.error(err);
        throw err;
    }
};
