define([
    'require', 'jquery', 'Util', 'Common'
], function (require, $, Util, Common) {
    'use strict';

    var selectionWrapper = $('ul.tab_section'),
        contentsWrapper = $('div.wrap_section_contents'),
        wrapScrollDepth1 = $('div.wrap_scroll.depth1'),
        wrapScrollDepth2 = $('div.wrap_scroll.depth2'),
        wrapScrollDepth3 = $('div.wrap_scroll.depth_check'),
        //wrapScrollDetail = $('.detail_option_section').find('.wrap_scroll'),
        wrapScrollAutoComplete = $('.wrap_auto_keyword .wrap_scroll');

    wrapScrollDepth1.tinyscrollbar();
    wrapScrollDepth2.tinyscrollbar();
    wrapScrollDepth3.tinyscrollbar();
    //wrapScrollDetail.tinyscrollbar();
    wrapScrollAutoComplete.tinyscrollbar();

    // 상단 선택바
    selectionWrapper.on('click', 'li', function () {
        var selectionClass = $(this).attr('class').split(' ')[0];

        $(this).toggleClass('on');
        contentsWrapper.find('div.' + selectionClass).toggleClass('on');

        switch (selectionClass) {
            case 'area_section':
                closeMultiSection(['job_category_section', 'industry_section', 'subway_section']);
                closeDetailSection();

                break;
            case 'job_category_section':
                closeMultiSection(['area_section', 'industry_section', 'subway_section']);
                closeDetailSection();
                toggleSubwaySection(!$(this).hasClass('on'));

                break;
            case 'industry_section':
                closeMultiSection(['area_section', 'job_category_section', 'subway_section']);
                closeDetailSection();

                break;
            case 'subway_section':
                closeMultiSection(['area_section', 'job_category_section', 'industry_section']);
                closeDetailSection();
                toggleSubwaySection(!$(this).hasClass('on'));

                break;
            case 'keyword_section':
                $('#total_ipt_keyword').focus().trigger('click').select();

                if (Common.getParam('action') === 'unified') { // 통검이면 하나만 킨다.
                    closeMultiSection(['area_section', 'job_category_section', 'industry_section', 'subway_section']);
                    closeDetailSection();
                    toggleSubwaySection(!$(this).hasClass('on'));
                }

                window.SearchPanelStore.state.keydownAccess = false;

                break;
            case 'detail_section':
                // wrapScrollDetail.outerHeight(650);
                // $(window).trigger('resize');

                closeMultiSection(['area_section', 'job_category_section', 'industry_section', 'subway_section']);
                toggleSubwaySection(!$(this).hasClass('on'));

                break;
            default :
                break;
        }


        switch (selectionClass) {
            case 'keyword_section':
                return;
            case 'job_category_section':
                Util.Layer.arrangeJobCategoryDepthTinyScrollbar();
                break;
            default :
                Util.Layer.arrangeDepthTinyScrollbar();
                break;
        }

        if ($(this).hasClass('on') && $('#sp_smart_filter').length > 0) {
            $('#sp_smart_filter').hide();
        } else {
            $('#sp_smart_filter').show();
        }
    });

    var closeMultiSection = function(targetList) {
        $.each(targetList, function(key, value) {
            selectionWrapper.find('li.' + value).removeClass('on');
            contentsWrapper.find('div.' + value).removeClass('on');
        })
    };

    var closeDetailSection = function() {
        selectionWrapper.find('li.detail_section').removeClass('on');
        selectionWrapper.find('li.detail_section').find('.btn_detail_option').removeClass('on');
        contentsWrapper.find('div.detail_section').removeClass('on');
        contentsWrapper.find('div.detail_option_section').removeClass('on');
        contentsWrapper.find('div.wrap_detail_panel').hide();
    };
    
    var toggleSubwaySection = function(showHide) {
        var $el = contentsWrapper.find('div.subway_station_section');
        showHide ? $el.show() : $el.hide();
    };

    var $searchPanelForm = $('#search_panel_form'),
        $boxLayer = $searchPanelForm.find('.search_option'),
        $panelLayer = $searchPanelForm.find('.wrap_section_contents'),
        $areaBtn = $('.area_btn');

    $('body')
        .on('click', function (e) {
            // 학력/경력/최근 검색조건 불러오기 닫기
            if ($boxLayer.hasClass('open') && !$boxLayer.has(e.target).length) {
                $boxLayer.removeClass('open');
            }

            // 자동완성 닫기
            if (!$searchPanelForm.find('.wrap_auto_keyword').has(e.target).length) {
                $searchPanelForm.find('.wrap_result').hide();
            }

            // 통검에서 패널 닫기
            if (Common.getParam('action') === 'unified' && $panelLayer.is(':visible')) {
                if (!$('#sp_main_wrapper').has(e.target).length) {
                    closeMultiSection(['area_section', 'job_category_section', 'industry_section', 'subway_section']);
                    closeDetailSection();
                    if ($('#sp_smart_filter').length > 0) {
                        $('#sp_smart_filter').show();
                    }
                }
            }
        })
        .on('click', '.btn_open_layer', function () {
            var $openLayer = $(this).parent('.search_option');
            if ($(this).hasClass('no_result') ) {
                alert('최근 검색조건이 없습니다.');
            } else {
                $openLayer.toggleClass('open');
                $boxLayer.not($openLayer).removeClass('open');
            }
        })
        .on('click', '.search_option .btn_close', function () {
            $boxLayer.removeClass('open');
        })
        .on('click', 'a.search_recently', function () {
            // Logging 처리
            var eventAction = Common.Logging.getEventAction();
            Common.Logging.pushDataLayer('ga_lead', eventAction, 'recent_search', '');
            Common.Logging.trackEvent('panel_search', eventAction, 'recent_search', '');
        });

    // 마지막 뎁쓰의 펼쳐/접어보기
    var $btnLastDepthSpread = $areaBtn.find('.btn_all_category');
    $btnLastDepthSpread.on('click', function() {
        var depthCategory = $(this).parents('.wrap_depth_category'),
            maxHeight = -1, loggingFlow = $(this).attr('data-logging-flow');

        depthCategory.toggleClass('expand');
        $(this).toggleClass('on');

        if (depthCategory.hasClass('expand')) {
            $(this).text($(this).text().replace('펼쳐보기', '접어보기'));
            depthCategory.find('.overview').each(function() {
                if (maxHeight > $(this).outerHeight()) {
                    //maxHeight = maxHeight;
                } else {
                    maxHeight = $(this).outerHeight();
                }
            });

            depthCategory.find('.wrap_scroll').each(function() {
                $(this).height(maxHeight);
            });

            // Logging 처리
            var eventAction = Common.Logging.getEventAction(), eventFlow = (eventAction === 'area_foreign' && loggingFlow === 'area') ? 'fore_open' : loggingFlow + '_open';
            Common.Logging.pushDataLayer('ga_lead', eventAction, eventFlow, '');
            Common.Logging.trackEvent('panel_search', eventAction, eventFlow, '');

        } else {
            $(this).text($(this).text().replace('접어보기', '펼쳐보기'));
            Util.Layer.arrangeDepthTinyScrollbar();
            depthCategory.find('.wrap_scroll').outerHeight(245);
        }

        $(window).trigger('resize');
    });

    // 마지막 뎁쓰의 초기화
    var $btnLastDepthReset = $areaBtn.find('.btn_reset');
    $btnLastDepthReset.on('click', function() {
        var depthCategory = $(this).parent().siblings('.list_check').filter(':visible');

        depthCategory.find(':checkbox').each(function() {
            if ($(this).prop('checked')) {
                $(this).click();
            }
        });
    });

    // 통검 플로팅 영역 관련
    selectionWrapper.click(function () {
        var $searchWrap = $('#wrap_search_panel'),
            $mainPanel = $('.main_option', $searchWrap),
            $gnb = $('#header');
        $gnb.addClass('hidden');
        $mainPanel.addClass('active');
    });
});