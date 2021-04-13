const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql');
const dbCon = mysql.createConnection({
    host : '34.64.123.43',
    port : '3306',
    user : 'root',
    password : 'gsb96!@',
    database : 'designer'
});

class FileManager{    

    getFileInfo(fileID, successCallBack, failedCallBack) {
        let queryString = ' select * from files ';
    
        getConnection().query(queryString, [], function(err, result){
            if(err){
                console.log(err)
                failedCallBack();
                return;
            } 
            successCallBack(result);
        });
    }

    getfileDownload(file, fileName, req, res){
        try {
            if(fs.existsSync(file)){ // 파일 존재 유무 체크
                let mimetype = mime.getType(file);
                res.setHeader('Content-disposition', 'attachment; filename=*=UTF-8\'\'' + this.getDownloadFilename(req, fileName)); // 다운받아질 파일명 설정
                res.serHeader('Content-type', mimetype); // 파일 형식 지정
                let filestream = fs.createReadStream(file); // 스트림 읽기 처리 대상이 되는 파일을 지정
                filestream.pipe(res); // ?
            } else {
                res.send('파일 없음');
                return;
            }
        } catch (e){
            console.log(e);
            res.send('파일 다운로드 중 오류가 발생');
            return;
        }
        }

    getDownloadFilename(req, filename){
        let header = req.header['user-agent'];

        if(header.includes("MSIE") || header.includes("Trident")) {
            return encodeURIComponent(filename).replace(/\\+/gi, "%20");
        }

        filename = encodeURIComponent(filename);

        return filename;
    }        
}

function getConnection() {
    return dbCon;
};

module.exports = FileManager;