define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template'
], function (require, $, _, Common, Util, Preview, Template) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 3},
        _MESSAGES = {'MAX_COUNT': '직급·직책은 최대 {{MAX_COUNT}}개까지 선택 가능합니다.'};

    var JobGrade = function() {
        this.name      = 'job_grade';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_job_grade');
        this.paramKeys = ['job_grade'];
    };


    JobGrade.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$section = _self.$wrapper.find('#sp_job_grade_section');
        },

        bindEvents: function() {
            _self.$wrapper
                .on('change', '[name="job_grade[]"]', _self.select)
                .on('click', '.btn_add', _self.append)
                .on('click', '.btn_delete', _self.remove)
            ;
        },

        initParams: function() {
            var job_grade = Common.getParamToArray('job_grade');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(job_grade)) {
                _.forEach(job_grade, function(val, index) {
                    if (_self.$section.find('.add_box:eq(' + index + ')').length === 0) {
                        _self.$section.find('.btn_add').triggerClick();
                    }
                    var $boxEl = _self.$section.find('.add_box:eq(' + index + ')');
                    $boxEl.find('.job_grade_sel > li > a').filter('[data-value="' + val + '"]').triggerClick();
                });
            }
            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        select: function() {
            var $el         = $(this),
                val         = $el.val(),
                $boxEl      = $el.closest('.add_box'),
                $select     = $boxEl.find('.job_grade_sel'),
                description = $select.find('li.on > a').data('description'),
                previewId   = 'preview_' + _self.name + '_' + $boxEl.data('unique_id'),
                removeFnc   = function() {
                    $select.find('li:first > a').triggerClick();
                };

            if (_self.isAlreadySelected(val)) {
                removeFnc();
                return false;
            }
            Common.removeState('job_grade', previewId);
            Preview.remove(previewId);

            if (!Util.Lang.isEmpty(val)) {
                Common.setState('job_grade', previewId, val);
                Preview.append(previewId, description, 'optional', removeFnc);
            }
        },

        isAlreadySelected: function(val) {
            return (!Util.Lang.isEmpty(val) && _self.$wrapper.find('[name="job_grade[]"]').filter('[value="' + val + '"]').length > 1);
        },

        append: function() {
            if (_self.exceedMaxCount()) {
                Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                return false;
            }

            _self.$section.append(Template.get('sp_job_grade_tmpl', {'unique_id': _.uniqueId()}));

            //Util.Layer.resizeDetailForTinyScrollbar();

            return false;
        },

        /** @this jQuery Object */
        remove: function() {
            var $boxEl = $(this).closest('.add_box');

            if (_self.$section.find('.add_box').length === 1) {
                _self.$section.find('.job_grade_sel > li:first > a').triggerClick();
                return false;
            }
            if (_self.$section.find('.add_box:first').data('unique_id') === $boxEl.data('unique_id')) {
                $boxEl.next().append($boxEl.find('.btn_add').clone());
            }

            $boxEl.find('.job_grade_sel > li:first > a').triggerClick();
            $boxEl.remove();

            //Util.Layer.resizeDetailForTinyScrollbar();

            return false;
        },

        exceedMaxCount: function() {
            return _self.$wrapper.find('.add_box').length >= _VARIABLES.MAX_COUNT;
        },

        isSelected: function() {
            return _self.$wrapper.find('[name="job_grade[]"]').filter(':not([value=""])').length > 0;
        },

        reset: function() {
            _self.$wrapper.find('.job_grade_sel').each(function() {
                $(this).find('li:first > a').triggerClick();
            });
        }
    };

    return new JobGrade();
});