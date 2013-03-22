(function($){
    $(function(){
        /* ########################## */
        var user = 'aig1001',albom = '63684'; // Имя пользователя и название альбома на яндекс фотках
        var ajaxResult;
        function l(l){console.log(l);}

        function makeGet(url){
            $.ajax({
                contentType: 'application/json',
                url: 'http://api-fotki.yandex.ru'+url+'?format=json&callback=?',
                dataType: 'jsonp',
                success: function(data){ l(data);}
            });
        }
        /* ########################## */
    });
})(jQuery);
