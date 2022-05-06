define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 5},
        _MESSAGES = {
            'DISALLOWED_CHARACTER': ":-()[]&,.·+#~/ 외의 특수문자는 입력하실 수 없습니다.",
            'MAX_COUNT': '최대 {{MAX_COUNT}}단어까지 입력 가능합니다.'
        };

    var ExceptKeyword = function() {
        this.name      = 'keyword';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_keyword');
        this.paramKeys = ['exc_keyword'];
    };


    ExceptKeyword.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$excKeyword   = _self.$wrapper.find('#exc_keyword');
            _self.$resetExclude = _self.$wrapper.find('.btn_reset_exclude');
        },

        bindEvents: function() {
            _self.$excKeyword.on('keyup', _self.input);
            _self.$resetExclude.on('click', _self.resetExclude);
        },

        initParams: function() {
            var exc_keyword = Common.getParam('exc_keyword');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(exc_keyword)) {
                _self.$excKeyword.val(exc_keyword).trigger('keyup').trigger('blur');
            }
            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        input: function() {
            var $el         = $(this),
                id          = $el.attr('id'),
                val         = $el.val(),
                description = $el.data('description'),
                previewId   = 'preview_' + $el.attr('id');

            if (_self.removeSpace($el)) {
                val = $el.val();
            }
            if (_self.removeEmpty($el)) {
                val = $el.val();
            }
            if (Common.getState(id, previewId) === val) {
                return;
            }

            if (!Util.Lang.isEmpty(val)) {
                if (!_self.validateCharacter($el)) {
                    return;
                }
                if (!_self.exceedMaxCount($el)) {
                    return;
                }

                Common.removeState(id, previewId);
                Preview.remove(previewId);

                Common.setState(id, previewId, val);
                Preview.append(previewId, description + val, 'optional', function() {
                    $el.val('').trigger('keyup').trigger('blur');
                });
            } else {
                Common.removeState(id, previewId);
                Preview.remove(previewId);
            }
        },

        removeSpace: function($el) {
            var val             = $el.val(),
                removedSpaceVal = Util.String.removeSpace(val);

            if (val !== removedSpaceVal) {
                $el.val(removedSpaceVal);
                return true;
            }
            return false;
        },

        removeEmpty: function($el) {
            var val = $el.val();
            if (!Util.Lang.isEmpty(val)) {
                var splitArr        = val.split(','),
                    removedEmptyVal = _.compact(_.dropRight(splitArr));

                removedEmptyVal.push(_.last(splitArr));
                removedEmptyVal = removedEmptyVal.join(',');
                if (val !== removedEmptyVal) {
                    $el.val(removedEmptyVal);
                    return true;
                }
            }

            return false;
        },

        validateCharacter: function($el) {
            var val = $el.val();
            if (!Util.String.isAllowed(val)) {
                Common.notify(_MESSAGES.DISALLOWED_CHARACTER);
                $el.val(Util.String.removeDisallowed(val));
                return false;
            }
            return true;
        },

        exceedMaxCount: function($el) {
            var val = $el.val(),
                arr = val.split(",");
            if (arr.length > _VARIABLES.MAX_COUNT) {
                Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                $el.val(_.dropRight(arr, arr.length - _VARIABLES.MAX_COUNT));
                return false;
            }
            return true;
        },

        isSelected: function() {
            return (!Util.Lang.isEmpty(_self.$excKeyword.val()));
        },

        resetExclude: function() {
            _self.$wrapper.find('#exc_keyword').val('').trigger('keyup').trigger('blur');
        },

        reset: function() {
            _self.resetExclude();
        }
    };

    return new ExceptKeyword();
});