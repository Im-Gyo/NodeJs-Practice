/*모듈 import*/
const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');
const socket = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');

// dotenv.config();

//라우트로 분리
const boardRouter = require('./routes/posts.js')
const webSocket = require('./socket/socket.js');
const { fstat } = require('fs');

const app = express();
const server = http.createServer(app);
const io = socket(server);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:false}));

app.get('/chat', function(req, res)
{
    res.render('chat');
});

app.use(webSocket(io));

// /로 시작하는 주소들에게 boardRouter라는 이름의 미들웨어를 적용 
app.use('/', boardRouter);
// app.use('/chat', chatRouter);
// app.use(webSocket);

//잘못된 호출이나 파라미터로 서버 종료문제 잡는 곳
process.on('uncaughtException', function(err){
    console.log('uncaughtException : ', err);
    if(err.code == 'ECONNREFUSED' || err.code == 'EHOSTUNREACH'){
        handler_connect_error(err);
    } else if(err.code == 'ETIMEDOUT'){
        handler_timeout(err);
    }
});

//404 핸들러(아무런 url이 지정되어있지 않으므로 지정된 url이외에는 모두 에러로 처리)
app.use(function(req, res, next){
    //views 폴더에서 찾아봄
    let reqPath = decodeURI(path.join(__dirname, './views', req.path));
    if(fs.existsSync(reqPath)){
        res.sendFile(reqPath);
        return;
    } else {
        //views 폴더에서 없으면 upload폴더에서 검색
        reqPath = decodeURI(path.join(__dirname, './upload', reqPath))
        if(fs.existsSync(reqPath)){
            res.sendFile(reqPath);
            return;
        }
        else { 
            //그래도 없으면 404
            console.log(req.path + 'not found');
            res.render('404.ejs');
        }
    }
});

//예기치못한 에러 처리
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('500.ejs');
})

var port = 5000;
/*서버 실행*/
// port번호를 이용해 5000번 포트에 node.js 서버를 올림, 서버가 실행되는 경우에 실행
//listen, get과 같이 어떤 조건이 갖춰지면 실행되는 함수를 이벤트 리스너라고 함
server.listen(port, function(){    
    // 서버 실행 시 콘솔에 출력할 메시지
    console.log("server on");     
}); 

// //웹소켓을 익스프레스 서버(server)에 연결
// webSocket(server);