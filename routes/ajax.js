function protocolSendAjax (data, isAlert, movePage) {
    $.ajax({
        type : "POST",
        url : "/",
        dataType : "JSON",
        contentType : "",
        success : function(data){
            
        },
        error : function(e){
    
        }
    })
}

// $.ajax({
//     type :
//     url :
//     dataType :
//     success : function(){

//     }
//     error : function(){

//     }
// })