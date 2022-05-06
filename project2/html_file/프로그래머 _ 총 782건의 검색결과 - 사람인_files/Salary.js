define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self;

    var Salary = function() {
        this.name      = 'salary';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_salary');
        this.paramKeys = ['sal_cd', 'sal_min'];
    };


    Salary.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$salMin       = _self.$wrapper.find('#sal_min');
            _self.$salMinSelect = _self.$wrapper.find('#sal_min_sel');
            _self.$salCd        = _self.$wrapper.find('#sal_cd');
        },

        bindEvents: function() {
            _self.$salCd.on('click', _self.select);
            _self.$salMin.on('change', _self.selectMin);
        },

        initParams: function() {
            var sal_cd  = Common.getParam('sal_cd'),
                sal_min = Common.getParam('sal_min');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(sal_cd)) {
                _self.$wrapper.find('#sal_cd:not(:checked)').triggerClick();
            }
            if (!Util.Lang.isEmpty(sal_min)) {
                _self.$wrapper.find('#sal_min_sel').find('li > a[data-value="' + sal_min + '"]').triggerClick();
            }
            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        select: function() {
            var $el       = $(this),
                previewId = 'preview_' + _self.name;

            if ($el.is(':checked')) {
                Common.setState('sal_cd', previewId, $el.val());
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('sal_cd', previewId);
                });
            } else {
                Common.removeState('sal_cd', previewId);
                Preview.remove(previewId);
            }
        },

        /** @this jQuery Object */
        selectMin: function() {
            var $el         = $(this),
                $select     = _self.$salMinSelect,
                description = $select.find('li.on > a').data('description'),
                previewId   = 'preview_' + _self.name + '_min';

            Common.removeState('sal_min', previewId);
            Preview.remove(previewId);

            if (!Util.Lang.isEmpty($el.val())) {
                Common.setState('sal_min', previewId, $el.val());
                Preview.append(previewId, description, 'optional', function() {
                    $select.find('li:first > a').triggerClick();
                });
            }
        },

        isSelected: function() {
            return (!Util.Lang.isEmpty(_self.$salMin.val()) || _self.$salCd.is(':checked'));
        },

        reset: function() {
            _self.$salCd.filter(':checked').triggerClick();
            _self.$salMinSelect.find('li:first > a').triggerClick();
        }
    };

    return new Salary();
});