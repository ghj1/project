define([
    'require', 'jquery', 'lodash', 'Common', 'Util'
], function (require, $, _, Common, Util) {
    'use strict';

    var AutoComplete = function () {
        this.init.apply(this, arguments);
    };

    AutoComplete.prototype = {
        init: function(options) {
            this.setVariables(options);
            this.initCallback();
            this.bindEvent();
        },

        setVariables: function(options) {
            this.isCommon               = false;
            this.url                    = options.url || '';
            this.params                 = options.params || {};
            this.$target                = (_.isString(options.target)) ? $('#' + options.target) : options.target;
            this.debounce               = null;

            if (options.result) {
                this.$result = options.result.wrapper || $();
                this.$resultList = options.result.list || $();
                this.$resultNone = options.result.none || $();
            }

            if (options.button) {
                this.$registerBtn = options.button.register || $();
                this.$cancelBtn = options.button.cancel || $();
                this.$removeBtn = options.button.remove || $();
                this.$closeBtn = options.button.close || $();
            }

            this.minimumCharacterLength = options.minimum_character_length || 0;
            this.callback               = options.callback || {'search': {}};
            this.intervalId             = null;
            this.latestKeyword          = null;
            this.currentIndex           = -1;
            this.useKeyEvent            = options.useKeyEvent || false;
        },

        /** SearchCommon.js **/
        initCommonPanel: function(common) {
            this.isCommon = true;
            this.key                    = common.key || '';
            this.domain                 = common.domain || '';

            this.$commonPreview   = common.layer.preview || $();
            this.$commonRecently  = common.layer.recently || $();
            this.$commonList      = common.layer.list || $();
            this.$commonMain      = common.layer.main || $();
            this.$commonMsg       = common.layer.msg || $();

            this.callback.bindEvents.call(this);
        },

        initCallback: function() {
            var init = function(key) {
                if (!_.has(this.callback, key)) {
                    _.set(this.callback, key, function() {});
                }
            };

            _.forEach(['bindEvents', 'search.generate', 'search.post', 'select', 'applyFilter'], init.bind(this));

            if (!_.has(this.callback.search, 'isEmpty')) {
                _.set(this.callback.search, 'isEmpty', function(response) {
                    return response.result_count === 0;
                })
            }
        },

        bindEvent: function() {
            var _self = this;

            this.$target.on('keyup', function(e) {
                return _self.input($(this).val());
            }).on('click', function(e) {
                return _self.input($(this).val());
            }).on('keydown', function(e) {
                if (e.keyCode === Util.Event.KEYCODE.ENTER || e.keyCode === Util.Event.KEYCODE.SPACE ||
                    e.keyCode === Util.Event.KEYCODE.UP || e.keyCode === Util.Event.KEYCODE.DOWN) {
                    e.preventDefault();

                    if ((e.keyCode === Util.Event.KEYCODE.UP || e.keyCode === Util.Event.KEYCODE.DOWN) && _self.useKeyEvent) {
                        _self.inputArrows();
                    }

                    if ((e.keyCode === 13 || e.keyCode === 32) && _self.useKeyEvent) {
                        _self.selectElement();
                    }
                }
            });

            // 파이어폭스인 경우 한글 입력 시 keyup 이벤트를 실행하지 않아 별도 처리
            if (Util.Browser.isFirefox()) {
                this.$target.on('focus', function() {
                    if (!_self.intervalId) {
                        _self.intervalId = window.setInterval(_self.watchInput.bind(_self), 500);
                    }
                });
                this.$target.on('blur', function() {
                    if (_self.intervalId) {
                        window.clearInterval(_self.intervalId);
                        _self.intervalId = null;
                    }
                });
            }

            if (this.$removeBtn) {
                this.$removeBtn.on('click', this.reset.bind(this));
            }

            if (this.callback && this.callback.bindEvents) {
                this.callback.bindEvents.call(this);
            }
        },

        input: function(keyword) {
            var _self = this,
                e = event;

            if (this.debounce) {
                clearTimeout(this.debounce);
            }

            this.debounce = setTimeout(function () {
                var isAvaliableSearch = _self.isAvaliableSearch(keyword);

                if (!isAvaliableSearch && _self.isCommon) {
                    _self.callback.main.call(_self);
                    return true;
                }

                if (!isAvaliableSearch && !_self.isCommon) {
                    _self.toggleResult('hide');
                    _self.toggleResultNone('hide');
                    _self.toggleDeleteBtn('hide');
                    return true;
                }

                if (e.keyCode > 36 && encodeURI().keyCode < 41) {
                    return;
                }

                if (e.keyCode === 13 || e.keyCode === 32) {
                    return;
                }

                _self.search(keyword);
                _self.currentIndex = -1;
            }, 100);
        },

        inputArrows: function () {
            var listBorderTopSize = parseInt(this.$resultList.css('padding-top').replace('px', '')),
                listBorderBottomSize = parseInt(this.$resultList.css('padding-bottom').replace('px', '')),
                firstEl = this.$resultList.find('li').eq(0), resultCnt = this.$resultList.find('li').length, elMaxLength = resultCnt < 5 ? resultCnt : 5,
                lastEl = (resultCnt - 1 >= 0) ? this.$resultList.find('li').eq(resultCnt - 1) : firstEl,
                elHeightTotal = firstEl.outerHeight() * elMaxLength, scrollHeight = elHeightTotal + listBorderTopSize;

            if (resultCnt <= 0) {
                return;
            }

            this.$resultList.find('li').removeClass('current');

            // up Arrow
            if (event.keyCode === 38) {
                this.currentIndex = (this.currentIndex <= 0) ? lastEl.index() : this.currentIndex - 1;
                var target = (this.currentIndex > lastEl.index()) ? lastEl : this.$resultList.find('li').eq(this.currentIndex),
                    resetOffset = target.offset().top >= lastEl.offset().top, upHeight = this.$result.offset().top - listBorderBottomSize;
                target.addClass('current');
                if (target.offset().top <= upHeight || resetOffset) {
                    var positionTop = resetOffset ? lastEl.position().top - scrollHeight + target.outerHeight() : target.position().top - listBorderTopSize;
                    this.$result.find('div.wrap_scroll').data('plugin_tinyscrollbar').update(positionTop);
                }
            }

            // down Arrow
            if (event.keyCode === 40) {
                this.currentIndex = (this.currentIndex >= lastEl.index()) ? 0 : this.currentIndex + 1;
                var target = (this.currentIndex < 0) ? firstEl : this.$resultList.find('li').eq(this.currentIndex),
                    resetOffset = target.offset().top <= firstEl.offset().top, downHeight = this.$result.offset().top + elHeightTotal + listBorderTopSize;
                target.addClass('current');
                if (target.offset().top >= downHeight || resetOffset) {
                    var positionTop = resetOffset ? target.position().top - listBorderTopSize : target.position().top - scrollHeight + target.outerHeight();
                    this.$result.find('div.wrap_scroll').data('plugin_tinyscrollbar').update(positionTop);
                }
            }
        },

        selectElement: function () {
            this.$resultList.find('li.current').find('input:checkbox').click();
        },

        watchInput: function() {
            var keyword = this.$target.val();
            if (this.latestKeyword !== keyword) {
                this.$target.trigger('keyup');
            }
            this.latestKeyword = keyword;
        },

        isAvaliableSearch: function(keyword) {
            return (this.minimumCharacterLength === 0 || keyword.length >= this.minimumCharacterLength);
        },

        toggleResult: function(type, html) {
            if (type === 'hide' || !!html) {
                this.$resultList.html(html || '');
            }
            this.$result.toggle(type === 'show');
        },

        toggleResultNone: function(type) {
            this.$resultNone.toggle(type === 'show');
        },

        toggleDeleteBtn: function(type) {
            this.$removeBtn.toggle(type === 'show');

            $('.wrap_auto_keyword .wrap_scroll').outerHeight(183);
            $(window).trigger('resize');
        },

        isOpened: function() {
            return this.$result.is(':visible') || this.$resultNone.is(':visible');
        },

        search: function(keyword) {
            var request = Util.Http.ajax(this.url, _.merge(this.params, {'seed': keyword, 'keyword': encodeURIComponent(keyword)}), null, null, false);

            request.success(function(response) {
                if (this.callback.search.applyFilter) {
                    response = this.callback.search.applyFilter(response);
                }

                if (this.isCommon) {
                    this.callback.search.call(this, this.callback.search.isEmpty(response), response, keyword);
                    return true;
                }

                if (this.callback.search.isEmpty(response)) {
                    this.toggleResult('hide');
                    this.toggleResultNone('show');
                    this.toggleDeleteBtn('show');
                    return true;
                }

                this.toggleResult('show', this.callback.search.generate.call(this, response, keyword));
                this.toggleResultNone('hide');
                this.toggleDeleteBtn('show');

                this.callback.search.post.call(this);
            }.bind(this));
        },

        select: function() {
            if (_.isFunction(this.callback.select)) {
                this.callback.select.apply(this, arguments);
            }

            this.reset();
        },

        reset: function() {
            this.$target.val('').trigger('blur');
            this.toggleResult('hide');
            this.toggleResultNone('hide');
            this.toggleDeleteBtn('hide');
        }
    };

    return AutoComplete;
});