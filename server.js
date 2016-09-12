var express = require('express')
  , routes = require('./routes')
  //, user = require('./routes/user')
  , _ = require('underscore')
  , http = require('http')
  , fs = require('fs')
  , util = require('util')
  , nu = require('nodeutil')
  , cfg = require('./lib/cfg')
  , log = nu.logger.getInstance('app.js')
  , path = require('path')
  , marked = require('marked')
  , partials = require('express-partials')
  , sitemap = require('./lib/sitemap');

var app = express();

app.use(partials());

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
// app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/tmp' }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('welcome', {title:'Open Data Framework'});
});

app.get('/odf/:data/:type', function(req, res, next){
  log.info('Got query event: %s', req.params.type);
  var d = getData(req.params.data);
  var data = d.data;
  var def = d.meta;
  def.title = 'Open Data Framework - ' + req.params.data;

  if(req.body.fields) {
    var arr = req.body.fields.split(',');
    data = _.map(data, function(doc) {
      return _.pick(doc, arr);
    });
  }

  switch(req.params.type) {
  case 'page':
    log.info('Page of %s, defaultPageSize:%s, block num:%s', req.params.data, cfg.defaultPageSize, req.body.p);
    def.curr = req.query.p;
    def.pages = Math.floor(data.length / cfg.defaultPageSize);
    log.info('Data length %s, pages: %s', data.length, def.pages);

    data = pick(data, cfg.defaultPageSize, req.query.p | 0); 
    def.data = jsonArrToTable(data); 

    //log.info(jsonArrToTable(data));
    res.render('index', def);
    break;
  case 'json':
    def.data = data;
    res.send(def); 
    break;
  case 'field':
    res.send(_.keys(data[0]));
    break;
  case 'download':
    var data_path = __dirname + '/data/' + req.params.data + '/data.json';
    res.download(data_path); 
    break;
  default:
    res.send(404);
  }
});

app.get('/sitemap', function(req, res, next) {
  sitemap.toSiteMap(function(r){
    res.end(r);
  });
});

app.post('/odf/map/:data', function(req, res, next){
  log.info(req.body);
  var obj = req.body; 
  log.info(obj.map);
  var fn = eval('fn=' + obj.map);
  log.warn(fn.toString());
  
  var d = getData(req.params.data);
  d.map = _.map(d.data, fn);
  d.map = _.compact(d.map);
  res.send(d.map);
});

app.get('/odf/datasets', function(req, res){
  if(req.body.detail)
    res.send(200, getDatasets(true));
  else  
    res.send(200, getDatasets());
});

app.post('/odf/upload/file/:name', function(req, res){
  var tmp_path = req.files.filedata.path;
  var filename = req.files.filedata.name;
  var truepath = __dirname + '/data/' + req.params.name;
  console.log('Upload file: %s to path: %s', filename, tmp_path);
  fs.rename(tmp_path, truepath, function(err) {
    if (err) throw err;
    fs.unlink(tmp_path, function(err) {
      if (err) throw err;
      res.send(200, {code:200, msg:'File uploaded to: ' + truepath + ' - ' + req.files.filedata.size + ' bytes'});
    });
  });
});

/**
 * 新檔案上傳
 * ex: curl $SERVER/odf/upload/Test -T data/GetAnimals/data.json -X POST -H 'Content-Type:application/json'
 */
app.post('/odf/upload/:name', auth, function(req, res, next){
  var data = req.body
    , name = req.params.name
    , meta = {};

  meta.name = name;
  //basic check: 1. data not null, 2. is a object, 3. is an array
  if(data && _.isObject(data) && _.isArray(data)) {
    var folder = __dirname + '/data/' + name;
    var data_path = folder + '/data.json';
    var meta_path = folder + '/package.json';
    if(fs.existsSync(folder) || fs.existsSync(meta_path)) {
      res.send(400, {status: 400, err: "FILEEXIST", msg: "data already exist!"});
    } else {
      fs.mkdir(folder, function(e){
        if(e) {
          log.error(e);
          res.send(500, {status: 500, err: "DIRCREATEERR", msg: "directory create error!", error: e});
        } else {
          fs.writeFileSync(data_path, JSON.stringify(data), "UTF-8");           
          fs.writeFileSync(meta_path, JSON.stringify(meta), "UTF-8"); 
          res.send(200, {status:200, msg: "done"});
        }
      });
    }
  } else {
    res.send(404, {status: 404, err: "DATAERR", msg: "data not found or format error"});
  }
  //TODO: 1. namespace check, 2. data check, 3. error code and status define
})

