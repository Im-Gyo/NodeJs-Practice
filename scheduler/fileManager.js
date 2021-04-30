const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const mime = require('mime');
const mysql = require('mysql');
var iconvLite = require('iconv-lite');
const dbCon = mysql.createConnection({

});

class FileManager{
    constructor(){};

    getFileInfo(fileID, successCallBack, failedCallBack) {
        let queryString = 'select filename from files where id = ?';
    
        getConnection().query(queryString, [fileID], function(err, result){
            if(err){
                console.log(err)
                failedCallBack();
                return;
            }
            successCallBack(result);
        });
    }

    getfileDownload(file, filename, req, res){
        try {
            if(fs.existsSync(file)){ // 파일 존재 유무 체크
                let mimetype = mime.getType(file);
                res.setHeader('Content-disposition', 'attachment; filename=' + this.getDownloadFilename(req, filename)); // 다운받아질 파일명 설정
                res.setHeader('Content-type', mimetype); // 파일 형식 지정
                let filestream = fs.createReadStream(file); // 스트림 읽기 처리 대상이 되는 파일을 지정
                filestream.pipe(res);
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
        var header = req.headers['user-agent'];
    
        if (header.includes("MSIE") || header.includes("Trident")) 
        { 
            return encodeURIComponent(filename).replace(/\\+/gi, "%20");
        }
        else if (header.includes("Chrome")) 
        {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        } 
        else if (header.includes("Opera")) 
        {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        } 
        else if (header.includes("Firefox")) 
        {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        } 
        else 
        {
            return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
        }
        
        // let header = req.header['user-agent'];

        // if(header.includes("MSIE") || header.includes("Trident")) {
        //     return encodeURIComponent(filename).replace(/\\+/gi, "%20");
        // }

        // // filename = encodeURIComponent(filename);

        // return filename;
    }
}

function getConnection() {
    return dbCon;
};

module.exports = FileManager;