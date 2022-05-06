define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 10},
        _MESSAGES = {'MAX_COUNT': '기업형태는 {{MAX_COUNT}}개까지 선택가능합니다.'};

    var CompanyType = function() {
        this.name      = 'company_type';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_company_type');
        this.paramKeys = ['company_type'];
    };


    CompanyType.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$companyType = _self.$wrapper.find('[name="company_type[]"]');
            _self.$resetBtn    = _self.$wrapper.find('.btn_reset');
        },

        bindEvents: function() {
            _self.$companyType.on('click', _self.select);
            _self.$resetBtn.on('click', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var company_type = Common.getParamToArray('company_type');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(company_type)) {
                _.forEach(company_type, function(val) {
                    _self.$companyType.filter('[value="' + val + '"]:not(:checked)').triggerClick();
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

                Common.setState('company_type', previewId, val);
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('company_type', previewId);
                });
            } else {
                Common.removeState('company_type', previewId);
                Preview.remove(previewId);
            }
        },

        exceedMaxCount: function() {
            return _self.$companyType.filter(':checked').length > _VARIABLES.MAX_COUNT;
        },

        isSelected: function() {
            return _self.$companyType.is(':checked');
        },

        reset: function() {
            _self.$companyType.filter(':checked').triggerClick();
        }
    };

    return new CompanyType();
});