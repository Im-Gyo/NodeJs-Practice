var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var mysql = require('mysql');
var dbCon = mysql.createConnection({

});

//urlencoded(url인코딩데이터) data를 extended 알고리즘을 사용해서 분석
router.use(bodyParser.urlencoded({extended:false}));

// '/' 위치에 get요청을 받는 경우, 서버에 get요청이 있을 때 실행
//메인페이지(조회)
router.get('/', function(req, res){    
    getConnection().query('SELECT * FROM posts', function(err, results){
        if(err){
            console.log(err)
            res.render('error')
        } else {
            res.render('index', {data: results});
        }    
    });    
});

//작성페이지(삽입)
router.get('/boardWrite', function(req, res){
    res.render('boardWrite');
});


//파일 업로드(디스크저장)
var storage = multer.diskStorage({    
    //파일 저장위치 설정
    destination : function(req, file, cb){
         console.log(file);
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png'){
            cb(null, 'upload/images');
        } else if(file.mimetype == 'application/pdf' || file.mimetype == 'application/txt'){
            cb(null, 'upload/texts');
        }
    },
    
    //파일 이름 설정
    filename : function(req, file, cb){
         console.log(file);
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// var upload = multer({ dest: 'upload/' });
var upload = multer({ storage: storage });

//작성페이지(파일업로드, 게시글)
router.post('/boardWrite', upload.single('inputfile'), function(req, res){
    if(req.file){
        console.log(req.file)
        console.log(req.file.path)
        console.log(upload)
        console.log(upload.storage.getFilename);
        getConnection().query('insert into files(filename) values(?)', [req.file.path], function(err, results){
            if(err){
                res.render('error');
            } else {
                console.log('작성 진행')
                var body = req.body;
                getConnection().query('insert into posts(title, content, author) values(?,?,?)', [body.title, body.content, body.author], function(err, results){
                    if(err){
                        res.render('error');
                    } else {
                        res.redirect('/');
                    }
                });
            }
        });
    }
});

//상세페이지
router.get('/detail/:id', function(req, res){    
        // 파일을 가져올 위치
        var path = __dirname + '/../' + 'upload/images'
        getConnection().query('select * from files', function(err, result){
            if(err){
                res.render('error');    
            } else{
                getConnection().query('select * from posts where id = ?', [req.params.id], function(err, results){
                    console.log(result)
                    res.render('detail', {data:results[0], data2:result});
                });
            }
        })
});

//파일다운로드
router.get('/download/upload/images/:name', function(req, res){
    var file = __dirname + '/../upload/images/' + req.params.name;
    // var filename = req.params.name;
    // var temp = filename.indexOf('-', 1);
    // var temp2 = filename.indexOf(filename.substr(filename.length -1 ), 1);
    res.download(file);
})

//수정페이지
router.get('/modify/:id', function(req, res){    
        getConnection().query('select * from posts where id = ?', [req.params.id], function(err, results){
            if(err){
                res.render('error')
            } else{
                res.render('modify', {data:results[0]});            
            }
        });    
});

//수정등록
router.post('/modify/:id', function(req, res){    
    var body = req.body;
    getConnection().query('update posts set title = ?, content = ?, author = ? where id = ?', [body.title, body.content, body.author, req.params.id], function(){
        if(err){
            res.render('error')
        } else{
            res.redirect('/');
        }
    });
});

//삭제
router.get('/delete/:id', function(req, res){        
    getConnection().query('delete from posts where id = ?', [req.params.id], function(){
        if(err){
            res.render('error')
        } else{
            res.redirect('/');
        }
    });
});


function getConnection() {
    return dbCon
};

module.exports = router;