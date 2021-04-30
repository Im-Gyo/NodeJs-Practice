let cUtil = (module.exports = {

    //응답정보를 받아 전송
    sendResponse: function(res, status, resultCode, message, jsonObject ={}) {
        jsonObject['resultCode'] = resultCode;
        jsonObject['message'] = message;

        res.status(status).json(jsonObject);
    }    
})