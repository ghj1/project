define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template', 'AutoComplete'
], function (require, $, _, Common, Util, Preview, Template, AutoComplete) {
    'use strict';

    var _self,
        _VARIABLES = {
            'MAX_COUNT': 5,
            'MINIMUM_CHARACTER_LENGTH_FOR_REQUEST': 2,
            'API_URL': '/zf_user/jobs/api/auto-complete'
        },
        _MESSAGES = {'MAX_COUNT': '자격증/외국어시험은 최대 {{MAX_COUNT}}개까지 입력 가능합니다.'};

    var License = function() {
        this.name      = 'license';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_license');
        this.paramKeys = ['license_lang_cd'];
    };


    License.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.AutoComplete.init();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$section = _self.$wrapper.find('#sp_license_section');
        },

        bindEvents: function() {
            _self.$wrapper.on('click', '#sp_license_selected_result .btn_reset', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var license_lang_cd = Common.getParamToArray('license_lang_cd'),
                license_lang_nm = Common.getParam('license_lang_nm');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(license_lang_cd)) {
                var groupByName = _.groupBy(license_lang_cd, function(code) {
                    return _.get(license_lang_nm, code);
                });
                _.forEach(groupByName, function(codes, name) {
                    _self.select(codes.join(','), name);
                });
            }
            Common.setEnabledAlert(true);
        },

        AutoComplete: {
            init: function() {
                _self.autoCompleteInstance = new AutoComplete({
                    'url': _VARIABLES.API_URL,
                    'params': {'domain': 11},
                    'target': _self.$wrapper.find('#license_keyword'),
                    'minimum_character_length': 2,
                    'result': {
                        'wrapper': _self.$wrapper.find('#sp_license_search_result'),
                        'list'   : _self.$wrapper.find('#sp_license_search_result'),
                        'none'   : _self.$wrapper.find('#sp_license_search_result_none')
                    },
                    'button': {'remove': _self.$wrapper.find('.btn_input_delete')},
                    'callback': {
                        'bindEvents': _self.AutoComplete.bindEvents,
                        'search': {'generate': _self.AutoComplete.search},
                        'select': _self.select
                    }
                });
            },

            /** @this AutoComplete */
            bindEvents: function() {
                var instance = this;

                _self.$wrapper.find('.btn_close').on('click', this.reset.bind(this));

                this.$result
                    .on('mouseover', 'li', function() {
                        $(this).addClass('selected');
                    })
                    .on('mouseout', 'li', function() {
                        $(this).removeClass('selected');
                    })
                    .on('click', 'li', function(e) {
                        var $el = $(this);

                        // event bubble
                        e = e || window.event;
                        if (e.stopPropagation) {
                            e.stopPropagation(); // W3C 표준
                        } else {
                            e.cancelBubble = true; // 인터넷 익스플로러 방식
                        }

                        return instance.select($el.data('kcode'), $el.data('description'));
                    })
                ;
            },

            /** @this AutoComplete */
            search: function(response) {
                var tmplData = {'list': []};
                _.forEach(response.result_list, function(val) {
                    tmplData.list.push({
                        'kcode': val.keyword_info,
                        'description': val.keyword,
                        'name': val.keyword,
                        'organization': (!Util.Lang.isEmpty(val.keyword_info2)) ? val.keyword_info2 : '-'
                    });
                });

                return Template.get('sp_license_search_result_tmpl', tmplData);
            }
        },

        select: function(kcode, description) {
            if (_self.exceedMaxCount()) {
                Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                return false;
            }

            var id        = _self.generateIdUsingCode(kcode),
                appendId  = _self.name + '_' + id,
                previewId = 'preview_' + appendId;

            if (!_self.isExist(id)) {
                Common.setState('license_lang_cd', previewId, kcode);
                Preview.append(previewId, description, 'optional', function() {
                    Common.removeState('license_lang_cd', previewId);
                    _self.remove(appendId);
                });

                _self.append(appendId, kcode, description, function() {
                    Common.removeState('license_lang_cd', previewId);
                    Preview.remove(previewId);
                });
            }

            return true;
        },

        generateIdUsingCode: function(code) {
            return Util.String.replaceAll(',', '_', code);
        },

        getSelectedCount: function() {
            return _self.$wrapper.find('#sp_license_selected_result').find('span').length;
        },

        exceedMaxCount: function() {
            return _self.getSelectedCount() >= _VARIABLES.MAX_COUNT;
        },

        isExist: function(kcode) {
            return _self.$wrapper.find('#sp_license_selected_result').find('#' + _self.name + '_' + kcode).length > 0;
        },

        append: function(id, kcode, text, removeCallback) {
            _self.generateSelectedResult();

            var tmplData  = {'id': id, 'name': text, 'hidden_name': 'license_lang_cd[]', 'kcode': kcode},
                $appendEl = $(Template.get('sp_license_selected_result_item_tmpl', tmplData)),
                $resultEl = _self.$wrapper.find('#sp_license_selected_result');

            $appendEl.find('.remove-btn').on('click', function(e) {
                // event bubble
                e = e || window.event;
                if (e.stopPropagation) {
                    e.stopPropagation(); // W3C 표준
                } else {
                    e.cancelBubble = true; // 인터넷 익스플로러 방식
                }

                _self.remove(id);
                if (_.isFunction(removeCallback)) {
                    removeCallback();
                }
            });

            $resultEl.prepend($appendEl);

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        remove: function(id) {
            $('#' + id).remove();
            _self.removeSelectedResult();

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        generateSelectedResult: function() {
            if (_self.$wrapper.find('#sp_license_selected_result').length > 0) {
                return true;
            }
            _self.$section.after(Template.get('sp_license_selected_result_tmpl'));
        },

        removeSelectedResult: function() {
            var $resultEl = _self.$wrapper.find('#sp_license_selected_result');
            if ($resultEl.find('span').length === 0) {
                $resultEl.remove();
            }

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        isSelected: function() {
            return _self.getSelectedCount() > 0;
        },

        reset: function() {
            _self.$wrapper.find('#sp_license_selected_result').find('.remove-btn').triggerClick();

            //Util.Layer.resizeDetailForTinyScrollbar();
        }
    };

    return new License();
});