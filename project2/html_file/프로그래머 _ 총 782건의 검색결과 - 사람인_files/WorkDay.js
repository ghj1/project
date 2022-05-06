define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 3},
        _MESSAGES = {'MAX_COUNT': '근무요일은 {{MAX_COUNT}}개까지 선택가능합니다.'};

    var WorkDay = function() {
        this.name      = 'work_day';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_work_day');
        this.paramKeys = ['workday'];
    };


    WorkDay.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$workDay  = _self.$wrapper.find('[name="workday[]"]');
            _self.$resetBtn = _self.$wrapper.find('.btn_reset');
        },

        bindEvents: function() {
            _self.$workDay.on('click', _self.select);
            _self.$resetBtn.on('click', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var workday = Common.getParamToArray('workday');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(workday)) {
                _.forEach(workday, function(val) {
                    _self.$workDay.filter('[value="' + val + '"]:not(:checked)').triggerClick();
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

                Common.setState('workday', previewId, val);
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('workday', previewId);
                });
            } else {
                Common.removeState('workday', previewId);
                Preview.remove(previewId);
            }
        },

        exceedMaxCount: function() {
            return _self.$workDay.filter(':checked').length > _VARIABLES.MAX_COUNT;
        },

        isSelected: function() {
            return _self.$workDay.is(':checked');
        },

        reset: function() {
            _self.$workDay.filter(':checked').triggerClick();
        }
    };

    return new WorkDay();
});