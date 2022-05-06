define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 3},
        _MESSAGES = {'MAX_COUNT': '근무형태는 {{MAX_COUNT}}개까지 선택 가능합니다.'};

    var JobType = function() {
        this.name      = 'job_type';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_job_type');
        this.paramKeys = ['job_type'];
    };


    JobType.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$jobType  = _self.$wrapper.find('[name="job_type[]"]');
            _self.$resetBtn = _self.$wrapper.find('.btn_reset');
        },

        bindEvents: function() {
            _self.$jobType.on('click', _self.select);
            _self.$resetBtn.on('click', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var job_type = Common.getParamToArray('job_type');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(job_type)) {
                _.forEach(job_type, function(val) {
                    _self.$jobType.filter('[value="' + val + '"]:not(:checked)').triggerClick();
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

                Common.setState('job_type', previewId, val);
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('job_type', previewId);
                });
            } else {
                Common.removeState('job_type', previewId);
                Preview.remove(previewId);
            }
        },

        exceedMaxCount: function() {
            return _self.$jobType.filter(':checked').length > _VARIABLES.MAX_COUNT;
        },

        isSelected: function() {
            return _self.$jobType.is(':checked');
        },

        reset: function() {
            _self.$jobType.filter(':checked').triggerClick();
        }
    };

    return new JobType();
});