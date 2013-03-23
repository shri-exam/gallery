(function($){
    $(function(){
        /* ######## default setting ################## */
        var user = 'aig1001',album = '63684'; domen = "http://api-fotki.yandex.ru"; /* Имя пользователя и название альбома на яндекс фотках    */
        var j = "&format=json&callback=?";
        var ajaxResult;
        var limit = 10; /* лимит постраничного вывода */
        var images = []; /* Массив для картинок */
        var imgId = []; /* массив где хранятся только id картинок */
        var next = 1; /* адрес следующей страницы пагинации */


        function l(l){console.log(l);}
        /* ####### end default settings ####### */

        function getAllAlbumImages()
        {
            if (next)/* если следующих страницы больше нет - выходим из рекурсии */
            {
                if (next == 1) { var url = domen + "/api/users/"+user+"/album/"+album+"/photos/?"+j;}
                else { url = next+j;}
                var defGetImg = $.Deferred();
                $.getJSON(url,function(data){
                    for (var i in data.entries)
                    {
                        next = data.links.next?data.links.next:false;
                        var reg = /(\d+)$/g;
                        var id = reg.exec(data.entries[i].id);
                        var imgObj = {
                            s_link : data.entries[i].img.S.href,
                            l_link : data.entries[i].img.L.href,
                            width : data.entries[i].img.L.width,
                            height : data.entries[i].img.L.height
                        }
                        imgId[imgId.length] = id[1];
                        images[id[1]] = imgObj;
                        defGetImg.resolve();
                    }
                    defGetImg.done(getAllAlbumImages());
                });
            }
            else
            {
                l(images);
                l(imgId);
                l(imgId.length);
            }
        }
        $(window).scroll(function(){
            console.log($(window).scrollTop());
            if ($(window).scrollTop() < 100 ) {$('.gallery').scrollLeft($('.gallery').scrollLeft()-(100-$(window).scrollTop()));}
            else {$('.gallery').scrollLeft($('.gallery').scrollLeft()+($(window).scrollTop()-100));}
            $(window).scrollTop(100);
        });

        //getAllAlbumImages();
        /* ########################## */
    });
})(jQuery);
