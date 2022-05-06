define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template'
], function (require, $, _, Common, Util, Preview, Template) {
    'use strict';

    var _self,
        _VARIABLES = {'MAX_COUNT': 3},
        _MESSAGES = {'MAX_COUNT': '전공은 최대 {{MAX_COUNT}}개까지 선택 가능합니다.'};

    var Major = function() {
        this.name      = 'major';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_major');
        this.paramKeys = ['major_cd'];
    };


    Major.prototype = {
        init: function() {
            _self = this;

            _self.initOptions();
            _self.initVariables();
            _self.bindEvents();
            _self.initParams();

            return _self;
        },

        initOptions: function() {
            this.options = {'major_cd': Common.getOption('major_cd')};
        },

        initVariables: function() {
            _self.$section = _self.$wrapper.find('#sp_major_section');
        },

        bindEvents: function() {
            _self.$wrapper
                .on('change', '[name="major[]"]', _self.selectMajor)
                .on('change', '[name="major_cd[]"]', _self.selectMajorCd)
                .on('click', '.btn_add', _self.append)
                .on('click', '.btn_delete', _self.remove)
            ;
        },

        initParams: function() {
            var major_cd = Common.getParamToArray('major_cd'),
                initBox  = function(index) {
                    if (_self.$section.find('.add_box:eq(' + index + ')').length === 0) {
                        _self.$section.find('.btn_add').triggerClick();
                    }
                };

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(major_cd)) {
                _.forEach(major_cd, function(val, index) {
                    var major = _.findKey(_self.options.major_cd, val);
                    initBox(index);
                    var $boxEl = _self.$section.find('.add_box:eq(' + index + ')');
                    $boxEl.find('.major_sel > li > a').filter('[data-value="' + major + '"]').triggerClick();
                    $boxEl.find('.major_cd_sel > li > a').filter('[data-value="' + val + '"]').triggerClick();
                });
            }
            Common.setEnabledAlert(true);
        },

        /** @this jQuery Object */
        selectMajor: function() {
            var $el             = $(this),
                $boxEl          = $el.closest('.add_box'),
                $majorCdWrapper = $boxEl.find('.major_cd_wrapper'),
                major_cd        = $majorCdWrapper.find('.major_cd_sel > li.on > a').data('value'),
                val             = $el.val();

            var tmplData = {'list': []};

            if (!Util.Lang.isEmpty(major_cd)) {
                if (_.findKey(_self.options.major_cd, major_cd) === val) {
                    return false;
                }
                $majorCdWrapper.find('.major_cd_sel > li:first > a').triggerClick();
            }
            if (!Util.Lang.isEmpty(val)) {
                var options = _.get(_self.options.major_cd, val);
                _.forEach(options, function(val, key) {
                    tmplData.list.push({'value': key, 'description': val, 'text': val});
                })
            }
            $majorCdWrapper.html(Template.get('sp_major_cd_tmpl', tmplData));

            return false;
        },

        /** @this jQuery Object */
        selectMajorCd: function() {
            var $el            = $(this),
                val            = $el.val(),
                $boxEl         = $el.closest('.add_box'),
                $selectWrapper = $boxEl.find('.major_cd_sel'),
                description    = $selectWrapper.find('li.on > a').data('description'),
                previewId      = 'preview_' + _self.name + '_' + $boxEl.data('unique_id'),
                removeFnc      = function() {
                    $selectWrapper.find('li:first > a').triggerClick();
                };

            if (_self.isAlreadySelected(val)) {
                removeFnc();
                return false;
            }

            Common.removeState('major_cd', previewId);
            Preview.remove(previewId);

            if (!Util.Lang.isEmpty(val)) {
                Common.setState('major_cd', previewId, val);
                Preview.append(previewId, description, 'optional', removeFnc);
            }

            return false;
        },

        isAlreadySelected: function(val) {
            return (!Util.Lang.isEmpty(val) && _self.$wrapper.find('[name="major_cd[]"]').filter('[value="' + val + '"]').length > 1);
        },

        append: function() {
            if (_self.exceedMaxCount()) {
                Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                return false;
            }

            _self.$section.append(Template.get('sp_major_tmpl', {'unique_id': _.uniqueId()}));

            //Util.Layer.resizeDetailForTinyScrollbar();

            return false;
        },

        /** @this jQuery Object */
        remove: function() {
            var $boxEl = $(this).closest('.add_box');

            if (_self.$section.find('.add_box').length === 1) {
                _self.$section.find('.major_sel > li:first > a').triggerClick();
                return false;
            }
            if (_self.$section.find('.add_box:first').data('unique_id') === $boxEl.data('unique_id')) {
                $boxEl.next().append($boxEl.find('.btn_add').clone());
            }

            $boxEl.find('.major_sel > li:first > a').triggerClick();
            $boxEl.remove();

            //Util.Layer.resizeDetailForTinyScrollbar();

            return false;
        },

        exceedMaxCount: function() {
            return _self.$wrapper.find('.add_box').length >= _VARIABLES.MAX_COUNT;
        },

        isSelected: function() {
            return _self.$wrapper.find('[name="major_cd[]"]').filter(':not([value=""])').length > 0;
        },

        reset: function() {
            _self.$wrapper.find('.major_sel').each(function() {
                $(this).find('li:first > a').triggerClick();
            });

            //Util.Layer.resizeDetailForTinyScrollbar();
        }
    };

    return new Major();
});