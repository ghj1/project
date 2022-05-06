define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self;

    var Age = function() {
        this.name      = 'age';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_age');
        this.paramKeys = ['age', 'age_none'];
    };

    Age.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$age       = _self.$wrapper.find('#age');
            _self.$ageSelect = _self.$wrapper.find('#age_sel');
            _self.$ageNone = _self.$wrapper.find('#age_none');
        },

        bindEvents: function() {
            _self.$age.on('change', _self.select);
            _self.$ageNone.on('click', _self.noneCheck);
        },

        initParams: function() {
            var age = Common.getParam('age'),
                ageNone = Common.getParam('age_none');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(age)) {
                _self.$ageSelect.find('li > a[data-value="' + age + '"]').triggerClick();
            } else {
                _self.$ageNone.prop('checked', true).attr('disabled', true);
            }

            if (!Util.Lang.isEmpty(ageNone)) {
                _self.$ageNone.triggerClick();
            }

            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        select: function() {
            var $el            = $(this),
                val            = $el.val(),
                description    = _self.$ageSelect.find('li.on > a').data('description'),
                previewId      = 'preview_' + _self.name,
                $noneEl        = _self.$ageNone;

            Common.removeState('age', previewId);
            Preview.remove(previewId);

            if (!Util.Lang.isEmpty(val)) {
                Common.setState('age', previewId, val);

                Preview.append(previewId, description, 'optional', function() {
                    _self.$ageSelect.find('li:first > a').triggerClick();
                });

                $noneEl.attr('disabled', false);

                var ageNoneFl = Object.keys(Common.getState('age_none')).length !== 0;
                _self.setNoneData(ageNoneFl);

                if (ageNoneFl === false) {
                    $noneEl.prop('checked', false);
                }
            } else {
                $noneEl.prop('checked', true).attr('disabled', true);
                _self.setNoneData(false);
            }
        },

        noneCheck: function() {
            _self.setNoneData($(this).is(':checked'));
        },

        setNoneData : function (dataFl) {
            var $noneEl        = _self.$ageNone,
                nonePreviewId  = 'preview_' + $noneEl.attr('name');

            if (dataFl) {
                Common.setState('age_none', nonePreviewId, $noneEl.val());
                Preview.remove(nonePreviewId);
                Preview.append(nonePreviewId, $noneEl.data('description'), 'optional', function() {
                    $noneEl.prop('checked', false).trigger('change');
                    Common.removeState('age_none', nonePreviewId);
                });
            } else {
                Preview.remove(nonePreviewId);
                Common.removeState('age_none', nonePreviewId);
            }
        },

        isSelected: function() {
            return !Util.Lang.isEmpty(_self.$age.val());
        },

        reset: function() {
            _self.$ageSelect.find('li:first > a').triggerClick();

            _self.$ageNone.prop('checked', true).attr('disabled', true);
            _self.setNoneData(false);
        }
    };

    return new Age();
});