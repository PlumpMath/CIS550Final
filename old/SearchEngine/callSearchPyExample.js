
//var extractorModule = require('../extractor.js');
//var extractor = new extractorModule.Extractor();

//-------------- search test ---------------------------
var linkerModule = require('../linker.js');
var linker = new linkerModule.Linker();
    
linker.searchQuery(['Bayer Leverkusen','Hannover 96'], function(result) {
    //console.log(result);
    var nodelist = [];

    if (result.length == 1) // tree search
    {
        var searchModule = require("./SearchEngine.js");
        var search = new searchModule.Search();
        search.StartConnection();
        console.log(result);

        search.SearchQuery(result, function (searchResult) {
            

            console.log(searchResult);
            search.EndConnection();
        });

    }
    else if(result.length == 2) // bidirectional bfs
    {
        for(var i=0;i<result.length;i++)
        {
            var tmp = [];
            for(var j=0;j<result[i].length;j++)
            {
                tmp.push(result[i][j]["vertex_id"]);
            }
            nodelist.push(tmp);
        }
        CallSearchBidirectionalBFS(nodelist);
    }

    console.log(nodelist);
    
});

function CallSearchBidirectionalBFS(nodelist)
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
        var jsonfile = require('jsonfile')
        var file = './data.json'
        jsonfile.writeFile(file, obj)
        // console.log(result);
        //console.log("pass number:", obj.length);
    });
}

