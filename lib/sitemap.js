/**
 * Example:
 * wg-sitemap -m ../micloud.github.com/mdfiles/ -o ../micloud.github.com/site-map.xml
 */
var fs = require('fs')
  , nu = require('nodeutil')
  , util = require('util')
  , _ = require('underscore')
  , cfg = require('./cfg')
  , log =  nu.logger.getInstance('sitemap.js');


// Site map template layout
var tpl = '<?xml version="1.0" encoding="UTF-8"?> <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> %s </urlset>'; 

// Site map subset layout
var map = '<url><loc>%s</loc></url>';

/**
 * Convert mdfiles to site map format
 */
exports.toSiteMap = function(cb){
  var maps = '';
  fs.readdir(__dirname + '/../data/', function(e, files) {
    log.info('>>>>' + files.length);
    files.forEach(function(file, i) {
      console.log('Processing of %s: %s', i, file);
      if(true) {
        //maps += util.format(map, 'http://doc.micloud.tw/index.html?page='+file);
        maps += util.format(map, cfg.server.url + '/odf/' + file + '/page');
        maps += util.format(map, cfg.server.url + '/odf/' + file + '/json');
        maps += util.format(map, cfg.server.url + '/odf/' + file + '/download');
      }
    });

    var out = util.format(tpl, maps);
    cb(out);
  });
}

