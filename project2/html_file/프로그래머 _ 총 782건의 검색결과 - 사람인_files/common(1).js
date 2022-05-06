define([
    'require', 'jquery', 'lodash', 'Util'
], function (require, $, _, Util) {
    'use strict';

    var _self;

    var Common = function() {
        this.init.apply(this);
    };

    Common.prototype = {
        init: function() {
            _self = this;

            _self.setJQueryFunction();
            _self.initVariables();
            _self.initElements();
            _self.bindEvents();

            return _self;
        },

        setJQueryFunction: function() {
            var clickFnc = function() { this.trigger('click'); };

            // IE8에서는 trigger('click') 실행 시 change 이벤트를 실행하지 않아 예외 처리
            if (Util.Browser.isUnderIE8()) {
                clickFnc = function() { this.trigger('click').trigger('change'); };
            }

            $.fn.extend({
                triggerClick: clickFnc
            });
        },

        initVariables: function() {
            _self.components    = {};
            _self.variables     = {};
            _self.params        = {};
            _self.options       = {};
            _self.state         = {};
            _self.initialParams = {};
            _self.searchUpperCodes = {};
            _self.searchMaxCount = {};

            _self.setVariable('wrapper', $('#search_panel_wrapper'));
            _self.setVariable('main_wrapper', $('#sp_main_wrapper'));
            _self.setVariable('optional_wrapper', $('#sp_optional_wrapper'));
            _self.setVariable('spread_wrapper', $('#sp_spread_wrapper'));
            _self.setVariable("list_tab", $("#list_tab"));
            _self.setEnabledAlert(true);
        },

        initElements: function() {
            var $wrapper = _self.getVariable('wrapper');

            $wrapper.find(':checkbox:checked').prop('checked', false).trigger('change');
            $wrapper.find('input[type="text"]').val('');
        },

        bindEvents: function() {
            var $wrapper = _self.getVariable('wrapper');

            $wrapper.find('.btn_detail_option').on('click', _self.Event.spread);        // 상세조건 버튼
            $wrapper.find('.btn_spread_item').on('click', _self.Event.spreadItem);      // 모든 펼치기 버튼
            $wrapper.find('.tooltip_btn')
                .on('mouseover', _self.Event.showTooltip)
                .on('mouseout', _self.Event.hideTooltip);
            $wrapper
                .on('focus', 'input[type="text"].placeholder', _self.Event.hidePlaceholder)
                .on('blur', 'input[type="text"].placeholder', _self.Event.togglePlaceholder);

            $wrapper.find('#search_btn').on('click', _self.search);
            $wrapper.find('#search_panel_form').on('submit', function() {
                return false;
            });

            // 통검 플로팅시 검색 버튼
            $wrapper.find('#btn_search_float').on('click', _self.search);

            // 상단 TAB
            _self.getVariable('list_tab').find('li.tab > a').on('click', _self.moveListTab);
        },

        Event: {
            /** @this jQuery Object */
            spread: function() {
                var $el      = $(this),
                    $wrapper = _self.getVariable('wrapper');

                if ($el.hasClass('on')) {
                    $wrapper.find('.detail_option_section').removeClass('on');
                    $el.removeClass('on');

                    $wrapper.find(".wrap_detail_panel").hide();
                } else {
                    $wrapper.find('.detail_option_section').addClass('on');
                    $el.addClass('on');
                    $wrapper.find(".wrap_detail_panel").show();

                    // Logging 처리
                    var eventAction = _self.Logging.getEventAction();
                    _self.Logging.pushDataLayer('ga_lead', eventAction, 'detail_search', '');
                    _self.Logging.trackEvent('panel_search', eventAction, 'detail_search', '');
                }

                // 상품 안내 레이어 닫기
                $('.nPdtInfo').filter(':visible').hide();
            },

            /** @this jQuery Object */
            spreadItem: function() {
                var $el = $(this);
                if ($el.hasClass('open')) {
                    $el.closest('.option_box').addClass('article_fold');
                    $el.removeClass('open').text('펼치기');
                } else {
                    $el.closest('.option_box').removeClass('article_fold');
                    $el.addClass('open').text('접기');
                }

                //Util.Layer.resizeDetailForTinyScrollbar();
            },

            /** @this jQuery Object */
            showTooltip: function() {
                $(this).next().show();
            },

            /** @this jQuery Object */
            hideTooltip: function() {
                $(this).next().hide();
            },

            /** @this jQuery Object */
            hidePlaceholder: function() {
                $(this).removeClass('inpTypo');
            },

            /** @this jQuery Object */
            togglePlaceholder: function() {
                var $el = $(this);
                $el.toggleClass('inpTypo', Util.Lang.isEmpty($el.val()));
            }
        },

        Logging: {
            /**
             * 와이즈로그 로깅처리
             * @param category
             * @param action
             * @param opt_label
             * @param opt_value
             */
            trackEvent: function (category, action, opt_label, opt_value) {
                    try {
                        // 통검 플로팅시 로깅 category 처리;
                        action = $('body').hasClass('fixed') ? action + '_gnb_fixed' : action;
                        window.n_trackEvent(category, action, opt_label, opt_value);
                    } catch (e) {}
            },
            setEventAction: function (eventAction) {
                _self.setVariable('eventAction', eventAction);
            },
            getEventAction: function () {
                return _self.getVariable('eventAction');
            },
            setEventFlow: function (eventFlow) {
                _self.setVariable('eventFlow', eventFlow);
            },
            getEventFlow: function () {
                return _self.getVariable('eventFlow');
            },
            setLoggingValue: function (value) {
                _self.setVariable('loggingValue', value);
            },
            getLoggingValue: function () {
                return _self.getVariable('loggingValue');
            },
            /**
             * 태그매니져 로깅처리
             * @param event
             * @param category
             * @param event_flow
             * @param label
             */
            pushDataLayer: function (event, category, event_flow, label) {
                try {
                    category = 'panel_search_' + category;
                    // 통검 플로팅시 로깅 category 처리;
                    category = $('body').hasClass('fixed') ? category + '_gnb_fixed' : category;

                    dataLayer.push({
                        'event': event,
                        'category': category,
                        'event-flow': event_flow,
                        'event-label': label
                    });
                } catch (e) {
                }
            },
            /**
             * 검색엔진 추천 API Click Url 전송
             * @param $obj
             */
            sendRecommendClickUrl: function ($obj) {
                if (!$obj || !$obj.data('click_url')) {
                    return;
                }

                // 클릭이벤트는 checked 상태가 변경되기 전에 실행되어 checked 속성과 반대로 처리해야함
                if ($obj.prop('ckecked')) {
                    return;
                }

                var url = '/zf_user/jobs/api/send-recommend-click-url',
                    data = {'click_url': $obj.data('click_url')};
                try {
                    Util.Http.ajax(url, data);
                } catch (e) {
                    return;
                }
            }
        },

        setArguments: function(args) {
            _.forEach(args, function(val, key) {
                if (key === 'params' || key === 'options' || key === 'searchUpperCodes' || key === 'searchMaxCount') {
                    _self[key] = val;
                } else {
                    _self.setVariable(key, val);
                }
            });
            return _self;
        },

        setParam: function(key, val) {
            _.set(_self.params, key, val);
            return _self;
        },

        getParam: function(key, defaultValue) {
            return _.has(_self.params, key) ? _.get(_self.params, key) : defaultValue || null;
        },

        getParamToArray: function(key, defaultValue, separator) {
            var param = _self.getParam(key, defaultValue);
            return (!Util.Lang.isEmpty(param)) ? param.toString().split(separator || ',') : [];
        },

        getParams: function(keys) {
            if (Util.Lang.isEmpty(keys)) {
                return _self.params;
            }
            if (!_.isArray(keys)) {
                keys = [keys];
            }
            return _.pick(_self.params, keys);
        },

        getUpperCodes: function (lastCode, upperCd) {
            var upperCodes = [];
            if (Util.Lang.isEmpty(_self.searchUpperCodes[lastCode]) || Util.Lang.isEmpty(_self.searchUpperCodes[lastCode][upperCd])) {
                return upperCodes;
            }

            return _self.searchUpperCodes[lastCode][upperCd];
        },

        getOption: function(key) {
            return _.has(_self.options, key) ? _.get(_self.options, key) : null;
        },

        setComponent: function(name, obj) {
            if (!_.has(_self.components, name)) {
                _.set(_self.components, name, obj);
            }
            return _self;
        },

        getComponent: function(name) {
            return _.has(_self.components, name) ? _.get(_self.components, name) : null;
        },

        setVariable: function(key, val) {
            _.set(_self.variables, key, val);
            return _self;
        },

        getVariable: function(key) {
            return _.has(_self.variables, key) ? _.get(_self.variables, key) : null;
        },

        setState: function(name, key, val) {
            _.set(_self.state, name + '.' + key, val);
            return _self;
        },

        getState: function(name, key) {
            if (!Util.Lang.isEmpty(key)) {
                return _.has(_self.state, name + '.' + key) ? _.get(_self.state, name + '.' + key) : null;
            }
            return _.has(_self.state, name) ? _.get(_self.state, name) : {};
        },

        setInitialParams: function() {
            _self.initialParams = _.clone(_self.params);
            return _self;
        },

        getInitialParams: function(omit) {
            return _.omit(_self.initialParams, omit || []);
        },

        getStateForSubmit: function() {
            var state = {};
            if (!Util.Lang.isEmpty(_self.state)) {
                state = _.reduce(_self.state, function(result, data, key) {
                    result[key] = _.values(data).join(',');
                    return result;
                }, {});
            }
            return state;
        },

        removeState: function(name, key) {
            var hasKey = !Util.Lang.isEmpty(key);
            if (hasKey && _.has(_self.state, name + '.' + key)) {
                _self.state[name] = _.omit(_self.state[name], key);
            }
            if (!hasKey || Util.Lang.isEmpty(_self.state[name])) {
                _self.state = _.omit(_self.state, name);
            }
            return _self;
        },

        getSearchOptionalItem: function() {
            var searchOptionalItem = 'n';
            _.forEach(_self.components, function(component) {
                var type = _.has(component, 'type') ? component.type : '';

                if (type !== 'main' && _.isFunction(component.isSelected) && component.isSelected()) {
                    searchOptionalItem = 'y';
                    return false;
                }
            });
            return searchOptionalItem;
        },

        setEnabledAlert: function(bool) {
            _self.setVariable('enabled_alert', bool);
        },

        isEnabledAlert: function() {
            return _self.getVariable('enabled_alert');
        },

        notify: function(msg) {
            if (!_self.isEnabledAlert()) {
                return;
            }
            Util.alert(msg);
        },

        initParams: function() {
            _.forEach(_self.components, function(component) {
                if (_.isFunction(component.initParams)) {
                    component.initParams();
                }
            });
        },

        validate: function() {
            var isValid = true;
            _.forEach(_self.components, function(component) {
                if (_.isFunction(component.validate) && !component.validate()) {
                    isValid = false;
                    return false;
                }
            });
            return isValid;
        },

        moveListTab: function() {
            var type = $(this).data('type'),
                state = _self.getStateForSubmit(),
                initialParams = _self.getInitialParams(),
                pathName = window.document.location.pathname
            ;

            _.forEach(state, function(val, key) {
                state[key] = initialParams[key];
            });

            state.tab_type = type;
            state.panel_type = initialParams.panel_type;

            if (initialParams.subway_mcd) {
                _.set(state, 'subway_mcd', initialParams.subway_mcd);
            }

            _.set(state, 'search_optional_item', _self.getSearchOptionalItem());
            _.set(state, 'search_done', 'y');
            _.set(state, 'panel_count', 'y');
            _.set(state, 'smart_tag', '');

            window.document.location.href = pathName + '?' + $.param(state);

            return false;
        },

        search: function() {
            if (!_self.validate()) {
                return false;
            }

            var keywordObject = _self.getComponent('Keyword');
            keywordObject.diffusionKeyword(keywordObject.$keywordInput.val());

            var state = _self.getStateForSubmit(),
                initialParams = _self.getInitialParams();

            if (typeof state.ind_key === 'undefined' && typeof state.ind_cd === 'undefined' && initialParams.ind_bcd) {
                _.set(state, 'ind_bcd', initialParams.ind_bcd);
            }

            state.panel_type = initialParams.panel_type;

            _self.logging(state);

            _.set(state, 'search_optional_item', _self.getSearchOptionalItem());
            _.set(state, 'search_done', 'y');
            _.set(state, 'panel_count', 'y');
            if (initialParams.csn) {
                _.set(state, 'csn', initialParams.csn);
            }

            var pathName = window.document.location.pathname;

            if (_self.getParam('action') === 'unified') {
                pathName = '/zf_user/search';
                _.set(state, 'search_optional_item', 'y');
                _self.setAccessData();
            }

            window.document.location.href = pathName + '?' + $.param(state);

            return false;
        },

        logging: function(state) {
            try {
                var action    = _self.getVariable('action'),
                    paramKeys = [];

                _.forEach(_self.components, function(component) {
                    var componentParamKeys = _.has(component, 'paramKeys') ? _.get(component, 'paramKeys') : [];
                    if (!Util.Lang.isEmpty(componentParamKeys)) {
                        paramKeys = _.union(paramKeys, componentParamKeys);
                    }
                });

                state = _.mapValues(state, function(val) {
                    if (_.isString(val) && val.indexOf(',') !== -1) {
                        val = val.split(',').sort(function(a, b){return b-a}).join(',');
                    }
                    return val;
                });

                var stateAll = _.merge(_.zipObject(paramKeys, _.fill(_.clone(paramKeys), '')), state);

                window.n_click_logging('https://' + window.location.host + '/' + _.snakeCase(action) + '_param.php?' + $.param(stateAll));
            } catch (e) {}
        },

        reset: function() {
            _.forEach(_self.components, function(component) {
                if (_.isFunction(component.reset)) {
                    component.reset();
                }
            });
        },

        setAccessData: function() {
            if(_self.state.searchword === undefined){
                return;
            }

            if(_self.state.searchword.preview_searchword === _self.params.searchword){
                return;
            }

            if(_self.state.searchword.preview_searchword === ''){
                return;
            }

            try{
                window.dataLayer.push({
                    'event': 'ga_lead',
                    'category': 'search_access',
                    'event-flow': 'search',
                    'event-label': (_self.state.keydownAccess)? 'keydown' : 'click'
                });

            } catch (e) {

            }
        }
    };

    return new Common();
});