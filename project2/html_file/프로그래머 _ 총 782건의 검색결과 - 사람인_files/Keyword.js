define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview'
], function (require, $, _, Common, Util, Preview) {
    'use strict';

    var _self,
        _VARIABLES = {
            'apiUrlForSuggestKeyword': '/lib/search_auto_complete.php',
            'apiUrlForRecentKeyword': '/zf_user/api-json/get-list-keyword-recent',
            'urlForDeleteRecentKeyword': '/zf_user/search/remove-search-word',
            'searchingTimeout' : 100,
            'searchingRecentTimeout' : 1500,
        };

    var Keyword = function () {
        this.$keywordAutoCompleteWrap = $('#keywordAutoComplete');
        this.keywordAutoCompleteOption = {
            '$wrap' : this.$keywordAutoCompleteWrap,
            '$keywordInputWrap' : this.$keywordAutoCompleteWrap.find('.ipt_keyword'),
            '$keywordInput' : this.$keywordAutoCompleteWrap.find('#total_ipt_keyword'),
            '$recentKeywordWrap' : this.$keywordAutoCompleteWrap.find('.total_recently_keyword'),
            '$suggestKeywordWrap' : this.$keywordAutoCompleteWrap.find('#wrapSuggestKeyword'),
            '$bottomWrap' : this.$keywordAutoCompleteWrap.find('.area_btn'),
            '$tplRecentKeyword' : $('#tplRecentKeyword'),
            '$tplSuggestKeyword' : $('#tplSuggestKeyword')
        };
    };

    Keyword.prototype = {
        init: function() {
            _self = this;

            var option = _self.keywordAutoCompleteOption;

            _self.initVariables(option);
            _self.bindEvents();

            return _self;
        },

        initVariables: function(option) {
            _self.$wrap = option['$wrap'];
            _self.$keywordInputWrap = option['$keywordInputWrap'];
            _self.$keywordInput = option['$keywordInput'];
            _self.$recentKeywordWrap = option['$recentKeywordWrap'];
            _self.$recentKeywordUl = option['$recentKeywordWrap'].find('ul');
            _self.$suggestKeywordWrap = option['$suggestKeywordWrap'];
            _self.$suggestKeywordUl = option['$suggestKeywordWrap'].find('ul');
            _self.$bottomWrap = option['$bottomWrap'];
            _self.tplRecentKeywordHtml = option['$tplRecentKeyword'].html();
            _self.tplSuggestKeywordHtml = option['$tplSuggestKeyword'].html();
            _self.$keywordSection = $('.tab_section').find('.keyword_section');

            _self.latestKeyword = '';
            _self.recentCount = 0;
            _self.suggestCount = 0;
            _self.searching = null;
            _self.dataListKeywordRecent = '';
            _self.dataListKeywordSuggest = '';
            _self.isReadyKeywordRecent = false;
            _self.topTinyscroll = 0;

            var incKeyword = Common.getParam('inc_keyword'),
                searchword = Common.getParam('searchword');

            if (!!incKeyword && !searchword) {
                searchword = incKeyword.split(',')[0];
            }

            if (searchword) {
                _self.diffusionKeyword(searchword, 'init');
                _self.latestKeyword = searchword; // 순서 중요
            }
        },

        bindEvents: function() {
            // 파폭은 한글은 keyup을 잡아내지 못해서 무한루프돌면서 검색창의 값이 변경됬으면 실행해버린다.
            var agent = navigator.userAgent.toLowerCase();
            if (agent.indexOf("firefox") !== -1) {
                setInterval(function() {
                    var keyword = _self.$keywordInput.val();
                    if (_self.latestKeyword !== keyword) {
                        _self.latestKeyword = keyword;
                        _self.setAndShowResult('keyup');
                    }
                }, 500);
            }

            _self.$keywordSection.on('click', function() {
                $('#keywordAutoComplete').find('.wrap_scroll').tinyscrollbar();
            });

            _self.$keywordInput
                .on('click', function() {
                    if (_self.$keywordSection.hasClass('opened') && $.trim(_self.$keywordInput.val()) === '') {
                        $('.layer_search_keyword').removeClass('no_suggest').addClass('no_suggest');
                        $('.total_recently_keyword').hide();
                        _self.$suggestKeywordWrap.hide();
                        $('.info_auto_complete').hide();
                        _self.$keywordSection.removeClass('opened');
                    } else {
                        _self.setAndShowResult();
                        _self.$keywordSection.removeClass('opened').addClass('opened');
                    }
                })
                .on('keyup', function(key) {
                    var keyword = $(this).val();

                    _self.keywordValidation(keyword);

                    if (key.keyCode !== 38 && key.keyCode !== 40) { // ↑38,↓40
                        if (_self.latestKeyword !== keyword) {
                            _self.setAndShowResult('keyup');
                        }

                        if (key.keyCode !== 10 && key.keyCode !== 13) {
                            Common.setState('searchType', 'searchType', 'search');
                        }
                    }

                    if (keyword.length > 0) {
                        $(this).siblings('.placeholder').hide();
                    } else {
                        $(this).siblings('.placeholder').show();
                    }

                    _self.$keywordSection.removeClass('opened').addClass('opened');
                })
                .on('keydown', function(key) {
                    var keyword = $(this).val();

                    _self.keywordValidation(keyword);

                    if (key.keyCode === 10 || key.keyCode === 13) {
                        _self.diffusionKeyword($(this).val());
                        _self.close();
                        $(this).blur();

                        if (Common.getParam('action') === 'unified') {
                            $('#search_btn').click();
                        }

                        return false;
                    }

                    if (key.keyCode == 38 || key.keyCode == 40) { // ↑38,↓40
                        var keywordListWrap = (_self.$recentKeywordUl.find('li').length > 0) ? _self.$recentKeywordWrap : _self.$suggestKeywordWrap,
                            keywordListUl = (_self.$recentKeywordUl.find('li').length > 0) ? _self.$recentKeywordUl :_self.$suggestKeywordUl,
                            scrollLastCount = (_self.$recentKeywordUl.find('li').length > 0) ? 5 : 4;

                        if (keywordListWrap.is(':visible') && keywordListUl.find('li').length > 0) {
                            var current = keywordListUl.find('li.current'),
                                target = null,
                                keywordCount = keywordListUl.find('li').length,
                                liOuterHeight = keywordListUl.find('li').outerHeight(),
                                firstLiTop = keywordListUl.find('li').eq(0).position().top,
                                lastLiTop = keywordListUl.find('li').eq(keywordCount - 1).position().top;

                            if (key.keyCode == 38) {
                                target = current.prev();
                                if (target.length == 0) {
                                    target = keywordListUl.find('li').eq(keywordCount - 1);
                                }

                                if (lastLiTop == target.position().top) {
                                    _self.topTinyscroll = (lastLiTop < 200) ? 0 : liOuterHeight * scrollLastCount;
                                }

                                if (_self.topTinyscroll > 0 && target.position().top < 200) {
                                    _self.topTinyscroll -= liOuterHeight;
                                }
                            } else if (key.keyCode == 40) {
                                target = current.next();
                                if (target.length == 0) {
                                    target = keywordListUl.find('li').eq(0);
                                }

                                if (target.position().top === firstLiTop) {
                                    _self.topTinyscroll = 0;
                                }

                                if ((_self.topTinyscroll < liOuterHeight * scrollLastCount) && target.position().top > 200) {
                                    _self.topTinyscroll += liOuterHeight;
                                }
                            }

                            if (target != null && target.length > 0) {
                                _self.$keywordInput.val(target.children('button').data('value'));
                                current.removeClass('current');
                                target.removeClass('current').addClass('current');
                                keywordListWrap.data('plugin_tinyscrollbar').update(_self.topTinyscroll);
                            }
                        }
                    }

                })
                .on('focusout', function() {
                    _self.diffusionKeyword(_self.$keywordInput.val());
                })
                ;

            // 검색창, 결과 외의 영역을 클릭하면 검색결과 닫기
            $('body').on('click', function(e) {
                if (_self.$wrap.is(':visible')) {
                    if (!_self.$wrap.has(e.target).length
                        && !_self.$keywordSection.has(e.target).length
                    ) {
                        _self.diffusionKeyword(_self.$keywordInput.val());
                        _self.close();
                    }
                }
            });

            // 자동완성 on/off
            _self.$wrap.find('.btn_auto').on('click', function() {
                _self.toggleAutoCompleteCookie();
            });

            // 닫기
            _self.$bottomWrap.find('.btn_close_auto').on('click', function() {
                _self.diffusionKeyword(_self.$keywordInput.val()); // 닫아도 검색어 포함시킨다.
                _self.close();
            });
        },

        keywordValidation: function(keyword) {
            if (keyword.length >= 1) {
                var regExp = /['"‘“!^@*~:;`\\]/gi;
                if (regExp.test(keyword)) {
                    _self.$keywordInput.val(_self.$keywordInput.val().replace(regExp, ''));
                    alert('검색어에 \' " ‘ “ ! ^ @ * ~ : ; ` \\ 와 같은 특수문자는 입력 할 수 없습니다.');
                }
            }
        },

        // 최근 검색어 삭제
        delRecentKeyword: function(obj) {
            $.ajax({
                url: _VARIABLES.urlForDeleteRecentKeyword,
                type: "POST",
                data: {
                    word: $(obj).data('value')
                }
            });

            // 이건 대단히 중요한건 아니니, 그냥 지워졌다 믿고 ui를 처리한다.
            $(obj).parents('li').remove();

            // 삭제 클릭 후 포커스를 검색input으로 보낸다.
            _self.$keywordInput.focus();

            // 재계산
            _self.recentCount = _self.$recentKeywordUl.find('li').length;

            // 결국 하나도 없게되면 닫는다. (최근검색어만 나와있는 상태에서 다 지웠을때)
            if (_self.recentCount === 0) {
                _self.hideResult();
            }
        },

        // setAndShowBasicResultReal 연속실행을 막기위한 함수
        // 다른곳들에서 실행은 이걸 한다.
        setAndShowResult: function(event) {
            if (_self.searching) {
                clearTimeout(_self.searching);
            }

            _self.searching = setTimeout(function() {
                _self.setAndShowResultReal(event);
            }, _VARIABLES.searchingTimeout);
        },

        // 기본 결과 세팅 및 표출 (최근검색어, 추천검색어)
        setAndShowResultReal: function(event) {
            _self.dataListKeywordRecent = '';
            _self.dataListKeywordSuggest = '';
            var $infoAutoComplete = $('.info_auto_complete');

            if (_self.getAutoCompleteCookie() === 1) { // 자동완성을 사용중이거나 설정한적이 없으면
                _self.$bottomWrap.find('#onoff').text('끄기').show();

                _self.$wrap.removeClass('auto_off');

                $infoAutoComplete.hide();

                if ($.trim(_self.$keywordInput.val()) === '') { // 키워드가 없으면 최근검색어 통신만 한다.
                    $.when(
                        _self.setDataListKeywordRecent() // 최근검색어
                    ).done(function() {
                        _self.hideResult();
                        _self.showRecent();
                    });
                } else {
                    $.when(
                        _self.setDataListKeywordSuggest() // 추천검색어
                    ).done(function() {
                        _self.hideResult();
                        _self.showSuggest();
                    });
                }
            } else { // 자동완성 미사용이면 아무런 통신없이 가이드창만 띄운다.
                _self.$bottomWrap.find('#onoff').text('켜기').show();

                _self.$wrap.removeClass('auto_off').addClass('auto_off');

                if (event !== 'keyup') {
                    $infoAutoComplete.show();
                } else {
                    $infoAutoComplete.hide();
                }

                _self.$wrap.removeClass('no_suggest');

                // keyup일때는 자동완성 가이드를 띄우지 않고 마지막 검색어만 교체한다.
                if (typeof event !== 'undefined' && event === 'keyup') {
                    _self.latestKeyword = _self.$keywordInput.val(); // 키조작 대응을 위해
                    _self.hideResult();
                }
            }
        },

        // 최근 검색어 셋업
        setDataListKeywordRecent: function() {
            return $.ajax({
                url: _VARIABLES.apiUrlForRecentKeyword,
                type: "GET",
                dataType: "json",
                cache: false,
                timeout: _VARIABLES.searchingRecentTimeout,
                data: {
                    dummy: _self.getDummy()
                },
                /**
                 * @param response 결과
                 */
                success: function(response) {
                    _self.dataListKeywordRecent = '';

                    if (response) {
                        var resultList = response;
                        _self.isReadyKeywordRecent = true;

                        if (resultList && resultList.length > 0) {
                            $.each(resultList, function(ind, key) {
                                var temp = _self.tplRecentKeywordHtml;

                                temp = temp.replace(/\{\{keywordValue}}/g, key.searchword_nm);
                                temp = temp.replace(/\{\{keyword}}/g, key.searchword_nm);

                                _self.dataListKeywordRecent += temp;
                            });
                        } else {
                            _self.recentCount = 0;
                        }
                    }
                }
            });
        },

        // 추천 검색어 셋업
        setDataListKeywordSuggest: function() {
            return $.ajax({
                url: _VARIABLES.apiUrlForSuggestKeyword,
                type: "GET",
                dataType: "json",
                cache: false,
                async: false,
                data: {
                    type: 'suggestKeyword',
                    keyword: encodeURIComponent(_self.$keywordInput.val()),
                    dummy: _self.getDummy()
                },
                /**
                 * @param response 결과
                 * @param response.result_list 결과리스트
                 */
                success: function(response) {
                    _self.dataListKeywordSuggest = '';

                    if (response) {
                        var resultList = response.result_list;

                        if (resultList && resultList.length > 0) {
                            $.each(resultList, function(ind, key) {
                                var temp = _self.tplSuggestKeywordHtml, regExr = /[\{\}\[\]\/\?\.\^\$\*\+\(\)\|]/gi, keywordInput = _self.$keywordInput.val();
                                if (regExr.test(keywordInput)) {
                                    keywordInput = keywordInput.replace(regExr, "\\$&");
                                }

                                temp = temp.replace(/\{\{keywordValue}}/g, key.keyword);
                                temp = temp.replace(/\{\{keyword}}/g, key.keyword.replace(new RegExp(keywordInput, 'gi'), '<span class="match">' + _self.$keywordInput.val().toUpperCase() + '</span>'));

                                _self.dataListKeywordSuggest += temp;
                            });
                        } else {
                            _self.suggestCount = 0;
                        }
                    }
                }
            });
        },

        // 최근검색어 최종 표출
        showRecent: function() {
            _self.latestKeyword = _self.$keywordInput.val();

            _self.$recentKeywordUl.empty().append(_self.dataListKeywordRecent);

            _self.bindEventsRecent();

            _self.$recentKeywordWrap.hide();

            if (_self.$recentKeywordUl.find('li').length > 0) {
                _self.$wrap.removeClass('no_suggest');
                _self.$recentKeywordWrap.show();
            }

            _self.resizeForTinyScrollbar();
        },

        // 최근검색어 이벤트
        bindEventsRecent: function() {
            // 최근검색어 삭제
            _self.$recentKeywordWrap.find('.btn_del').on('click', function(e) {
                // event bubble
                e = e || window.event;
                if (e.stopPropagation) {
                    e.stopPropagation(); // W3C 표준
                } else {
                    e.cancelBubble = true; // 인터넷 익스플로러 방식
                }

                _self.delRecentKeyword(this);
            });

            _self.bindEventsClickKeyword();
        },

        // 최근검색어, 추천검색어 클릭
        bindEventsClickKeyword: function() {
            _self.$wrap.find('.btn_keyword').on('click', function(e) {
                // event bubble
                e = e || window.event;
                if (e.stopPropagation) {
                    e.stopPropagation(); // W3C 표준
                } else {
                    e.cancelBubble = true; // 인터넷 익스플로러 방식
                }

                _self.diffusionKeyword($(this).data('value'));
                _self.close();
                _self.$keywordInput.blur();
                Common.setState('searchType', 'searchType', $(this).data('type'));

                // Logging 처리
                var eventAction = Common.Logging.getEventAction(), eventFlow = $(this).attr('data-logging-flow');
                Common.Logging.pushDataLayer('ga_lead', eventAction, eventFlow, $(this).data('value'));
                Common.Logging.trackEvent('panel_search', eventAction, eventFlow, $(this).data('value'));
            });
        },

        // 검색어를 전파한다?
        diffusionKeyword: function(keyword, type) {
            // 검색input을 교체한다.
            _self.$keywordInput.val(keyword);

            // 뒤 멀티셀렉트에 보낸다.
            var $keywordSpanInMultiSelect = _self.$keywordSection.find('.input_placeholder'),
                isReplace = true,
                floatingSearchButton = $('#search_open');

            $keywordSpanInMultiSelect.text(keyword);
            $keywordSpanInMultiSelect.addClass('filter_selected');
            floatingSearchButton.text(keyword);

            if (typeof type !== 'undefined' && type === 'init') {
                Common.setState('searchType', 'searchType', 'search');
            }

            // 검색을 위해 값을 세팅한다.
            if (keyword) {
                _self.$keywordInput.siblings('.placeholder').hide();

                if (Common.state.searchword && Common.state.searchword['preview_searchword']) {
                    if (Common.state.searchword['preview_searchword'] === keyword) {
                        isReplace = false;
                    }
                }

                if (isReplace === true) {
                    Common.removeState('searchword', 'preview_searchword');
                    Preview.remove('preview_searchword');

                    Common.setState('searchword', 'preview_searchword', keyword);
                    Preview.append('preview_searchword', '검색어 > ' + keyword, '', function () {
                        $keywordSpanInMultiSelect.text('검색어 입력');
                        $keywordSpanInMultiSelect.removeClass('filter_selected');
                        _self.$keywordInput.val('');
                        _self.$keywordInput.siblings('.placeholder').show();
                        _self.hideResult();
                        Common.removeState('searchword', 'preview_searchword');
                    });
                }
            } else {
                $keywordSpanInMultiSelect.text('검색어 입력');
                $keywordSpanInMultiSelect.removeClass('filter_selected');
                _self.$keywordInput.siblings('.placeholder').show();
                Common.removeState('searchword', 'preview_searchword');
                Preview.remove('preview_searchword');
                Common.removeState('searchType', 'searchType');
                floatingSearchButton.text('검색어 입력');
            }

            _self.$keywordSection.removeClass('opened');
        },

        // 추천검색어 최종 표출
        showSuggest: function() {
            _self.latestKeyword = _self.$keywordInput.val();

            _self.$suggestKeywordUl.empty().append(_self.dataListKeywordSuggest);

            _self.bindEventsClickKeyword();

            _self.$suggestKeywordWrap.hide();

            if (_self.$suggestKeywordUl.find('li').length > 0) {
                _self.$wrap.removeClass('no_suggest');
                _self.$suggestKeywordWrap.show();
            }

            _self.resizeForTinyScrollbar();
        },

        // 레이어 닫기
        close: function() {
            $('.keyword_section').removeClass('on');
            _self.hideResult();
        },

        // 리사이징
        resizeForTinyScrollbar: function() {
            _self.$suggestKeywordWrap.outerHeight(211);
            $(window).trigger('resize');
        },

        // 검색결과 닫기
        hideResult: function() {
            _self.$recentKeywordUl.empty();
            _self.$suggestKeywordUl.empty();

            _self.$keywordSection.removeClass('opened');
            _self.$wrap.removeClass('no_suggest').addClass('no_suggest');
            $('.info_auto_complete').hide();
            _self.$recentKeywordWrap.hide();
            _self.$suggestKeywordWrap.hide();
        },

        // create dummy
        getDummy: function() {
            var timestamp = new Date().getTime().toString(),
                randomPrefix = Math.floor(Math.random() * 1000).toString(),
                randomSuffix = Math.floor(Math.random() * 1000).toString();

            return randomPrefix + timestamp + randomSuffix;
        },

        // 자동완성 on/off
        toggleAutoCompleteCookie: function() {
            var flag = _self.getAutoCompleteCookie();

            if (flag === 1) { // 사용중이거나 설정한적이 없으면
                _self.setAutoCompleteCookie(0); // 끈다.
                _self.$bottomWrap.find('#onoff').html('켜기').show();
            } else {
                _self.setAutoCompleteCookie(1); // 킨다.
                _self.$bottomWrap.find('#onoff').html('끄기').show();
            }

            _self.hideResult();
            _self.setAndShowResult();
            _self.$keywordSection.removeClass('opened').addClass('opened');
        },

        // 자동완성 check cookie
        getAutoCompleteCookie: function() {
            if (document.cookie.indexOf("KonanAKC=0") > 0) {
                return 0; // 유저가 끈 경우
            }
            return 1; // 사용중이거나 설정한적이 없는 경우
        },

        // 자동완성 set cookie
        setAutoCompleteCookie: function(flag) {
            var expiresDate = new Date();
            expiresDate.setDate(expiresDate.getDate() + 3650);
            document.cookie = "KonanAKC=" + flag + "; path=/; expires=" + expiresDate.toUTCString();
        },

        isSelected: function() {
            return !!Common.getState('searchword', 'preview_searchword');
        }
    };

    return new Keyword();
});