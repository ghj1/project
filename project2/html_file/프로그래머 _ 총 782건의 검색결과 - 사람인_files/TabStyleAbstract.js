define([
    'require', 'jquery', 'lodash', 'Common', 'Util'
], function (require, $, _, Common, Util) {
    'use strict';

    var TabStyleAbstract = function() {};

    TabStyleAbstract.prototype = {
        init: function() {},

        initOptions: function() {
            this.options       = Common.getOption(this.name);
            this.depth1Options = Common.getOption(this.name + '_1depth');
        },

        initVariables: function() {},
        bindEvents: function() {},
        initParams: function() {},

        initParam: function(code) {
            var depth1Code = this.get1DepthCode(code);
            if (Util.Lang.isEmpty(depth1Code)) {
                return false;
            }
            var $1depthEl = this.$wrapper.find('#sp_' + this.name + '_1depth_' + depth1Code);
            if (!this.hasSubDepth($1depthEl)) {
                this.generateSubDepth(depth1Code);
            }
            $1depthEl.siblings('.sub_depth_wrapper').find(':checkbox[value="' + code + '"]:not(:checked)').each(function() {
                $(this).filter(':not(:checked)').triggerClick();
            });
        },

        initTabIfParamIsInvalid: function() {
            var $depth1 = this.$depth1Wrapper.find('.depth1');
            if ($depth1.filter('.selected').length === 0) {
                $depth1.filter(':first').triggerClick();
            }
        },

        get1DepthCode: function(code) {
            return _.has(this.depth1Options, code) ? _.get(this.depth1Options, code) : null;
        },

        getElement: function(code, $wrapper) {
            $wrapper = $wrapper || this.$wrapper;
            return $wrapper.find(':checkbox[value="' + code + '"]');
        },

        hasSubDepth: function($el) {
            return $el.siblings('.sub_depth_wrapper').length > 0;
        },

        showSubDepth: function($el, callback) {
            this.$wrapper.find('.depth1.selected').removeClass('selected').siblings('.sub_depth_wrapper').hide();

            $el.addClass('selected');

            if (!this.hasSubDepth($el)) {
                this.generateSubDepth($el.data('code'));
            }

            $el.siblings('.sub_depth_wrapper').show();

            if (_.isFunction(callback)) {
                callback();
            }

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        hideSubDepth: function($el) {
            $el.removeClass('selected').siblings('.sub_depth_wrapper').hide();

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        generateSubDepth: function() {},

        show3Depth: function($el) {
            var $wrapperEl = $el.closest('.sub_depth_wrapper'),
                code       = $el.data('code');

            $el.siblings().removeClass('selected');
            $el.addClass('selected');

            $wrapperEl.find('.depth3:visible').hide();
            $wrapperEl.find('#sp_' + this.name + '_3depth_' + code).show();
        },

        clickItem: function() {},
        exceedMaxCount: function() {},

        getCheckedCount: function() {
            return this.$wrapper.find(':checkbox:checked').length;
        },

        set1DepthCheckedStyle: function(code) {
            var $el        = this.$wrapper.find('#sp_' + this.name + '_1depth_' + code),
                $parentEl  = $el.closest('li'),
                checkedCnt = $el.siblings('.sub_depth_wrapper').find(':checkbox:checked').length;

            (checkedCnt > 0) ? $parentEl.addClass('dep3checked') : $parentEl.removeClass('dep3checked');
        },

        set2DepthCheckedStyle: function(code) {
            var $el        = this.$wrapper.find('#sp_' + this.name + '_2depth_' + code),
                checkedCnt = this.$wrapper.find('#sp_' + this.name + '_3depth_' + code).find(':checkbox:checked').length;

            (checkedCnt > 0) ? $el.addClass('select_area') : $el.removeClass('select_area');
        },

        isSelected: function() {
            return this.getCheckedCount() > 0;
        },

        pauseCheckingCount: function() {
            this.checkCount = 'inactive';
        },

        resumeCheckingCount: function() {
            this.checkCount = 'active';
        },

        isActivatedCheckingCount: function() {
            return this.checkCount !== 'inactive';
        },

        validate: function() {
            return true;
        },

        resetItem: function() {},

        reset: function() {
            this.$wrapper.find(':checkbox:checked').triggerClick();
        }
    };

    return TabStyleAbstract;
});