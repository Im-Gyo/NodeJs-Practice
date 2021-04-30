const express = require("express");
const dbCon = mysql.createConnection({

});

let instance;

class DataCacheManager {
    constructor(){};
    
    static getInstance() {
        if(!instance) {
            instance = new DataCacheManager();
        }
    }

    init(){

    }

    async memberRegister(memberData, successCallBack, failedCallBack) {
        let nickName = memberData.nickName;
        let id = memberData.id;
        let pw = memberData.pw;

        let query = 'INSERT INTO memberList(id, pw, nickName) VALUES (?, ?, ?)';
        getConnection().query(query, [id,pw,nickName], 
            function(err, data) {
                if(err){
                    failedCallBack(err);
                    return;
                }
                successCallBack();                          
        });
    };
}

function getConnection() {
    return dbCon;
};

module.exports = DataCacheManager;