function handleUpload(fname, data){
  var meta = {};
  meta.name = fname;
  //basic check: 1. data not null, 2. is a object, 3. is an array
  if(data && _.isObject(data) && _.isArray(data)) {
    var folder = __dirname + '/data/' + name;
    var data_path = folder + '/data.json';
    var meta_path = folder + '/package.json';
    if(fs.existsSync(folder) || fs.existsSync(meta_path)) {
      res.send(400, {status: 400, err: "FILEEXIST", msg: "data already exist!"});
    } else {
      fs.mkdir(folder, function(e){
        if(e) {
          log.error(e);
          res.send(500, {status: 500, err: "DIRCREATEERR", msg: "directory create error!", error: e});
        } else {
          fs.writeFileSync(data_path, JSON.stringify(data), "UTF-8");           
          fs.writeFileSync(meta_path, JSON.stringify(meta), "UTF-8"); 
          res.send(200, {status:200, msg: "done"});
        }
      });
    }
  } else {
    res.send(404, {status: 404, err: "DATAERR", msg: "data not found or format error"});
  }
}

function jsonArrToTable(arr){
  var TRs = '';
  for(var i = 0 ; i< arr.length ; i++){
    var row = arr[i];
    var TR = '<tr>';
    var keys = Object.keys(row);
    for(var j = 0 ; j < keys.length ; j++) {
      var rowvalue = row[keys[j]];
      //Reformat output data
      if(rowvalue && rowvalue.startsWith && rowvalue.startsWith('http') && rowvalue.endsWith('.jpg')) {
        rowvalue = '<img width="50px"  src="' + rowvalue + '"/>'
      } 
      TR += ('<td>' + rowvalue + '</td>' );
    }
    TR+= '</tr>';
    TRs += TR;
  }
  return '<table>' + TRs + '</table>';
}

app.get('/api', function(req, res){
  var body = mkup(fs.readFileSync(__dirname + '/mdfiles/api.md', 'UTF-8'));
  log.info(body);
  res.render('index', {
    title: 'OpenDataFramework API Document', 
    keyword: 'API,ODF,Open Data',
    description: 'OpenDataFramework API Document',
    data: body
  });
});

function mkup(txt) {
  if(!txt || txt == '') return '';
  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    langPrefix: 'language-',
    highlight: function(code, lang) {
      if (lang === 'js') {
        return highlighter.javascript(code);
      }
      return code;
    }
  });
  return marked(txt);
}

function pick(data, ps,  num) {
  var out = new Array();
  log.info('ps:%s, num:%s, start:%s, end: %s', ps, num, ps*num, ps*num + ps -1);
  for(var i = ps*num; i < ps*num + ps -1 ; i++) {
    out.push(data[i]);
  }
  return out;
}

function getData(name){
  var def_path = __dirname + '/data/' + name + '/package.json';
  var data_path = __dirname + '/data/' + name + '/data.json';
  var def = JSON.parse(fs.readFileSync(def_path, 'utf-8'));
  var data = JSON.parse(fs.readFileSync(data_path, 'utf-8'));
  return {
    meta: def, data: data
  }
}

function auth(req, res, next) {
  console.log(req.headers);
  if(req.headers && req.headers.authorization) {
    if(req.headers.authorization == 'demo') {
      next();
    } else {
      log.info('has info, not demo...value:' + req.headers.authorization);
      res.send(301, {status:301, msg: "not authorized"});
    }
  } else {
    log.info('no header..');
    res.send(301, {status:301, msg: "not authorized"});
  }
}

function getDatasets(gotDetail){
  var data_path = __dirname + '/data';
  var datasets = fs.readdirSync(data_path);
  if(gotDetail) {
    var out = {};
    for(var i = 0 ; i < datasets.length ; i++){
      var meta_path = __dirname + '/data/' + datasets[i] + '/package.json';
      var def = JSON.parse(fs.readFileSync(meta_path, 'utf-8'));
      out[datasets[i]] = def;
    }
    return out;
  } else {
    return datasets;
  }
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
