(function() {
    var express = require('express');
    var app = express();

    //app.use(express.staticProvider(__dirname + '/public'));

    app.get('/', function(req, res) {
        res.render('draw_test.html');
    });

    app.listen(8080, '127.0.0.1')
})();