module.exports = {
//var extractJsonFromFile = extractJsonFromFile || {};
//var Extractor = Extractor || {};

    Extractor : function () {
        var fs = require("fs");
        var csv2JsonConverter = require("csvtojson").Converter;
        var converter = new csv2JsonConverter({});
        var xml2JsonParseString = require("xml2js").parseString;
        var path = require('path');
        
        var extractJsonFromFile = function (filename, onload) {
            var formatName = path.extname(filename);
            switch(formatName) {
                case '.csv':
                converter.fromFile(filename, function(err, result) {
                    onload(result);
                });
                break;
                
                case '.json':
                fs.readFile(filename, function(err, data){
                    var json = JSON.parse(data);
                    onload(json);
                });
                break;
                
                case '.xml':
                fs.readFile(filename, function(err, data){
                    xml2JsonParseString(data, function(err, json){
                        onload(json);
                    });
                });
                break;
                default:
                console.log('Unsupported file format');
                break;
            }
        };
        
        // expose as public
        this.extractJsonFromFile = extractJsonFromFile;
    }

};
//var extractor = new Extractor();
//extractor.extractJsonFromFile("./1-bundesliga.csv", function(json){console.log(json);});
//extractor.extractJsonFromFile("./de.1.clubs.json", function(json){console.log(json);});
//extractor.extractJsonFromFile("./example.xml", function(json){console.dir(json);});