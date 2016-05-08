function CallSearchExample(nodelist)
{
    var pythonShell = require('python-shell');

    //var list = [['13','12'],['4','7','10']];
    var options = {
        mode: 'text',
        args: nodelist
    };

    pythonShell.run('SearchEngineWrapperForNodejs.py', options, function(err, result){
        if(err) throw err;

        var obj = JSON.parse(result);
        console.log(obj);

        //console.log("pass number:", obj.length);
    });
}

var extractorModule = require('../extractor.js');
var extractor = new extractorModule.Extractor();

//-------------- search test ---------------------------
var linkerModule = require('../linker.js');
var linker = new linkerModule.Linker();
    
linker.searchQuery(['Bayer Leverkusen','Hannover 96'], function(result) {
    //console.log(result);
    var nodelist = [];

    for(var i=0;i<result.length;i++)
    {
        var tmp = [];
        for(var j=0;j<result[i].length;j++)
        {
            tmp.push(result[i][j]["node_id"]);
        }
        nodelist.push(tmp);
    }
    //console.log(nodelist);
    CallSearchExample([['fcb68966918b4bc2b58c68e4e9f364b9'],['d4a81e515163461c9085d730cf7e0a3a']]);
});
