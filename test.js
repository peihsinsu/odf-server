var fs = require('fs')
fs.readFile('map.json', 'UTF-8', function(e, d){ 
  var obj = JSON.parse(d);
  var fn = eval('fn='+obj.map)
  console.log(obj.map)
  console.log(fn.toString());
  fn("test");
});
