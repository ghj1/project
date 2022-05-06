define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Template', 'DepthAbstract', 'AutoComplete', 'OverseasArea'
], function (require, $, _, Common, Util, Template, DepthAbstract, AutoComplete, OverseasArea) {
    'use strict';

    var _self,
        _VARIABLES = {
            'API_URL': '/zf_user/jobs/api/auto-complete'
        };

    var Area = function () {
        this.name = 'area';
        this.data = {
            text: '지역',
            stateId: 'loc_cd',
            stateIdCheckedAll: ['loc_mcd', 'loc_bcd']
        };
        this.type     = 'main';
        this.$wrapper = $('div.area_section');
        this.oneDepthTemplate = 'sp_area_1depth_template';
        this.oneDepthText = 'area_1depth_domestic_text';
        this.lastDepthTemplate = 'sp_area_lastDepth_template';
        this.lastDepthArea = 'sp_area_lastDepth';

        this.params = {};
        this.eventFlowName = 'area';
    };

    Area.prototype = _.create(DepthAbstract.prototype, {
        constructor: Area,

        init: function() {
            _self = this;
            _self.initLogging();
            _self.initOptions();
            _self.initVariables();
            _self.bindEvents();
            _self.generateDefaultDepth(_self.oneDepthCode);
            if (Common.getParam('action') === 'sba-seoul' || Common.getParam('action') === 'youthstay') {
                this.$depth1.find('ul.list_overseas').remove();
            } else {
                OverseasArea.generateDefaultDepth(_self.oneDepthCode);
            }
            _self.AutoComplete.init();
            _self.initParams();
            _self.defaultBindEvent();

            return _self;
        },

        initLogging: function () {
            this.loggingName = Common.getVariable('loggingOptions').loggingName;
            Common.Logging.setEventAction(this.loggingName);
            this.eventFlowName = this.loggingName === 'area_foreign' ? 'fore' : 'area';
        },

        initOptions: function() {
            _self.options        = Common.getOption(_self.name);
            _self.depth1Options  = Common.getOption(_self.name + '_1depth');
            _self.representative = Common.getOption(_self.name + '_representative');
            _self.oneDepthCode  = [];

            var loc_mcd = Common.getParamToArray('loc_mcd'), loc_bcd = Common.getParamToArray('loc_bcd');

            _self.oneDepthCode   = Common.getUpperCodes('loc_cd', 'mcode') || [];

            if (!Util.Lang.isEmpty(loc_mcd)) {
                _.forEach(loc_mcd, function (key) {
                    _self.oneDepthCode = _self.oneDepthCode.concat(_self.depth1Options[key]);
                });
            }

            if (!Util.Lang.isEmpty(loc_bcd)) {
                _.forEach(loc_bcd, function (key) {
                    _self.oneDepthCode = _self.oneDepthCode.concat(_self.depth1Options[key]);
                });
            }
        },

        initVariables: function () {
            _self.$depthWrapper = _self.$wrapper.find('.depth_check');
            _self.$depth1 = _self.$wrapper.find('.depth1');
        },

        initParams: function() {
            var loc_cd  = Common.getParamToArray('loc_cd'), loc_mcd = Common.getParamToArray('loc_mcd'), loc_bcd = Common.getParamToArray('loc_bcd');

            Common.setEnabledAlert(false);

            if (_self.$depth1.find('li.selected').length > 0) {
                _self.$depth1.find('li.selected').children('button').triggerClick();
                _self.$depth1.find('li.selected:first').addClass('on').children('button').triggerClick();
            }

            if (!Util.Lang.isEmpty(loc_bcd)) {
                _.forEach(loc_bcd, _self.initParam.bind(_self));
            }

            if (!Util.Lang.isEmpty(loc_mcd)) {
                _.forEach(loc_mcd, _self.initParam.bind(_self));
            }

            if (!Util.Lang.isEmpty(loc_cd)) {
                _.forEach(loc_cd, _self.initParam.bind(_self));
            }

            _self.initTabIfParamIsInvalid();

            Common.setEnabledAlert(true);
        },

        initTabIfParamIsInvalid: function() {
            var $depth1 = Common.getParam('action') === 'overseas' ? this.$depth1.find('ul.list_overseas').find('.depth1_btn_wrapper')
                : this.$depth1.find('.depth1_btn_wrapper');
            if ($depth1.filter('.on').length === 0) {
                $depth1.filter(':first').addClass('on');
                _self.generateLastDepth($depth1.filter(':first').children('button').attr('data-code'), null, false);
            }
        },

        validate: function () {
            var action = Common.getParam('action');
            if (action === 'unified') {
                return true;
            }
            var currentSelectedCount = this.$wrapper.find('.wrap_depth_category :checkbox:checked').length;
            if (currentSelectedCount === 0 && (action === 'domestic' || action === 'overseas')) {
                alert('선택한 지역이 없습니다.\n희망 근무지역을 선택하세요.');
                _self.showDefaultSection('job_category');
                return false;
            }
            return true;
        },

        bindEvents: function() {
            // 패널 1 depth 선택
            _self.$wrapper.find('div.wrap_scroll.depth1').on('click', 'button', function () {
                _self.generateLastDepth($(this).data('code'), null, true);
            });

            // 최근본 메뉴 선택
            _self.$wrapper.find('div.recently_keyword').on('click', 'button', function () {
                var oneDepthType = $(this).data('type'),
                    oneDepthCode = $(this).data(oneDepthType),
                    codeType = ($(this).data('code')) ? 'loc_cd' : 'loc_'+oneDepthType,
                    code = ($(this).data('code')) ? $(this).data('code') : oneDepthCode;

                // logging param
                Common.Logging.setEventFlow(_self.eventFlowName + '_recently');
                Common.Logging.setLoggingValue($(this).index());

                _self.makeDepth(oneDepthCode);

                var $target = _self.$wrapper.find('input:checkbox[id=' + codeType + '_' + code + ']');

                _self.clickCheckBox($target, true);
                _self.checkedAllCheckBox($target);
                _self.handleRepresentative($target);
                if (!_self.validateCheckedCount($target)) {
                    $target.prop('checked', false);
                    _self.clickItemFromBelongsToRepresentative($target, $target.data('representative'));
                    _self.setPreviewAndState($target);
                    return false;
                }
                _self.addSelectedClass(_self.depth1Options[code]);
                _self.showSelectedCountAndTitle($target);
            });
        },

        generateDefaultDepth: function (params) {
            var _self = this,
                tmplData = { list : [] },
                oneDepthText = Common.getOption(_self.oneDepthText),
                sortKey = ['101000', '102000', '108000', '106000', '104000', '103000', '105000', '107000', '118000','109000', '110000', '111000', '112000', '113000', '115000', '114000', '116000', '117000'],
                depth1Count = Common.getOption(_self.name + '_1depth_count');

            if (Common.getParam('action') === 'sba-seoul') {
                sortKey = ['101000', '999999'];
            }
            if (Common.getParam('action') === 'youthstay') {
                sortKey = ['106000', '104000', '103000', '105000', '107000', '118000','109000', '110000', '111000', '112000', '113000', '115000', '114000', '116000', '117000', '999999'];
            }

            _.forEach(sortKey, function (key) {
                tmplData.list.push({
                    code: key, name: oneDepthText[key], count: depth1Count[key], selected: (params.indexOf(key) > -1) ? 'selected' : ''
                });
            });

            $('#' + _self.oneDepthTemplate).after(Template.get(_self.oneDepthTemplate, tmplData));
        },

        AutoComplete: {
            init: function () {
                _self.AutoComplete.$wrapper = _self.$wrapper.find('.wrap_auto_keyword');

                _self.autoCompleteInstance = new AutoComplete({
                    'url': _VARIABLES.API_URL,
                    'params': {'domain': _self.name},
                    'target': _self.AutoComplete.$wrapper.find('#'+_self.name+'_ipt_keyword'),
                    'minimum_character_length': 2,
                    'useKeyEvent' : true,
                    'result': {
                        'wrapper': _self.AutoComplete.$wrapper.find('#autocomplete_has_result'),
                        'list'   : _self.AutoComplete.$wrapper.find('.list_keyword'),
                        'none'   : _self.AutoComplete.$wrapper.find('#autocomplete_no_result')
                    },
                    'button': {'remove': _self.AutoComplete.$wrapper.find('.btn_delete')},
                    'callback': {
                        'bindEvents': _self.AutoComplete.bindEvents,
                        'search': {
                            'generate': _self.AutoComplete.search,
                            'post': function() {
                                this.$resultList.find(':checkbox:checked').trigger('change');
                                if(!_self.AutoComplete.$wrapper.find('.list_keyword li').length){
                                    _self.AutoComplete.$wrapper.find('#autocomplete_has_result').hide();
                                    _self.AutoComplete.$wrapper.find('#autocomplete_no_result').show();
                                }
                            }
                        }
                    }
                });
            },

            /** @this AutoComplete */
            bindEvents: function() {
                var instance = this;

                this.$target
                    .on('keydown', _self.AutoComplete.hidePlaceholder)
                    .on('blur', _self.AutoComplete.togglePlaceholder);

                this.$resultList
                    .on('click', 'input[name="search_loc_mcd[]"]', function() {
                        _self.AutoComplete.clickItem.call(instance, 'loc_mcd', $(this));
                    })
                    .on('click', 'input[name="search_loc_bcd[]"]', function() {
                        _self.AutoComplete.clickItem.call(instance, 'loc_bcd', $(this));
                    })
                    .on('click', 'input[name="search_loc_cd[]"]', function() {
                        _self.AutoComplete.clickItem.call(instance, 'loc_cd', $(this));
                    })
                ;

                _self.AutoComplete.$wrapper.find('.btn_close').on('click', this.reset.bind(this));

                _self.AutoComplete.togglePlaceholder.call(this.$target);
            },

            hidePlaceholder: function() {
                $(this).siblings('.placeholder').hide();
            },

            togglePlaceholder: function() {
                $(this).siblings('.placeholder').toggle(Util.Lang.isEmpty($(this).val()));
            },

            /** @this AutoComplete */
            search: function(response, keyword) {
                var tmplData = {'keyword': keyword, 'list': []};
                _.forEach(response.result_list, function(val) {
                    var code = val.code.split('|'), resultTemp = _.find(_self.options[code[0]], 'code', code[1]);

                    if ( code[1] < 210000 || (code[1] > 210000 && (resultTemp.count > 0 || val.type !== 'loc_cd'))) {
                        tmplData.list.push({
                            'type': val.type,
                            'name': 'search_' + val.type,
                            'code': code[1],
                            'text': val.text,
                            'checked': _self.isExist(val.type, code[1]) ? 'checked="checked"' : ''
                        });
                    }
                });

                return Template.get('sp_'+_self.name+'_auto_complete_tmpl', tmplData);
            },

            /** @this AutoComplete */
            clickItem: function(type, $el) {
                var val       = $el.val(),
                    isChecked = $el.is(':checked');

                if (isChecked) {
                    _self.makeDepth(_self.depth1Options[val]);
                }

                // logging param
                Common.Logging.setEventFlow(_self.eventFlowName + '_inputbox');

                var $target = _self.$wrapper.find('input:checkbox[id=' + type + '_' + val + ']');
                _self.clickCheckBox($target, $el.is(':checked'));
                _self.checkedAllCheckBox($target);

                _self.handleRepresentative($target);
                if (!_self.validateCheckedCount($target)) {
                    if(isChecked) {
                        $el.prop('checked', false);
                        $target.prop('checked', false);
                    } else {
                        $el.prop('checked', true);
                        $target.prop('checked', true);
                    }
                    _self.clickItemFromBelongsToRepresentative($target, $target.data('representative'));
                    _self.setPreviewAndState($target);
                    return false;
                }

                _self.addSelectedClass(_self.depth1Options[val]);
                _self.showSelectedCountAndTitle($target);
            },

            /** @this AutoComplete */
            reset: function(type, code) {
                this.$resultList.find('input[name="search_'+type+'[]"]:checked').filter('[value="' + code + '"]').triggerClick();
            }
        },

        // 자동완성에서 선택시 html 요소가 없다면 그리기
        makeDepth: function (code) {
            _self.appendLastDepth(code, null, true);
            _self.resizeForTinyScrollbar();
        },

        isExist: function(type, code) {
            var findName = type+'[]';
            return _self.$wrapper.find('input[name="' + findName + '"]:checked').filter('[value="' + code + '"]').length > 0;
        },

        getCheckedEl: function() {
            return _self.$wrapper.find('.depth_check :checkbox:checked');
        },

        addEventTrigger: function(el) {
            _self.handleRepresentative(el);
        },

        handleRepresentative: function($el) {
            var isRepresentative = $el.data('is_representative'),
                representative   = $el.data('representative');

            // 대표지역을 클릭한 경우
            if (isRepresentative === 'y') {
                return _self.clickItemOfRepresentative($el);
            }

            // 대표지역에 속하는 지역을 클릭한 경우
            if (!Util.Lang.isEmpty(representative)) {
                return _self.clickItemFromBelongsToRepresentative($el, representative);
            }
        },

        // 대표지역 여부
        isRepresentative: function(code) {
            return _.has(_self.representative, code);
        },

        getRepresentative: function(code) {
            var values = _.find(_self.representative, function(data) {
                return Util.Array.has(code, data);
            });
            return !Util.Lang.isEmpty(values) ? _.findKey(_self.representative, values) : null;
        },

        clickItemOfRepresentative: function($el) {
            var code           = $el.val(),
                $subListEl     = _self.getElementFromBelongsToRepresentative(code),
                autoCompleteSubListEl = Array.prototype.slice.call($subListEl).map(function (el) {
                    return _self.AutoComplete.$wrapper.find('#autocomplete_has_result').find('#search_loc_cd_' + $(el).val());
                });

            if ($el.is(':checked')) {
                // 대표 체크 시 하위 전체 체크
                this.clickCheckBox($subListEl.filter(':not(:checked)'), true);
                autoCompleteSubListEl.forEach(function($el){
                    $el.prop('checked', true);
                });
            } else if ($subListEl.filter(':not(:checked)').length === 0) {
                // 대표 해제 시 하위 전체 체크되어 있을 경우 전체 해제
                this.clickCheckBox($subListEl, false);
                autoCompleteSubListEl.forEach(function($el){
                    $el.prop('checked', false);
                });
            }
        },

        clickItemFromBelongsToRepresentative: function($el, representative) {
            var $target = _self.getElement(representative, _self.$depthWrapper),
                $autoCompleteTypeAllEl = _self.AutoComplete.$wrapper.find('#autocomplete_has_result').find('#search_loc_cd_' + representative);

            if ($el.is(':checked')) {
                var $subList = _self.getElementFromBelongsToRepresentative(representative);
                // 하위 코드가 전부 선택되었을때 대표 체크
                if ($subList.filter(':not(:checked)').length === 0) {
                    this.clickCheckBox($target.filter(':not(:checked)'), true);
                    $autoCompleteTypeAllEl.prop('checked', true);
                }
            } else {
                this.clickCheckBox($target.filter(':checked'), false);
                $autoCompleteTypeAllEl.prop('checked', false);
            }
        },

        getElementFromBelongsToRepresentative: function(representative) {
            if (Util.Lang.isEmpty(representative)) {
                return null;
            }

            return _self.$depthWrapper.find('input:checkbox[data-representative="' + representative + '"]');
        },

        getCheckedCount: function($checkedEl) {
            var hasCheckedEl = !Util.Lang.isEmpty($checkedEl),
                $wrapper = $checkedEl.parents('.wrap_depth_category');
            return _.reduce($wrapper.find(':checkbox:checked[data-representative!=""]'), function(count, el) {
                var representative = $(el).data('representative');

                // 대표지역이 선택된 경우 하위지역은 카운트 갯수에서 제외하고
                // 하위지역만 선택한 경우 카운트 갯수에 포함한다.
                var $subListEl            = _self.getElementFromBelongsToRepresentative(representative),
                    $representativeEl     = _self.getElement(representative),
                    representativeChecked = $representativeEl.is(':checked');

                if (hasCheckedEl && !$checkedEl.is(':checked') && $subListEl.filter($checkedEl).length > 0 && representativeChecked) {
                    return ++count;
                }
                if ((!hasCheckedEl || $checkedEl.is(':checked')) && !representativeChecked && $subListEl.filter(':not(:checked)').length > 0) {
                    return ++count;
                }
                // 대표체크가 아닌데 아직 체크 되어있는 다른 하위 항목들이 있다.
                if (!representativeChecked && $subListEl.filter(':checked').length > 0) {
                    return ++count;
                }
                return count;
            }, $wrapper.find(':checkbox:checked[data-representative=""]').length);
        },

        getPreviewText: function ($this) {
            var checkBoxText = $('label[for=' + $this.attr('id') + ']').find('span.txt').text(),
                isSelectedTypeAll = $this.attr('data-check-type') === 'all',
                depth1Text = $this.parents('.wrap_depth_category')
                    .find('#depth1_btn_' + $this.attr('data-mcode') + ' span.txt').text()
                    .replace(/\s$/, '');

            return (!isSelectedTypeAll && depth1Text !== '' ? depth1Text + '>' : '') // 전체 선택이 아닐 경우 1depth 텍스트
                + checkBoxText; // 현재 선택한 텍스트
        }
    });

    return new Area();
});