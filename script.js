(function(){
    /* ######## default setting ################## */
    var user = 'aig1001',album = '63684'; domen = "http://api-fotki.yandex.ru"; /* Имя пользователя и название альбома на яндекс фотках    */
    var j = "&format=json&callback=?";
    var images = []; /* Массив для картинок */
    var imgId = []; /* массив Объектов  где хранятся только id картинок */
    var next = 1; /* адрес следующей страницы пагинации */
    var hovergallery = false;
    var beginId = "175189";
    var loadImages = $.Deferred();
    var blockLoadImages = false;
    var preload=Number(beginId),nextload = true;
    var loading = $('<td/>',{
        class: 'loading'
    });

    function getAllAlbumImages()
    {
        $('.row').append(loading);
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
            loadImages.resolve();
        }
    }
    loadImages.done(function(){
            loadSibImage(beginId,true);
    });
    /*
    * @param {jQuery} img
    */
    function resizeImage(img)
    {
        var dataImg = images[$(img).attr('data-id')];
        /*console.log($(img).attr('data-id'));
        console.log(dataImg);  */
        var reqheight = $(window).height()-20;
        var reqwidth = $(window).width()-20;
        console.log('reqH=',reqheight,' reqW=',reqwidth);

        if (dataImg.height<reqheight && dataImg.width<reqwidth)
        {
            $(img).height(dataImg.height);
            $(img).width(dataImg.width);
        }
        else
        {
            var tempHeight = $(img).height();
            console.log('tempHeight=',tempHeight);
            var tempWidth = $(img).width();
            console.log('tempWidth=',tempWidth);
            if (reqheight<reqwidth)
            {
                $(img).height(reqheight);
                $(img).width(tempWidth*reqheight/tempHeight);
            }
            else
            {
                console.log('OPA');
                $(img).width(reqwidth);
                $(img).height(tempHeight*reqwidth/tempWidth);
            }
        }
        $(img).css({
            'margin-left': $(img).width() / -2,
            'margin-top': $(img).height() / -2
        });
    }
    /*
    * @param {number}
    *
    * */
    function searchIndex(id)
    {
        for (var i=0 in imgId)
        {
            if (imgId[i].id == id) {return i;}
        }
        return false;
    }
    /*
    * @param {string} id, {boolean} next
    *
    */
    function loadSibImage(id,next)
    {
        if (blockLoadImages === false)
        {
            blockLoadImages = true;
            if (id)
            {
                var $row = $('.row');
                if (next){ $row.append(loading);console.log('ADD END');}
                else { $row.prepend(loading);console.log('ADD BEGIN');}

                console.log('id=',id); console.log('next=',next);

                var indexImg = false;
                indexImg = searchIndex(id);

                console.log('indexImg=',indexImg);
                indexImg = Number(indexImg);
                var count = Math.ceil($(window).width()/130);
                for (var i=1;i<count;i++)
                {
                    var newIndexImg = false;
                    if (next)
                    {
                        if (nextload == false) {console.log('nextload=false error: 1');return false;}
                        else {newIndexImg = indexImg+i;}
                    }
                    else
                    {
                        if (preload == false) {console.log('preload=false error: 2');return false;}
                        else {newIndexImg = indexImg-i;}
                    }

                    /*console.log('newIndexImg=',newIndexImg);     */
                    if (imgId[newIndexImg])
                    {
                        console.log('loaded = ',newIndexImg,' ',images[imgId[newIndexImg].id]);

                        if (imgId[newIndexImg].load == false)
                        {
                            imgId[newIndexImg].load = true;

                            if (next) {nextload = imgId[newIndexImg].id;}
                            else {preload = imgId[newIndexImg].id;}

                            var insertImg = loadTiles(images[imgId[newIndexImg].id]);

                            insertImg.then(function(ins){
                                var insertTd = $('<td/>').append(ins);
                                if (next) {$(insertTd).appendTo('.row').find('img').animate({opacity:1},300);}
                                else
                                {
                                    $(insertTd).prependTo('.row').find('img').animate({opacity:1},300);
                                    /*$('.gallery').scrollLeft(count*120);  */
                                }
                                $('.loading').remove();
                                /* привязываем обработчики обратно */
                                blockLoadImages = false;
                            });
                        }
                        else
                        {
                            /* такого элемента не существует */
                            console.log(' already loaded = ',imgId[newIndexImg]);
                        }
                    }
                    else
                    {
                        /* элемента не существует */
                        if (next) {nextload = false;} else {preload = false;}
                        console.log('newIndexImg=',newIndexImg,' error: 3');
                        blockLoadImages = false;
                    }
                }
            }
            else {console.log('id=',id,' error: 5');blockLoadImages = false;}
        }  else {console.log('blockLoadImages = ',blockLoadImages,' error: 6');}
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
    function loadScroll(obj)
    {
        $window = $(window);
        if (hovergallery)
        {
            var windowscrolltop = $(window).scrollTop();
            var galleryscrollleft = $('.gallery').scrollLeft();
            if (windowscrolltop<100 ) {$('.gallery').scrollLeft(galleryscrollleft-(100-windowscrolltop));}
            else {$('.gallery').scrollLeft(galleryscrollleft+(windowscrolltop-100));}


            $gallery = $('.gallery');
            $table = $('.gallery table');
            if ($gallery.scrollLeft()>=($table.width()-$gallery.width()-10))
            {
                $window.trigger('scroll-next');
            }
            else if ($gallery.scrollLeft() == 0)
            {
                $window.trigger('scroll-prep');
            }
            else {console.log('gallery.scrollLeft=',$gallery.scrollLeft(),
                ' table.width=',$table.width(),
                ' gallery.width=',$gallery.width());}
        }
    }
    /* функция горизонтального скрола */
    function scrolling()
    {
        $(window)
            .scroll(function(){
                console.log('WINDOWS SCROLLING');
                loadScroll();
                $(window).scrollTop(100);
            }).bind('touchmove',function(){ loadScroll(); });

        $('.gallery').scroll(function(){console.log('GALLERY SCROLLING ');loadScroll();});
    }
    /* после загрузки страницы */
    $(function(){
        /*Скачивание всех картинок в массив */
        $window = $(window);
        getAllAlbumImages();
        scrolling();
        $('.gallery').hover(function(){
                hovergallery=true;
            },
            function(){
                hovergallery=false;
                $(this).slideUp(400);
            });
        $window
            .bind('scroll-next',function(){console.log('loadiing NEXT');loadSibImage(nextload,true);})
            .bind('scroll-prep',function(){console.log('loadiing PREP');loadSibImage(preload,false);})
            .resize(function(){resizeImage($('.lightbox').eq(0));});

        $('.row').delegate('td img','click',function(){
            $('.lightbox').remove();
            $('.main').prepend('<div class="preload"></div>');

            var img = images[($(this).attr('data-id'))];
            var lightbox =  $('<img/>',{
                src: img.l_link,
                class: 'lightbox',
                'data-id': img.id
            }).appendTo('.main').load(function(){
                    resizeImage($(this));
                    $('.preload').remove();
                    $(this).animate({opacity:1},300);
                });
        });
        $('.main').delegate('.lightbox','click',function(){
            $('.lightbox').remove();
        });
        $('.hovergallery').hover(function(){
            $('.gallery').slideDown(400);
        });
    });
}());
