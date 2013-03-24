(function(){
    /* ######## default setting ################## */
    var user = 'aig1001',album = '63684'; domen = "http://api-fotki.yandex.ru"; /* Имя пользователя и название альбома на яндекс фотках    */
    var j = "&format=json&callback=?";
    var limit = 10; /* лимит постраничного вывода */
    var images = []; /* Массив для картинок */
    var imgId = []; /* массив где хранятся только id картинок */
    var next = 1; /* адрес следующей страницы пагинации */
    var hovergallery = false;
    var beginId = "186574";
    var loadImages = $.Deferred();
    var preload,nextload = true;
    var styleSheet = {
        lightbox: {
            'display': 'none',
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'margin': null,
            'outline': '9999px solid rgba(0,0,0,0.5)'
        }
    }
    function l(l){console.log(l);}
    /* ####### end default settings ####### */
    function getAllAlbumImages()
    {
        if (next)/* если следующих страницы больше нет - выходим из рекурсии */
        {
            if (next == 1) { var url = domen + "/api/users/"+user+"/album/"+album+"/photos/?"+j;}
            else { url = next+j;}
            var dfd = $.Deferred();
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
                        height : data.entries[i].img.L.height,
                        id: id[1]
                    }
                    imgId[imgId.length] = {load:false,id:id[1]};
                    images[id[1]] = imgObj;
                    dfd.resolve();
                }
                dfd.done(getAllAlbumImages());
            });
        }
        else
        {

            l(images);
            l(imgId);
            l(imgId.length);
            loadImages.resolve();
        }
    }
    loadImages.done(function(){
            l('All img load');
            loadSibImage(beginId,true);
    });
    /* функция горизонтального скрола */
    $(window).scroll(function(){
        if (hovergallery)
        {
            var windowscrolltop = $(window).scrollTop();
            var galleryscrollleft = $('.gallery').scrollLeft();
            if (windowscrolltop<100 ) {$('.gallery').scrollLeft(galleryscrollleft-(100-windowscrolltop)*2);}
            else {$('.gallery').scrollLeft(galleryscrollleft+(windowscrolltop-100)*2);}
        }
        $(window).scrollTop(100);
    });
    /*
    * @param {jQuery} img
    */
    function resizeImage(img)
    {
        var windowheight = $(window).height();
        var windowwidth = $(window).width();
        if ($(img).height() >= windowheight) {$(img).height(windowheight-10);}
        if ($(img).width() >= windowwidth) {$(img).width(windowwidth-10);}
        $(img).css({
            'margin-left': $(img).width() / -2,
            'margin-top': $(img).height() / -2
        });
        $(img).fadeIn();
    }
    /*
    * @param {string} id, {boolean} next
    *
    */
    function loadSibImage(id,next)
    {
        l(id),l(next);
        var indexImg = false;
        for (i in imgId)
        {
            if (imgId[i].id == id) {indexImg = i;break;}
        }

        l(indexImg);
        indexImg = Number(indexImg);
        l(indexImg);
        for (var i=1;i<30;i++)
        {
            if (next) {var newIndexImg = indexImg+i;}
            else {var newIndexImg = indexImg-i;}

            l(newIndexImg);
            if (imgId[newIndexImg])
            {
                /* если элемент существует */
                var insertImg = loadTiles(images[imgId[newIndexImg].id]);
                insertImg.then(function(ins){
                    var insertTd = $('<td/>').append(ins);
                    if (next) {$(insertTd).appendTo('.gallery').find('img').animate({opacity:1},300);}
                    else {$(insertTd).prependTo('.gallery').find('img').animate({opacity:1},300);}
                });
            }
        }
    }
    /*
    * @param {object} img
    *
    * @return {jQuery}
    *
    * */
    function loadTiles(img)
    {
        var lT = $.Deferred();
        var imageTiles = $('<img/>',{
            class: 'tiles',
            src: img.s_link,
            'data-id': img.id
        });
        $(imageTiles).load(function(){ lT.resolve($(imageTiles)); });
        return lT.promise();
    }
    $(function(){
        /*Скачивание всех картинок в массив */
        getAllAlbumImages();

        $('.gallery').hover(function(){
                $(this).animate({opacity:1},300);
                hovergallery=true;
            },
            function(){
                hovergallery=false;
                $(this).animate({opacity:0},300);
            });
    });
}());
