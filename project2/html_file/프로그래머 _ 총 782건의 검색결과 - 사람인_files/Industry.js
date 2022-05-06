define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template', 'TabStyleAbstract'
], function (require, $, _, Common, Util, Preview, Template, TabStyleAbstract) {
    'use strict';

    var _self,
        _MESSAGES  = {'MAX_COUNT': '업종은 {{MAX_COUNT}}개까지 선택 가능합니다.'};

    var Industry = function() {
        TabStyleAbstract.call(this);

        this.name      = 'industry';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_industry');
        this.paramKeys = ['ind_bcd', 'ind_cd', 'ind_key'];
    };

    Industry.prototype = _.create(TabStyleAbstract.prototype, {
        constructor: Industry,

        init: function() {
            _self = this;

            _self.initOptions();
            _self.bindEvents();
            _self.initParams();

            _self.maxCount = 5;

            return _self;
        },

        bindEvents: function() {

            _self.$wrapper
                .on('click', '.depth1', function() {
                    var $el = $(this);
                    if ($el.hasClass('selected')) {
                        _self.hideSubDepth($el)
                    } else {
                        _self.showSubDepth($el, function() {
                            $el.siblings('.sub_depth_wrapper').find('.depth2_wrapper > ul > li:first-child').triggerClick();
                        });
                    }
                })
                .on('click', '.depth2', function() {
                    _self.show3Depth($(this));
                })
                .on('click', '.btn_reset', function() {
                    _self.resetItem('all', _self.$wrapper.find('.depth3:visible').data('bcode'));
                    return false;
                })
                .on('click', '.btn_close', function() {
                    var $el = $(this).closest('.sub_depth_wrapper').siblings('.depth1');
                    _self.hideSubDepth($el);
                })
                .on('click', 'input[name="ind_cd[]"]', function() {
                    _self.clickItem('code', $(this));
                })
                .on('click', 'input[name="ind_key[]"]', function() {
                    _self.clickItem('keyword', $(this));
                })
            ;
        },

        initParams: function() {
            var ind_cd  = Common.getParamToArray('ind_cd'),
                ind_key = Common.getParamToArray('ind_key');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(ind_cd)) {
                _.forEach(ind_cd, _self.initParam.bind(_self));
            }
            if (!Util.Lang.isEmpty(ind_key)) {
                _.forEach(ind_key, _self.initParam.bind(_self));
            }
            Common.setEnabledAlert(true);
        },

        generateSubDepth: function(bcode) {
            var $el      = _self.$wrapper.find('#sp_industry_1depth_' + bcode),
                tmplData = {'list': [], 'sub_list': []};

            _.forEach(_self.options[bcode], function(data) {
                var tmplSubData = {'mcode': data.bcode, 'bcode': data.code, 'bcode_text': data.name, 'list': []};

                _.forEach(data.keyword, function(subData) {
                    tmplSubData.list.push({'code': subData.code, 'text': subData.name});
                });

                tmplData.sub_list.push({'html': Template.get('sp_industry_sub_tmpl', tmplSubData)});
                tmplData.list.push({'code': data.code, 'text': data.name});
            });

            $el.after(Template.get('sp_industry_tmpl', tmplData));
        },

        clickItem: function(type, $el) {
            var val       = $el.val(),
                name      = (type === 'keyword') ? 'ind_key' : 'ind_cd',
                bcode     = (type === 'keyword') ? $el.data('bcode') : val,
                resetType = (type === 'keyword') ? 'code' : 'keyword',
                previewId = 'sp_preview_' + _self.name + '_' + val;

            if ($el.is(':checked')) {
                _self.resetItem(resetType, bcode);

                if (_self.exceedMaxCount()) {
                    $el.prop('checked', false).trigger('change');
                    Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _self.maxCount}));
                    return;
                }

                Common.setState(name, previewId, val);
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState(name, previewId);
                    _self.set2DepthCheckedStyle(bcode);
                    _self.set1DepthCheckedStyle($el.data('mcode'));
                });
            } else {
                Common.removeState(name, previewId);
                Preview.remove(previewId);
            }

            _self.set2DepthCheckedStyle(bcode);
            _self.set1DepthCheckedStyle($el.data('mcode'));
        },

        exceedMaxCount: function() {
            return _self.getCheckedCount() > _self.maxCount;
        },

        resetItem: function(type, bcode) {
            var $depth3Wrapper = _self.$wrapper.find('#sp_industry_3depth_' + bcode);

            if (type === 'all') {
                $depth3Wrapper.find(':checkbox:checked').triggerClick();
            } else {
                var findName = (type === 'keyword') ? 'ind_key[]' : 'ind_cd[]';
                $depth3Wrapper.find('input[name="' + findName + '"]:checked').triggerClick();
            }
        }
    });

    return new Industry();
});