const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const mime = require('mime');
const mysql = require('mysql');
const url =  require('url');
var iconvLite = require('iconv-lite');
const fileManager = require('../scheduler/fileManager')
const dbCon = mysql.createConnection({

});

//urlencoded(url인코딩데이터) data를 extended 알고리즘을 사용해서 분석
router.use(bodyParser.urlencoded({extended:false}));

//채팅
router.get('/chat', function(req, res){
    res.render('chat')
})

//페이징
router.get("/pasing/:now", function(req, res){
    // 검색한 포스트 값
    var searchPost = {};
    // console.log(searchPost);
    // console.log(searchPost);
    // console.log(searchPost);
    // console.log(searchPost);
    // console.log(searchPost);
     // 페이지 당 게시물 수
    let page_size = 10;
     // 페이지의 개수
    let page_list_size = 10;
     // limit DB에서 가져올 게시글의 수
    let no = "";
     // 전체 게시물 수
    let totalPageCount = 0;

    getConnection().query('select count(*) as cnr from posts', function(err2, data){
        if(err2){
            console.log(err2);
            res.render('error')
            return;
        }

        //전체 게시글 개수
        //Select해서 가져온 posts 테이블의 게시물 갯수를 가져온 뒤 data 객체에 담아 totalPageCount에 저장
        //RowDataPacket(객체를 생성하는 생성자 함수의 이름)으로 가져온 cnt객체(as 별칭)의 값을 저장
        totalPageCount = data[0].cnr;

        //현재 페이지
        var nowPage =  req.params.now;

        console.log("현재 페이지" + nowPage + "," + "전체 게시글" + totalPageCount);

        //게시글 숫자가 0보다 작으면 0으로 세팅
        if(totalPageCount < 0) {
            totalPageCount = 0;
        }

        //전체 페이지 수, 전체 세트 수, 현재 세트 번호, 현재 세트 내 출력될 시작 페이지, 현재 세트 내 출력될 마지막 페이지
        //전체 페이지 수
        let totalPage = Math.ceil(totalPageCount / page_size);
        //전체 세트 수
        let totalSet = Math.ceil(totalPage / page_list_size);
        //현재 세트 번호
        let nowSet = Math.ceil(nowPage / page_list_size);
        //현재 세트 내 출력될 시작 페이지(만약 2페이지면 11번째 게시물 부터 시작)
        let startPage = ((nowSet - 1) * 10) + 1;
        //현재 세트 내 출력될 마지막 페이지(만약 2페이지면 20번이 마지막)
        let lastPage = (startPage + page_list_size) - 1;

        //현재 페이지에 따라 DB에서 가져올 limit 설정
        if(nowPage < 0){
            no = 0;
        } else {
            no = (nowPage - 1) * 10;
        }       

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

        getConnection().query('select * from posts order by id asc limit ?, ?', [no, page_size], function(err, result){
            if(err){
                console.log(err)
                res.render('error');
                return
            } else {
                res.render('index', { data : result, pasing : result2 });
            }
        });
    });
});

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
        //  console.log(file);
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png'){
            cb(null, 'upload/images');
        } else if(file.mimetype == 'application/pdf' || file.mimetype == 'application/txt'){
            cb(null, 'upload/texts');
        }
    },
    
    //파일 이름 설정
    filename : function(req, file, cb){
        //  console.log(file);
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// var upload = multer({ dest: 'upload/' });
var upload = multer({ storage: storage });

//작성페이지(파일업로드, 게시글)
router.post('/boardWrite', upload.single('inputfile'), function(req, res){
    if(req.file){
        // console.log(req.file)        
        // console.log(req.file.filename)              
        // console.log(req.file.path)              
        // console.log(upload)
        // console.log(upload.storage.getFilename);        
        getConnection().query('insert into files(filename, fileOriName) values(?, ?)', [req.file.path, req.file.filename], function(err, results){
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

//상세페이지(파일표시)
router.get('/detail/:id', function(req, res){
        // 파일을 가져올 위치
        // var path = __dirname + '/../' + 'upload/images'
        getConnection().query('select * from files', function(err, result){
            if(err){
                res.render('error');
            } else{
                getConnection().query('select * from posts where id = ?', [req.params.id], function(err, results){                    
                    res.render('detail', {data:results[0], data2:result});
                });
            }
        })
});


//파일다운로드
router.get('/download/upload/images/:name/:id', function(req, res){
    const fm = new fileManager();
    let fileID = req.params.id;
    let filePathName = req.params.name;    

    // 파일정보가져옴
    fm.getFileInfo(fileID,
        //sucessCallBack
        function(fileInfo) {
            let fileName = fileInfo[0].filename;
            let fileLen = fileName.length;
            let endDot = fileName.lastIndexOf('-'); // - 기준으로 인덱스 값 반환
            let fileExt = fileName.substring(endDot+1, fileLen).toLowerCase(); // 소문자로 파일명 파싱(캡처.png)

            //다운로드 받을 파일 경로
            let file = __dirname + '/../upload/images/' + filePathName;            
            let customName = fileExt;
            fm.getfileDownload(file, customName, req, res);
        }, 
        //failCallBack
        function(err){
            console.log(err)
        })
    // res.download(file);
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
    getConnection().query(
        'update posts set title = ?, content = ?, author = ? where id = ?', 
        [body.title, body.content, body.author, req.params.id], 
        function(){
            if(err){
                res.render('error')
            } else{
                res.redirect('/');
            }
        }
    );
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

//검색
router.get('/search', (req, res) => {
    var queryData = url.parse(req.url, true).query;

    if(queryData.category == 'title')
    {        
        getConnection().query('select title from posts where title = ?', [queryData.searchText], (err, result) =>{
            if(err)
            {
                console.log(err);
            }
            else
            {                
                console.log(result);
                console.log(result);
                console.log(result);
                console.log(result);
                console.log(result);

                searchPost = result;
                res.redirect('/pasing/' + 1);
            }
        })
    } else if(queryData.category == 'author')
    {        
        getConnection().query('select author from posts where author = ?', [queryData.searchText], (err, result) =>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                
                searchPost = result;
                res.redirect('/pasing/' + 1);
            }
        })
    }    
})

function getConnection() {
    return dbCon;
};

module.exports = router;