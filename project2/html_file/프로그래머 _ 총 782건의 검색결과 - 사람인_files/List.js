define([
    'require', 'jquery', 'lodash', 'history', 'Util', 'Common', 'Template'
], function (require, $, _, History, Util, Common, Template) {
    'use strict';

    var _self,
        _VARIABLES = {
            'URL': window.document.location.pathname
        },
        _MESSAGES = {
            'LOADING': '리스트를 로딩중 입니다. 잠시만 기다려 주세요.',
            'ERROR': '페이지에 오류가 발생했습니다. 페이지를 새로고침 합니다.'
        };

    var List = function() {
        this.name = 'list';
    };

    List.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();

            return _self;
        },

        initVariables: function() {
            _self.$wrapper      = $('.recruit_list_renew');
            _self.$tabWrapper   = _self.$wrapper.find('ul.tabs');
            _self.$listWrapper  = _self.$wrapper.find('#default_list_wrap');
            _self.initialParams = Common.getInitialParams(['action', 'bannerListLoad', 'page', 'page_count', 'topPlusListLoad', 'type']);
            _self.isLoading     = false;
            _self.previousUrl   = window.document.location.href;
            _self.currentTab    = _self.initialParams.recruit_kind || 'recruit';
            _self.sort          = 'recruit';
        },

        bindEvents: function() {
            History.Adapter.bind(window,'statechange',function() {
                var state    = History.getState(),
                    type     = state.data.type;

                if (!_self.setLoading()) {
                    return;
                }
                if (type === 'tab') {
                    _self.activeTabStyle(state.data.category || 'recruit');
                }

                _self.load();
            });

            _self.$tabWrapper.on('click', 'li.tab > a', _self.changeTab);
            if (typeof defaultListAsync !== 'undefined' && defaultListAsync === true) {
                _self.$tabWrapper.find('li.tab > a').eq(0).click();
            }
            _self.$listWrapper
                .on('change', '#sort', _self.changeSort)
                .on('click', '#filter_quick_apply', _self.changeApplyCondition)
                .on('click', '#show_applied_recruit', _self.changeShowApplidRecruit)
            ;

            var recruit_location = document.location.hash.replace('#recruit_location=', '#');
            if (recruit_location && $(recruit_location).length > 0) {
                var isFirstPage = (document.location.search.indexOf('page=1&') > 1);
                var delay = isFirstPage ? 800 : 200;

                setTimeout(function () {
                    var top = $(recruit_location).offset().top || 0;

                    $('html, body').animate({
                        'scrollTop': top - 300
                    }, 0);
                }, delay);
            }
        },

        /** @this jQuery Object */
        changeTab: function() {
            var state = {type: 'tab', category: $(this).data('category')};
            if (_self.redirectIfBrowserIsUnderIE9(state,'n')) {
                return false;
            }
            if (_self.pushState(state)) {
                _self.currentTab = state.category;
            }
            return false;
        },

        /** @this jQuery Object */
        changeSort: function() {
            var state = {type: 'sort', category: _self.currentTab, sort: $(this).val(), quick_apply: _self.getQuickApply()};
            if (_self.redirectIfBrowserIsUnderIE9(state)) {
                return false;
            }
            _self.pushState(state);

            return false;
        },

        /** @this jQuery Object */
        changeApplyCondition: function() {
            var $el   = $(this),
                state = {type: 'quick_apply', category: _self.currentTab, sort: _self.getSort(), quick_apply: $el.hasClass('selected') ? 'n' : 'y'};

            if (_self.redirectIfBrowserIsUnderIE9(state)) {
                return false;
            }

            $el.toggleClass('selected');
            _self.pushState(state);
            return false;
        },

        changeShowApplidRecruit: function () {
            var $el   = $(this),
                state = {type: 'show_applied', category: _self.currentTab, sort: _self.getSort(), quick_apply: _self.getQuickApply(), show_applied: $el.hasClass('selected') ? 'n' : 'y'};

            if (_self.redirectIfBrowserIsUnderIE9(state)) {
                return false;
            }

            $el.toggleClass('selected');
            _self.pushState(state);
            return false;
        },

        // 정렬, 즉시지원 변경시 헤드/파견 리로드
        changeMiniList: function(state) {
            if (typeof MiniList !== 'undefined') {
                params.sort         = state['sort'];
                params.quick_apply  = state['quick_apply'];

                MiniList.get('dispatching', params, bottomUrl);
                MiniList.get('headhunting', params, bottomUrl);
            }
        },

        redirectIfBrowserIsUnderIE9: function(state,filter_flag) {
            filter_flag = filter_flag || '';
            if (Util.Browser.isUnderIE9()) {
                var smart_tag = '';
                var temp_array= [];
                $("#async_sfilter").find("input[type=checkbox]:checked").each(function(i){
                    temp_array[i] = $(this).val();
                });
                if(filter_flag !== "n") { //탭으로 이동시에는 s필터 값 전달 x
                    smart_tag = temp_array.join();
                }
                window.location.href = _self.getUrl(state) + '&moveScroll=y&smart_tag='+encodeURI(smart_tag)+"&recruit_kind="+state.category;
                return true;
            }
            return false;
        },

        pushState: function(state) {
            if (_self.isLoading) {
                Common.notify(_MESSAGES.LOADING);
                return false;
            }

            History.pushState(_.merge({state: 1, rand: Math.random()}, state), window.document.title.toString(), _self.getUrl(state));
            return true;
        },

        activeTabStyle: function(category) {
            _self.$tabWrapper.find('#' + category + '_tab').addClass('on').siblings('.tab').removeClass('on').find('span.total_count').text('');
        },

        setTotalCount: function(count) {
            _self.$tabWrapper.find('li.tab.on span.total_count').text(' (' + Util.Number.toStringByComma(count) + '건)');
            $('.tabs_recruit_list').find('li.tab.on span.total_count').text(' (' + Util.Number.toStringByComma(count) + '건)');
            $('.list_total_count').find('span.total_count').html('<em>' + Util.Number.toStringByComma(count) + '</em>건');
        },

        getSort: function() {
            return _self.$listWrapper.find('#sort').val();
        },

        getQuickApply: function() {
            return _self.$listWrapper.find('#filter_quick_apply').hasClass('selected') ? 'y' : 'n';
        },

        getShowApplid: function(){
            return _self.$listWrapper.find('#show_applied_recruit').hasClass('selected') ? 'y' : 'n';
        },

        getUrl: function(state) {
            var additionalParams = {'recruit_kind': state.category};
            if (_.has(state, 'sort')) {
                additionalParams.sort = state.sort;
            }
            if (_.has(state, 'quick_apply')) {
                additionalParams.quick_apply = state.quick_apply;
            }
            if (_.has(state, 'show_applied')) {
                additionalParams.show_applied = state.show_applied;
            }
            return _VARIABLES.URL + '?' + $.param(_.merge(_.clone(_self.initialParams), additionalParams));
        },

        decodeUrl: function(url) {
            return decodeURIComponent(url);
        },

        setPreviousUrl: function(url) {
            if (Util.Lang.isEmpty(url)) {
                return;
            }
            _self.previousUrl = _self.decodeUrl(url);
        },

        setScroll: function() {
            $("body").animate({scrollTop: _self.$wrapper.offset().top - 70}, 100);
        },

        setLoading: function() {
            if (_self.isLoading) {
                return false;
            }
            _self.isLoading = true;
            return true;
        },

        loading: function() {
            _self.$listWrapper.prepend(Template.get('list_loading_tmpl', {'height': _self.$listWrapper.height()}));
        },

        load: function() {
            var data = {};
            try {
                var url = window.document.location.href;
                _self.setScroll();
                _self.loading();

                data = $.param(Common.getStateForSubmit());
                var request = Util.Http.ajax(url, data, 'get');
                request.success(function (response) {
                    _self.setTotalCount(response.total_count);
                    _self.$listWrapper.html(response.contents);
                    try {
                        window.jobBoardAction.init('table.default-jobboard');
                        window.n_common_logging(_self.decodeUrl(url), _self.previousUrl, document.title.toString());
                    } catch (e) {}

                    _self.setScroll();
                    _self.setPreviousUrl(url);
                }).complete(function () {
                    _self.isLoading = false;
                });
            } catch (e) {
                Common.notify(_MESSAGES.ERROR);
                window.location.reload();
            }
        }
    };

    return new List();
});