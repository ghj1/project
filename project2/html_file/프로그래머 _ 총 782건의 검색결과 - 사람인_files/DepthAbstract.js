define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Template', 'Preview'
], function (require, $, _, Common, Util, Template, Preview) {
    'use strict';

    var DepthAbstract = function () {};

    DepthAbstract.prototype = {

        init: function() {},

        initOptions: function() {
            this.options       = Common.getOption(this.name);
            this.depth1Options = Common.getOption(this.name + '_1depth');
        },

        initParam: function(code) {
            var depth1Code = this.get1DepthCode(code);
            if (Util.Lang.isEmpty(depth1Code)) {
                return false;
            }

            if (this.hasSubDepth()) {
                this.generateSubDepth(depth1Code);
                this.$wrapper.find('ul.list_sub button.subDepth_btn_' + code).triggerClick();
            }

            this.$wrapper.find('.depth_check').find(':checkbox[value="' + code + '"]:not(:checked)').each(function() {
                $(this).filter(':not(:checked)').triggerClick();
            });
        },

        initLogging: function () {
            this.loggingName = Common.getVariable('loggingOptions').loggingName;
            Common.Logging.setEventAction(this.loggingName);
        },
        
        initTabIfParamIsInvalid: function() {
            var $depth1 = this.$depth1.find('.depth1_btn_wrapper');
            if ($depth1.filter('.on').length === 0) {
                $depth1.filter(':first').addClass('on').children('button').triggerClick();
            }
        },

        // depth 관련 기본 바인딩
        defaultBindEvent: function () {
            var $depth1Wrapper = this.$wrapper.find('div.wrap_scroll.depth1'), $tabFirstSection = $('ul.tab_section').find('li').eq(0),
                $wrapSectionFirstContents = $('div.wrap_section_contents').find('div.option_content').eq(0);
            $depth1Wrapper.on('click', 'button', function () {
                $depth1Wrapper.find('li.depth1_btn_wrapper.on').removeClass('on');
                $(this).parent().addClass('on');
                Util.Layer.arrangeDepthTinyScrollbar('depth1');
            });

            // 기본 펼치기 설정;
            if ($wrapSectionFirstContents.find('li.depth1_btn_wrapper').filter('.selected').length === 0 && !$tabFirstSection.hasClass('keyword_section')) {
                $tabFirstSection.addClass('on');
                $wrapSectionFirstContents.addClass('on');
                $('#sp_smart_filter').hide();
                Util.Layer.arrangeDepthTinyScrollbar();
            }
        },

        get1DepthCode: function(code) {
            return _.has(this.depth1Options, code) ? _.get(this.depth1Options, code) : null;
        },

        getElement: function(code, $wrapper) {
            $wrapper = $wrapper || this.$wrapper;
            return $wrapper.find('input:checkbox[value="' + code + '"]');
        },

        hasSubDepth: function() {
            return this.$wrapper.find('.depth2 ul.list_sub').length > 0;
        },

        addEventTrigger: function () {},
        getCheckedCount: function () {},
        getPreviewText: function () {},

        // 기본 1depth append
        generateDefaultDepth: function (params) {
            var tmplData = { list : [] }, depth1Count = Common.getOption(this.name + '_1depth_count');

            _.forEach(Common.getOption(this.oneDepthText), function (val, key) {
                tmplData.list.push({
                    code: key, name: val, count: depth1Count[key], selected: (params.indexOf(key) > -1) ? 'selected' : ''
                });
            });

            $('#' + this.oneDepthTemplate).after(Template.get(this.oneDepthTemplate, tmplData));
        },

        // sub depth 가 있는경우 호출하여 사용 (직, 업종 등)
        generateSubDepth: function (code) {
            var subDepthArea = $('#' + this.subDepthArea + '_' + code);

            // 일단 subDepth 영역을 숨기고
            this.$wrapper.find('div.wrap_scroll.depth2 ul.list_sub').hide();

            // 그려진 html 이 있으면 안그리고 show 만
            if (subDepthArea.length > 0) {
                subDepthArea.show();
            } else {
                this.appendSubDepth(code, false);
            }

            // subDepth Binding
            this.subDepthBinding(code);

            this.toggleNoticeTxt(code);

            this.resizeForTinyScrollbar();
        },

        /**
         * check box 생성을 위한 마지막 depth
         * @param code
         * @param bcode
         * @param defaultCheck / checkbox Default check boolean / true or false
         */
        generateLastDepth: function (code, bcode, defaultCheck) {
            var lastDepthArea = $('#' + this.lastDepthArea + '_' + code);
            // 일단 lastDepth 영역을 숨기고
            this.$wrapper.find('div.depth_check ul.list_check').hide();

            // 그려진 html 이 있으면 안그리고 show 만
            if (lastDepthArea.length > 0) {
                lastDepthArea.show();
            } else {
                this.appendLastDepth(code, bcode, false);
            }

            this.defaultCheckbox(code, defaultCheck);
            this.resizeForTinyScrollbar();
            Util.Layer.arrangeDepthTinyScrollbar('depth2');
        },

        appendSubDepth: function (code, displayNone) {
            var depth = Common.getOption(this.name), subDepthCode = this.subDepthCode || [],
                tmplData = { list : [], code : code.toString() }, subDepthArea = $('#' + this.subDepthArea + '_' + code);

            if (subDepthArea.length > 0) {
                return;
            }

            _.forEach(depth[code], function (val) {
                tmplData.list.push({
                    code: val.code, bcode: val.bcode, name: val.name, count: val.count, keyword: val.keyword, selected: (subDepthCode.indexOf(val.code.toString()) > -1) ? 'selected' : ''
                });
            });

            $('#' + this.subDepthTemplate).after(Template.get(this.subDepthTemplate, tmplData));

            if (displayNone === true) {
                $('#' + this.subDepthArea + '_' + code).hide();
            }
        },

        appendLastDepth: function (code, bcode, displayNone) {
            var tmplData = {}, depth = Common.getOption(this.name), lastDepthArea = $('#' + this.lastDepthArea + '_' + code);

            if (lastDepthArea.length > 0) {
                return;
            }
            // sub depth 가 있는 경우
            if (bcode) {
                _.forEach(depth[bcode], function (val) {
                    if (val.code == code) {
                        tmplData = { list: val.keyword, code: code, bcode: bcode, name: val.name };
                    }
                });
            } else {
                tmplData = { list : depth[code], code : code };
            }

            // template 위치에 append
            $('#' + this.lastDepthTemplate).after(Template.get(this.lastDepthTemplate, tmplData));

            if (displayNone === true) {
                $('#' + this.lastDepthArea + '_' + code).hide();
            }

            // append 된 요소 bind
            this.clickItems(code);
        },

        resizeForTinyScrollbar: function() {
            $('.wrap_auto_keyword .wrap_scroll').outerHeight(183);
            $(window).trigger('resize');
        },

        // last depth binding and preview append
        clickItems: function (code) {
            var _self = this, lastDepthArea = $('#' + this.lastDepthArea + '_' + code);

            lastDepthArea.on('click', 'input:checkbox', function () {
                var $this = $(this);
                _self.checkedAllCheckBox($this);
                _self.addEventTrigger($this);
                if (!_self.validateCheckedCount($this)) {
                    return false;
                }

                Common.Logging.setEventFlow(_self.eventFlowName + '_category');
                if (_self.name === 'subway') {
                    _self.addTransfer($this);
                }
                _self.setPreviewAndState($this);
                _self.addSelectedClass($this.attr('data-mcode'), $this.attr('data-bcode'));
                _self.showSelectedCountAndTitle($this);
            });
        },

        validateCheckedCount: function ($this, isExceptionCountFlag) {
            var message = '{{name}}은 {{count}}개까지 선택 가능합니다.',
                currentValidateCount = Common.searchMaxCount[this.name];
            message = message.replace('{{name}}', this.data.text).replace('{{count}}', currentValidateCount);

            switch (this.name) {
                case 'area' :
                    if (this.getCheckedCount($this) > currentValidateCount && ($this.prop('checked') || !$this.prop('checked') && $this.data('is_representative') === 'n')) {
                        if ($this.is(':checked')) {
                            $this.prop('checked', false);
                        } else {
                            $this.prop('checked', true);
                        }
                        this.clickItemOfRepresentative($this);
                        this.clickItemFromBelongsToRepresentative($this, $this.data('representative'));
                        Common.notify(message);
                        return false;
                    }
                    break;
                case 'job_category' :
                    if($this.attr('name') === 'cat_mcls[]'){
                        if(!$this.prop('checked') || $this.closest('.box_detail_depth').find('[name="cat_kewd[]"].on').length > 0){
                            return true;
                        }
                    }

                    if($this.attr('name') === 'cat_kewd[]' && $this.hasClass('on')){    // 클릭이벤트 동작 이후 on 클래스가 추가되기 때문에 클래스가 없는 경우 체크해야함
                        return true;
                    }

                    if (this.getCurrentPanelCheckedCount() - (isExceptionCountFlag ? 1 : 0) >= currentValidateCount) {
                        Common.notify(message);
                        return false;
                    }
                    break;
                default :
                    if (!$this.prop('checked')) {
                        return true;
                    }
                    if (this.getCurrentPanelCheckedCount() - (isExceptionCountFlag ? 1 : 0) >= currentValidateCount) {
                        Common.notify(message);
                        return false;
                    }
                    break;
            }
            return true;
        },

        getCurrentPanelCheckedCount: function () {
            var stateIds = [this.data.stateId].concat(this.data.stateIdCheckedAll),
                allStateIds = [];
            stateIds.forEach(function (stateId) {
                if (Common.state[stateId]) {
                    allStateIds = allStateIds.concat(Object.keys(Common.state[stateId]).map(function (id) {
                        return Preview.isExist($('#' + id).parent().text()) ? id : '';
                    }).filter(Boolean));
                }
            });
            return allStateIds.length;
        },

        showSelectedCountAndTitle: function($this){
            var _self = this,
                selectedTitle = [],
                stateCheckTypeAllPreviewIdArr = [];

            // 지하철 중복 제거(preview에 존재하는 항목만 사용)
            var statePreviewIdArr = [];
            if (Common.state[_self.data.stateId]) {
                statePreviewIdArr = Object.keys(Common.state[_self.data.stateId]).map(function (id) {
                    return Preview.isExist($('#' + id).parent().text()) ? id : '';
                }).filter(Boolean);
            }

            // 전체 클릭시
            if (_self.name !== 'subway') {
                _self.data.stateIdCheckedAll.forEach(function (id) {
                    if (Common.state[id]) {
                        Object.keys(Common.state[id]).forEach(function (statePreviewId) {
                            selectedTitle.push(_self.getSelectedTitleTypeAll(id, Common.state[id][statePreviewId]));
                            stateCheckTypeAllPreviewIdArr.push(statePreviewId);
                        });
                    }
                });
            }

            // 전체 외의 아이템 클릭시
            statePreviewIdArr.forEach(function (statePreviewId) {
                selectedTitle.push(_self.getSelectedTitle(_self.data.stateId, Common.state[_self.data.stateId][statePreviewId]));
            });

            // 국내 지역일 경우에만 대표지역 예외 카운트 처리
            var count = (_self.name === 'area')
                ? _self.getCheckedCount($this)
                : statePreviewIdArr.concat(stateCheckTypeAllPreviewIdArr).length,
                text = _self.data.text + (count === 0 ? ' 선택' : '(' + count + ') ' + selectedTitle.join(', '));
            $('.tab_section  .' + _self.name + '_section').find('.input_placeholder').text(text);

            if(count === 0 ) {
                $('.tab_section  .' + _self.name + '_section').find('.input_placeholder').removeClass('filter_selected');
            } else {
                $('.tab_section  .' + _self.name + '_section').find('.input_placeholder').addClass('filter_selected');
            }
        },

        getSelectedTitle: function (key, code) {
            return this.$wrapper.find('label[for=' + key + '_' + code + ']').find('span.txt').text();
        },

        getSelectedTitleTypeAll: function (key, code) {
            var selectedTitle = '';

            switch (key) {
                case 'cat_mcls' :
                    var $oneDepthBtn = this.$wrapper.find('#depth1_btn_' + code).clone();

                    selectedTitle = $oneDepthBtn.find('.txt').text();
                    break;
                default :
                    // 전체 클릭했을 때 국내/해외는 1depth명 전체 / 업직종은 2depth 전체
                    var selector = (['loc_mcd', 'loc_bcd'].indexOf(key) > -1) ? '#depth1_btn' : '#depth2_btn',
                        allText = (code != '117000') ? ' 전체' : '';

                    selectedTitle = this.$wrapper.find(selector + '_' + code).find('span.txt').text().replace(/\s$/, '') + allText;
                    break;
            }
            return selectedTitle;
        },

        // 각 상위 depth selected 처리;
        addSelectedClass: function (mcode, bcode) {
            if (typeof bcode !== 'undefined') {
                if ($('#' + this.lastDepthArea + '_' + bcode).find('input:checked').length > 0) {
                    this.$wrapper.find('#depth1_btn_' + mcode).addClass('selected');
                    this.$wrapper.find('#depth2_btn_' + bcode).addClass('selected');
                } else {
                    this.$wrapper.find('#depth1_btn_' + mcode).removeClass('selected');
                    this.$wrapper.find('#depth2_btn_' + bcode).removeClass('selected');
                }
            } else {
                if ($('#' + this.lastDepthArea + '_' + mcode).find('input:checked').length > 0) {
                    this.$wrapper.find('#depth1_btn_' + mcode).addClass('selected');
                } else {
                    this.$wrapper.find('#depth1_btn_' + mcode).removeClass('selected');
                }
            }
        },

        subDepthBinding: function (code) {
            var subDepthArea = $('#' + this.subDepthArea + '_' + code), _self = this;
            subDepthArea.on('click', 'button', function () {
                subDepthArea.find('li.depth2_btn_wrapper.on').removeClass('on');
                $(this).parent().addClass('on');
                Util.Layer.arrangeDepthTinyScrollbar('depth2');
                _self.$wrapper.find('.wrap_list_check .area_btn').show();
                _self.$wrapper.find('.noti_txt').hide();
            });
        },

        toggleNoticeTxt: function (code) {
            var subDepthArea = $('#' + this.subDepthArea + '_' + code);
            if (subDepthArea.length === 0) {
                return;
            }

            this.$wrapper.find('div.depth_check ul.list_check').hide();

            if (subDepthArea.children('li').filter('.on').length === 0) {
                this.$wrapper.find('.wrap_list_check .area_btn').hide();
                this.$wrapper.find('.noti_txt').show();
            } else {
                var lastDepthId = subDepthArea.children('li').filter('.on').children('button').attr('data-code');
                $('#' + this.lastDepthArea + '_' + lastDepthId).show();
                this.$wrapper.find('.wrap_list_check .area_btn').show();
                this.$wrapper.find('.noti_txt').hide();
            }
        },

        checkedAllCheckBox: function (checkBox) {
            // 지하철은 전체 선택이 없다.
            if (this.name === 'subway') {
                return;
            }
            var _self = this;
            var parent = checkBox.parents('ul.list_check'),
                isTypeAll = checkBox.attr('data-check-type') === 'all',
                $allElem = parent.find('[data-check-type="all"]'),
                $autoCompleteCont = checkBox.parents('.option_content');


            // 전체를 선택한경우
            if (isTypeAll && checkBox.prop("checked")) {
                $allElem.prop('checked', true);
                var $targetElem = parent.find(':checkbox:checked').filter('[data-check-type!="all"]');
                // 국내지역일 경우 대표지역 아닌 항목만 체크해주면 대표지역은 자동으로 해제된다
                this.clickCheckBox($targetElem.filter('[data-representative!=""]'), false);
                // 하위에 선택되어있는 아이템들을 찾아서 모두 해제
                this.clickCheckBox($targetElem, false);
                // 자동완성에서도 하위 항목들 해제
                Array.prototype.map.call($targetElem, function (i, el) {
                    return $(el).attr('id');
                }).forEach(function (id) {
                    _self.clickCheckBox($autoCompleteCont.find('#search_' + id), false);
                });
            }
            // 전체이외에 나머지를 선택한 경우
            if (!isTypeAll && checkBox.prop('checked')) {
                $allElem.prop('checked', false);
                this.clickCheckBox($allElem, false);
                // 자동완성에서 전체가 있을 경우 해제
                var $autoCompleteAllElem = $autoCompleteCont.find('#search_' + parent.first().find('[data-check-type="all"]').attr('id'));
                $autoCompleteAllElem.length > 0 && this.clickCheckBox($autoCompleteAllElem, false);
            }
        },

        clickCheckBox : function($target, checked){
            var _self = this;
            $target.each(function(i, el){
                $(el).prop('checked', checked);
                _self.setPreviewAndState($(el));
            });
        },

        // depth 선택시 전체 항목 선택
        defaultCheckbox: function (code, defaultCheck) {
            if (defaultCheck === true && $('#' + this.lastDepthArea + '_' + code).find('input:checkbox:checked').length <= 0) {
                $('#' + this.lastDepthArea + '_' + code).find('input:checkbox').eq(0).triggerClick();
            }
        },

        setPreviewAndState: function($this){
            var _self = this;
            var checkBoxValue = $this.val(), previewId = 'sp_preview_' + this.name + '_' + checkBoxValue,
                elementId = $this.attr('name').replace('[]', ''), mCode = $this.attr('data-mcode'), bcode = $this.attr('data-bcode');

            if ($this.prop('checked') === true) {
                Common.setState(elementId, previewId, checkBoxValue);
                Preview.append(previewId, _self.getPreviewText($this), '', function () {
                    Common.removeState(elementId, previewId, checkBoxValue);
                    $this.prop('checked', false).trigger('change');
                    _self.removeTransfer($this);
                    _self.removeRepresentative($this);
                    _self.addSelectedClass(mCode, bcode);
                    _self.showSelectedCountAndTitle($this);
                    // 자동완성 visible 일 경우 hide 처리
                    var $searchForm = $('#search_panel_form');
                    if (!$searchForm.find('.wrap_auto_keyword').has($this.target).length) {
                        $searchForm.find('.wrap_result').hide();
                    }
                });

                // logging 처리
                var eventFlow = Common.Logging.getEventFlow(), loggingValue = Common.Logging.getLoggingValue() || $this.val();
                Common.Logging.pushDataLayer('ga_lead', Common.Logging.getEventAction(), eventFlow, loggingValue);
                Common.Logging.trackEvent('panel_search', Common.Logging.getEventAction(), eventFlow, loggingValue);
            } else {
                Common.removeState(elementId, previewId);
                Preview.remove(previewId);
                _self.removeTransfer($this);
            }

            // Logging 값 초기화
            Common.Logging.setLoggingValue('');
        },

        removeTransfer: function ($this) {
            if (this.name !== 'subway') {
                return;
            }
            var _self = this;
            var transfer = $this.data('transfer').toString();
            if (!Util.Lang.isEmpty(transfer)) {
                transfer.split(',').forEach(function (code) {
                    var previewId = 'sp_preview_' + _self.name + '_' + code,
                        $elem = $('#' + _self.data.stateId + '_' + code);
                    $elem.prop('checked', false);
                    _self.addSelectedClass($elem.attr('data-mcode'), $elem.attr('data-bcode'));
                    Common.removeState($this.attr('name').replace('[]', ''), previewId, code);
                    Preview.remove(previewId);
                });
            }
        },

        removeRepresentative: function ($el) {
            if (this.name !== 'area') {
                return;
            }

            var _self = this, isRepresentative = $el.data('is_representative'), code = $el.val(), representativeCode = $el.data('representative');
            if (isRepresentative === 'y') {
                $.each(_self.$depthWrapper.find('input:checkbox[data-representative="' + code + '"]'), function () {
                    var previewId = 'sp_preview_' + _self.name + '_' + $(this).val(), $elem = $('#' + _self.data.stateId + '_' + $(this).val());
                    $elem.prop('checked', false);
                    _self.addSelectedClass($elem.attr('data-mcode'), $elem.attr('data-bcode'));
                    Common.removeState($el.attr('name').replace('[]', ''), previewId, $(this).val());
                    Preview.remove(previewId);
                });
            } else {
                var previewId = 'sp_preview_' + _self.name + '_' + representativeCode, $elem = $('#' + _self.data.stateId + '_' + representativeCode);
                $elem.prop('checked', false);
                _self.addSelectedClass($elem.attr('data-mcode'), $elem.attr('data-bcode'));
                Common.removeState($el.attr('name').replace('[]', ''), previewId, representativeCode);
                Preview.remove(previewId);
            }
        },

        showDefaultSection: function(closeSection) {
            var tabWrapper = $('ul.tab_section'),
                contentsWrapper = $('div.wrap_section_contents');

            tabWrapper.find('li.' + this.name + '_section').addClass('on');
            this.$wrapper.addClass('on');

            tabWrapper.find('li.' + closeSection + '_section').removeClass('on');
            contentsWrapper.find('div.' + closeSection + '_section').removeClass('on');

            tabWrapper.find('li.keyword_section').removeClass('on');
            contentsWrapper.find('div.keyword_section').removeClass('on');

            tabWrapper.find('li.detail_section').removeClass('on');
            tabWrapper.find('li.detail_section').find('.btn_detail_option').removeClass('on');
            contentsWrapper.find('div.detail_section').removeClass('on');
            contentsWrapper.find('div.detail_option_section').removeClass('on');
            contentsWrapper.find('div.wrap_detail_panel').hide();

            switch(this.name) {
                case 'job_category' :
                    Util.Layer.arrangeJobCategoryDepthTinyScrollbar();
                    break;
                case 'subway' :
                    contentsWrapper.find('div.subway_station_section').hide();
                    break;
            }


            if ($('#sp_smart_filter').length > 0) {
                $('#sp_smart_filter').hide();
            }
        }
    };

    return DepthAbstract;
});