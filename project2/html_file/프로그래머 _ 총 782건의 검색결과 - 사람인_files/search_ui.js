(function($) {
    var isHeaderFixed = false;

    function resetDefaultPanel() {
        $('.default_option > .search_option').removeClass('open');
        $('.ipt_keyword').parent().removeClass('on');
    }
    function resetMainPanel() {
        $('.tab_section > li').removeClass('on').removeClass('opened');
        $('.tab_section > li').find('.btn_detail_option').removeClass('on'); // 상세조건
        $('div.detail_option_section').removeClass('on'); // 상세조건
        $('div.wrap_detail_panel').hide(); // 상세조건

        if ($('.option_content.keyword_section').hasClass('on')) {
            $('.layer_search_keyword').removeClass('no_suggest').addClass('no_suggest');
            $('.total_recently_keyword').hide();
            $('#wrapSuggestKeyword').hide();
            $('.info_auto_complete').hide();
            $('.option_content').not('.keyword_section').removeClass('on');
        } else {
            $('.option_content').removeClass('on');
        }

        $('.wrap_depth_category').removeClass('expand');
        $.each($('button.btn_all_category'), function () {
            $(this).text($(this).text().replace('접어보기', '펼쳐보기'));
        });
    }

    $(window).scroll(function() {
        var isOpenDetail = $('div.detail_option_section').hasClass('on'),
            standardTopForFloating;

        if (isOpenDetail) {
            standardTopForFloating = 822;
        } else {
            standardTopForFloating = 215;
        }

        // header fix
        if($(this).scrollTop() > standardTopForFloating) {
            if(!isHeaderFixed) {
                resetMainPanel();
            }
            $('body').addClass('fixed');
            isHeaderFixed = true;
            resetDefaultPanel();
            $('#sp_smart_filter').show();
        } else {
            // if(isHeaderFixed) {
            //     resetMainPanel();
            // }
            $('body').removeClass('fixed');
            isHeaderFixed = false;
            $('.utility > li').removeClass('layer_on');
        }
    });

    $(window).resize(function() {
        if(isHeaderFixed && window.innerWidth < 1280) {
            $('.tab_section li').not('.keyword_section').removeClass('on');
            $('.option_content').not('.keyword_section').removeClass('on');
        }
    });

    $(document).ready(function () {
        var $searchWrap = $('#wrap_search_panel'),
            $mainPanel = $('.main_option', $searchWrap),
            $gnb = $('#sri_header');

        // 검색되어 왔을 경우 fixed 처리;
        if ($mainPanel.hasClass('active')) {
            $gnb.addClass('hidden');
        }

        $('#search_open').click(function() {
            $gnb.addClass('hidden');
            $mainPanel.addClass('active');
            resetMainPanel();
        });

        $('#search_close').click(function() {
            $gnb.removeClass('hidden');
            $mainPanel.removeClass('active');
            resetMainPanel();
        });
    });

    // 상세조건 패널 > 구버전 컴포넌트 대응
    $.fn.sri_refresh = function() {
        return this.trigger('sri_refresh');
    };
    $(document).on('change', '.sri_check .inp_check[type="checkbox"]', function() {
        $(this).sri_refresh();
    }).on('change', '.sri_check .inp_check[type="radio"]', function() {
        var groupName = $(this).attr('name'),
            radios = $('.sri_check .inp_check[type="radio"]').filter('[name="' + groupName + '"]');

        radios.sri_refresh();
    }).on('sri_refresh', '.sri_check .inp_check', function() {
        var $el = $(this),
            $self = $el.closest('.sri_check');

        $self.toggleClass('disabled', $el.is(':disabled'));
        $self.toggleClass('check_on', $el.is(':checked'));
    }).on('ready', function() {
        if($('.sri_check').length > 0) {
            $('.sri_check > .inp_check').filter(':not([data-pass-onload-refresh="y"])').sri_refresh();
        }
    });

    $(document).on('click', '.sri_select > button.selected', function() {
        var $self = $(this).closest('.sri_select');
        if(!$self.is('.disabled')) {
            $self.toggleClass('open');
        }
    }).on('click', '.sri_select > .list_opt > li > a', function() {
        var $el = $(this),
            $self = $el.closest('.sri_select');
        $self.find('> button.selected').removeClass('first').html($el.html());
        $el.closest('li').siblings().removeClass('on');
        $el.closest('li').addClass("on");
        $self.find('> input[type="hidden"]').val($el.data('value')).trigger('change');
        $self.removeClass('open');
        return false;
    }).on('sri_refresh', '.sri_select > input[type="hidden"]', function() {
        var $input = $(this),
            $self = $input.closest('.sri_select'),
            $selected = $self.find('.list_opt > li.on');
        if($input.prop('disabled')) {
            $self.addClass('disabled');
        } else {
            $self.removeClass('disabled');
            if($selected.length) {
                var selectedEl = $selected.find('> a');
                $self.find('> button.selected').removeClass('first').html(selectedEl.html());
                $input.val(selectedEl.data('value')).trigger('change');
            }
        }
    }).on('ready', function() {
        if($('.sri_select').length > 0) {
            $(document).on('click', function(e) {
                $('.sri_select').not($(e.target).closest(".sri_select")).removeClass('open');
            });
            $('.sri_select > input[type="hidden"]').filter(':not([data-pass-onload-refresh="y"])').sri_refresh();
        }
    }).on('click', '.toggleDivision', function() {
        var $divisionParent = $(this).closest('div.area_recruit');

        if ($divisionParent.hasClass('open')) {
            $divisionParent.removeClass('open');
            $(this).find('span').text('펼쳐보기');
        } else {
            $divisionParent.addClass('open');
            $(this).find('span').text('접기');
        }
    });

})(jQuery);
