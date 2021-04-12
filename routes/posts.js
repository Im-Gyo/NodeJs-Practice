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

//페이징
router.get("/pasing/:now", function(req, res){
     // 페이지 당 게시물 수
    var page_size = 10;
     // 페이지의 개수
    var page_list_size = 10;
     // limit DB에서 가져올 게시글의 수
    var no = "";
     // 전체 게시물 수
    var totalPageCount = 0;

    getConnection().query('select count(*) as cnt from posts', function(err2, data){
        if(err2){
            console.log(err2);
            res.render('error')
        }        

        //전체 게시글 개수
        //Select해서 가져온 posts 테이블의 게시물 갯수를 가져온 뒤 data 객체에 담아 totalPageCount에 저장
        totalPageCount = data[0].cnt;

        //현재 페이지
        nowPage =  req.params.now;

        console.log("현재 페이지" + nowPage + "," + "전체 게시글" + totalPageCount);

        //게시글 숫자가 0보다 작으면 0으로 세팅
        if(totalPageCount < 0) {
            totalPageCount = 0;
        }
        
        console.log(totalPageCount);

        //전체 페이지 수, 전체 세트 수, 현재 세트 번호, 현재 세트 내 출력될 시작 페이지, 현재 세트 내 출력될 마지막 페이지
        //전체 페이지 수
        var totalPage = Math.ceil(totalPageCount / page_size);
        //전체 세트 수
        var totalSet = Math.ceil(totalPage / page_list_size);
        //현재 세트 번호
        var nowSet = Math.ceil(nowPage / page_list_size);
        //현재 세트 내 출력될 시작 페이지(만약 2페이지면 11번째 게시물 부터 시작)
        var startPage = (nowSet - 1 * 10) + 1;
        //현재 세트 내 출력될 마지막 페이지(만약 2페이지면 20번이 마지막)
        var lastPage = (startPage + page_list_size) - 1;

        //현재 페이지에 따라 DB에서 가져올 limit 설정
        if(nowPage < 0){
            no = 0;
        } else {
            no = (nowPage - 1) * 10;
        }

        console.log(no);

        //result2 객체에 페이지, 세트 정보 저장
        var result2 = {
            "page_size" : page_size,
            "page_list_size" : page_list_size,
            "nowPage" : nowPage,
            "totalPage" : totalPage,
            "totalSet" : totalSet,
            "nowSet" : nowSet,
            "startPage" : startPage,
            "lastPage" : lastPage
        };

        console.log(result2)

        getConnection().query('select * from posts order by id desc limit ?, ?',[no, page_size], function(err, result){
            if(err){
                console.log(err)
                res.render('error');
            } else {
                res.render(data, {
                    data : result,
                    pasing : result2
                })
            }
        })
    })
})

// '/' 위치에 get요청을 받는 경우, 서버에 get요청이 있을 때 실행
//메인페이지(조회)
router.get('/', function(req, res){    
    //main으로 오면 pasing으로 리다이렉트
    res.redirect('/pasing/'+ 1)

    // getConnection().query('SELECT * FROM posts as cst', function(err, results){
    //     if(err){
    //         console.log(err)
    //         res.render('error')
    //     } else {
    //         console.log(req.params);
    //         res.render('index', {data: results});
    //     }
    // });  

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