var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message : "Hello folks, welcome to GeOL API" });
});

router.get('/nedown',function(req, res, next){

    var mysql = require('mysql').createConnection({
        host     : '10.23.32.109',
        user     : 'fbss',
        password : 'password',
        database : 'geolv2'
    });

    mysql.connect( function( err ){
        if( !err ){
            console.log("Database is connected!");
        }   
        else
            console.log("Failed to connect to database!");
    });
    
    var query = "SELECT UNIX_TIMESTAMP(`TIME`) AS time,`region`, @ as nedown "+
			"			FROM geolv2.`NEDOWN_BY_AGING_1HOUR` WHERE TIME BETWEEN DATE_SUB( CURDATE(), INTERVAL 24 HOUR ) AND DATE_ADD(CURDATE(), INTERVAL 1 DAY) and region = '#' GROUP BY region,time";
    
    var aging = {
        "all"   : "( MAX( `ONE_TO_FOUR_H` ) + MAX( `FOUR_TO_24_H` ) + MAX( `ONE_TO_THREE_D` ) + MAX( `THREE_TO_SEVEN_D` )+ MAX( `MORE_THAN_SEVEN_D`))",
        "14h"   : "MAX(`ONE_TO_FOUR_H`)",
        "424h"  : "MAX( `FOUR_TO_24_H` )",
        '13d'   : "MAX( `ONE_TO_THREE_D` )",
        'ltoa'  : "MAX(( `THREE_TO_SEVEN_D` )+( `MORE_THAN_SEVEN_D` ))"
    };
    
    if( aging[ req.query.aging ] ){
        var _query = query.replace('@', aging[ req.query.aging ]);
            _query = _query.replace('#',req.query.reg);
        mysql.query( _query, function( err, rows, fields){
            if(!err){
                res.json( { status : "success", data : rows } );
            }
            else{
                res.json( { status : "error", data : err } );
            }

        })
    }
    
    mysql.end();
    
});

router.get('/nav',function( req, res, next){

    var mysql = require('mysql').createConnection({
        host     : '10.23.32.109',
        user     : 'fbss',
        password : 'password',
        database : 'geolv2'
    });

    mysql.connect( function( err ){
        if( !err ){
            console.log("Database is connected!");
        }   
        else
            console.log("Failed to connect to database!");
    });
    
    var _query = "SELECT `Time`,IF( area_name IS NULL, Cluster, area_name ) AS Clusterx,`Region`,TRUNCATE(AVG(`Availability`),2) AS availability,`technology` FROM availabilities_cluster"+
			" LEFT JOIN `acrosspm_cluster_map` ON `acrosspm_cluster_map`.`cluster_code` = availabilities_cluster.cluster"+
			" WHERE DATE(TIME) =  CURDATE() AND (region = ? AND technology = ?)"+
			" GROUP BY Clusterx,TIME,technology";
    
    mysql.query( _query, function( err, rows, fields ){
        if( ! err ){
            res.json({ status : "success", data : rows });
        }
        else{
            res.json({ status : "failed", data : [] });
        }
    });
    
    mysql.end();
    
});


module.exports = router;