//Ajax 처리 프로토콜
const { route } = require("./posts");
const bodyParser = require("body-parser");
const commonUtil = require("../util/commonUtil");
const DataCacheManager = require("../scheduler/dataCacheManager");
const dataCacheManager = DataCacheManager.getInstance();

let func = {};

//프로토콜 공통처리 부분(공통처리 후 ajax로 받은 protocol url을 매핑)
router.post('/', (req, res, next) => {
    let jsonObject = req.body;
    let protocolName = jsonObject['protocol'];

    if(func.hasOwnProperty(protocolName) == true) {
        func[protocolName](req, res, next, jsonObject);
    } else {
        commonUtil.sendResponse(res, 200, 1, '프로토콜 체크하라우');
    }
});

func.memeberLogin = (req, res, next, jsonObject) => {
    
}

func.memberRegister = (req, res, next, jsonObject) => {
    dataCacheManager.memberRegister(jsonObject, function(data) {
        commonUtil.sendResponse(res, 200, 0, '가입성공');
    });
}
