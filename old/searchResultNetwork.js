(function() {
    var express = require('express');
    var app = express();
    var path    = require("path");

    //app.use(express.staticProvider(__dirname + '/public'));

    app.get('/search', function(req, res) {
        //res.render('./draw_test.html');
        //res.json({ message: 'Hello World' });
        res.sendFile(path.join(__dirname+'/draw_test.html'));
        //res.json({ message: 'Hello World' });
    });

    app.listen(8080, function(){
        console.log('draw network test!');
    });
    
    app.get('/data', function(req, res){
        // factual.get('/t/places',{q:'starbucks'}, function (error, data) {
        // console.log(data);
        // res.writeHead(200, { 'Content-Type': 'application/json' }); 
        // res.end(JSON.stringify(data));
        // });
        res.json({
            nodes:[{id: 1, label: 'BVB'},{id: 2, label: 'Bor Dortmund'},
            {id: 3, label: 'Shit Lane'},
            {id: 4, label: 'cao ni ma bi'},
            {id: 5, label: 'Node 5'}]
            ,
            edges:[
                {from: 1, to: 3},
                {from: 1, to: 2},
                {from: 2, to: 4},
                {from: 2, to: 5}
            ] 
        });
        
    });
    
})();