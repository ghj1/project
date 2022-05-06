define([
    'require', 'jquery', 'lodash', 'Common', 'Util'
], function (require, $, _, Common, Util) {
    'use strict';

    var _self;

    var SearchHistory = function () {
        this.init.apply(this);
    };

    SearchHistory.prototype = {
        init: function () {
            _self = this;
            _self.initVariables();
            _self.bindEvents();

            return _self;
        },

        initVariables: function () {
            _self.$mySearchListLayer = $('#mySearchListLayer');
            _self.$btnOpenListLayer = $('#recently_search_btn');
            _self.$rightWingUtil = $('#rightWingUtil');
            _self.$rightWingMySearch = $('#rightWingMySearch');
            _self.$mySearchList = $('#mySearchLHistory');
            _self.$searchPanelWrapper = $('#search_panel_wrapper');
        },

        bindEvents: function () {

            _self.$searchPanelWrapper.on('click', '.subscribe_tooltip .btn_tooltip', function () {
                switch (_self.$btnOpenListLayer.data('action')) {
                    case 'unified':
                        var path = '/zf_user/search';
                        break
                    case 'samsung':
                        var path = '/zf_user/jobs/theme/samsung';
                        break
                    case 'sba-seoul':
                        var path = '/zf_user/jobs/theme/sba-seoul';
                        break
                    case 'tech':
                        var path = '/zf_user/jobs/theme/tech';
                        break
                    case 'wiset':
                        var path = '/zf_user/jobs/theme/wiset';
                        break
                    case 'youthstay':
                        var path = '/zf_user/jobs/theme/youthstay';
                        break
                    case 'cjpi':
                        var path = '/zf_user/jobs/theme/cjpi';
                        break
                    case 'winwin-doosan':
                        var path = '/zf_user/jobs/theme/winwin-doosan';
                        break
                    case 'ex':
                        var path = '/zf_user/jobs/theme/ex';
                        break
                    case 'with-komipo':
                        var path = '/zf_user/jobs/theme/with-komipo';
                        break
                    case 'kova':
                        var path = '/zf_user/jobs/theme/kova';
                        break
                    case 'ketep':
                        var path = '/zf_user/jobs/theme/ketep';
                        break
                    case 'incheon-airport':
                        var path = '/zf_user/jobs/theme/incheon-airport';
                        break
                    default :
                        var path = '/zf_user/jobs/list/' + _self.$btnOpenListLayer.data('action');
                        break;
                }

                var todayDate = new Date();
                todayDate.setDate(todayDate.getDate() + 1);
                todayDate.setHours(0, 0, 0);
                document.cookie = "mykeyword_info_layer=y; path=" + path + "; expires=" + todayDate.toGMTString() + ";";
                _self.$searchPanelWrapper.find('.subscribe_tooltip').hide();
            });

            _self.$searchPanelWrapper.on('click', '.subscribe_tooltip .btn_subscribe', function () {
                _self.saveMySearchConditionForLayer();
            });

            _self.$btnOpenListLayer.on('click', function () {
                if (!_self.$mySearchListLayer.hasClass('open')) {
                    _self.getSearchHistoryList(1);
                }
            });

            _self.$mySearchListLayer.on('click', '.btn_help', function () {
                _self.$mySearchListLayer.find('.toolTipWrap .toolTip').toggle();
            });

            _self.$mySearchListLayer.on('click', '.btn_save_mail', function () {
                _self.openSaveLayer(this, 'n');
            });

            _self.$mySearchListLayer.on('click', '.btn_save_search', function () {
                _self.openSaveLayer(this, 'y');
            });

            _self.$mySearchListLayer.on('click', '.btn_mail_receive', function () {
                _self.mailSetting(this, 'y', 'n');
            });

            _self.$mySearchListLayer.on('click', '.btn_mail_reject', function () {
                _self.mailSetting(this, 'n', 'n');
            });

            _self.$mySearchListLayer.on('click', '.btn_search_delete', function () {
                _self.mySearchDelete(this);
            });

            _self.$mySearchListLayer.on('click', '.btn_layer_close', function () {
                $(this).parents('.total_layer').hide();
            });

            _self.$mySearchListLayer.on('click', '.btn_word_change', function () {
                $(this).parents('.box_tit').addClass('edit_on');
            });

            _self.$mySearchListLayer.on('click', '.btn_preview', function () {
                $(this).parents('.box_txt').next('.area_preview').addClass('open');
            });

            _self.$mySearchListLayer.on('click', '.area_preview .btn_preview_close', function () {
                $(this).parents('.area_preview').removeClass('open');
            });

            _self.$mySearchListLayer.on('click', '.btn_save_title', function () {
                _self.changeSaveTitle(this);
            });

            _self.$mySearchListLayer.on('click', '.page_move', function () {
                var page = $(this).attr('page') ? $(this).attr('page') : 1;
                _self.getSearchHistoryList(page);
                return false;
            });

            _self.$mySearchListLayer.on('change', '#search_history_count', function () {
                _self.getSearchHistoryList(1);
            });

            _self.$mySearchListLayer.on('click', '.inbox_sort span', function () {
                $(this).addClass('on').siblings('span').removeClass('on');
                _self.getSearchHistoryList(1);
            });

            _self.$mySearchListLayer.on('click', '.btn_title_search', function () {
                var reg_check = /[^a-z0-9\ㄱ-\힝\s]/i;
                if (reg_check.test(_self.$mySearchListLayer.find('#search_list_title').val())) {
                    alert("검색은 한글, 영문, 숫자 입력만 가능합니다.");
                    _self.$mySearchListLayer.find('#search_list_title').val().focus();
                    return false;
                }

                if (_self.$mySearchListLayer.find('[data-type="recently-search"]').hasClass('on')) {
                    _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                }
                _self.getSearchHistoryList(1);

            });

            _self.$mySearchListLayer.on('keydown', '#search_list_title', function (event) {
                if (event.keyCode && event.keyCode == 13) {
                    _self.$mySearchListLayer.find('.btn_title_search').trigger('click');
                    event.preventDefault();
                }
            });

            _self.$mySearchListLayer.on('click', '#condition_title', function () {
                _self.$mySearchListLayer.find('#condition_title').val('');
                _self.$mySearchListLayer.find('.txt_num em').text(0);
            });

            _self.$mySearchListLayer.on('keyup', '#condition_title', function () {
                _self.checkTitleLength();
            });

            _self.$mySearchListLayer.on('click', '#btn_save_condition', function () {
                _self.saveCondition();
            });

            _self.$mySearchList.on('mousedown', '.track_event', function () {
                _self.trackEvent(this);
            });

            _self.$rightWingUtil.on('click', '.btn_wordsave', function () {
                _self.setMySearchCondition($(this).data('index'), 'n', '');
            });

            _self.$rightWingUtil.on('click', '.btn_delete_box', function () {
                var index = $(this).data('index');
                if (!index) {
                    alert('삭제할 검색 조건을 선택하세요.');
                    return false;
                }
                _self.recentlySearchDelete(index);
            });

            _self.$rightWingUtil.on('click', '.ico_word_setting', function () {
                _self.settingBtnOpenLayer();
            });

            _self.$rightWingUtil.on('click', '.btn_prev', function () {
                _self.getRecentlySearchConditionsList(1);
            });

            _self.$rightWingUtil.on('click', '.btn_next', function () {
                _self.getRecentlySearchConditionsList(2);
            });

            $(document).ready(function () {
                var view = _self.$mySearchListLayer.data('view');
                if (view == 'y') {
                    _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                    _self.getSearchHistoryList(1);
                }

                if (_self.$rightWingUtil.length > 0) {
                    _self.getRecentlySearchConditionsList(1);
                }
            });
        },

        checkTitleLength: function () {
            var text = _self.$mySearchListLayer.find('#condition_title').val();
            var cnt = text.length;
            _self.$mySearchListLayer.find('.txt_num em').text(cnt);
        },

        saveCondition: function () {
            var title_input = _self.$mySearchListLayer.find('#condition_title');
            var text = title_input.val();
            if ($.trim(text).length == 0) {
                alert('저장명을 입력하세요.');
                title_input.focus();
                return false;
            }

            var reg_check = /[^a-z0-9\ㄱ-\힝\s]/i;
            if (reg_check.test(text)) {
                alert("저장명은 한글, 영문, 숫자 입력만 가능합니다.");
                title_input.focus();
                return false;
            }

            var index = _self.$mySearchListLayer.find('.total_layer').attr('seq');
            var reject = _self.$mySearchListLayer.find('.total_layer').attr('reject');

            _self.setMySearchCondition(index, reject, title_input.val());

        },

        openSaveLayer: function (elt, reject) {
            _self.$mySearchListLayer.find('.total_layer').attr('seq', '');
            _self.$mySearchListLayer.find('.total_layer').attr('reject', '');

            var index = $(elt).parents('td').data('seq');
            if (index == undefined) {
                alert('저장할 데이터를 선택하세요.');
                return false;
            }

            $.ajax({
                url: '/zf_user/search/save-login-check',
                data: {
                    'index': index,
                    'reject_status': reject
                },
                dataType: "json",
                async: false,
                success: function (response) {
                    switch (response.resultCode) {
                        case 'err_no_login' :
                            _self.getPositionedLoginLayer($);
                            break;
                        case 'empty' :
                            alert('저장할 데이터를 선택하세요.');
                            break;
                        case 'error' :
                            alert('저장에 실패했습니다. 다시 시도하여 주시기 바랍니다.');
                            break;
                        case 'update' :
                            alert('동일한 조건이 저장 되어 있습니다. 기존 조건이 업데이트 됩니다.');
                            _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                            _self.getSearchHistoryList(1);
                            $('#history_' + index).find('.box_btn').hide();
                            break;
                        case 'change' :
                            alert('동일한 조건이 저장 되어 있습니다. 기존 조건이 업데이트 됩니다.');
                            _self.mailSetting(response.seq, reject == 'y' ? 'n' : 'y', 'y');
                            $('#history_' + index).find('.box_btn').hide();
                            break;
                        case 'login' :
                            _self.$mySearchListLayer.find('.total_layer').show();
                            _self.$mySearchListLayer.find('.total_layer').attr('seq', index);
                            _self.$mySearchListLayer.find('.total_layer').attr('reject', reject);
                            break;
                    }
                },
                error: function () {
                    return;
                }
            });
        },

        settingBtnOpenLayer: function () {
            $('html, body').stop().animate({
                scrollTop: 0
            }, {
                complete: function () {
                    _self.getSearchHistoryList(1);
                }
            });
        },

        changeSaveTitle: function (elt) {
            var mail_title = $(elt).parents('.box_edit ').find('input.mail_title_text').val();
            var mail_seq = $(elt).data('seq');
            if ($.trim(mail_title).length == 0) {
                alert('변경할 저장명을 입력하세요.');
                $(elt).parents('.box_edit ').find('input.mail_title_text').focus();
                return false;
            }

            if (!mail_seq) {
                alert('변경할 검색조건을 선택하세요');
                return false;
            }

            var reg_check = /[^a-z0-9\ㄱ-\힝\s]/i;
            if (reg_check.test(mail_title)) {
                alert("저장명은 한글, 영문, 숫자 입력만 가능합니다.");
                $(elt).parents('.box_edit ').find('input.mail_title_text').focus();
                return false;
            }

            try {
                $.ajax({
                    url: '/zf_user/search/change-save-title',
                    data: {
                        'mail_seq': mail_seq,
                        'mail_title': mail_title
                    },
                    dataType: "json",
                    async: false,
                    success: function (response) {
                        switch (response) {
                            case 'empty' :
                                alert('저장할 데이터를 선택하세요.');
                                break;
                            case 'err_no_login' :
                                _self.getPositionedLoginLayer($);
                                break;
                            case 'error' :
                                alert('저장에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                                break;
                            case 'err_overlap' :
                                alert('동일한 조건명을 사용중 입니다. 조건명을 변경 해 주세요.');
                                break;
                            case 'success' :
                                alert('나의 검색조건명이 변경되었습니다.');
                                $(elt).parents('.box_tit').find('.in_tit').text(mail_title);
                                $(elt).parents('.box_tit').removeClass('edit_on');
                                break;
                        }
                    },
                    error: function () {
                        alert('저장에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                        return;
                    }
                });

            } catch (e) {
                return;
            }
        },

        setMySearchCondition: function (index, status, title) {
            if (index == undefined) {
                alert('저장할 데이터를 선택하세요.');
                return false;
            }

            try {
                $.ajax({
                    url: '/zf_user/search/save-my-search-conditions',
                    data: {
                        'index': index,
                        'reject_status': status,
                        'title': title ? title : ''
                    },
                    dataType: "json",
                    async: false,
                    success: function (response) {
                        switch (response.resultCode) {
                            case 'empty' :
                                alert('저장할 데이터를 선택하세요.');
                                break;
                            case 'err_no_login' :
                                _self.getPositionedLoginLayer($);
                                break;
                            case 'err_overcnt' :
                                alert('최대 설정 갯수가 초과 하였습니다');
                                if (!_self.$mySearchListLayer.hasClass('open')) {
                                    _self.settingBtnOpenLayer();
                                }
                                break;
                            case 'err_overlap' :
                                alert('동일한 조건명을 사용중 입니다. 조건명을 변경 해 주세요.');
                                break;
                            case 'error' :
                                alert('저장에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                                break;
                            case 'update' :
                                alert('동일한 조건이 저장 되어 있습니다. 기존 조건이 업데이트 됩니다.');
                                if (_self.$mySearchListLayer.hasClass('open')) {
                                    _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                                    _self.getSearchHistoryList(1);
                                }
                                $('#history_' + index).find('.box_btn').hide();
                                break;
                            case 'change' :
                                alert('동일한 조건이 저장 되어 있습니다. 기존 조건이 업데이트 됩니다.');
                                _self.mailSetting(response.seq, status == 'y' ? 'n' : 'y', 'y');
                                $('#history_' + index).find('.box_btn').hide();
                                break;
                            case 'success' :
                                if (_self.$mySearchListLayer.hasClass('open')) {
                                    if (status == 'n') {
                                        alert('메일수신 설정이 완료 되었습니다.(검색조건 저장 포함)');
                                    } else {
                                        alert('설정하신 검색 조건이 저장 되었습니다.');
                                    }
                                    _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                                    _self.getSearchHistoryList(1);
                                } else {
                                    alert('메일수신 설정이 완료 되었습니다.(검색조건 저장 포함)');
                                }
                                $('#history_' + index).find('.box_btn').hide();
                                break;
                        }
                    },
                    error: function (response) {
                        alert('저장에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                        return;
                    }
                });

            } catch (e) {
                return;
            }

        },

        saveMySearchConditionForLayer: function () {
            var index = _self.$searchPanelWrapper.find('.subscribe_tooltip').data('value');
            if (index == undefined) {
                alert('저장할 데이터를 선택하세요.');
                return false;
            }

            try {
                $.ajax({
                    url: '/zf_user/search/save-my-search-conditions',
                    data: {
                        'index': index,
                        'reject_status': 'n',
                        'title': ''
                    },
                    dataType: "json",
                    async: false,
                    success: function (response) {
                        switch (response.resultCode) {
                            case 'empty' :
                                alert('저장할 데이터를 선택하세요.');
                                break;
                            case 'err_no_login' :
                                _self.getPositionedLoginLayer($);
                                break;
                            case 'err_overcnt' :
                                alert('저장 조건이 10개를 초과했습니다.\n나의 검색관리에서 수정해주시기 바랍니다.');
                                break;
                            case 'error' :
                                alert('저장에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                                break;
                            case 'update' :
                                alert('동일한 조건이 저장 되어 있습니다. 기존 조건이 업데이트 됩니다.');
                                $('#history_' + index).find('.box_btn').hide();
                                break;
                            case 'change' :
                                alert('동일한 조건이 저장 되어 있습니다. 기존 조건이 업데이트 됩니다.');
                                _self.mailSetting(response.seq, 'y', 'y');
                                $('#history_' + index).find('.box_btn').hide();
                                break;
                            case 'success' :
                                alert('나의 검색메일 구독신청이 완료되었습니다.\n수신 설정은 나의 검색 / 메일관리를 이용해주세요.');
                                $('#history_' + index).find('.box_btn').hide();
                                break;
                        }
                    },
                    error: function (response) {
                        alert('저장에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                        return;
                    }
                });

            } catch (e) {
                return;
            }

            _self.$searchPanelWrapper.find('.subscribe_tooltip').hide();

        },

        getPositionedLoginLayer: function ($) {
            $('#pop_login_layer_dimmed').show();
            var layerEl = $('#pop_login_layer'),
                h = layerEl.height(),
                w = layerEl.width();

            var sheight = document.body.scrollTop;

            if (sheight == 0) {
                sheight = document.documentElement.scrollTop;
            }
            var cheight = document.compatMode == "CSS1Compat" ?
                document.documentElement.clientHeight : document.body.clientHeight;

            $('#pop_login_layer').css("left", Math.ceil((document.body.clientWidth - w) / 2) + 250);
            $('#pop_login_layer').css("top", Math.ceil((cheight - h) / 2 + sheight));
            $('#pop_login_layer').show();
        },

        mySearchDelete: function (e) {
            var type = $(e).parents('td').data('type');
            var seq = $(e).parents('td').data('seq');

            if (!type || !seq) {
                alert('삭제할 검색 조건을 선택하세요.');
                return false;
            }

            if (type == 'my-search') {
                this.myKeywordDelete(seq);
            } else if (type == 'recently-search') {
                this.recentlySearchDelete(seq);
            }
        },

        recentlySearchDelete: function (index) {
            if (!index) {
                alert('삭제할 검색 조건을 선택하세요.');
                return false;
            }

            try {
                $.ajax({
                    url: '/zf_user/search/delete-my-search-conditions',
                    data: {
                        index: index
                    },
                    dataType: "json",
                    async: false,
                    success: function (response) {
                        switch (response) {
                            case 'empty' :
                                alert('삭제할 데이터를 선택하세요.');
                                break;
                            case 'error' :
                                alert('삭제에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                                break;
                            case 'no-result' :
                                alert('최근 나의 검색 조건에 업데이트가 있습니다. 새로고침 후 다시 이용 부탁 드립니다.');
                                break;
                            case 'success' :
                                alert('해당 조건이 삭제 되었습니다.');
                                if (_self.$mySearchListLayer.hasClass('open')) {
                                    _self.getSearchHistoryList(1);
                                }
                                _self.getRecentlySearchConditionsList(1);
                                break;
                        }
                    },
                    error: function () {
                        alert('삭제에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                        return;
                    }
                });

            } catch (e) {
                return;
            }
        },

        myKeywordDelete: function (mail_seq) {

            if (!mail_seq) {
                alert('삭제할 검색 조건을 선택하세요.');
                return false;
            }

            try {
                $.ajax({
                    url: '/zf_user/member/suited-recruit-mail/recruit-del-ajax',
                    data: {
                        mail_seq: mail_seq
                    },
                    dataType: "html",
                    async: false,
                    success: function (response) {
                        switch (response) {
                            case 'error' :
                                alert('삭제에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                                break;
                            case 'success' :
                                alert('해당 조건이 삭제 되었습니다.');
                                _self.getSearchHistoryList(1);
                                break;
                        }
                    },
                    error: function () {
                        alert('삭제에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                        return;
                    }
                });

            } catch (e) {
                return;
            }
        },

        mailSetting: function (e, status, duplication) {
            if (duplication == 'y') {
                var seq = e;
            } else {
                var seq = $(e).parents('td').data('seq');
            }

            if (!seq || !status) {
                alert('메일 수신을 선택할 데이터를 선택하세요.');
                return false;
            }

            if (status == 'y') {
                _self.mailRequest(e, seq, duplication);
            } else {
                _self.mailReject(e, seq, duplication);
            }
        },

        mailRequest: function (e, seq, duplication) {
            if (!seq) {
                alert('메일 수신을 선택할 데이터를 선택하세요.');
                return false;
            }

            $.ajax({
                url: '/zf_user/member/suited-recruit-mail/recruit-mail-request-ajax',
                data: {
                    mail_seq: seq
                },
                dataType: "html",
                async: false,
                success: function (response) {
                    switch (response) {
                        case 'fail' :
                            alert('메일 수신 설정에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                            break;
                        case 'success' :
                            if (duplication == 'y') {
                                if (_self.$mySearchListLayer.hasClass('open')) {
                                    _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                                    _self.getSearchHistoryList(1);
                                }
                            } else {
                                alert('메일수신이 설정되었습니다.');
                                $(e).parents('td').find('.btn_mail_receive').hide();
                                $(e).parents('td').find('.btn_mail_reject').show();
                            }
                            break;
                    }
                },
                error: function () {
                    alert('메일 수신 설정에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                    return;
                }
            });
        },

        mailReject: function (e, seq, duplication) {

            if (!seq) {
                alert('메일 수신을 취소할 데이터를 선택하세요.');
                return false;
            }

            try {
                $.ajax({
                    url: '/zf_user/help/mail/saramin-per-search-reject-process',
                    data: {
                        mail_seq: seq
                    },
                    dataType: "json",
                    async: false,
                    success: function (response) {
                        switch (response) {
                            case 'empty' :
                            case 'not_valid' :
                            case 'empty_parameters' :
                            case 'empty_data' :
                                alert('수신을 취소할 데이터를 선택하세요.');
                                break;
                            case 'error' :
                                alert('수신 취소에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                                break;
                            case 'err_no_login' :
                                _self.getPositionedLoginLayer($);
                                break;
                            case 'already_rejected' :
                                alert('이미 수신거부 되어있습니다.');
                                break;
                            case 'success' :
                                if (duplication == 'y') {
                                    _self.$mySearchListLayer.find('[data-type="my-search"]').addClass('on').siblings('span').removeClass('on');
                                    _self.getSearchHistoryList(1);
                                } else {
                                    alert('나의 검색 메일 배달이 취소 되었습니다.');
                                    $(e).parents('td').find('.btn_mail_receive').show();
                                    $(e).parents('td').find('.btn_mail_reject').hide();
                                }
                                break;
                        }
                    },
                    error: function () {
                        alert('수신 취소에 실패했습니다. 잠시 후 다시 시도해 보시기 바랍니다.');
                        return;
                    }
                });

            } catch (e) {
                return;
            }

        },

        getRecentlySearchConditionsList: function (page) {
            $.ajax({
                url: '/zf_user/search/get-recently-search-condition',
                type: "get",
                dataType: 'json',
                data: {
                    page: page ? page : 1
                },
                success: function (response) {
                    _self.$rightWingMySearch.html(response.innerHTML);
                    _self.$rightWingMySearch.find('.page_num').text(page);

                },
                error: function () {
                    return;
                }
            });
        },

        getSearchHistoryList: function (page) {
            _self.$mySearchListLayer.find('.sri_tooltip').hide();
            _self.$mySearchListLayer.find('.area_preview').hide();
            _self.$mySearchListLayer.find('.total_layer').hide();
            _self.$mySearchListLayer.find('#condition_title').val('');

            var count = $('#search_history_count option:selected').val();
            var listType = _self.$mySearchListLayer.find('.wrap_box_sort span.on').data('type');
            var searchTarget = _self.$btnOpenListLayer.data('action');
            var searchTitle = _self.$mySearchListLayer.find('#search_list_title').val();

            $.ajax({
                url: '/zf_user/search/get-my-search-list',
                type: "get",
                dataType: 'json',
                data: {
                    page: page ? page : 1,
                    pageCount: count ? count : 3,
                    listType: listType ? listType : 'all',
                    searchTarget: searchTarget ? searchTarget : 'unified',
                    searchTitle: searchTitle ? searchTitle : ''
                },
                success: function (response) {
                    _self.$mySearchList.html(response.innerHTML);
                    _self.$mySearchListLayer.addClass('open');
                    _self.$mySearchListLayer.find('[data-type="recently-search"]').find('em').text(response.layerRecentlyCount);
                    _self.$mySearchListLayer.find('[data-type="my-search"]').find('em').text(response.layerMyCount);
                    _self.$mySearchListLayer.find('[data-type="all"]').find('em').text(response.layerTotalCount);
                    _self.$mySearchListLayer.find('#condition_title').val(response.saveTitle);
                    _self.$mySearchListLayer.find('.txt_num em').text(response.saveTitle.length);
                },
                error: function () {
                    return;
                }
            });
        },

        trackEvent: function (elt) {
            var data = $(elt).data('track_event').split("|"),
                category = data[0] || '',
                action = data[1] || '',
                opt_label = data[2] || '',
                opt_value = data[3] || '';

            if (!category || !action) {
                return true;
            }

            try {
                n_trackEvent(category, action, opt_label, opt_value);
            } catch (e) {
            }
        },

    };

    return new SearchHistory();
});