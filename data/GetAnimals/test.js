var fs = require('fs');

var data = fs.readFileSync('data.json', 'utf8');
data = JSON.parse(data);
//console.log(data);
//console.log(data.join('\n'));

var job = {
  toLineJson: function(){
    var out = '';
    for(var i = 0 ; i < data.length ; i++){
      var d = data[i];
      out = out + JSON.stringify(d) + '\n';
    }
    console.log(out);
  }, 
  toBqSchema: function(){
    var keys = Object.keys(data[0]);
    var out = '';
    for(var i = 0 ; i < keys.length ; i++){
      var d = keys[i];
      out += d + ":" + typeof(d);
      if(i < keys.length -1) out += ', ';
    }
    console.log(out);
  }
}

job.toBqSchema();
