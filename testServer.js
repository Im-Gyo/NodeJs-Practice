const http = require('http');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
    //--요청의 본문에 있는 데이터를 꺼내기 위한 작업(req,res도 내부적으로는 스트림으로 되어있어 요청/응답의 데이터가 스트림 형식으로 전달됨)
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {      
    console.log('post본문 : ', body)
    //배열 body의 내용(버퍼 객체들의 내용)을 합쳐 새로운 버퍼를 스트링화시켜 리턴
    body = Buffer.concat(body).toString();
    //--
    response.on('error', (err) => {
      console.error(err);
    });  

    response.writeHead(200, {'Content-Type': 'application/json'})

    const responseBody = { headers, method, url, body };
    
    response.end(JSON.stringify(responseBody))
    
  });
}).listen(8070);