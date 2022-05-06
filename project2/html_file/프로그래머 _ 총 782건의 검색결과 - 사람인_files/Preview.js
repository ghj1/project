define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Template'
], function (require, $, _, Common, Util, Template) {
    'use strict';

    var _self,
        _intervalId = null,
        _VARIABLES = {
            'COUNT_API_URL': '/zf_user/jobs/api/get-search-count',
            'GROUP_NAME': {
                'domestic': '지역',
                'overseas': '해외지역',
                'job_category': '직업',
                'industry': '산업',
                'subway': '지하철역',
                'keyword': '검색어',
                'search-detail': '상세검색'
            }
        },
        _intiFlag = true,
        _tonfFlag = true,
        _sectionFlag = true,
        _toolFlag = true;

    var Preview = function() {
        this.init.apply(this);
    };

    Preview.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();

            return _self;
        },

        initVariables: function() {
            _self.status            = {'get_count': 'active'};
            _self.$wrapper          = $('#sp_preview');
            _self.$section          = _self.$wrapper.find('#sp_preview_section');
            _self.$totalCnt         = _self.$wrapper.find('#sp_preview_total_cnt');
            _self.$selectedEl       = _self.$wrapper.find('#sp_preview_selected');
            _self.$guideEl          = _self.$wrapper.find('#sp_preview_guide');
            _self.$btnWrapperEl     = _self.$wrapper.find('#sp_preview_btn_wrapper');
            _self.headerHeight      = $('#sri_header').outerHeight(true);
            _self.$content          = $('#content');
            _self.contentMarginTop  = parseInt(_self.$content.css('margin-top').replace(/[^-\d\.]/g, ''));
            _self.titleHeight       = _self.$content.find('.wrap_title_recruit').eq(0).outerHeight(true);
            _self.layoutHeight      = _self.headerHeight + _self.contentMarginTop + _self.titleHeight;
            _self.groupText         = {};
            _self.filter            = $("#async_sfilter");
            _self.$filterWrap       = $('.wrap_result_filter');
            _self.company_cd        = '';
        },

        bindEvents: function() {
            _self.$wrapper.find('.btn_reset').on('click', Common.reset);
            _self.$wrapper.find('.btn_expand').on('click', _self.expand);
            _self.$wrapper.find('.btn_condition_copy').on('click', function() {
                if (!!opener && !opener.closed) {
                    var queryString = window.location.search.replace('?', '');
                    $(opener.location).attr("href", "javascript:getCondition('" + queryString +  "');");
                    self.close();
                }
            });

            _self.$wrapper.find('.btn_reset').on('click', function() {
                _self.$selectedEl.find('.btn_del').each(function() {
                    _self.$selectedEl.find('.btn_del').eq(0).click();
                })
            });

            /** eventcontrol.js에 있는 채용구분 클릭 이벤트를 가져옴
                채용구분 클릭시 state에 담겨있는 s필터값을 제거해야는데 현재 로직은 eventcontrol.js 및 searchcommon.js 에서
                state값 제어가 안되서 부득이하게 preview.js 에서 작업을함
             */
            _self.$filterWrap.on('click', '.company_cd.checkbox', function () {
                var checkCount = 0;
                var temp_company_cd = '';
                $('#recruit_info').find('.wrap_result_filter').find('.company_cd.checkbox').each(function (seq) {
                    if (this.checked) {
                        checkCount++;
                        temp_company_cd += $(this).val() + ",";
                    }
                });
                var company_cd  = temp_company_cd.substring(0,temp_company_cd.length-1);
                _self.company_cd = company_cd;
                if (checkCount !== 0) {
                    Common.removeState('smart_tag'); //스마트 필터 태그 초기화
                }
            });

            //s필터 해제시 제일 마지막 선택된 필터 해제(중간부터 해제하면 depth 꼬임)
            _self.filter.on("click",'.swiper-slide .checked', function(){
                var seq = $(".btn_del.checked").index(this);
                _self.filter.find("input[type=checkbox]:checked").eq(seq).trigger("click");
            });

            Common.getVariable('wrapper').find('.btn_set').on('click', _self.scroll);
        },

        getStatus: function(key) {
            return _.has(_self.status, key) ? _.get(_self.status, key) : null;
        },

        setStatus: function(key, val) {
            _.set(_self.status, key, val);
        },

        setVisible: function(is_visible) {
            is_visible ? this.$wrapper.show() : this.$wrapper.filter('.preview_v2').hide();
        },

        expand: function() {
            var $el = $(this);
            if (_self.$wrapper.hasClass('open')) {
                _self.$wrapper.removeClass('open');
                $el.text('펼쳐보기');
            } else {
                _self.$wrapper.addClass('open');
                $el.text('접어보기');
            }
        },

        /**
         *
         * @param id
         * @param text
         * @param classNm
         * @param removeFnc
         * @param code => 검색패널 통합 작업시 키워드 검색 데이터가 필요해서 추가
         */
        append: function(id, text, classNm, removeFnc, code, isVisible) {
            // 이미 preview에 있을 경우 추가 하지 않음 (지하철 환승역)
            if (id.match('sp_preview_subway') !== null && _self.isExist(text)) {
                return;
            }
            if (_self.isExist(id)) {
                _self.remove(id);
            }

            var tmplData  = {'id': id, 'text': text, 'classNm': classNm, 'code' : code},
                $appendEl = $(Template.get('sp_preview_selected_item_tmpl', tmplData)),
                idTokens = id.split('_'),
                groupId = idTokens[1],
                elementId= idTokens[1]+"_"+idTokens[2]+"_"+idTokens[3];

                Common.setVariable("elementId",elementId);
                Common.setVariable('filter_id',id);
                Common.setVariable('filter_text',text);

            if (Util.Lang.isEmpty(this.groupText[groupId])) {
                this.groupText[groupId] = {};
            }

            this.groupText[groupId][code] = text;

            $appendEl.find('.remove-btn').on('click', function(e) {
                // event bubble
                e = e || window.event;
                if (e.stopPropagation) {
                    e.stopPropagation(); // W3C 표준
                } else {
                    e.cancelBubble = true; // 인터넷 익스플로러 방식
                }

                $(".wrap_section_contents").find("#"+elementId).trigger('click'); //프리뷰 조건 x버튼 클릭시 공고 리스트 비동기 작업
                _self.remove(id, $(this));
                if (_.isFunction(removeFnc)) {
                    removeFnc();
                }

                if (!_self.hasSelectedItem()) {
                    _self.$wrapper.addClass('resetting');
                    _self.$wrapper.find('#search_btn').removeClass('active');
                    _self.$wrapper.find('#search_count_txt').text('선택된 ');
                    _self.$totalCnt.html('0');
                    _self.$wrapper.find('#search_btn_txt').text('검색하기');
                }

            });


            _self.$selectedEl.append($appendEl);

            if(_self.$wrapper.hasClass('searching')) {
                _self.$wrapper.removeClass('searching');
            }

            if(_self.$wrapper.hasClass('resetting')) {
                _self.$wrapper.removeClass('resetting');
            }

            _self.invisibleGuide();
            _self.controlSpreadBtn();
            _self.getCount();
            if (Common.isEnabledAlert()) {
                $(window).trigger('update_preview');
            }

            _self.setVisible(typeof isVisible === 'undefined' ? true : isVisible);

            _self.setCountInButton();
        },

        remove: function(id, $el) {
            $el = $el || $('#' + id);

            if ($el.length === 0) {
                return;
            }

            var idTokens = id.split('_'),
                groupId = idTokens[1],
                code = idTokens[2];

            if (!Util.Lang.isEmpty(this.groupText[groupId]) && !Util.Lang.isEmpty(this.groupText[groupId][code])) {
                delete this.groupText[groupId][code];
            }

            $el.parent().remove();
            $(window).trigger('update_preview');

            _self.visibleGuide();
            _self.controlSpreadBtn();
            _self.getCount();
            if (Common.getVariable("filterShow") === 'y') {
                _self.updateRecruitList();
                Common.setVariable("filterShow", "n");
            }
            _self.setCountInButton();
        },

        reset: function() {
            _self.$selectedEl.find('span').remove();
            _self.groupText = {};

            $(window).trigger('update_preview');

            _self.visibleGuide();
            _self.controlSpreadBtn();
            if (_self.hasSelectedItem()) {
                _self.getCount();
                _self.updateRecruitList();
            }

            _self.setCountInButton();
        },

        visibleGuide: function() {
            if (_self.$selectedEl.find('span').length > 0) {
                return;
            }
            _self.$guideEl.show();
            _self.$totalCnt.html('0');
            _self.$btnWrapperEl.hide();
            _self.$selectedEl.hide();

            _self.$wrapper.find('.btn_reset').hide();
        },

        isExist: function (type) {
            if (type.match('sp_preview') !== null) { // id 일 경우
                return _self.$selectedEl.find('#' + type).length > 0;
            } else { // text 일 경우
                var result = false;
                $(_self.$selectedEl.find('.selected_keyword')).each(function (i, elem) {
                    if (type.replace('삭제', '').trim() === $(elem).text().replace('삭제', '').trim()) {
                        result = true;
                    }
                });
                return result;
            }
        },

        invisibleGuide: function() {
            _self.$guideEl.hide();
            _self.$selectedEl.show();
            _self.$btnWrapperEl.show();

            _self.$wrapper.find('.btn_reset').show();
        },

        controlSpreadBtn: function() {
            var $spreadBtn = _self.$wrapper.find('.btn_expand'),
                isOpen = _self.$wrapper.hasClass('open'),
                tempTop = [],
                hasHiddenItem = false;

            $.each(_self.$selectedEl.find('span'), function() {
                var top = $(this).position().top;
                if (top > 0 && $.inArray(top, tempTop) === -1) {
                    tempTop.push(top);
                }
            });

            if (tempTop.length > 2) {
                hasHiddenItem = true;
            }

            if (isOpen !== true) {
                if (hasHiddenItem === true) {
                    $spreadBtn.text('펼쳐보기').show();
                } else {
                    $spreadBtn.hide();
                }
            } else {
                if (hasHiddenItem === true) {
                    $spreadBtn.text('접어보기').show();
                } else {
                    _self.$wrapper.removeClass('open');
                    $spreadBtn.hide();
                }
            }
        },

        hasSelectedItem: function() {
            return _self.$selectedEl.find('span').delay(100).length > 0;
        },

        pauseGettingCount: function() {
            _self.setStatus('get_count', 'inactive');
            return _self;
        },

        resumeGettingCount: function() {
            _self.setStatus('get_count', 'active');
            return _self;
        },

        loading: function() {
            _self.$totalCnt.html('...');
        },

        getCount: function() {
            clearInterval(_intervalId);
            _intervalId = setTimeout(function() {
                if (!_self.hasSelectedItem()) {
                    _self.$wrapper.addClass('resetting');
                    _self.$wrapper.find('#search_count_txt').text('선택된 ');
                    _self.$totalCnt.html('0');
                    _self.$wrapper.find('#search_btn_txt').text('검색하기');
                    return;
                }
                var initialParams = Common.getInitialParams();
                if (initialParams.company_cd) {
                    Common.setState('company_cd', 'company_cd', initialParams.company_cd);
                }
                if (initialParams.cooperator_category) {
                    Common.setState('cooperator_category', 'cooperator_category', initialParams.cooperator_category);
                }
                if (initialParams.csn) {
                    Common.setState('csn', 'csn', initialParams.csn);
                }

                var state = Common.getStateForSubmit();

                if (typeof state.ind_key === 'undefined' && typeof state.ind_cd === 'undefined' && initialParams.ind_bcd) {
                    _.set(state, 'ind_bcd', initialParams.ind_bcd);
                }

                 Common.logging(state);
                 _.set(state, 'temp_smart_tag', state.smart_tag); //s필터 선택후 재검색시 기존 필터 초기화시켜야는데 그렇지 않아야할경우에는 임시 temp 에 담아두기
                 _.set(state, 'smart_tag', '');
                var text = !_self.$wrapper.hasClass('preview_v2') ? '<span>건</span>' : '';
                var request = Util.Http.ajax(_VARIABLES.COUNT_API_URL, _.merge({'type': Common.getVariable('action')}, state));
                request.success(function(response) {
                    _self.$totalCnt.html(Util.Number.toStringByComma(response.result_cnt) + text);
                    _self.ripple();
                });
            }, 500);

            _self.loading();
        },

        setCountInButton: function() {
            var optionalCount = _self.$selectedEl.find('.optional').length + _self.$selectedEl.find('.associated_optional').length,
                $btnDetailOption = $('.btn_detail_option');

            if (optionalCount > 0) {
                $btnDetailOption.find('span').text('상세(' + optionalCount + ')');
            } else {
                $btnDetailOption.find('span').text('상세조건');
            }
        },

        rippleCount: 0,
        ripple: function() {
            _self.rippleCount++;
            var setRipple = false,
                searchParamCount = Common.getParam('searchParamCount'), $targetButton = _self.$wrapper.find('#search_btn');

            if (searchParamCount !== 0 && _self.rippleCount > 1) {
                setRipple = true;
            } else if (searchParamCount === 0 && _self.rippleCount > 0) {
                setRipple = true;
            }

            if (setRipple === true) {
                var $ripple = _self.$wrapper.find('.ripple');

                if(!$targetButton.hasClass('active')) {
                    $targetButton.find('#search_count_txt').text('선택된 ');
                    $targetButton.find('#search_btn_txt').text('검색하기');

                    var buttonTimer = setTimeout(function() {
                        $targetButton.addClass('active');
                    }, 200);
                } else {
                    $ripple.removeClass('drop');
                    if (!$ripple.height() && !$ripple.width()) {
                        $ripple.css({'height':'12px', 'width':'12px'});
                    }
                    $ripple.addClass('drop');
                }
            } else {
                $targetButton.find('#search_count_txt').text(' ');
                $targetButton.find('#search_btn_txt').text('검색완료');
                $('.subscribe_tooltip').show();
            }
        },

        updateRecruitList: function (id, previewId, value, next_cd, page, tabName) {
            /**
             * S필터,프리뷰 액션에따른 비동기 호출
             */

            id = id || '';
            previewId = previewId || '';
            value = value || '';
            next_cd = next_cd || '';
            page = page || '';
            tabName = tabName || '';

            $("#async_sfilter").find("input[type=checkbox]").each(function(){
               $(this).attr("disabled","disabled"); //한 뎁스당 필터는 1개씩만 선택
            });
            if (id !== '' && previewId !== '') { //S필터 클릭시
                Common.setState(id, previewId, value);
            }
           _self.filterLoading();
            var state = Common.getStateForSubmit();
            var initialParams = Common.getInitialParams();
            var tooltip_msg = "";
            var tag_count  = 0;

            var url = {
                banner: 'zf_user/jobs/list/banner', //프리미엄,포커스
                topPlus: '/zf_user/jobs/list/top-plus', //top,plus
                recruit: window.document.location.pathname,
                bottom: '/zf_user/jobs/list/bottom' //서브리스트(해드헌팅,파견대행)
            };

            state.panel_type = initialParams.panel_type;

            if (typeof state.ind_key === 'undefined' && typeof state.ind_cd === 'undefined' && initialParams.ind_bcd) {
                _.set(state, 'ind_bcd', initialParams.ind_bcd);
            }

            Common.logging(state);
            _.set(state, 'search_done', 'y');
            _.set(state, 'isAjaxRequest', 'y');
            if (tabName !== '') { //S필터 선택시 섹션페이지 공고탭 상태값 전달
                _.set(state, 'recruit_kind', tabName);
            }
            if(page !== '') { //s필터 선택시 공고리스트 1페이지로 return
                _.set(state, 'page', 1);
            } else {
                _.set(state, 'page', initialParams.page); //initialParams.page
            }
            if(next_cd !== '') {
                _.set(state, 'next_cd', next_cd);
            }
            if (initialParams.cat_key !== '') {
                _.set(state, 'cat_key', initialParams.cat_key);
            }
            if (_self.company_cd !== '') {
                _.set(state, 'company_cd', _self.company_cd);
            }
            if (initialParams.tab_type !== '') {
                _.set(state, 'tab_type', initialParams.tab_type);
            }
            try { //ie9 섹션페이지 정렬시 location 될때  정렬값 사자리는거 방지
                if ($("#sort").val() !== '') {
                    _.set(state, 'sort', $("#sort").val());
                }
            }catch (e) {

            }

            switch (url.recruit) {
                case '/zf_user/search':
                case '/zf_user/search/recruit':
                    _.set(state, 'recruitSort', $('#recruit_info').find('.layer_filter.sort li.selected').find('button').attr('value'));
                    _.set(state, 'recruitPageCount', $('#recruit_info').find('.layer_filter.count li.selected').find('button').attr('value'));
                    _.set(state, 'inner_com_type', $('#recruit_info').find('.layer_filter.company_type li.selected').find('button').attr('value'));
                    _.set(state, 'smart_filter_search', 'y');
                    if ($('#recruit_info').find('.btn_show_applied').hasClass('apply_on')) {
                        _.set(state, 'show_applied', 'y');
                    }
                    if ($('#recruit_info').find('.btn_quick_apply').hasClass('apply_on')) {
                        _.set(state, 'quick_apply', 'y');
                    }
                    if ($('#recruit_info').find('.btn_except_read').hasClass('apply_on')) {
                        _.set(state, 'except_read', 'y');
                    }

                    if ($('#recruit_info_list').attr('other-count') == 0) {
                        _.set(state, 'mainSearch', 'n');
                    }
                    break;
            }
            // 공고리스트 비동기 호출
            var request = Util.Http.ajax(url.recruit, $.param(state));
            if (state.smart_tag !== undefined) { //선택된 스마트태그 개수
                var tag_split = state.smart_tag.split(",");
                for(var i = 0 ; i < tag_split.length; i++){
                    if(tag_split[i] !== '') {
                        ++tag_count;
                    }
                }
            }
            if (tag_count === 1) {
                tooltip_msg = "선택하신 S필터가 적용된 <br> 채용정보의 수입니다.";
            }
            if (tag_count > 1) {
                tooltip_msg = "선택하신 조건을 모두 만족하는<br>(And 조건) 채용정보의 수입니다";
            }
            request.success(function (response) {
                switch (url.recruit) {
                    case '/zf_user/search': //통검
                    case '/zf_user/search/recruit': //통검
                        $("#recruit_info_list").html(response.innerHTML);
                        $("#recruit_info .cnt_result").html("총 "+Util.Number.toStringByComma(response.count) +"건");
                        if (tag_count === 1) { //툴팁은 최초 한번만 노출시키기
                            if (_tonfFlag) {
                                _self.filter.find(".txt.tooiltip").html(tooltip_msg);
                                _self.filterTooltip();
                                _tonfFlag = false;
                            }
                        } else if (tag_count === 2) {
                            if (_toolFlag) {
                                _self.filter.find(".txt.tooiltip").html(tooltip_msg);
                                _self.filterTooltip();
                                _toolFlag = false;
                            }
                        }
                        break;
                    default: // 공고리스트
                        $("#default_list_wrap").html(response.contents);
                        $(".tabs .on .total_count").html(" (" + Util.Number.toStringByComma(response.total_count) + "건)");
                        $('.tabs_recruit_list').find('li.tab.on span.total_count').text(' (' + Util.Number.toStringByComma(response.total_count) + '건)');
                        $('.list_total_count').find('span.total_count').html('<em>' + Util.Number.toStringByComma(response.total_count) + '</em>건');
                        if (tag_count > 1) { //색션페이지 공고리스트는 S필터 2개이상 선택시에만 툴팁 노출
                            if(_sectionFlag) {
                                _self.filter.find(".txt.tooiltip").html(tooltip_msg);
                                _self.filterTooltip();
                                _sectionFlag = false;
                            }
                        }
                        break;
                }
                $(window).trigger('resize');
                Util.swipe(); //swipe 재호출
            });
        },
        filterLoading: function() {
            $('.recruit_list_renew').find('#default_list_wrap').prepend(Template.get('list_loading_tmpl', {'height': $('.recruit_list_renew').find('#default_list_wrap').height()}));
        },
        filterTooltip: function () {
            $('.wrap_sfilter .toolTip').show();
            setTimeout(function(){
                $('.wrap_sfilter .toolTip').hide();
            },2500);
        }
    };

    return new Preview();
});