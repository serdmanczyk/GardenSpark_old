"use strict"
var incl = require('../includes'),
    db = incl.db,
    _ = incl._;
    
var router = module.exports = incl.express.Router();

router.get('/', function(req, res){
        var n = Date.now(),
            smoothing = (req.query.smooth == 'true' ? true : false),
            all = (req.query.all == 'true' ? true : false),
            startDate = (req.query.start || 0),
            endDate = (req.query.end || n);

    if (startDate === 0 && endDate === n && !all){
        endDate = Date.now();
        startDate = endDate - 300000; // Five minutes ago
    }else if (all){
        endDate = Date.now();
        startDate = 0;
    };

    db.getReadings(startDate, endDate, function(results) {
        if (req.headers['content-type'] === 'application/json') {
            res.json(results);
        }else{
            var ret = {
                title:incl.name,
                readings:results || []
            };
            res.render('readings', ret);
        };
    }, smoothing);
});

router.post('/', function(req,res){
    if (req.body.magicpasscode && req.body.magicpasscode == "hotdogbuns") {
        var readings = JSON.parse(req.body.data),
            sparkData = {
                "timestamp": req.body.published_at,
                "airtemp": readings[0],
                "soiltemp": readings[1],
                "humidity": readings[2],
                "soilmoist": readings[3],
                "light": readings[4]
            };

        db.insert(sparkData);
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('');
});
