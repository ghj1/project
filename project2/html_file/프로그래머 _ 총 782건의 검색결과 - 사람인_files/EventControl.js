var EventControl = function () {
    this.init.apply(this);
};

(function (window, $) {

    EventControl.prototype = {
        init: function () {
            this.setVariables();
            this.bindEvent();
        },

        setVariables: function () {
            this.$searchCommon = new SearchCommon();
            this.$header = $('#header_search');
            this.$rightWingUtil = $('#rightWingUtil');
            this.$groupCompany = $('.inbox_topcompany');
            this.$topButton = $('.goTop');
            this.$contentWrap = $('.content_wrap');
            this.$filterWrap = $('.wrap_result_filter');
            this.$boxFeedBack = $(".box_feedback");
            this.$feedBackBtn = $(".btn_g", this.$boxFeedBack);
            this.$feedBackClose = $(".btn_close", this.$boxFeedBack);
            this.$feedBackTextarea = $(".sri_textarea", this.$boxFeedBack);
            this.$feedBackSubmit = $(".btn_submit", this.$boxFeedBack);
            this.$filter = $("#async_sfilter");
            this.$recruitInfo = $("#recruit_info");
            this.$searchMain = $(".body_search");
        },

        bindEvent: function () {
            var self = this;

            self.$header
                .on('mouseenter focus', '#member_menu, #total_menu, #hidden_gnb', function () {
                    $(this).addClass('layer_on');
                })
                .on('mouseleave', '#member_menu, #total_menu, #hidden_gnb', function () {
                    $(this).removeClass('layer_on');
                })
                .on('mouseenter', '.dimmed', function () {
                    $('#total_menu').removeClass('layer_on');
                });
            self.$contentWrap.on('click', '.btn_view_other', function () {
                $('.inbox_group').toggle();
                $(this).toggleClass('open');
            });

            self.$groupCompany.on('click', '.box_img a', function (e) {
                self.$searchCommon.companyInfoViewPopup(this.href);
                e.preventDefault();
            });

            self.$groupCompany.on('click', '.btn_more', function () {
                $('#list_open_recruit').toggleClass('open');
                $(this).toggleClass('on');
            });

            $('.box_sublist .list li').each(function () {
                self.$searchCommon.groupCompanyIconOver(this);
            });

            self.$searchCommon.groupCompanyIconSlide();

            if (self.$rightWingUtil.length > 0) {
                $(window).on('scroll resize', function () {
                    self.$searchCommon.controlRightWingFloating(self.$rightWingUtil, $(this).scrollTop(), 0);
                });
            }
            if (self.$topButton.length > 0) {
                $(window).on('resize', self.$searchCommon.updateBtnTopOffsetTop);
            }

            self.$topButton.click(function () {
                $('html, body').animate({scrollTop: 0});
            });

            $('body').on('click', function (e) {
                if (!$(e.target).hasClass('btn_filter') && !$(e.target).parents('div').hasClass('layer_filter')) {
                    if (self.$filterWrap.find('.layer_filter').is(':visible')) {
                        self.$filterWrap.find('.item').removeClass('on');
                    }
                }
            });

            self.$filterWrap.on('click', '.btn_filter', function () {
                var $parentWrap = $(this).closest('.item');
                $parentWrap.toggleClass('on').siblings().removeClass('on');
            });

            $('.tab_search_result, .tab_quick').on('click', 'li', function () {
                var type = $(this).find('a').attr('target');
                self.$searchCommon.tabMove(type);
            });

            $('#curation_list').on('click', '.tab_curation button', function (e) {
                var _this = e.target;
                var contName = _this.getAttribute('data-cont');

                $(".tab_curation button").removeClass('on');
                $(_this).addClass('on');

                $(".tab_cont_curation").css('display', 'none');
                $("#tab_cont_" + contName).css('display', 'block');
            });

            self.$contentWrap.on('click', '.content_bottom .view_more', function () {
                var type = $(this).attr('target');
                if (type !== '_blank') {
                    self.$searchCommon.tabMove(type);
                }
            });

            self.$contentWrap.on('click', '.btn_show_applied', function () {
                $(this).toggleClass('apply_on');
                self.$searchCommon.recruitListMove(this);
            });
            
            self.$contentWrap.on('click', '.btn_quick_apply', function () {
                $(this).toggleClass('apply_on');
                self.$searchCommon.recruitListMove(this);
            });

            self.$contentWrap.on('click', '.btn_except_read', function () {
                $(this).toggleClass('apply_on');
                self.$searchCommon.recruitListMove(this);

                try {
                    dataLayer.push(
                        {
                            'event': 'ga_lead',
                            'category': 'search',
                            'event-flow': 'pc_search_filtering',
                            'event-label': 'read_rec_filtering'
                        }
                    );
                } catch(e) {}
            });

            self.$contentWrap.on('click', '.layer_filter button', function () {
                self.$searchCommon.conditionChange(this);
            });

            self.$contentWrap.on('click', '.tab_pds button', function () {
                self.$searchCommon.pdsChange(this);
            });

            self.$contentWrap.on('click', '#check_end', function () {
                self.$searchCommon.dataListMove(this, 'company');
            });

            self.$contentWrap.on('click', '.item_corp .corp_name a', function () {
                $(this).parents('.item_corp').addClass('visited');
            });

            self.$contentWrap.on('click', '.list_article .desc_tit a, .list_article .thumb img', function () {
                $(this).parents('.list_article li').addClass('visited');
            });

            self.$contentWrap.on('click', '.main_search_list .list a', function () {
                $(this).parents('.list').addClass('visited');
            });

            self.$contentWrap.on('click', '#recruit_info .area_job .job_tit a, #recruit_info .area_corp .corp_name a', function () {
                $(this).parents('div.item_recruit').addClass('visited');
                self.$recruitInfo.find('div.item_recruit').removeClass('has_similar_list');
                self.$recruitInfo.find('.similar_recruit').hide();
                self.$searchCommon.getSimilarRecruitList(this);
            });

            self.$contentWrap.on('click', '#keyword_info .job_tit a, #keyword_info .corp_name a', function () {
                $(this).parents('div.item_recruit').addClass('visited');
            });

            self.$contentWrap.on('click', '.not_found .job_tit a, .not_found .corp_name a', function () {
                $(this).parents('div.item_recruit').addClass('visited');
            });

            self.$filterWrap.on('click', '.company_cd.checkbox', function () {
                var checkCount = 0;
                self.$recruitInfo.find('.wrap_result_filter').find('.company_cd.checkbox').each(function () {
                    if (this.checked) {
                        checkCount++;
                    }
                });

                if (checkCount === 0) {
                    alert('채용정보 조건을 1개 이상 선택해주세요');
                    this.checked = true;
                    return;
                }
                self.$filter.find(':checkbox').prop("checked", false);
                self.$searchCommon.recruitListMove(this);

                var companyGroup = $(this).attr('id'),
                    gaEventFlow = '',
                    isChecked = $(this).is(':checked');

                switch (companyGroup) {
                    case 'default':
                        gaEventFlow = 'normal-list';
                        break;
                    case 'dispatch':
                        gaEventFlow = 'dispatch-list';
                        break;
                    case 'headhunting':
                        gaEventFlow = 'headhunting-list';
                        break;
                }

                try {
                    dataLayer.push(
                        {
                            'event': 'ga_lead',
                            'category': 'total_search',
                            'event-flow': gaEventFlow,
                            'event-label': (isChecked === true) ? 'checked' : 'unchecked'
                        }
                    );
                } catch(e) {}
            });

            self.$contentWrap.on('click', '.page_move', function (e) {
                self.$searchCommon.pageMove(this);
                e.preventDefault();
            });

            self.$contentWrap.on('mouseover', '.btn_info', function () {
                self.$contentWrap.find('.lpop_corp_info').hide();
                self.$searchCommon.getCompanyInfo(this);
            });

            self.$contentWrap.on('mouseleave', '.area_corp_info', function () {
                $(this).find('.lpop_corp_info').hide();
            });

            self.$contentWrap.on('click', '.btn_recruit', function () {
                var csn = $(this).parents('.area_btn').attr('value');
                self.$searchCommon.getUnderwayRecruitList(csn, 'A');
            });

            self.$contentWrap.on('click', '.lpop_corp_info .view_recruit_list', function () {
                var csn = $(this).attr('value');
                self.$contentWrap.find('.lpop_corp_info').hide();
                self.$searchCommon.getUnderwayRecruitList(csn, 'B');
            });

            self.$contentWrap.on('click', '.recruit_layer_close', function () {
                $('.dim_lpop_ongoing').hide();
                $(this).parents('div.lpop_ongoing').hide();
            });

            self.$contentWrap.on('click', '.company_popup', function (e) {
                self.$searchCommon.companyInfoViewPopup(this.href);
                e.preventDefault();
            });

            self.$contentWrap.on('click', '.pass_refer', function (e) {
                self.$searchCommon.passDataPopup(this.href, 1040);
                e.preventDefault();
            });

            $('#content').on('mousedown', '.recommend_logging', function () {
                eval('try{ _hwaClick(\'237C\');}catch(_e){}');
                self.$searchCommon.loggingRecommendUrl(this);
            });

            self.$contentWrap
                .on('mouseenter', '.info_tip', function () {
                    $(this).next('.info_onarea').show();
                })
                .on('mouseleave', 'section h2', function () {
                    $(this).find('.info_onarea').hide();
                })
                .on('mouseleave', '.info_onarea', function () {
                    $(this).hide();
                })
                .on('click', '.box_help_tooltip .ico_help', function () {
                    $(this).next('.sri_tooltip').toggleClass('hidden');
                })
                .on('focusout', '.box_help_tooltip .ico_help', function () {
                    $('.box_help_tooltip .ico_help').next('.sri_tooltip').addClass('hidden');
                })
            ;

            $(document).on('click', '#pop_login_layer .pop_login_layer_close', function () {
                $('#pop_login_layer_dimmed').hide();
            });

            $(document).on('click', '#pop_login_layer_dimmed', function () {
                $('#pop_login_layer_dimmed').hide();
                $('#pop_login_layer').hide();
            });

            self.$contentWrap.on('click', '.data_layer', function () {
                var data = $(this).data('data_layer').split("|");
                self.$searchCommon.pushDataLayer(data[0] || '', data[1] || '');
            });

            self.$contentWrap.on('click', '.sri_btn_immediately', function () {
                if ($(this).parents('.item_recruit').data('data_layer')) {
                    var data = $(this).parents('.item_recruit').data('data_layer').split("|");
                    self.$searchCommon.pushDataLayer(data[0] || '', data[1] || '');
                }
            });

            $('.track_event').on('mousedown', function () {
                self.$searchCommon.trackEvent(this);
            });

            self.$contentWrap.on('click', '.type_searchup .view_more', function () {
                self.$searchCommon.getKeywordUpLogoList();
            });

            self.$feedBackBtn.on("click", function () {
                self.$searchCommon.feedbackServiceRequest(this);
            });

            /* 피드백 영역 닫기 */
            self.$feedBackClose.on("click", function () {
                self.$searchCommon.closeFeedBack(this);
            });
            /* 입력창 높이값 변경 */
            self.$feedBackTextarea.on("keyup", function () {
                $(this).height("auto").height(this.scrollHeight);
            });
            /* 의견 보내기 */
            self.$feedBackSubmit.on("click", function () {
                self.$searchCommon.feedbackServiceSubmit();
            });

            self.$searchCommon.pageLoadDataPush();

            self.$searchCommon.remoteControl();

            self.$searchCommon.getKeywordList();

            self.$searchCommon.getCurationList();

            self.$searchCommon.rollingCuration();

            self.$searchCommon.rollingCompanyInfo();

            $(window).scroll(function () {
                self.$searchCommon.lazyLoadExpandImage();
            });

            self.$searchMain.on('keydown', function(e){
                var $inputText = $('#total_ipt_keyword');
                var focusTag = $(':focus').prop("tagName");

                if(focusTag === 'INPUT' || focusTag === 'TEXTAREA' || focusTag === 'SELECT') {
                    return;
                }

                if(e.keyCode === 17){
                    self.isCtrl = true;
                    return;
                }
                if(e.keyCode === 18){
                    self.isAlt = true;
                    return;
                }

                if(self.isCtrl || self.isAlt){
                    return;
                }

                if(self.isExceptLayer()){
                    return;
                }

                if(self.$searchMain.hasClass('fixed')&&!$('.main_option').hasClass('active')){
                    $('.main_option').addClass('active');
                    $('#header').addClass('hidden');
                }

                $('.option_content.keyword_section').addClass('on');

                //  48 <= keyCode <= 57 : 0~9 ; 65 <= e.keyCode <= 90 : A~Z ; 96 <= e.keyCode <= 105 : 0~9 (우측패드)
                if(!(e.keyCode >= 48 && e.keyCode <=57) && !(e.keyCode >= 65 && e.keyCode <=90) && !(e.keyCode >= 96 && e.keyCode <=105) ){
                    return;
                }

                $inputText.val('');
                $inputText.focus();
                window.SearchPanelStore.state.keydownAccess = true;
            });

            self.$searchMain.on('keyup', function(){
                self.isAlt = false;
                self.isCtrl = false;
            });

            window.onpopstate = function (e) {
                if (!e.state) {
                    window.location.reload();
                }

                var params = e.state.params;
                var position = e.state.position;

                self.$searchCommon.historyBack(params, position);
            }
        },
        isExceptLayer : function(){

            var isExceptLayer = false;
            var exceptLayer = [
                'pop_login_layer', //로그인레이어
                'iframe_layer',    //iframe 로그인,즉시지원 레이어
                'lpop_ongoing',    //공고 모아보기
                'lpop_corp_info',   //기업정보 프리뷰
            ];

            exceptLayer.forEach(function (layer){
                if($('.'+layer).is(':visible')){
                    isExceptLayer = true;
                }
            });

            if($('.search_option').hasClass('open')){
                isExceptLayer = true;
            }

            if($('.wrap_total_menu').hasClass('layer_on')){
                isExceptLayer = true;
            }

            return isExceptLayer;
        }

    };

    $(function () {
        return new EventControl();
    });

})(window, jQuery);