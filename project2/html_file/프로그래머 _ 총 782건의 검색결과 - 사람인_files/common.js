(function($, window) {
    var Saramin = {};

    Saramin.setFavorCompanyStatus = function(csn, del_fl, first_fl) {
        var state = del_fl === 'n';
        if (del_fl === 'n') {
            Saramin.showLayerIfFirstFavor(first_fl);
        }

        $('button.interested_corp[csn=' + csn + '], button.btn_interested_corp[csn=' + csn + ']').each(function() {
            var $el = $(this);
            if ($el.hasClass('interested_corp_xlarge')) {
                $el.toggleClass('interested_corp_xlarge_on', state);
            } else if ($el.hasClass('interested_corp_large')) {
                $el.toggleClass('interested_large_on', state);
            } else {
                $el.toggleClass('interested_on', state);
            }
            $el.attr('del_fl', (state) ? 'y' : 'n');
        });

        $('button.btn_jview[csn=' + csn + '], button.btn_jview[csn=' + csn + ']').each(function() {
            var $el = $(this);
            $el.toggleClass('on', state);
            $el.attr('del_fl', (state) ? 'y' : 'n');
        });
    };

    Saramin.showLayerIfFirstFavor = function (first_fl) {
        var html, $firstFavorLayer;

        if (first_fl !== 'y') {
            return false;
        }

        html = '<div class="bottom_lypopup" id="firstFavorLayer" style="z-index: 100">' +
            '    <div class="inner on">' +
            '        <div class="list">' +
            '            <p class="txt01">처음으로 <i class="ico_my_interest">관심</i>관심기업을 설정하셨네요!</p>' +
            '            <p class="txt02">새로운 채용공고와 기업 관련 소식이 있을 때<br/>메일/푸시를 보내드릴게요.</p>' +
            '           <div class="btn_line"><a href="/zf_user/member/favor-company/list" title="내 관심기업 목록 바로가기" class="btn_basic2 type02">내 관심기업 목록보기</a></div>' +
            '        </div>' +
            '        <button type="button" class="ly_close" id="btnCloseFirstFavor">닫기</button>' +
            '    </div>' +
            '</div>'
        ;

        jQuery(function($) {
            $('body').append(html);

            $firstFavorLayer = $('#firstFavorLayer');
            $firstFavorLayer.animate({
                bottom:'0'
            },400);

            $firstFavorLayer.find('#btnCloseFirstFavor').on('click', function (){
                $firstFavorLayer.animate({
                    bottom:'-200px'
                },400);
                setTimeout(function () {
                    $firstFavorLayer.remove();
                },400);
            });
        });
    };

    Saramin.setFavorCompany = function(obj) {
        var $el    = $(obj),
            csn    = $el.attr('csn'),
            del_fl = $el.attr('del_fl'),
            first_nudge = $el.attr('first_nudge');

        $.ajax({
            data : {'csn': csn, 'del_fl': del_fl, 'mode': 'single', first_nudge : first_nudge},
            dataType : 'json',
            type : 'post',
            url : '/zf_user/member/favor-company/set-favor-company-ajax',
            success : function(response) {
                switch (response.code) {
                    case 'c' :
                        Saramin.setFavorCompanyStatus(csn, del_fl, response.first_fl);
                        try {
                            if (window.opener && window.opener.Saramin && window.opener.Saramin.setFavorCompanyStatus) {
                                window.opener.Saramin.setFavorCompanyStatus(csn, del_fl);
                            }
                        } catch (e) {}
                        break;
                    case 'e6' :
                    case 'e7' :
                    case 'e8' :
                        alert(response.message);
                        break;
                    case 'e1' :
                    case 'e2' :
                    case 'e3' :
                    case 'e4' :
                        alert(response.message);
                        location.reload(true);
                        break;
                    case 'e5' :
                        Saramin.setFavorCompanyStatus(response.data.toString(), response.del_fl);
                        break;
                    default :
                        alert('오류가 발생하였습니다.');
                        break;
                }
            },
            error : function(request, status) {
                alert('오류가 발생하였습니다. - ' + status);
            }
        });
    };

    Saramin.showLoginLayer = function(obj) {
        Saramin.setLoginLayerPosition(obj);
        $('#job_login_wrapper').show();
    };

    Saramin.clonePosition = function($target, $source, options) {
        options = $.merge(options || {}, {'setTop': true, 'setLeft': true, 'setWidth': false, 'setHeight': false, 'offsetTop': 0, 'offsetLeft': 0});

        var css = {};
        if (options.setTop || options.setLeft) {
            var offsetParent = {top: 0, left: 0};
            if ($target.css('position') === 'absolute') {
                var $parent = $target.offsetParent();
                if (!$target.is(':visible')) {
                    $target.show();
                    $parent = $target.offsetParent();
                    $target.hide();
                }
                if ($parent.length > 0) {
                    offsetParent = $parent.offset();
                }
            }
            if (options.setTop) {
                css.top = $source.offset().top - offsetParent.top + options.offsetTop;
            }
            if (options.setLeft) {
                css.left = $source.offset().left - offsetParent.left + options.offsetLeft;
            }
        }
        if (options.setWidth) {
            css.width = $source.outerWidth();
        }
        if (options.setHeight) {
            css.height = $source.outerHeight();
        }

        $target.css(css);
    };

    Saramin.setLoginLayerPosition = function(obj) {
        var $el    = $('#job_login_wrapper'),
            $obj   = $(obj),
            offTop = $el.outerHeight() - 60,
            top    = $el.position().top;

        if (offTop > top) {
            offTop = top;
        }
        offTop = offTop * -1;

        if ($obj.hasClass('right-wing-scrap')) {
            var scrollY = window.document.all ? (!window.document.documentElement.scrollTop ? window.document.body.scrollTop : window.document.documentElement.scrollTop) : (window.pageYOffset ? window.pageYOffset : window.scrollY);
            offTop = offTop + scrollY;
        }

        Saramin.clonePosition($el, $obj, {setLeft: true, setTop: true, setWidth: false, setHeight: false, offsetTop : offTop, offsetLeft : 0});

        $el.css('left', 50);
    };

    Saramin.closeLoginLayer = function() {
        $('#job_login_wrapper').hide();
    };

    Saramin.closeFavorLayer = function() {
        $('#layerAddInterestedCorp').hide();
    };

    Saramin.favorTooltip = function(obj, mode) {
        $(obj).next().toggle(mode === 'on');
    };

    Saramin.btnJob = function(action, obj, target, term) {
        var $obj = $(obj);
        var async_flag = (action === 'ask_manager') ? false : true;

        $.ajax({
            dataType : 'json',
            async: async_flag,
            type : 'post',
            url : '/zf_user/recruit/push-service-login-status',
            success : function(response) {
                if (!response) {
                    return;
                }

                if (response.message === 'LOGIN') {
                    if (action === 'scrap') {
                        term = (term === 'calendar_layer') ? 'calendar' : term;
                        Saramin.scrapJob(obj, target, term);
                    } else if (action === 'favor') {
                        Saramin.setFavorCompany(obj);
                    } else if (action === 'ask_manager') {
                        var url = '/zf_user/recruit/ask-to-manager/rec_idx/' + $obj.data('rec_idx');
                        window.open(url, 'askToManager', 'width=555px,height=658px');
                    }
                } else if (response.message === 'NOUSER' || response.message === 'COMPANY') {
                    var redirectUrl = window.location.href ? encodeURIComponent(window.location.href) : '';
                    if (term === 'quick_login') {
                        if ($('#quick_apply_layer').length > 0) {
                            if (action === 'ask_manager') {
                                openIframeLoginLayer('', '', '', '', 'quick_login');
                            } else {
                                openIframeLoginLayer('', '', '', '', action);
                            }
                            return;
                        }
                    }
                    if (term === 'avatar' || term === 'read-jobs') {
                        if (confirm('로그인 후 이용하실 수 있습니다. 로그인하시겠습니까?')) {
                            window.location.href = '/zf_user/auth?ut=p&url=' + redirectUrl;
                        }
                        return;
                    }
                    var $popLoginLayer = $('#pop_login_layer');
                    if ($popLoginLayer.length > 0) {
                        $('#quick_apply_layer').hide();
                        if (action === 'scrap') {
                            $('input[name=layerScrapIdx]').val($obj.attr('rec_idx'));
                        }
                        if (action === 'favor') {
                            $('input[name=layerFavorIdx]').val($obj.attr('csn'));
                        }

                        setLayerPosition('pop_login_layer');
                        $popLoginLayer.show();
                        return;
                    }
                    if ($('#job_login_wrapper').length > 0 && term !== 'calendar_layer') {
                        Saramin.showLoginLayer(obj);
                    } else {
                        if (confirm('개인회원으로 로그인하시면 이용할 수 있습니다.\n\n로그인하시겠습니까?')) {
                            window.location.href = '/zf_user/auth?url=' + redirectUrl;
                        }
                    }
                }
            },
            error : function(request, status) {
                alert('정보 호출에 실패하였습니다. - ' + status);
            }
        });
    };

    Saramin.clickAds = function(rec_idx, spec) {
        var img  = new Image();
        img.src    = "/zf_user/jobs/click/ads-click?rec_idx=" + rec_idx + "&" + spec || '';
        img.onload = function() {};
    };

    Saramin.readJob = function(rec_idx, spec) {
        var img  = new Image();
        img.src    = "/zf_user/jobs/read-jobs/read?rec_idx=" + rec_idx + "&" + spec || '';
        img.onload = function() {};
    };

    Saramin.readJobCount = function() {
        try {
            $.ajax({
                dataType : 'json',
                type : 'post',
                url : '/zf_user/jobs/read-jobs/read-job-count',
                success : function(response) {
                    $('#recently-recruit-count').text(response);
                }
            });
        } catch (e) {
            $('#recently-recruit-count').text('0');
        }
    };

    Saramin.updateHomepageLink = function(rec_idx, form_gb, trackEvent) {
        var i = new Image();
        i.src    = "/zf_user/track-apply-form/update-homepage-apply-form-cnt-ajax?rec_idx=" + rec_idx + "&form_gb=" + form_gb + '&' + trackEvent;
        i.onload = function () {};
    };

    Saramin.showQuickLogin = function() {
        $('#quick_apply_layer').hide();
        setLayerPosition('pop_login_layer');
        $('#pop_login_layer').show();
    };

    Saramin.scrapJob = function(obj, target, term, open_type) {
        var $el              = $(obj),
            scraped          = $el.attr('scraped') || 'n',
            imgType          = $el.attr('imgType'),
            domainUrl        = '//www.saraminimage.co.kr',
            replaceImageList = {
                'list'      : {'y': '/category/bul_subtb_star.png', 'n': '/category/bul_subtb_star_on2.png'},
                'small'     : {'y': '/common/bul_sri_star_small.png', 'n': '/common/bul_sri_star_small_on.png'},
                'viewWidget': {'y': '/common/bul_sri_star.png', 'n': '/common/bul_sri_star_on.png'},
                'viewTop'   : {'y': '/recruit/templete_view/btn_view_util07.gif', 'n': '/recruit/templete_view/btn_view_util07_on2.gif'},
                'viewTop2'  : {'y': '/ui/common/btn_view_scrap_new.png', 'n': '/ui/common/btn_view_scrap_new_on.png'},
                'viewTop3'  : {'y': '/ui/recruit/view/ico_scrap.png', 'n': '/ui/recruit/view/ico_scrap_on.png'},
                'viewTop4'  : {'y': '/ui/recruit/view/btn_summary_scrap.png', 'n': '/ui/recruit/view/btn_summary_scrap_on.png'},
                'calendar'  : {'y': '/ui/open_recruit_calendar/btn_scrap_star.png', 'n': '/ui/open_recruit_calendar/btn_scrap_star_on.png'},
                'listV2'    : {'y': '/ui/btn/list_scrap.png', 'n': '/ui/btn/list_scrap_on.png'},
                'companyinfo'    : {'y': '/sri/company/information/ico/ico_scrap.png', 'n': '/sri/company/information/ico/ico_scrap_on.png'},
                'ai'        : {'y': '/common/sri_ai_star.png', 'n': '/common/sri_ai_star_on.png'},
            },
            replaceImage = (!!replaceImageList[imgType]) ? replaceImageList[imgType][scraped] : replaceImageList['viewWidget'][scraped],
            url          = (scraped === 'y') ? '/zf_user/recruit/person-recruit-scrap-unset-ajax' : '/zf_user/recruit/person-recruit-scrap-ajax',
            scrapedFl    = (scraped === 'y') ? 'n' : 'y',
            rec_idx      = $el.attr('rec_idx'),
            scrap_cnt    = 0;

        open_type = open_type || '';
        target = target || '';

        $.ajax({
            data: {'rec_idx': rec_idx},
            dataType : 'json',
            type : 'post',
            url : url,

            /**
             * @param {int} response.error_code
             * @param {string} response.error_message
             * @param {int} response.scrap_cnt
             */
            success : function(response) {
                if (response.error_code === 0) {
                    scrap_cnt = response.scrap_cnt;

                    $el.children().attr('src', domainUrl + replaceImage);
                    $el.attr('scraped', scrapedFl);

                    // a태그 + img타입 스크랩
                    var target_id = (target !== '') ? '#' + target + ' .scrap-' + rec_idx : '.scrap-' + rec_idx ;
                    $(target_id).each(function() {
                        var $targetEl       = $(this),
                            targetImageType = $targetEl.attr('imgType');

                        if (targetImageType === 'button') {
                            $targetEl.toggleClass('on', scrapedFl === 'y')
                        } else if (targetImageType === 'span') {
                            $targetEl.find('span').toggleClass('on', scrapedFl === 'y')
                        } else {
                            var targetReplaceImage = (!!replaceImageList[targetImageType]) ? replaceImageList[targetImageType][scraped] : replaceImageList['viewWidget'][scraped];
                            $targetEl.children().attr('src', domainUrl + targetReplaceImage);
                            $targetEl.attr('scraped', scrapedFl);
                        }
                    });

                    // button 형태 스크랩
                    $('.like_btn.scrap-' + rec_idx).each(function() {
                        $(this).toggleClass('on', scrapedFl === 'y');
                    });

                    $('div.jv_util strong.count_scrap').text(scrap_cnt);

                    // 스크랩 카운트 업데이트
                    $('#login_scrap_count').text(scrap_cnt);

                    $('#side_scrap_count').text(scrap_cnt > 99 ? '99+' : scrap_cnt);

                    $('#timeline-scrap-count').text(scrap_cnt);

                    $('#lud_scrap_cnt').text(scrap_cnt > 99 ? '99+' : scrap_cnt + '건');

                    $('#timeline-scrap-count').text(scrap_cnt);

                    $('#public_mylayer_scrap').text(scrap_cnt > 99 ? '99+' : scrap_cnt);

                    // 개인MY > 내 공고활동 탭 카운트 업데이트
                    $('#scrapTotalCount').text(scrap_cnt > 999 ? '999+' : scrap_cnt);
                    
                    var activityStatus = 'n';
                    if ($('#activity_nudge').length > 0) {
                        try {
                            // loadTodayActivityNudge();
                            activityStatus = 'y';
                        } catch (e) {}
                    }

                    if (window.parent.jQuery('#activity_nudge').length > 0 && activityStatus === 'n') {
                        try {
                            // window.parent.loadTodayActivityNudge();
                        } catch (e) {}
                    }

                    // 스크랩 와이즈로그
                    (function (click_term) {
                        click_term = click_term || 'list';

                        var protocol       = (("https:" === window.document.location.protocol) ? "https://" : "http://"),
                            click_campaign = (scrapedFl === 'y') ? 'scrap' : 'scrap_cancel',
                            loggingUrl     = protocol + window.document.location.host + '/click_count.php?click_position=scrap&click_campaign=' + click_campaign + '&click_term=' + click_term + '&rec_idx=' + rec_idx;

                        n_click_logging(loggingUrl);
                    }(term || ''));
                } else if (response.error_code === 1 && response.error_message === 'not-login' ) {
                    var redirectUrl    = window.location.href ? encodeURIComponent(window.location.href) : '',
                        $popLoginLayer = $('#pop_login_layer');

                    if (open_type === 'layer' && $popLoginLayer.length > 0) {
                        $('#quick_apply_layer').hide();
                        setLayerPosition('pop_login_layer');
                        $('input[name=layerScrapIdx]').val(rec_idx);
                        $popLoginLayer.show();
                    } else {
                        if (confirm('개인회원으로 로그인하시면 이용할 수 있습니다.\n\n로그인하시겠습니까?')) {
                            window.location.href = '/zf_user/auth?url=' + redirectUrl;
                        }
                    }
                } else if (response.error_code === 1 && response.error_message === 'empty-recruit') {
                    alert('등록된 공고가 없습니다.');
                } else if (response.error_code === 1 && response.error_message === 'scrap-max') {
                    alert('스크랩은 최대 3,000건까지 할 수 있습니다.');
                }
            }
        });
    };

    Saramin.open = function(elt, specs) {
        var sURL = elt.href || "about:blank",
            name = elt.target || "_blank";

        window.open(sURL, name, specs).focus();
    };

    Saramin.openUrl = function(link, target, specs) {
        var sURL  = link || "about:blank",
            name  = target || "_self";

        window.open(sURL, name, specs || '').focus();
    };

    Saramin.validateLoginForm = function(form) {
        if (form.id.value === "") {
            alert("id 를 입력하세요");
            form.id.focus();
            return false;
        }
        if (form.id.value.indexOf(" ") > 0) {
            alert("id에 공백에 있습니다. 공백을 제거해주세요");
            form.id.focus();
            return false;
        }
        if (form.id.value.length < 4) {
            alert("id는 4자이상이어야 합니다");
            form.id.focus();
            return false;
        }
        if (form.password.value === "") {
            alert("password 를 입력하세요");
            form.password.focus();
            return false;
        }
        if (form.password.value.indexOf(" ") > 0) {
            alert("password에 공백에 있습니다. 공백을 제거해주세요");
            form.password.focus();
            return false;
        }
        if (4 > form.password.value.length) {
            alert("password는 4자이상이어야 합니다");
            form.password.focus();
            return false;
        }

        form.action = "https://" + window.document.location.hostname + "/zf_user/auth/login";
    };

    Saramin.showLayer = function(ev, id) {
        var $layer  = $('#' + id),
            $source = $(ev.target);

        var options = $.extend({
            setLeft:    true,
            setTop:     true,
            setWidth:   false,
            setHeight:  false,
            offsetTop:  0,
            offsetLeft: 0
        }, arguments[2] || {});

        Saramin.clonePosition($layer, $source, options);
        $layer.show();
    };

    Saramin.hideLayer = function(id) {
        $('#' + id).hide();
    };

    Saramin.avatarGnv = function() {
        Saramin.setAvatarCount();
    };

    Saramin.setAvatarCount = function() {
        try {
            $.ajax({
                dataType : 'json',
                type : 'post',
                url : '/zf_user/member/avatar/list-ajax',

                /**
                 * @param {integer} response.recruit_count
                 * @param {integer} response.resume_count
                 */
                success : function(response) {
                    if (response.recruit_count > 0) {
                        $('#icon_avatar_nudge_count').html('NEW ' + response.recruit_count + '건').removeClass('hide');
                    }
                    if (response.resume_count > 0) {
                        $('#gnb_resume_direct').attr('href', '/zf_user/resume/resume-manage');
                    }
                }
            });
        } catch (e) {}
    };

    Saramin.validateEmail = function(email) {
        var exp = /^[0-9a-z._+-]+@([0-9a-z_-]+\.)+[a-z]{2,10}$/i;
        return exp.test(email);
    };

    Saramin.validateHomepage = function(homepage) {
        var exp = new RegExp("[0-9a-zA-Z_-]+(\\.[0-9a-zA-Z_-]+)*(\\.com|\\.net|\\.org|\\.biz|\\.info|\\.me|\\.name|\\.edu|\\.gov|\\.int|\\.jobs|\\.tel|\\.mobi|\\.museum|\\.pro|\\.travel|\\.aero|\\.arpa|\\.cat|\\.coop|\\.asia|\\.kr|\\.co\\.kr|\\.or\\.kr|\\.pe\\.kr|\\.re\\.kr|\\.ne\\.kr|\\.seoul\\.kr|\\.busan\\.kr|\\.daegu\\.kr|\\.incheon\\.kr|\\.gwangju\\.kr|\\.daejeon\\.kr|\\.ulsan\\.kr|\\.gyeonggi\\.kr|\\.gangwon\\.kr|\\.chungbuk\\.kr|\\.chungnam\\.kr|\\.jeonbuk\\.kr|\\.jeonnam\\.kr|\\.gyeongbuk\\.kr|\\.gyeongnam\\.kr|\\.go\\.kr|\\.mil|\\.mil\\.kr|\\.ac|\\.ac\\.kr|\\.hs\\.kr|\\.ms\\.kr|\\.es\\.kr|\\.kg\\.kr|\\.sc\\.kr|\\.jeju\\.kr|\\.cc|\\.jp|\\.co\\.jp|\\.or\\.jp|\\.eu|\\.tw|\\.tv|\\.cn|\\.au|\\.ca|\\.de|\\.fr|\\.es|\\.us|\\.uk|\\.com\\.cn|\\.net\\.cn|\\.in|\\.net\\.in|\\.co\\.in|\\.com\\.my|\\.co|\\.cm|\\.vn|\\.land)$");
        return exp.test(homepage);
    };

    Saramin.validateDomain = function(str) {
        if (!str && str.length === 0) {
            return true;
        }

        var arr     = ['.co', '.cm'],
            dot     = str.lastIndexOf("."),
            dname   = str.substring(dot, str.length);

        for (var i = 0; i < arr.length; i++) {
            if (dname === arr[i]) {
                return false;
            }
        }
        return true;
    };

    Saramin.HoverMenu = function() {
        this.initialize.apply(this, arguments);
    };
    Saramin.HoverMenu.prototype = {
        initialize: function(el, $sub, options) {
            if ($sub.length === 0) {
                return;
            }

            this.options = $.extend({timeout: 0, eventTypes: ['mouseover'], hideOnClick: true, cssClassName: 'hover'}, options || {});
            this.$el     = $('#' + el).children(':first');
            this.$sub    = $sub;

            this.queue = [];
            this.init();
        },
        init: function() {
            $.each(this.options.eventTypes, function(key, type) {
                switch(type) {
                    case 'click' :
                        this.$el.on('click', function() {
                            if (!this.options.cssClassName) {
                                this.$sub.toggle();
                            } else {
                                this.$sub.toggleClass(this.options.cssClassName);
                            }
                        }.bind(this));
                        break;
                    case 'mouseover' :
                        this.$sub.on('mouseover', this.enterMenu.bind(this));
                        this.$el.on('mouseover', this.enterMenu.bind(this));
                        break;
                }
            }.bind(this));

            /** @this Saramin.HoverMenu */
            var mouseoutFnc = function() {
                if (this.options.timeout > 0) {
                    this.queue.push(this.leaveMenu.delay(this.options.timeout / 1000, this));
                } else {
                    this.leaveMenu(this);
                }
            };
            this.$el.on('mouseout', mouseoutFnc.bind(this));
            this.$sub.on('mouseout', mouseoutFnc.bind(this));

            if (this.options.hideOnClick) {
                this.$sub.on('click', function() {
                    if (!this.options.cssClassName) {
                        this.$sub.toggle();
                    } else {
                        this.$sub.toggleClass(this.options.cssClassName);
                    }
                }.bind(this));
            }
        },
        enterMenu: function () {
            while (this.queue.length) {
                clearTimeout(this.queue.shift());
            }

            if (!this.options.cssClassName) {
                this.$sub.show();
            } else {
                this.$sub.addClass(this.options.cssClassName);
            }
        },
        leaveMenu: function(instance) {
            if (instance.$el.length > 0) {
                if (!instance.options.cssClassName) {
                    instance.$sub.hide();
                } else {
                    instance.$sub.removeClass(instance.options.cssClassName);
                }
            }
        },
        focusMenu: function() {
            this.hideAll();
            if (!this.options.cssClassName) {
                this.$sub.show();
            } else {
                this.$sub.addClass(this.options.cssClassName);
                this.$sub.show();
            }
        },
        hideAll: function() {
            $('.gnb_sub_menu').hide();
        }
    };

    Saramin.SideWidget = function() {
        this.initialize.apply(this, arguments);
    };
    Saramin.SideWidget.prototype = {
        initialize: function(sticker, options) {
            this.$sticker = $('#' + sticker);
            this.options = $.extend({
                top_limit: 0,
                top_default: 0,
                fixed_css: 'fixed',
                absolute_css: 'absolute',
                bottom_css: 'absolute'
            }, options || {});

            $(window).on('scroll', this.scroll.bind(this));

            this.isIE7Under = window.document.all && !window.document.querySelector;
        },
        scroll: function() {
            var sTop   = document.body.scrollTop || document.documentElement.scrollTop,
                sLeft  = document.body.scrollLeft || document.documentElement.scrollLeft,
                sWidth = document.body.scrollWidth || document.documentElement.scrollWidth;

            sTop = sTop + this.options.top_default;

            var absolute_top_imit = 0,
                $rightwing        = $('#sidewidget_right_wing');

            if ($rightwing.length > 0) {
                absolute_top_imit += $rightwing.position().top;
                absolute_top_imit += $rightwing.outerHeight();
            }

            if (absolute_top_imit > 300) {
                this.options.top_limit = this.options.top_limit > absolute_top_imit ? absolute_top_imit : this.options.top_limit;
            }

            if (this.options.bottom_css === 'sidewidget-absolute-bottom') {
                var footer    = document.getElementById("footer"),
                    bottomPos = footer.offsetTop;

                if (sTop <= this.options.top_limit) {
                    this.$sticker.removeClass(this.options.fixed_css);
                    this.$sticker.addClass(this.options.absolute_css);
                } else if (bottomPos < sTop + 280) {
                    this.$sticker.removeClass(this.options.fixed_css);
                    this.$sticker.addClass(this.options.bottom_css);
                } else {
                    this.$sticker.removeClass(this.options.bottom_css);
                    this.$sticker.removeClass(this.options.absolute_css);
                    this.$sticker.addClass(this.options.fixed_css);
                }
            } else if (this.isIE7Under || (sLeft > 0 && sWidth < 1270)) {
                if (this.isIE7Under) {
                    this.$sticker.css('margin-left', '-60px');
                }

                var topPos = sTop < this.options.top_limit ? this.options.top_limit : sTop;
                this.$sticker.removeClass(this.options.fixed_css);
                this.$sticker.addClass(this.options.absolute_css);
                this.$sticker.css('position', 'absolute');
                this.$sticker.css('top', topPos);
            } else {
                this.$sticker.css('position', '');
                this.$sticker.css('top', '');
                if (sTop < (this.options.top_limit + 150)) {
                    this.$sticker.removeClass(this.options.fixed_css);
                    this.$sticker.addClass(this.options.absolute_css);
                } else {
                    this.$sticker.removeClass(this.options.absolute_css);
                    this.$sticker.addClass(this.options.fixed_css);
                }
            }
        }
    };

    Saramin.ToolTip = function() {
        this.initialize.apply(this, arguments);
    };
    Saramin.ToolTip.prototype = {
        initialize: function(contentWidth, options) {
            this.contentWidth     = contentWidth;
            this.$currentLayerEl  = '';
            this.currentLayerName = '';

            this.options = $.extend({
                iframe_id : '',             // background iframe element id
                arrow_id : '',              // 화살표 layer element id
                switch_id : '',             // 풍선도움말 사용 여부 checkbox element id
                arrow_top_id : '',          // 상단 화살표 layer element id
                plus_top_pos : {},          // plus top position (tooltip, arrow, arrow_top, iframe)
                plus_left_pos : {},         // plus left position (tooltip, arrow, arrow_top, iframe)
                minus_top_pos : {},         // minus top position (tooltip, arrow, arrow_top, iframe)
                minus_left_pos : {}         // minus left position (tooltip, arrow, arrow_top, iframe)
            }, options || {});

            this.$iframeLayer        = '';
            this.$arrowLayer         = '';
            this.$arrowTopLayer      = '';
            this.$switchEl           = '';

            // background iframe layer
            if (this.options.iframe_id !== '') {
                this.$iframeLayer = $('#' + this.options.iframe_id);
            }

            // 하단 화살표 layer
            if (this.options.arrow_id !== '') {
                this.$arrowLayer = $('#' + this.options.arrow_id);
            }

            // 상단 화살표 layer
            if (this.options.arrow_top_id !== '') {
                this.$arrowTopLayer = $('#' + this.options.arrow_top_id);
            }

            // 도움말 레이어 on & off element
            if (this.options.switch_id !== '') {
                this.$switchEl = $('#' + this.options.switch_id);
            }
        },
        show: function(type, el, name, absoluteLayer, ignoreSwitch) {
            var $el = $(el);

            // 다른 풍선 도움말 레이어가 열려 있을 경우 해당 레이어를 감춘다.
            if (this.$currentLayerEl !== '' && this.currentLayerName !== '') {
                if (this.$currentLayerEl !== $el) {
                    this.hide(this.currentLayerName);
                }
            }

            ignoreSwitch = ignoreSwitch || false;

            // 현재 보여주는 레이어의 element와 name을 변수에 담는다.
            this.$currentLayerEl  = $el;
            this.currentLayerName = name;

            if (!ignoreSwitch && this.$switchEl !== '' && this.$switchEl.is(':checked')) {
                return;
            }

            // 해당 element가 readonly일 경우 레이어를 보여주지 않는다.
            if ($el.prop('readonly')) {
                return;
            }

            // 선택한 element의 위치값을 얻는다.
            var elPosTop  = $el.position().top,
                elPosLeft = $el.position().left;

            // 레이어로 띄웠을 경우 위치가 해당 레이어의 상대 값을 가져와 해당 레이어의 위치만큼 더해준다.
            if (absoluteLayer) {
                var $absoluteLayer = $(absoluteLayer);
                if ($absoluteLayer.length > 0 && $absoluteLayer.is(':visible')) {
                    elPosTop  = elPosTop + $absoluteLayer.position().top;
                    elPosLeft = elPosLeft + $absoluteLayer.position().left;
                }
            }

            var $tipLayer = $('#' + name);

            // 도움말 레이어 left position
            var tipLayerLeft = elPosLeft - 5;

            var layerWidth   = elPosLeft + $tipLayer.outerWidth(),
                elementWidth = elPosLeft + $el.innerWidth(),
                distance     = layerWidth - elementWidth;

            // 도움말 레이어가 content 밖으로 나가는 경우
            if (distance > 0 && layerWidth > (this.contentWidth)) {
                tipLayerLeft = (elPosLeft - distance) + 20;
            }

            var arrowLayerType = 'bottom',
                arrowLayerTop  = 0,
                tipLayerTop    = 0;

            // 도움말 레이어 top & z-index position
            // 도움말 레이어가 content 상단 밖으로 나가는 경우
            if (elPosTop < $tipLayer.outerHeight()) {
                tipLayerTop = elPosTop + $el.outerHeight();
                arrowLayerType = 'top';
            } else {
                tipLayerTop = elPosTop - $tipLayer.outerHeight();
            }
            var tipLayerZIndex = 100;

            // 화살표 레이어 보이기
            if (type === 'balloon' && this.$arrowLayer !== '') {
                // 화살표 레이어 top & left & z-index position
                if (arrowLayerType === 'top') {
                    arrowLayerTop = elPosTop + $el.outerHeight();
                    tipLayerTop = tipLayerTop + this.$arrowTopLayer.outerHeight();
                } else {
                    arrowLayerTop = elPosTop - this.$arrowLayer.outerHeight();
                    tipLayerTop = tipLayerTop - this.$arrowLayer.outerHeight();
                }
                var arrowLayerLeft = elPosLeft + 3;
                var arrowLayerZIndex = 101;

                this._showArrow(arrowLayerType, arrowLayerTop, arrowLayerLeft, arrowLayerZIndex);
            }

            // 도움말 레이어 보이기
            this._showTip($tipLayer, tipLayerLeft, tipLayerTop, tipLayerZIndex);

            // layer background iframe 보이기
            if (this.iframeLayer !== '') {
                var iframeLayerWidth  = $tipLayer.outerWidth();
                var iframeLayerHeight = $tipLayer.outerHeight() - 15;
                var iframeLayerTop    = tipLayerTop;
                var iframeLayerLeft   = tipLayerLeft;
                var iframeLayerZIndex = tipLayerZIndex - 1;

                this._showIframe(iframeLayerWidth, iframeLayerHeight, iframeLayerTop, iframeLayerLeft, iframeLayerZIndex);
            }
        },
        hide: function(name) {
            // 화살표 레이어 감추기
            if (this.$arrowLayer !== '') {
                this.$arrowLayer.hide();
            }

            // 화살표 상단 레이어 감추기
            if (this.$arrowTopLayer !== '') {
                this.$arrowTopLayer.hide();
            }

            // layer background iframe 감추기
            if (this.$iframeLayer !== '') {
                this.$iframeLayer.hide();
            }

            // 도움말 레이어 감추기
            $('#' + name).hide();
        },
        _showTip: function($el, left, top, zIndex) {
            top  = this._setCustomPosition('tooltip', 'top', top);
            left = this._setCustomPosition('tooltip', 'left', left);

            $el.css({'left': left, 'top': top, 'z-index': zIndex}).show();
        },
        _showArrow: function(type, top, left, zIndex) {
            if (type === 'top') {
                top  = this._setCustomPosition('arrow_top', 'top', top);
                left = this._setCustomPosition('arrow_top', 'left', left);

                this.$arrowTopLayer.css({'top': top, 'left': left, 'z-index': zIndex}).show();
            } else {
                top  = this._setCustomPosition('arrow', 'top', top);
                left = this._setCustomPosition('arrow', 'left', left);

                this.$arrowLayer.css({'top': top, 'left': left, 'z-index': zIndex}).show();
            }
        },
        _showIframe: function(width, height, top, left, zIndex) {
            top  = this._setCustomPosition('iframe', 'top', top);
            left = this._setCustomPosition('iframe', 'left', left);

            this.$iframeLayer.css({'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}).show();
        },
        _setCustomPosition: function(layerType, posType, value) {
            var plus_pos  = this.options['plus_' + posType + '_pos.' + layerType],
                minus_pos = this.options['minus_' + posType + '_pos.' + layerType];

            if (plus_pos && !isNaN(plus_pos)) {
                value = value + plus_pos;
            }
            if (minus_pos && !isNaN(minus_pos)) {
                value = value - minus_pos;
            }

            return value;
        }
    };

    Saramin.SidewidgetFixed = function() {
        this.initialize.apply(this, arguments);
    };
    Saramin.SidewidgetFixed.prototype = {
        initialize: function(sticker, wrapper, options) {
            this.scrollFl = false;
            this.$sticker = $('#' + sticker);
            this.$wrapper = $('#' + wrapper);
            this.wraperOffset = '';

            this.setOptions(options);

            this.moveY = 0;
            this.calcPosition();

            this.browser = navigator.appVersion.indexOf('MSIE 6.0');

            $(window).on('scroll', this.scroll.bind(this)).on('resize', this.calcPosition.bind(this));
        },
        setOptions: function(options) {
            this.options = $.extend({
                top_limit: 0,
                top_margin : 6
            }, options || {});
        },
        calcPosition: function() {
            var wrapperWidth = this.$wrapper.outerWidth();

            this.wraperOffset = this.$wrapper.offset();
            this.wX           = this.wraperOffset.left + wrapperWidth + 10;

            if (this.options.bannerFl) {
                this._setTargetStyle('fixed', this.wX + 'px', this.options.top_margin + 'px');
            }

            if (this.scrollFl) {
                if (this.browser === -1) {
                    this._setTargetStyle('fixed', this.wX + 'px', this.options.top_margin + 'px');
                } else {
                    this._setTargetStyle('absolute', '50', this.moveY + 'px');
                }
            }
        },
        scroll: function() {
            var top = $(window.document).scrollTop();
            if (this.options.top_limit - 10 <= top) {
                this.scrollFl = true;
                this.moveY    = top;

                if (this.browser === -1) {
                    this._setTargetStyle('fixed', this.wX + 'px', this.options.top_margin + 'px');
                } else {
                    var yY = this.moveY - this.options.top_limit + 31;
                    this._setTargetStyle('absolute', '', yY + 'px');
                }
            } else {
                this.scrollFl = false;
                this._setTargetStyle('absolute', '', '');
            }
        },
        _setTargetStyle: function(pos, lL, tT) {
            this.$sticker.css({'position': pos, 'left': lL, 'top': tT});
        }
    };

    Saramin.CheckPersonsInfoForBoard = function() {
        this.initialize.apply(this, arguments);
    };
    Saramin.CheckPersonsInfoForBoard.prototype = {
        initialize: function() {

        },
        fncTrim: function(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        },
        fncTrimAll: function(str) {
            return str.replace(/\s/g,"").replace(/_/g,"").replace(/\n/g,"").replace(/\r/g,"");
        },
        fncNum: function(str) {
            return this.fncTrim(str).match(/^[0-9]+$/);
        },
        fncJumin: function(num) {
            num = this.fncTrim(num);

            if(num.length === 13) {
                num = num.substring(0, 6) + "-" + num.substring(6, 13);
            } else if(num.length !== 14) {
                return false;
            }
            num = num.match(/^([0-9]{6})-?([0-9]{7})$/);
            if (!num) {
                return false;
            }
            var num1 = RegExp.$1,
                num2 = RegExp.$2;

            if (!num2.substring(0, 1).match(/^[1-4]$/)) {
                return false;
            }

            num = num1 + num2;
            var sum   = 0,
                last  = num.charCodeAt(12) - 0x30,
                bases = "234567892345";

            for (var i = 0; i < 12; i++) {
                sum += (num.charCodeAt(i) - 0x30) * (bases.charCodeAt(i) - 0x30);
            }

            return (11 - (sum % 11)) % 10 === last;
        },
        chkJumin: function(str) {
            var len   = str.length,
                a     = "",
                tmp   = "",
                tmp2  = "";

            for (var i = 0; i < len; i++) {
                a = str.substring(i, i + 1);
                if (!this.fncNum(a)) {
                    continue;
                }

                tmp  = str.substring(i, i + 14);
                tmp2 = str.substring(i, i + 13);

                if (!!this.fncJumin(tmp) || !!this.fncJumin(tmp2)) {
                    return false;
                }
            }

            return true;
        },
        chkCellNo: function(str) {
            var cell = /^01[016789]-?[1-9][0-9]{2,3}-?[0-9]{4}$/,
                len  = str.length,
                a    = "",
                tmp  = "",
                tmp2 = "",
                tmp3 = "";

            for (var i = 0; i < len; i++) {
                a = str.substring(i, i + 1);
                if (!this.fncNum(a)) {
                    continue;
                }

                tmp  = str.substring(i, i + 11);
                tmp2 = str.substring(i, i + 12);
                tmp3 = str.substring(i, i + 13);

                if (cell.test(tmp) || cell.test(tmp2) || cell.test(tmp3)) {
                    return false;
                }
            }

            return true;
        },
        execute: function(str) {
            str = this.fncTrimAll(str);
            if (!this.chkCellNo(str) || !this.chkJumin(str)) {
                alert("해당 게시물에 개인정보를 포함된 내용이 있습니다.\n\n게시하는 경우 불특정 다수에게 개인정보가 노출 되어 악용될 수\n있습니다.\n\n게시물을 다시 확인 해주세요.");
                return false;
            }
            return true;
        }
    };

    Saramin.setRelayViewPosition = function(id) {
        var target = id;
        var d = new Date();
        d.setTime(d.getTime() + 60000);
        var expires = "expires="+d.toUTCString();
        document.cookie = "relay_view_to=" + target + ";" + expires + ";path=/;"
    };

    var setLayerPosition = function(id) {
        var $layerEl = $('#' + id),
            h        = $layerEl.outerHeight(),
            w        = $layerEl.outerWidth(),
            sheight  = window.document.body.scrollTop;

        if (sheight === 0) {
            sheight = window.document.documentElement.scrollTop;
        }
        var cheight = window.document.compatMode === "CSS1Compat" ? window.document.documentElement.clientHeight : window.document.body.clientHeight;

        $layerEl.css({
            left: Math.ceil((document.body.clientWidth - w) / 2) + 250,
            top: Math.ceil(((cheight - h) / 2) + sheight)
        });
    };

    $.extend(String.prototype, {
        byteLength: function() {
            var byteLength = 0;
            for (var i = 0; i < this.length; i++) {
                byteLength += (4 < escape(this.charAt(i)).length) ? 2 : 1;
            }
            return byteLength;
        },
        truncateByte: function(maxLength, truncation) {
            var byteLength = 0;
            for (var i = 0; i < this.length; i++) {
                byteLength += (4 < escape(this.charAt(i)).length) ? 2 : 1;
                if (maxLength < byteLength) {
                    return this.truncate(i, truncation);
                }
            }
            return this;
        },
        capitalize: function(lower) {
            return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        }
    });

    window.setDocumentCookie = function(name, value) {
        var argv = setDocumentCookie.arguments,
            argc = setDocumentCookie.arguments.length,
            expires = (argc > 2) ? argv[2] : null,
            path = (argc > 3) ? argv[3] : null,
            domain = (argc > 4) ? argv[4] : null,
            secure = (argc > 5) ? argv[5] : false;

        document.cookie = name + "=" + escape(value) +
            (!expires ? "" : ("; expires=" + expires.toGMTString())) +
            (!path ? "" : ("; path=" + path)) +
            (!domain ? "" : ("; domain=" + domain)) +
            (!secure ? "; secure" : "");
    };

    if ( ! window.atob ){

        window.atob = function ( b64text ){  return Base64.decode( b64text );  };
        window.btoa = function ( utf8text ){  return Base64.encode( utf8text );  };

        var Base64 = {

            keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


            encode : function ( input ){
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var x = 0;

                input = Base64._utf8_encode( input );

                while ( x < input.length ){

                    chr1 = input.charCodeAt( x++ );
                    chr2 = input.charCodeAt( x++ );
                    chr3 = input.charCodeAt( x++ );

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if ( isNaN(chr2) ) enc3 = enc4 = 64;
                    else if ( isNaN(chr3) ) enc4 = 64;

                    output = output + this.keyStr.charAt( enc1 ) + this.keyStr.charAt( enc2 ) + this.keyStr.charAt( enc3 ) +
                      this.keyStr.charAt( enc4 );
                }

                return output;
            },


            decode : function ( input ){
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var x = 0;

                input = input.replace( /[^A-Za-z0-9\+\/\=]/g , "" );

                while ( x < input.length ){

                    enc1 = this.keyStr.indexOf( input.charAt(x++) );
                    enc2 = this.keyStr.indexOf( input.charAt(x++) );
                    enc3 = this.keyStr.indexOf( input.charAt(x++) );
                    enc4 = this.keyStr.indexOf( input.charAt(x++) );

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode( chr1 );

                    if ( enc3 != 64 ) output = output + String.fromCharCode( chr2 );

                    if ( enc4 != 64 ) output = output + String.fromCharCode( chr3 );
                }

                output = Base64._utf8_decode( output );

                return output;
            },


            _utf8_encode : function ( string ){
                string = string.replace( /\r\n/g , "\n" );
                var utftext = "";

                for ( var n = 0; n < string.length; n++ ){

                    var c = string.charCodeAt( n );

                    if ( c < 128 ) utftext += String.fromCharCode( c );

                    else if ( (c > 127) && (c < 2048) ){
                        utftext += String.fromCharCode( (c >> 6) | 192 );
                        utftext += String.fromCharCode( (c & 63) | 128 );
                    }

                    else {
                        utftext += String.fromCharCode( (c >> 12) | 224 );
                        utftext += String.fromCharCode( ( (c >> 6) & 63 ) | 128 );
                        utftext += String.fromCharCode( (c & 63) | 128 );
                    }
                }

                return utftext;
            },


            _utf8_decode : function ( utftext ){
                var string = "";
                var x = 0;
                var c = c1 = c2 = 0;

                while ( x < utftext.length ){

                    c = utftext.charCodeAt( x );

                    if ( c < 128 ) {
                        string += String.fromCharCode( c );
                        x++;
                    }

                    else if ( (c > 191) && (c < 224) ){
                        c2 = utftext.charCodeAt( x + 1 );
                        string += String.fromCharCode( ( (c & 31) << 6 ) | (c2 & 63) );
                        x += 2;
                    }

                    else {
                        c2 = utftext.charCodeAt( x + 1 );
                        c3 = utftext.charCodeAt( x + 2 );
                        string += String.fromCharCode( ( (c & 15) << 12 ) | ( (c2 & 63) << 6 ) | (c3 & 63) );
                        x += 3;
                    }
                }

                return string;
            }
        }
    }

    window.Saramin = Saramin;
})(jQuery, window);