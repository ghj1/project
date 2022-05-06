SearchCommon = function () {
    this.init.apply(this);
};
(function (window, $) {
    var _self;
    SearchCommon.prototype = {
        init: function () {
            this.setVariables();
            _self = this;
        },

        setVariables: function () {
            this.$feedback_idx = 0;
            this.$boxFeedBack = $(".box_feedback");
            this.$searchword = $('.content_wrap').find('[name="searchword"]').val();
            this.$searchType = $('.content_wrap').find('[name="searchType"]').attr('search');
            this.$keywordLogoArea = $('.keyword_up_logo_area');
            this.$keywordLogoLayer = $('.content_wrap').find('.keyword_up_logo');
            this.$feedBackTextarea = $(".sri_textarea", this.$boxFeedBack);
            this.$feedBackStatus = $("#feedback_status");
            this.$feedBackTitle = $("#feedback_title");
            this.$feedBackContents = $("#feedback_contents");
            this.$recruitInfo = $("#recruit_info");
            this.$toogleClass = "show";
            this.$initTextareaTimer;
            this.$wingHeight = $('#rightWingUtil').offset().top;
            this.$btnTopOffsetTop = $('.goTop').offset().top - 80;
            this.$lastRecommendIdx;
            this.isFirstChangeKeywordPage = true;
        },

        groupCompanyIconSlide: function () {
            var canvas = document.createElement('canvas');
            if (!('getContext' in canvas)) {
                var isCanvas = false;
            } else {
                var isCanvas = true;
            }

            return $('.box_sublist').each(function () {
                var $self = $('.box_sublist'),
                    $list = $('.inbox_sublist > ul', $self),
                    $item = $('> li', $list),
                    $next = $('.btn_next', $self),
                    $prev = $('.btn_prev', $self),
                    max = $item.size(),
                    curIndex = 0,
                    itemWidth = $item.eq(0).outerWidth(),
                    itemMargin = parseInt($item.eq(1).css('padding-left')), // 여백 : 9 || 13
                    translateValue = itemWidth + itemMargin,
                    cnt = itemMargin === 9 ? 6 : 7; // 노출 갯수

                function btnCheck() {
                    if (curIndex < 1) {
                        $prev.removeClass('this');
                    } else {
                        $prev.addClass('this');
                    }
                    if (curIndex < (max - cnt)) {
                        $next.addClass('this');
                    } else {
                        $next.removeClass('this');
                    }
                }

                function moveTo(index) {
                    if (isCanvas) {
                        $list.css('transform', 'translateX(-' + (index * translateValue) + 'px)');
                    } else {
                        $list.css('left', '-' + (index * translateValue) + 'px');
                    }
                    btnCheck();
                }

                $next.on('click', function () {
                    if (curIndex < (max - cnt)) {
                        curIndex++;
                        moveTo(curIndex);
                        var lazyImg = $item.eq(curIndex + 5).find('.swiper-lazy');
                        if (lazyImg.length > 0 && lazyImg.attr('data-src')) {
                            lazyImg.attr('src', lazyImg.attr('data-src'));
                            lazyImg.removeAttr('data-src');
                            lazyImg.removeClass('swiper-lazy');
                        }
                    }
                });
                $prev.on('click', function () {
                    if (curIndex > 0) {
                        curIndex--;
                        moveTo(curIndex);
                    }
                });
                $list.width((itemWidth * max) + (itemMargin * (max - 1)) + 'px');
                btnCheck();
            });
        },

        groupCompanyIconOver: function (elt) {
            var bgcase_ = 'bgcase_';
            var num = [];
            for (var i = 1; i <= 13; i++) {
                num.push(i)
            }
            var myNum = [];
            for (var j = 1; j < 999; j++) {
                var randomNum = Math.floor(Math.random() * num.length) + 1;
                if (myNum.indexOf(randomNum) == -1) {
                    myNum.push(randomNum);
                    if (myNum.length == 1) {
                        break;
                    }
                }
            }
            var result = bgcase_ + Number(myNum);

            if ($(elt).hasClass(result)) {
                return;
            }

            $(elt).mouseenter(function () {
                if ($(elt).hasClass('') != false) {
                    $(elt).addClass(result);
                }
            }).mouseleave(function () {
                $(elt).removeClass(result);
            });
        },

        getList: function (params, position) {
            if (!params) {
                return false;
            }

            if (position == 'recruit' && $('#' + position + '_info_list').attr('other-count') == 0) {
                params['mainSearch'] = 'n';
            } else if (position == 'main_keyword') {
                params['mainSearch'] = 'y';
                position = 'keyword';
            } else if (position != 'keyword') {
                params['mainSearch'] = $('#' + position + '_info_list').attr('main-search');
            } else if (position == 'keyword') {
                params['mainSearch'] = 'n';
            }

            var self = this;

            $.ajax({
                url: '/zf_user/search/get-' + position + '-list',
                type: "get",
                data: params,
                dataType: 'json',
                success: function (response) {
                    var cnt = response.count;
                    var trgOffset = $('#' + position + '_info').offset().top - 60;
                    $('html, body').stop().animate({
                        scrollTop: trgOffset
                    });

                    $('#' + position + '_info').find('.cnt_result').html('총 ' + cnt + '건');
                    $('#' + position + '_info_list').html(response.innerHTML);

                    if (position == 'company') {
                        self.rollingCuration();
                        self.rollingCompanyInfo();
                    } else if(position == 'keyword' && cnt > 0 ) {
                        $('#' + position + '_info').show();
                        self.pushDataLayer('search_ad', '');
                        $('#keywordOrder').val(response.keywordOrder);
                    }

                    _self.$btnTopOffsetTop = $('.goTop').offset().top - 80;
                }
            });
        },

        pageMove: function (elt) {
            var section = $(elt).parents('section').attr('id').replace('_info', '');
            var position = section ? section : 'recruit';
            if (position == 'recruit') {
                var page = $(elt).attr('page') ? $(elt).attr('page') : 1;

                if (location.href.search(/search\/recruit/) == -1 && page == 1) {
                    _self.tabMove('search');
                    return false;
                }

                if (this.$keywordLogoArea.length > 0) {
                    this.$keywordLogoArea.hide();
                    this.$recruitInfo.css('margin-top', '0px');
                }

                this.recruitListMove(elt);
            } else {
                this.dataListMove(elt, position);
            }
        },

        tabMove: function (type) {
            var url = '/zf_user/search';

            if (type == 'recruit_more') {
                var page = 2;
                var queryString = _self.getRecruitParams(page);
            } else if (type == 'recruit' && _self.$recruitInfo.length > 0
                && _self.$recruitInfo.find('.no_result_filter').length == 0) {
                var queryString = _self.getRecruitParams(1);
            } else {
                var queryString = _self.getSearch();
                queryString.recruitPage !== undefined ? delete queryString.recruitPage : '';
                queryString.recruitSort !== undefined ? delete queryString.recruitSort : '';
                queryString.recruitPageCount !== undefined ? delete queryString.recruitPageCount : '';
                queryString.inner_com_type !== undefined ? delete queryString.inner_com_type : '';
                queryString.company_cd !== undefined ? delete queryString.company_cd : '';
                queryString.quick_apply !== undefined ? delete queryString.quick_apply : '';
            }

            if (queryString) {
                var params = '?' + Object.keys(queryString).map(function (key) {
                    return key + '=' + encodeURIComponent(queryString[key])
                }).join('&');
            }

            type = (type == 'recruit_more') ? 'recruit' : type;
            url = (type != 'search') ? url + '/' + type : url;

            location.href = url + params;
        },

        getSearch: function () {
            var search = window.location.search;
            var result = {},
                string = search.substr(1).split('&'),
                string_length = string.length;

            var rs = '';
            for (var idx = 0; idx < string_length; ++idx) {
                rs = string[idx].split('=', 2);
                result[rs[0]] = rs.length === 1 ? "" : decodeURIComponent(rs[1].replace(/\+/g, " "));
            }

            return result;
        },

        getRecruitParams: function (page) {
            var companyCd = [];
            var params = _self.getSearch();

            _self.$recruitInfo.find('.wrap_result_filter').find('.company_cd.checkbox').each(function () {
                if (this.checked) {
                    companyCd.push(this.value);
                }
            });

            params['recruitPage'] = page;
            params['recruitSort'] = _self.$recruitInfo.find('.layer_filter.sort li.selected').find('button').attr('value');
            params['recruitPageCount'] = _self.$recruitInfo.find('.layer_filter.count li.selected').find('button').attr('value');
            params['inner_com_type'] = _self.$recruitInfo.find('.layer_filter.company_type li.selected').find('button').attr('value');
            params['company_cd'] = companyCd.join(',');
            params['searchword'] = this.$searchword;

            if (_self.$recruitInfo.find('.btn_show_applied').hasClass('apply_on')) {
                params['show_applied'] = 'y';
            } else {
                params['show_applied'] = '';
            }

            if (_self.$recruitInfo.find('.btn_quick_apply').hasClass('apply_on')) {
                params['quick_apply'] = 'y';
            } else {
                params['quick_apply'] = '';
            }

            if (_self.$recruitInfo.find('.btn_except_read').hasClass('apply_on')) {
                params['except_read'] = 'y';
            } else {
                params['except_read'] = '';
            }

            return params;
        },

        recruitListMove: function (elt) {
            var page = $(elt).attr('page') ? $(elt).attr('page') : 1;
            var params = _self.getRecruitParams(page, 'page');
            this.getList(params, 'recruit');

            if (!!history.pushState) {
                history.pushState({ position: 'recruit', params: params }, null, window.location.pathname + '?' + $.param(params));
            }
        },

        dataListMove: function (elt, position) {
            var page = $(elt).attr('page') ? $(elt).attr('page') : 1;
            var count = $('#' + position + '_info').find('.layer_filter.count li.selected').find('button').attr('value');

            var params = {'searchword': this.$searchword, 'page': page, 'searchType': this.$searchType};

            if (count !== undefined) {
                params['pageCount'] = count;
            }

            if (position == 'news') {
                var sort = $('#' + position + '_info').find('.layer_filter.sort li.selected').find('button').attr('value');
                if (sort !== undefined) {
                    params['sort'] = sort;
                }
            }

            if (position == 'saramin_data') {
                var category = $('#' + position + '_info').find('.tab_pds li.on').find('button').attr('value');
                if (category !== undefined) {
                    params['category'] = (category == 70) ? '70,100' : category;
                }
            }

            if (position == 'company') {
                var condition = $('#' + position + '_info').find('#check_end:checked').attr('value');
                if (condition !== undefined) {
                    params['condition'] = condition;
                }
            }

            if (position == 'keyword') {
                params['keywordOrder'] = $('#keywordOrder').val();
                if (this.isFirstChangeKeywordPage) {
                    params['page'] = 1;
                    params['firstPage'] = true;
                    history.pushState({ position: position, params: params }, null, url);
                    params['page'] = page;
                    params['firstPage'] = null;
                    this.isFirstChangeKeywordPage = false;
                }
            }

            this.getList(params, position);

            if (!!history.pushState) {
                var url = (position !== 'keyword') ? window.location.pathname + '?' + $.param(params) : null;
                history.pushState({ position: position, params: params }, null, url);
            }
        },

        historyBack: function (params, position) {
            if (position === 'recruit') {
                if (params['recruitPageCount']) {
                    this.conditionChangeBtn(this.$recruitInfo.find('.layer_filter.count li button[value="' + params['recruitPageCount'] + '"]'));
                }
                if (params['recruitSort']) {
                    this.conditionChangeBtn(this.$recruitInfo.find('.layer_filter.sort li button[value="' + params['recruitSort'] + '"]'));
                }
                this.conditionChangeBtn(this.$recruitInfo.find('.layer_filter.company_type li button[value="' + params['inner_com_type'] + '"]'));
                this.$recruitInfo.find('.wrap_result_filter').find('.company_cd.checkbox').each(function () {
                    this.checked = params['company_cd'].indexOf(this.value) !== -1;
                });
                this.$recruitInfo.find('.btn_show_applied').toggleClass('apply_on', !!(params['show_applied'] && params['show_applied'] === 'y'));
                this.$recruitInfo.find('.btn_quick_apply').toggleClass('apply_on', !!(params['quick_apply'] && params['quick_apply'] === 'y'));
                this.$recruitInfo.find('.btn_except_read').toggleClass('apply_on', !!(params['except_read'] && params['except_read'] === 'y'));

                this.getList(params, position);
                return;
            }

            var $positionInfo = $('#' + position + '_info');
            if (params['pageCount']) {
                this.conditionChangeBtn($positionInfo.find('.layer_filter.count li button[value="' + params['pageCount'] + '"]'));
            }

            if (position === 'saramin_data') {
                var category = params['category'] || '';
                if (category === '70,100') {
                    category = '70';
                }
                this.pdsChangeBtn($positionInfo.find('.tab_pds li button[value="' + category + '"]'));
            } else if (position === 'company') {
                $positionInfo.find('#check_end').prop('checked', !!(params['condition'] && params['condition'] === 'die'));
            } else if (position === 'keyword') {
                if (!!params['firstPage']) {
                    this.isFirstChangeKeywordPage = true;
                }
            }

            this.getList(params, position);
        },

        getKeywordList: function () {

            if (!this.$searchword || $('#keyword_info').length == 0) {
                return false;
            }

            var params = {
                'searchword': this.$searchword,
                'page': 1,
                'searchType': this.$searchType,
                'keywordOrder': $('#keywordOrder').val()
            };

            var position = 'keyword';
            if($('#recruit_info_list').attr('other-count') > 0 && $('#mainPage').val() == 'y') {
                position = 'main_keyword';
            }

            this.getList(params, position);
        },

        conditionChange: function (elt) {
            var position = $(elt).attr('position');
            if (!position) {
                return false;
            }

            this.conditionChangeBtn(elt);

            if (position == 'recruit') {
                this.recruitListMove(elt);
            } else {
                this.dataListMove(elt, position);
            }
        },

        conditionChangeBtn: function (elt) {
            if (!elt || elt.length === 0) {
                return;
            }
            $(elt).parents('div.item').removeClass('on').find('button.btn_filter').text($(elt).text());
            $(elt).parents('li').addClass('selected').siblings('li').removeClass('selected');
        },

        pdsChange: function (elt) {
            this.pdsChangeBtn(elt);
            this.dataListMove(elt, 'saramin_data');
        },

        pdsChangeBtn: function (elt) {
            $(elt).parents('li').addClass('on').siblings('li').removeClass('on');
        },

        getCompanyInfo: function (elt) {
            var csn = $(elt).parents('.area_btn').attr('value');

            if (!csn) {
                return false;
            }

            $.ajax({
                url: '/zf_user/search/get-company-info',
                type: "get",
                data: {
                    'csn': csn,
                    'searchword': this.$searchword
                },
                dataType: 'json',
                success: function (response) {
                    $(elt).next('.lpop_corp_info').html(response.innerHTML).show();
                }
            });
        },

        getUnderwayRecruitList: function (csn, ref_type) {
            if (!csn) {
                alert('진행중인 공고가 없습니다.');
                return false;
            }

            $.ajax({
                url: '/zf_user/search/get-underway-recruit-list',
                type: "get",
                data: {
                    'csn': csn,
                    'searchword': this.$searchword,
                    'ref_type': ref_type ? ref_type : 'A'
                },
                dataType: 'json',
                success: function (response) {
                    switch (response.resultCode) {
                        case 'empty' :
                            alert('진행중인 공고가 없습니다.');
                            break;
                        case 'success' :
                            $('#recruit_list_layer').html(response.innerHTML).show();
                            $('.dim_lpop_ongoing').show();
                            break;
                    }
                }
            });
        },

        getSimilarRecruitList: function (elt) {
            var rec_idx = $(elt).parents('div.item_recruit').attr('value');
            if (!rec_idx) {
                return false;
            }

            var params = window.location.search;
            params = params.substring(1) + '&rec_idx=' + rec_idx;

            if (_self.$lastRecommendIdx !== undefined) {
                params = params + '&lastRecommendIdx=' + _self.$lastRecommendIdx;
            }

            $.ajax({
                url: '/zf_user/search/get-similar-recruit-list',
                type: "get",
                data: params,
                dataType: 'json',
                success: function (response) {
                    switch (response.resultCode) {
                        case 'empty' :
                            break;
                        case 'success' :
                            $(elt).parents('div.item_recruit').addClass('has_similar_list');
                            $(elt).parents('div.item_recruit').find('.similar_recruit').html(response.innerHTML).show();
                            _self.$lastRecommendIdx = response.lastRecommendIdx;
                            break;
                    }
                }
            });
        },

        getKeywordUpLogoList: function () {
            var params = window.location.search;
            $.ajax({
                url: '/zf_user/search/get-keyword-up-logo-list',
                type: "get",
                data: params.substring(1),
                dataType: 'json',
                success: function (response) {
                    switch (response.resultCode) {
                        case 'empty' :
                            alert('불러오기에 실패했습니다. 잠시 후 다시 시도하세요.');
                            break;
                        case 'success' :
                            _self.$keywordLogoLayer.html(response.innerHTML).show();
                            $('.dim_lpop_ongoing').show();
                            break;
                    }
                }
            });
        },

        getCurationList: function () {
            var params = window.location.search;
            $.ajax({
                url: '/zf_user/search/get-curation-list',
                type: "get",
                dataType: 'json',
                data: params.substring(1),
                success: function (response) {
                    switch (response.resultCode) {
                        case 'empty' :
                            break;
                        case 'success' :
                            $('#curation_list').html(response.innerHTML);
                            break;
                    }
                }
            });
        },

        lazyLoadExpandImage: function () {
            if ($('#news_info').length == 0 || $('#mainPage').val() !== 'y') {
                return false;
            }

            var st = $(document).scrollTop();
            var offsetTop = $('#news_info').offset().top - 1000;
            if (st > offsetTop) {
                $('.section_search').find('.lazy').each(function (index, el) {
                    if ($(el).attr('data-src')) {
                        $(el).attr('src', $(el).attr('data-src'));
                        $(el).removeAttr('data-src');
                        $(el).removeClass('lazy');
                    }
                });
            }
        },

        remoteControl: function () {
            $(window).scroll(function () {
                var st = $(document).scrollTop();
                var offsetTop = $('.content_wrap').offset().top - 73;
                var tabQuick = $('.tab_quick');
                if (st > offsetTop) {
                    tabQuick.addClass('fixed');
                    return false;
                }
                tabQuick.removeClass('fixed');
            });
        },

        rollingCuration: function() {
            $.fn.rollingCuration = function() {
                return this.each(function() {
                    var cur = 0;
                    var $self = $(this);
                    var $item = $("li", $self);
                    var itemLength = $item.length;
                    var timer;

                    function stop() {
                        clearTimeout(timer);
                    }
                    function play() {
                        timer = setTimeout(play, 5000);
                        next();
                    }
                    function prev() {
                        if (cur <= 0) {
                            cur = itemLength - 1;
                        } else {
                            cur--;
                        }
                        $item.css('display', 'none');
                        $item.eq(cur).css('display', 'block');

                    }
                    function next() {
                        if (cur >= itemLength - 1) {
                            cur = 0;
                        } else {
                            cur++;
                        }
                        $item.css('display', 'none');
                        $item.eq(cur).css('display', 'block');
                    }
                    $self.find('button').on('click', function(e) {
                        var _this = e.target;
                        var btnClass = _this.getAttribute('class');

                        switch (btnClass) {
                            case 'btn_prev' :
                                prev();
                                break;
                            case 'btn_next' :
                                next();
                                break;
                            case 'btn_play' :
                                play();
                                _this.setAttribute('class', 'btn_stop');
                                $(_this).text('멈춤');
                                break;
                            case 'btn_stop' :
                                stop();
                                _this.setAttribute('class', 'btn_play');
                                $(_this).text('자동재생');
                                break;
                        }
                    });
                    $self.find('.btn_play').trigger('click');
                });
            };
            $('.rolling_curation').rollingCuration();
        },

        rollingCompanyInfo: function() {
            var salesElements = document.querySelectorAll('.sales_rolling');
            setInterval(function() {
                for(var i=0, len=salesElements.length; i<len; i++) {
                    var ul = salesElements[i];
                    var children = ul.children;
                    if (children.length < 2) continue;

                    for(var j=0, jLen=children.length; j<jLen; j++) {
                        var el = children[j];
                        var display = (el.currentStyle) ?
                            el.currentStyle.display :
                            window.getComputedStyle(el).getPropertyValue("display");

                        el.style.display = (display === 'none') ? 'block' : 'none';
                    }
                }
            }, 5000);
        },

        pageLoadDataPush: function () {

            if (this.$keywordLogoArea.length > 0) {
                _self.pushDataLayer('search_logo', '');
            }

            if (this.$recruitInfo.length > 0) {
                _self.pushDataLayer('search_recruit', '');
            }

            if ($('#group_info').length > 0) {
                _self.pushDataLayer('search_group', '');
            }

            if ($('.wrap_subway_result').length > 0) {
                _self.pushDataLayer('search_subway', '');
            }

            if ($('.tool_infoarea').length > 0 || $('.cont_resume').length > 0) {
                _self.pushDataLayer('search_help', '');
            }
        },

        feedbackServiceRequest: function (elt) {
            if ($(elt).hasClass("btn_good")) {
                _self.$feedBackStatus.val('satisfaction');
            } else {
                _self.$feedBackStatus.val('dissatisfaction');
            }

            var params = {
                'target_value': _self.$searchword,
                'feedback_status': _self.$feedBackStatus.val(),
            };

            try {
                $.ajax({
                    url: '/zf_user/search/service-feedback-request',
                    type: "post",
                    data: params,
                    dataType: "json",
                    success: function (data) {
                        switch (data.code) {
                            case 'empty' :
                                alert('필수 입력 값이 없습니다.');
                                break;
                            case 'not-login' :
                                alert('로그인한 사용자만 이용가능합니다.');
                                break;
                            case 'fail' :
                                break;
                            case 'success' :
                                $(elt).parents(_self.$boxFeedBack).removeClass(_self.$toogleClass);
                                $(".step2").addClass(_self.$toogleClass);

                                _self.$feedback_idx = data.idx;

                                if (_self.$feedBackStatus.val() == 'satisfaction') {
                                    _self.$feedBackTitle.text('만족한 점이 있다면 이야기해 주세요!');
                                    _self.$feedBackContents.attr('placeholder', '작은 의견이라도 귀 기울여 듣겠습니다.');
                                } else {
                                    _self.$feedBackTitle.text('아쉬웠던 점이 있다면 이야기해 주세요!');
                                    _self.$feedBackContents.attr('placeholder', '귀 기울여 듣고, 반영할 수 있도록 노력하겠습니다.');
                                }

                                _self.$initTextareaTimer = setTimeout(function () {
                                    _self.initTextarea();
                                }, 10);

                                break;
                            default :
                                break;
                        }
                    },
                    error: function () {
                        return;
                    }
                });

            } catch (e) {
                return;
            }
        },

        feedbackServiceSubmit: function () {
            if ($.trim(_self.$feedBackContents.val()) == '') {
                alert('의견을 입력해 주세요!');
                return false;
            }

            var params = {
                'idx': _self.$feedback_idx,
                'feedback_contents': _self.$feedBackContents.val()
            };

            try {
                $.ajax({
                    url: '/zf_user/search/service-feedback-contents',
                    type: "post",
                    data: params,
                    dataType: "json",
                    success: function (data) {
                        switch (data.code) {
                            case 'empty' :
                                alert('필수 입력 값이 없습니다.');
                                break;
                            case 'not-login' :
                                alert('로그인한 사용자만 이용가능합니다.');
                                break;
                            case 'fail' :
                                break;
                            case 'success' :
                                _self.$boxFeedBack.removeClass(_self.$toogleClass);
                                $(".step3").addClass(_self.$toogleClass);
                                clearTimeout(_self.$initTextareaTimer);
                                break;
                            default :
                                break;
                        }
                    },
                });

            } catch (e) {
                return;
            }
        },

        closeFeedBack: function (elt) {
            $(elt).parents(this.$boxFeedBack).removeClass(this.$toogleClass);
            clearTimeout(this.$initTextareaTimer);
        },

        initTextarea: function () {
            this.$feedBackTextarea.focus(function () {
                $(this).parents(".input_opinion").addClass("focus");
            }).blur(function () {
                $(this).parents(".input_opinion").removeClass("focus");
            })
        },

        getPositionedLoginLayer: function ($) {
            $('#pop_login_layer_dimmed').show();
            var layerEl = $('#pop_login_layer'),
                h = layerEl.height(),
                w = layerEl.width();

            var sheight = document.body.scrollTop;

            if (sheight == 0) {
                sheight = document.documentElement.scrollTop;
            }
            var cheight = document.compatMode == "CSS1Compat" ?
                document.documentElement.clientHeight : document.body.clientHeight;

            $('#pop_login_layer').css("left", Math.ceil((document.body.clientWidth - w) / 2) + 250);
            $('#pop_login_layer').css("top", Math.ceil((cheight - h) / 2 + sheight));
            $('#pop_login_layer').show();
        },

        loggingRecommendUrl: function (el) {
            var elt = $(el),
                url = ''
            var idx = elt.attr('idx');

            if (idx) {
                url = $('#logging_url_' + idx).val();
            }

            if (!url) {
                return;
            }

            try {
                $.ajax({
                    url: '/zf_user/index/logging-crm-click',
                    data: {
                        'url': url
                    },
                    dataType: "json",
                    success: function () {
                    },
                    error: function () {
                        return;
                    }
                });

            } catch (e) {
                return;
            }
        },

        controlRightWingFloating: function (obj, current, extraSpace) {
            if (!obj) {
                return;
            }
            var contentHeight = $('.content_wrap').height(),
                wingOuterHeight = $('#rightWingUtil').outerHeight();

            if (contentHeight < _self.$wingHeight) {
                return;
            }

            if (parseInt(current + wingOuterHeight) < _self.$btnTopOffsetTop) {
                current = current - $('#curation_list').height();
                if (!$('.detail_option_section').hasClass('on') && parseInt(current + extraSpace) >= _self.$wingHeight - 60) {
                    obj.addClass('fixed_script').removeClass('fixed_script_end');
                } else {
                    try {
                        obj.removeClass('fixed_script fixed_script_end');
                    } catch (e) {
                    }
                }
            } else {
                obj.removeClass('fixed_script').addClass('fixed_script_end');
            }
        },

        pushDataLayer: function (event_flow, label) {
            try {
                dataLayer.push({
                    'event': 'ga_lead',
                    'category': 'search_recruit',
                    'event-flow': event_flow,
                    'event-label': label
                });
            } catch (e) {}
        },

        trackEvent: function (elt) {
            var data = $(elt).data('track_event').split("|"),
                category = data[0] || '',
                action = data[1] || '',
                opt_label = data[2] || '',
                opt_value = data[3] || '';

            if (!category || !action) {
                return true;
            }

            if (category == 'main' || category == 'section') {
                category = 'total_search';
            }

            if (category == 'total_search' && $('body').hasClass('fixed')) {
                category = 'total_search_fixed';
            }

            try {
                n_trackEvent(category, action, opt_label, opt_value);
            } catch (e) {
            }
        },

        companyInfoViewPopup: function (url) {
            window.open(url, 'companyInfoView');
        },

        passDataPopup: function (url, width) {
            var src_height = screen.height, b = '';

            if (src_height > 1020) {
                b = 'width=' + width + ', height=960, top=0, left=0, scrollbars=yes, status=no';
            } else {
                src_height = src_height - 60;
                b = 'width=' + width + ', height=' + src_height + ', top=0, left=0, scrollbars=yes, status=no';
            }

            window.open(url, '_blank', b + ', resizable=1');
        },

        toStringByComma: function (val) {
            return val.toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
        },

        updateBtnTopOffsetTop: function () {
            _self.$btnTopOffsetTop = $('.goTop').offset().top - 80;
        }
    };
})(window, jQuery);
