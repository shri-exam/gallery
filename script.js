(function(){
    /* ######## default setting ################## */
    var user = 'aig1001',album = '63684'; domen = "http://api-fotki.yandex.ru"; /* Имя пользователя и название альбома на яндекс фотках    */
    var j = "&format=json&callback=?";
    var touch_e = 0; /* тачскрин по умолчанию false */
    var images = []; /* Массив для картинок */
    var imgId = []; /* массив Объектов  где хранятся только id картинок */
    var next = 1; /* адрес следующей страницы пагинации */
    delete localStorage['image'];
    var rememberScroll=0;
    var hovergallery = false;
    var beginId = "175189";
    var loadImages = $.Deferred();
    var blockLoadImages = false;
    var preload=Number(localStorage['image']),nextload = true;
    var step=1; if (/firefox/i.test(navigator.userAgent))  {alert('fire');step=3;}

    var loading = $('<td/>',{
        class: 'loading'
    });
    var spiner = $('<div/>',{ class: 'spiner'});

    function getAllAlbumImages()
    {
        blockLoadImages = true;
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
            console.log('al IMAGES LOAD images=',images,' imgId=',imgId);
            loadImages.resolve();
        }
    }

    /* когда все картинки загружены в массив загружаем первую партию превьюх */
    loadImages.done(function(){
            blockLoadImages = false;
        if (localStorage['image']) {
            loadSibImage(imgId[searchIndex(localStorage['image'])-1].id,true).done(function(){
                loadSibImage(localStorage['image'],false).done(function(){
                    showLightBoxById(localStorage['image']);
                    $gallery = $('.gallery');
                    console.log(' === gallery.SCrollLeft=',$gallery.scrollLeft(),
                        ' windows.width()/2=',$(window).width()/2,
                        ' NEW sdvinut = ',$gallery.scrollLeft()+$(window).width()/2
                    );
                });
            });
            /*loadSibImage(localStorage['image'],false);   */
        }
        else
        {
            preload =  imgId[0].id;
            loadSibImage(preload,true,-1).done(function(){
                showLightBoxById(imgId[0].id,0);
            });
        }

    });
    /*
    * @param {jQuery} img
    */
    function resizeImage(img)
    {
        var dataImg = images[$(img).attr('data-id')];
        if (!dataImg) { return false;}
        $window = $(window);
        /*console.log($(img).attr('data-id'));
        console.log(dataImg);  */
        /*alert('touch_e='+touch_e);  */
        var reqheight = ($window.height()-(20+touch_e));
        var reqwidth = $window.width()-20;
       /*alert('reqh='+reqheight);*/
        console.log('reqH=',reqheight,' reqW=',reqwidth);


        if (dataImg.height<reqheight && dataImg.width<reqwidth)
        {
            $(img).height(dataImg.height);
            $(img).width(dataImg.width);
        }
        else
        {
            /*alert('delaem resize'); */
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
            'left': ($window.width()-(img).width())/2,
            'top': ($window.height()-(img).height()-touch_e)/2
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
    function loadSibImage(id,next,yyy)
    {
        yyy = yyy || 0;
        var loadSibImage_dfd = $.Deferred();
        if (blockLoadImages === false)
        {
            blockLoadImages = true;
            if (id)
            {
                var $row = $('.row');
                if (next){ $row.append(loading);console.log('ADD END');}
                else { $row.prepend(loading);console.log('ADD BEGIN');}

                console.log('id=',id); console.log('next=',next);

                var indexImg = false; indexImg = searchIndex(id);

                console.log('indexImg=',indexImg);
                indexImg = Number(indexImg)+yyy;
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

                            /* было insertImg.then(function(ins)
                            { */
                            var ins=insertImg;
                            var $gallery = $('.gallery');
                                var insertTd = $('<td/>').append(ins);
                                if (next) {$(insertTd).appendTo('.row').find('img').animate({opacity:1},300);}
                                else
                                {
                                    $(insertTd).prependTo('.row').find('img').animate({opacity:1},300);
                                    if (touch_e === 0 )
                                    {
                                        $gallery.scrollLeft(count*100);
                                    }
                                }
                                $gallery.trigger('btn-replace');
                                /* привязываем обработчики обратно */
                                blockLoadImages = false;
                                loadSibImage_dfd.resolve();


                            /* было });*/

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
                /* возвращаем промис когда все картинки загружены */
                $('.loading').remove();
                return loadSibImage_dfd.promise();
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
        /* было return lT.promise();   */
        /* надо ли дожидатся ?*/
        return $(imageTiles);
    }
    function loadScroll(obj)
    {
        $window = $(window);
        if (hovergallery)
        {
            var windowscrolltop = $(window).scrollTop();
            var galleryscrollleft = $('.gallery').scrollLeft();
            if (windowscrolltop<100 ) {$('.gallery').scrollLeft(galleryscrollleft-(100*step-windowscrolltop));}
            else {$('.gallery').scrollLeft(galleryscrollleft+(windowscrolltop-100*step));}


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
                 $(this).trigger('scrollOn');
            });
    }
    function sdvig(img)
    {
        console.log('sdvig  img=',img);
        if (img.length)
        {

            var offsetLeft = $(img).offset().left;
            console.log('sdvig offsetLeft=',offsetLeft);
            var $gallery = $('.gallery');
            var z = $gallery.scrollLeft()-($(window).width()/2-$(img).width()/2-offsetLeft);
            console.log(
                'galleryLeft=',$gallery.scrollLeft()
                ,' windowsW/2=',$(window).width()/2
                ,' z=',z
            );
            $gallery.animate({ scrollLeft: z}, 500);
            rememberScroll = z;
        }
        else
        {
            console.log('sdvig propusk');
        }
    }
    /*
    * @param {string} data_id  {nubmer} x
    *
    * */
    function showLightBoxById (data_id,x)
    {
        if (data_id)
        {
            x = x || 0;
            x = Number(x);
            console.log('x bylo = ',x);
            data_id = Number(data_id);
            console.log('data_id=',data_id,' x=',x);
            var newIndex = Number(searchIndex(data_id))+x;
            console.log('newIndex=',newIndex);
            if (imgId[newIndex])
            {
                var $rowimg = $('.row img');
                var oldIndex = $rowimg.index($rowimg.filter('.current').eq(0));
                console.log(' ======= oldIndex=',oldIndex);

                $(spiner).prependTo('.main')
                .css({
                    top: ($window.height()-(200+touch_e))/2,
                    left: ($window.width()-200)/2
                });
                var new_data_id = images[imgId[newIndex].id];
                console.log('new_data_id = ',new_data_id);

                var newimg = $rowimg.removeClass('current').
                    filter('[data-id='+new_data_id.id+']').eq(0).addClass('current');
                var thisindex = $rowimg.index(newimg);

                var vlevoOrvpravo = $.Deferred();
                $lightbox = $('.lightbox');

                var lll = $.Deferred();
                lll.done(function()
                {
                    console.log('lll DEFERRED',' $lightbox=',$lightbox
                    ,' newimg=', newimg);
                    console.log('thisindex=',thisindex);
                    /* подгружаем если первый или последний */
                    console.log('newimg=',newimg);
                    var lightbox =  $('<img/>',{
                        src: new_data_id.l_link,
                        class: 'lightbox',
                        'data-id': new_data_id.id
                    }).appendTo('.main').load(function(){
                            $lightbox.remove();
                            resizeImage($(this));
                            $('.spiner').remove();
                            $(this).animate({opacity:1},300);
                        });
                    console.log('************ old localstorage image =',localStorage['image']) ;
                    localStorage['image'] = new_data_id.id;
                    console.log('************ new localstorage image =',localStorage['image']) ;
                    sdvig(newimg);

                });

                if (thisindex > oldIndex)
                {
                    console.log('EDEM VLEVO');
                    console.log('EDEM VLEVO $lightbox=',$lightbox);
                    if ($lightbox.length)
                    {
                        $lightbox.animate({left:'-200%'},800,function()
                        {
                            lll.resolve();
                        });
                    }
                    else {lll.resolve();}
                }
                else
                {
                    console.log('EDEM VPRAVO');
                    console.log('EDEM VPRAVO $lightbox=',$lightbox);
                    if ($lightbox.length)
                    {
                        $lightbox.animate({left:'200%'},800,function(){
                            lll.resolve();
                        });
                    }
                    else {lll.resolve();}
                }



                if (thisindex == 0)
                {
                    /* подгружаем картинки в начало */
                    loadSibImage(preload,false).then(function()
                    {
                        console.log('deffered PRELOAD sdvig');
                        sdvig(newimg);
                    });
                }
                if (thisindex == ($rowimg.length-1))
                {
                    /* подгружаем картинки в конец */
                    loadSibImage(nextload,true).done(function()
                    {
                        console.log('deffered NEXTLOAD sdvig');
                        sdvig(newimg);
                    });
                }

            }
            else
            {
                console.log('elementa imgId s indexom=',newIndex,' netu :-(');
                $('.spiner').remove();
            }
        }
        else
        {
            console.log('nepravilnuy data-id=',data_id);
            $('.spiner').remove();
        }
    }
    /* после загрузки страницы */
    $(function(){
        /*Скачивание всех картинок в массив */
        $window = $(window);
        $gallery = $('.gallery');
        getAllAlbumImages();
        scrolling();
        $gallery.hover(function(){
                hovergallery=true;
            },
            function(){
                hovergallery=false;

                if (touch_e === 0)
                {
                    rememberScroll = $(this).scrollLeft();
                    $(this).slideUp(400);
                    alert('slideUp');
                }
            });
        $window
            .bind('scrollOn',function(){
                console.log('ScrollOn = WINDOWS SCROLLING');
                loadScroll();
                $(window).scrollTop(100);
            })
            .bind('scroll-next',function(){console.log('loadiing NEXT');loadSibImage(nextload,true);})
            .bind('scroll-prep',function(){console.log('loadiing PREP');loadSibImage(preload,false);})
            .resize(function(){resizeImage($('.lightbox').eq(0));});

        $('.row').delegate('td img','click',function(){
            showLightBoxById($(this).attr('data-id'));
        }).delegate('.btn_prep','click',function(){
                loadSibImage(preload,false);
            })
          .delegate('.btn_next','click',function()
            {
                loadSibImage(nextload,true);
            });
        $('.main').delegate('.lightbox','click',function(){
            $('.lightbox').remove();$('.gallery').trigger('btn-replace');
        });
        $('.hovergallery').hover(function(){
            $('.gallery').scrollLeft(rememberScroll).slideDown(400);
            sdvig($('.row img').filter('.current').eq(0));
        });
        $('body').bind('touchmove',function(){
            /* меняем интерфейс на тачкриновский */
            /* отсвязываем события прокрутки */
            var $gallery =  $('.gallery');
            touch_e = $gallery.height()+30;
            $gallery.trigger('btn-replace');
            hovergallery=true;
            $window.unbind('scroll-next').unbind('scroll-prep').unbind('scrollOn');
            $('.hovergallery').remove();
        }).hover(function(){
                $('.krug').animate({opacity:0.5},300);
            },function(){
                $('.krug').animate({opacity:0},300);
            });
        $gallery.bind('btn-replace',function(){
            if (touch_e > 0)
            {
                $('.btn').remove();
                $('.row').prepend('<td class="btn btn_prep"></td>').append('<td class="btn btn_next"></td>');
            }
        });
        $('.krug_prep').click(function()
        {
            console.log('click krug_prep');
            showLightBoxById($('.lightbox').attr('data-id'),-1)
        });
        $('.krug_next').click(function()
        {
            console.log('click krug_next');
            showLightBoxById($('.lightbox').attr('data-id'),1)
        });

    });
}());
