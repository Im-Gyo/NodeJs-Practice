/*모듈 import*/
const express = require('express');
const path = require('path');
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
const webSocket = require('./socket/socket.js')

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