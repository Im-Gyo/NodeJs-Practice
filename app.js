/*모듈 import*/
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// dotenv.config();

//라우트로 분리
const boardRouter = require('./routes/posts.js')
const webSocket = require('./socket/socket.js')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.set('view engine', 'ejs'); 

// nunjucks.configure('views',
// {
//     express : app,
//     watch : true,
// });

// app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
// app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
// app.use(express.urlencoded({extended:false}));
// app.use(cookieParser());
// app.use(session(
// {
//     resave : false,
//     saveUninitialized : false,
//     secret : 'gyo',
//     cookie : 
//     {
//         httpOnly : true,
//         secure : false,
//     },
// }));

//브라우저의 폼으로 전송된 데이터를 서버에서 쉽게 사용
//__dirname : node.js에서 프로그램이 실행중인 파일의 위치를 나타냄
// get과 마찬가지로 req, res, next 파라미터가 콜백 함수로 자동으로 전달, 다만 route나 http메소드에 상관없이 서버에 요청이 들어올 떄마다 무조건 콜백함수 실행

app.get('/chat', function(req, res)
{
    res.render('chat');
});

app.use(webSocket(io));


// /로 시작하는 주소들에게 boardRouter라는 이름의 미들웨어를 적용 
app.use('/', boardRouter);
// app.use('/chat', chatRouter);
// app.use(webSocket);
//에러처리
// app.use(function(req, res, next)
// {
    
// })

var port = 5000;
/*서버 실행*/
// port번호를 이용해 5000번 포트에 node.js 서버를 올림, 서버가 실행되는 경우에 실행
//listen, get과 같이 어떤 조건이 갖춰지면 실행되는 함수를 이벤트 리스너라고 함
http.listen(port, function(){    
    // 서버 실행 시 콘솔에 출력할 메시지
    console.log("server on");     
}); 

// //웹소켓을 익스프레스 서버(server)에 연결
// webSocket(server);