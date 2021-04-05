var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var dbCon = mysql.createConnection({
    host : '',
    port : '',
    user : '',
    password : '',
    database : ''
});

//urlencoded(url인코딩데이터) data를 extended 알고리즘을 사용해서 분석
router.use(bodyParser.urlencoded({extended:false}));

// '/' 위치에 get요청을 받는 경우, 서버에 get요청이 있을 때 실행
//메인페이지(조회)
router.get('/', function(req, res){    
    getConnection().query('SELECT * FROM posts', function(err, results){
        console.log(results);
        res.render('index', {data: results});
    //    res.send(ejs.render(results, {data: results}));
    });
    
});

//작성페이지(삽입)
router.get('/boardWrite', function(req, res){
    res.render('boardWrite');
});

router.post('/boardWrite', function(req, res){
    console.log('작성 진행')
    var body = req.body;
    getConnection().query('insert into posts(title, content, author) values(?,?,?)', [body.title, body.content, body.author], function(){
        res.redirect('/');
    });
});



function getConnection() {
    return dbCon
};

module.exports = router;