function protocolSendAjax(data, isAlert, movePage) {
    $.ajax({
        type: 'post',
        url: '/protocol',
        dataType: 'json',
        data: data,
        success: function(data) {
            if(data.resultCode = 0) {
                if(isAlert){
                    alert(data.message);
                }
                if( movePage = 'reload') {
                    window.location.reload();
                }
                else {
                    window.location.href = movePage;
                }
            }
        },
        error : function(e) {
            alert('에러가 났슈');
        }
    });
}