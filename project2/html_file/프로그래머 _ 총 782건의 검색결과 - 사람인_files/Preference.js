define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 5},
        _MESSAGES = {'MAX_COUNT': '우대조건은 {{MAX_COUNT}}개까지 선택가능합니다.'};

    var Preference = function() {
        this.name      = 'preference';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_preference');
        this.paramKeys = ['preferential_cd'];
    };


    Preference.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$preferentailCd = _self.$wrapper.find('[name="preferential_cd[]"]');
            _self.$resetBtn       = _self.$wrapper.find('.btn_reset');
        },

        bindEvents: function() {
            _self.$preferentailCd.on('click', _self.select);
            _self.$resetBtn.on('click', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var preferential_cd = Common.getParamToArray('preferential_cd');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(preferential_cd)) {
                _.forEach(preferential_cd, function(val) {
                    _self.$preferentailCd.filter('[value="' + val + '"]:not(:checked)').triggerClick();
                });
            }
            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        select: function() {
            var $el       = $(this),
                val       = $el.val(),
                previewId = 'preview_' + _self.name + '_' + val;

            if ($el.is(':checked')) {
                if (_self.exceedMaxCount()) {
                    $el.prop('checked', false).trigger('change');
                    Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                    return false;
                }

                Common.setState('preferential_cd', previewId, val);
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('preferential_cd', previewId);
                });
            } else {
                Common.removeState('preferential_cd', previewId);
                Preview.remove(previewId);
            }
        },

        exceedMaxCount: function() {
            return _self.$preferentailCd.filter(':checked').length > _VARIABLES.MAX_COUNT;
        },

        isSelected: function() {
            return _self.$preferentailCd.is(':checked');
        },

        reset: function() {
            _self.$preferentailCd.filter(':checked').triggerClick();
        }
    };

    return new Preference();
});