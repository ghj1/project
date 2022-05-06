define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template'
], function (require, $, _, Common, Util, Preview, Template) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 7},
        _MESSAGES = {'MAX_COUNT': '복리후생은 {{MAX_COUNT}}개까지 선택가능합니다.'};

    var Welfare = function() {
        this.name      = 'welfare';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_welfare');
        this.paramKeys = ['welfare_cd'];
    };


    Welfare.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$welfareCd   = _self.$wrapper.find('[name="welfare_cd[]"]');
            _self.$searchBtn   = _self.$wrapper.find('.btn_welfare');
            _self.$closeBtn    = _self.$wrapper.find('.btn_close');
            _self.$registerBtn = _self.$wrapper.find('.btn_register');
            _self.$layer       = _self.$wrapper.find('#sp_welfare_layer');
        },

        bindEvents: function() {
            _self.$welfareCd.on('click', _self.select);
            _self.$searchBtn.on('click', _self.toggleLayer);
            _self.$closeBtn.on('click', _self.closeLayer);
            _self.$registerBtn.on('click', _self.closeLayer);

            _self.$wrapper.on('click', '.btn_reset', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var welfare_cd = Common.getParamToArray('welfare_cd');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(welfare_cd)) {
                _.forEach(welfare_cd, function(val) {
                    _self.$welfareCd.filter('[value="' + val + '"]:not(:checked)').triggerClick();
                });
            }
            Common.setEnabledAlert(true);
        },

        toggleLayer: function() {
            if (_self.$layer.is(':visible')) {
                Util.Layer.hide(_self.$layer);
            } else {
                Util.Layer.show(_self.$layer, function() {
                    if (Common.getParam('action') === 'samsung' || Common.getParam('action') === 'sba-seoul'
                        || Common.getParam('action') === 'tech' || Common.getParam('action') === 'wiset'
                        || Common.getParam('action') === 'youthstay' || Common.getParam('action') === 'cjpi'
                        || Common.getParam('action') === 'winwin-doosan' || Common.getParam('action') === 'ex'
                        || Common.getParam('action') === 'with-komipo' || Common.getParam('action') === 'kova'
                        || Common.getParam('action') === 'incheon-airport' || Common.getParam('action') === 'ketep'
                        || Common.getParam('action') === 'hdepartnership'
                        || Common.getParam('action') === 'skgeocentric'
                        || Common.getParam('action') === 'cjpi2'
                    ) {
                        $(window).scrollTop(560);
                    } else {
                        $(window).scrollTop(110);
                    }
                });
            }
            return false;
        },

        closeLayer: function() {
            Util.Layer.hide(_self.$layer);
        },

        /** @this jQuery Object */
        select: function() {
            var $el         = $(this),
                val         = $el.val(),
                description = $el.data('description'),
                appendId    = _self.name + '_' + val,
                previewId   = 'preview_' + appendId;

            if ($el.is(':checked')) {
                if (_self.exceedMaxCount()) {
                    $el.prop('checked', false).trigger('change');
                    Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                    return false;
                }

                Common.setState('welfare_cd', previewId, val);
                Preview.append(previewId, description, 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('welfare_cd', previewId);
                    _self.remove(appendId);
                });

                _self.append(appendId, description, function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('welfare_cd', previewId);
                    Preview.remove(previewId);
                });
            } else {
                Common.removeState('welfare_cd', previewId);
                Preview.remove(previewId);
                _self.remove(appendId);
            }
        },

        exceedMaxCount: function() {
            return _self.$welfareCd.filter(':checked').length > _VARIABLES.MAX_COUNT;
        },

        append: function(id, text, removeCallback) {
            _self.generateSelectedResult();

            var tmplData  = {'id': id, 'name': text},
                $appendEl = $(Template.get('sp_welfare_selected_result_item_tmpl', tmplData)),
                $resultEl = _self.$wrapper.find('#sp_welfare_selected_result');

            $appendEl.find('.remove-btn').on('click', function(e) {
                // event bubble
                e = e || window.event;
                if (e.stopPropagation) {
                    e.stopPropagation(); // W3C 표준
                } else {
                    e.cancelBubble = true; // 인터넷 익스플로러 방식
                }

                _self.remove(id);
                if (_.isFunction(removeCallback)) {
                    removeCallback();
                }
            });

            $resultEl.prepend($appendEl);

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        remove: function(id) {
            $('#' + id).remove();
            _self.removeSelectedResult();

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        generateSelectedResult: function() {
            if (_self.$wrapper.find('#sp_welfare_selected_result').length > 0) {
                return true;
            }
            _self.$searchBtn.after(Template.get('sp_welfare_selected_result_tmpl'));
        },

        removeSelectedResult: function() {
            var $resultEl = _self.$wrapper.find('#sp_welfare_selected_result');
            if ($resultEl.find('span').length === 0) {
                $resultEl.remove();
            }
        },

        isSelected: function() {
            return _self.$welfareCd.is(':checked');
        },

        reset: function() {
            _self.$welfareCd.filter(':checked').triggerClick();

            //Util.Layer.resizeDetailForTinyScrollbar();
        }
    };

    return new Welfare();
});