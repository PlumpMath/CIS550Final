
//var extractorModule = require('../extractor.js');
//var extractor = new extractorModule.Extractor();

//-------------- search test ---------------------------
var linkerModule = require('../linker.js');
var linker = new linkerModule.Linker();

//,'Hannover 96''FC Augsburg',
linker.searchQuery(['FC Augsburg'], function(result) {
    
    var searchEngineModule = require('./SearchEngine.js');
    var searchEngine = new searchEngineModule.Search();
    //console.log(result);

    searchEngine.StartSearch(result, function(searchResult){
        console.log(searchResult);
    });
    
});

// function CallSearchBidirectionalBFS(nodelist)
// {
//     var pythonShell = require('python-shell');

//     //var list = [['13','12'],['4','7','10']];
//     var options = {
//         mode: 'text',
//         args: nodelist
//     };

//     pythonShell.run('SearchEngineWrapperForNodejs.py', options, function(err, result){
//         if(err) throw err;

//         var obj = JSON.parse(result);
//         console.log(obj);
//         var jsonfile = require('jsonfile')
//         var file = './data.json'
//         jsonfile.writeFile(file, obj)
//         // console.log(result);
//         console.log("pass number:", obj.length);
//     });
// }

