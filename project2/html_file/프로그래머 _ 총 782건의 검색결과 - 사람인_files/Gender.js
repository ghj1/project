define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        genderSelected = false;

    var Gender = function() {
        this.name      = 'gender';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_gender');
        this.paramKeys = ['gender', 'gender_none'];
    };

    Gender.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$gender     = _self.$wrapper.find('[name="gender"]');
            _self.$genderNone = _self.$wrapper.find('#gender_none');
            _self.$resetBtn   = _self.$wrapper.find('.btn_reset');
        },

        bindEvents: function() {
            _self.$gender.on('change', _self.select);
            _self.$genderNone.on('click', _self.selectNone);
            _self.$resetBtn.on('click', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var gender      = Common.getParam('gender'),
                gender_none = Common.getParam('gender_none');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(gender)) {
                _self.$gender.filter('[value="' + gender + '"]').prop('checked', true).trigger('change');
            }
            if (!Util.Lang.isEmpty(gender_none)) {
                _self.$genderNone.filter(':not(:checked)').triggerClick();
            }
            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        select: function() {
            var $el       = $(this),
                previewId = 'preview_' + _self.name;

            Common.removeState('gender', previewId);
            Preview.remove(previewId);

            if ($el.is(':checked')) {
                if (typeof JSON.parse(window.searchPanelArgs.params).gender === 'undefined' || genderSelected === true) {
                    _self.$genderNone.filter(':not(:checked)').triggerClick();
                }

                Common.setState('gender', previewId, $el.val());
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('gender', previewId);
                });

                genderSelected = true;
            }
        },

        /** @this jQuery Object */
        selectNone: function() {
            var $el       = $(this),
                previewId = 'preview_' + _self.name + '_none';

            if ($el.is(':checked')) {
                Common.setState('gender_none', previewId, $el.val());
                Preview.append(previewId, $el.data('description'), 'optional', function() {
                    $el.prop('checked', false).trigger('change');
                    Common.removeState('gender_none', previewId);
                });
            } else {
                Common.removeState('gender_none', previewId);
                Preview.remove(previewId);
            }
        },

        isSelected: function() {
            return _self.$gender.is(':checked') || _self.$genderNone.is(':checked');
        },

        reset: function() {
            _self.$gender.filter(':checked').prop('checked', false).trigger('change');
            _self.$genderNone.filter(':checked').triggerClick();
        }
    };

    return new Gender();
});