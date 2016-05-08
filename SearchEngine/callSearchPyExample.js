var pythonShell = require('python-shell');

var list = [['13','12'],['4','7','10']];
var options = {
    mode: 'text',
    args: list
};

pythonShell.run('SearchEngineWrapperForNodejs.py', options, function(err, result){
    if(err) throw err;

    var obj = JSON.parse(result);
    console.log(obj);

    console.log("pass number:", obj.length);
});
