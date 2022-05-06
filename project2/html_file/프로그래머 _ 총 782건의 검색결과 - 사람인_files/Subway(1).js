define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template', 'AutoComplete'
], function (require, $, _, Common, Util, Preview, Template, AutoComplete) {
    'use strict';

    var _self,
        _VARIABLES = {
            'MAX_COUNT': 10,
            'MINIMUM_CHARACTER_LENGTH_FOR_REQUEST': 2,
            'API_URL': '/zf_user/jobs/api/auto-complete'
        },
        _MESSAGES = {
            'MAX_COUNT': '지하철은 최대 {{MAX_COUNT}}개까지 입력 가능합니다.',
            'EMPTY_CHECKED': '지하철역을 선택한 후 등록하세요.'
        };

    var Subway = function() {
        this.name      = 'subway';
        this.type      = 'optional';
        this.$wrapper  = $('#sp_subway');
        this.paramKeys = ['subway_cd'];
    };


    Subway.prototype = {
        init: function() {
            _self = this;

            _self.initVariables();
            _self.bindEvents();
            _self.AutoComplete.init();
            _self.initParams();

            return _self;
        },

        initVariables: function() {
            _self.$section = _self.$wrapper.find('#sp_subway_section');
        },

        bindEvents: function() {
            _self.$wrapper.on('click', '.btn_reset', function() {
                _self.reset();
                return false;
            });
        },

        initParams: function() {
            var subway_cd = Common.getParamToArray('subway_cd'),
                subway_nm = Common.getParam('subway_nm');

            Common.setEnabledAlert(false);
            if (!Util.Lang.isEmpty(subway_cd)) {
                var groupByName = _.groupBy(subway_cd, function(code) {
                    return _.get(subway_nm, code);
                });
                _.forEach(groupByName, function(codes, name) {
                    _self.selectItem(codes.join(','), name);
                });
            }
            Common.setEnabledAlert(true);
        },

        AutoComplete: {
            init: function() {
                _self.autoCompleteInstance = new AutoComplete({
                    'url': _VARIABLES.API_URL,
                    'params': {'domain': 10},
                    'target': _self.$wrapper.find('#subway_keyword'),
                    'minimum_character_length': 2,
                    'result': {
                        'wrapper': _self.$wrapper.find('#sp_subway_search_result'),
                        'list'   : _self.$wrapper.find('#sp_subway_search_result_list'),
                        'none'   : _self.$wrapper.find('#sp_subway_search_result_none')
                    },
                    'button': {'remove'  : _self.$wrapper.find('.btn_input_delete')},
                    'callback': {
                        'bindEvents': _self.AutoComplete.bindEvents,
                        'search': {'generate': _self.AutoComplete.search},
                        'select': _self.AutoComplete.select
                    }
                });
            },

            /** @this AutoComplete */
            bindEvents: function() {
                _self.$wrapper.find('.btn_register').on('click', this.select.bind(this));
                _self.$wrapper.find('.btn_cancel').on('click', this.reset.bind(this));
                _self.$wrapper.find('.btn_close').on('click', this.reset.bind(this));

                this.$result.on('click', '[name="subway_search_cd[]"]', function(e) {
                    if (_self.AutoComplete.exceedMaxCount.call(this)) {
                        $(e.target).prop('checked', false).trigger('change');
                        Common.notify(Util.Message.bindData(_MESSAGES.MAX_COUNT, {'MAX_COUNT': _VARIABLES.MAX_COUNT}));
                        return false;
                    }
                }.bind(this));
            },

            /** @this AutoComplete */
            search: function(response) {
                var tmplData = {'list': []};
                _.forEach(_.groupBy(response.result_list, 'keyword_info2'), function(list) {
                    var data = Util.Object.first(list),
                        code = data.keyword_info;
                    if (list.length > 1) {
                        code = _.pluck(list, 'keyword_info').join(',');
                    }
                    tmplData.list.push({
                        'id': _self.generateIdUsingCode(code),
                        'code': code,
                        'text': data.keyword_info2,
                        'description': data.keyword_info2
                    });
                });

                return Template.get('sp_subway_search_result_tmpl', tmplData);
            },

            /** @this AutoComplete */
            select: function() {
                var $checkedEl = this.$result.find('input[name="subway_search_cd[]"]:checked');

                if ($checkedEl.length < 1) {
                    Common.notify(_MESSAGES.EMPTY_CHECKED);
                    return false;
                }

                $checkedEl.each(function() {
                    var $el         = $(this),
                        code        = $el.val(),
                        description = $el.data('description');

                    _self.selectItem(code, description);
                });
            },

            /** @this AutoComplete */
            exceedMaxCount: function() {
                var checkedLen = this.$result.find('[name="subway_search_cd[]"]:checked').length;
                return _self.getSelectedCount() + checkedLen > _VARIABLES.MAX_COUNT;
            }
        },

        selectItem: function(code, description) {
            var id          = _self.generateIdUsingCode(code),
                appendId    = _self.name + '_' + id,
                previewId   = 'preview_' + appendId;

            if (!_self.isExist(id)) {
                Common.setState('subway_cd', previewId, code);
                Preview.append(previewId, description, 'optional', function() {
                    Common.removeState('subway_cd', previewId);
                    _self.remove(appendId);
                });

                _self.append(appendId, code, description, function() {
                    Common.removeState('subway_cd', previewId);
                    Preview.remove(previewId);
                });
            }
        },

        generateIdUsingCode: function(code) {
            return Util.String.replaceAll(',', '_', code);
        },

        getSelectedCount: function() {
            return _self.$wrapper.find('#sp_subway_selected_result').find('span').length;
        },

        isExist: function(id) {
            return _self.$wrapper.find('#sp_subway_selected_result').find('#' + _self.name + '_' + id).length > 0;
        },

        append: function(id, code, text, removeCallback) {
            _self.generateSelectedResult();

            var tmplData  = {'id': id, 'code': code, 'text': text, 'hidden_name': 'subway_cd[]'},
                $appendEl = $(Template.get('sp_subway_selected_result_item_tmpl', tmplData)),
                $resultEl = _self.$wrapper.find('#sp_subway_selected_result');

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
            if (_self.$wrapper.find('#sp_subway_selected_result').length > 0) {
                return true;
            }
            _self.$section.after(Template.get('sp_subway_selected_result_tmpl'));
        },

        removeSelectedResult: function() {
            var $resultEl = _self.$wrapper.find('#sp_subway_selected_result');
            if ($resultEl.find('span').length === 0) {
                $resultEl.remove();
            }

            //Util.Layer.resizeDetailForTinyScrollbar();
        },

        isSelected: function() {
            return _self.getSelectedCount() > 0;
        },

        reset: function() {
            _self.$wrapper.find('#sp_subway_selected_result').find('.remove-btn').triggerClick();

            //Util.Layer.resizeDetailForTinyScrollbar();
        }
    };

    return new Subway();
});