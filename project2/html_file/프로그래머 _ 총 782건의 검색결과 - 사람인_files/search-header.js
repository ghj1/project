(function($, window) {
    var SEARCH_HEADER = function () {
        this.init.apply(this, arguments);
    };

    SEARCH_HEADER.prototype = {
        init: function() {
            this.initVariables();
            this.loadSvg();
            this.bindEvents();
            this.loadGnbPhoto();
            $(window).trigger('resize');

        },

        initVariables: function() {
            this.$sriHeader = $('#sri_header');
            this.$btnMember = $('#sri_header .wrap_member .btn_member');
            this.$btnDepth1 = $('#sri_header .navigation .btn_depth1');
            this.$naviTotal = $('#sri_header .navi_total');
        },

        bindEvents: function() {
            $(document).on('click', function(e) {
                if($(e.target).closest('#sri_header .wrap_member .btn_member').length > 0) {
                    this.$btnMember.toggleClass('expanded');
                } else {
                    this.$btnMember.removeClass('expanded');
                }
                if($(e.target).closest('#sri_header .navigation .btn_depth1').length > 0) {
                    this.$btnDepth1.toggleClass('expanded');
                } else {
                    this.$btnDepth1.removeClass('expanded');
                }
                if($(e.target).closest('#sri_header .navi_total').length < 1 ) {
                    this.$naviTotal.removeClass('expanded');
                    this.changeTotalMenuTrackingCode();
                }
            }.bind(this));

            $(window).on('resize', function () {
                this.setResizeVariables();
                $(window).trigger('scroll');
            }.bind(this));

            this.$sriHeader.on('click', '.navi_total > button', function() {
                this.$naviTotal.toggleClass('expanded');
                this.changeTotalMenuTrackingCode();
            }.bind(this));

            $(window).on('scroll', function () {
                this.windowScrollLeft = jQuery(window).scrollLeft();
                this.windowScrollTop = jQuery(window).scrollTop();
                this.setFixed();
            }.bind(this));
        },

        setResizeVariables : function () {
            this.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;// incl. scrollbar
            this.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;//incl. scrollbar
            this.viewportWidth = $(window).width();
            this.viewportHeight = $(window).height();
        },

        setFixed : function() {
            if(this.windowScrollTop > 48 && this.windowWidth >= 800) {
                this.$sriHeader.addClass('fixed');
            } else {
                this.$sriHeader.removeClass('fixed');
            }
        },

        loadSvg : function() {
            var svg = '/svg/layout_default.svg?v=?20210520',
                req = new XMLHttpRequest();
            req.open('GET', svg, true);
            req.send();
            req.onload = function(e) {
                var div = document.querySelector('.img_svg_layout');
                div.innerHTML = req.responseText;
            }
        },

        loadGnbPhoto : function() {
            if($('#gnb_member_person').length) {
                var loadUrl = '/zf_user/member/persons/gnb-personal-data';

                $.get(loadUrl, function(data) {
                    $('#gnb_photo_area_span').html('');
                    $('#gnb_photo_area_span').html(data);
                });
            }
            if($('#gnb_member_company').length) {
                $.ajax({
                    dataType: "json",
                    url: "/zf_user/memcom/index/get-gnb-data-of-company"
                }).done(function (res) {
                    if( res.result === 'success' && !!res.data.logo_src) {
                        $('#gnb_photo_area_span').html('<img src="' + res.data.logo_src  + '" alt="" />');
                    } else {
                        $('.user_photo').html('<svg class="img_default"><use xlink:href="#svg_gnb_member_photo"></use></svg>');
                    }
                });
            }
        },

        /**
         * Total 메뉴의 트래킹 코드 변경 open, close
         * !! expanded 클래스 변경 후 실행
         */
        changeTotalMenuTrackingCode : function() {
            var onclick = null;
            var button = this.$naviTotal.find('button')[0] || null;
            if (button !== null) {
                var code = this.$naviTotal.hasClass('expanded') ? 'close' : 'open';
                eval('onclick = ' + button.onclick.toString().replace(/(\'|\")[^\'\"]*(\'|\")(|\s)\)/, "'" + code + "')"));
                button.onclick = onclick;
            }
        },
    };

    $(document).ready(function() {
        window.SearchHeader = new SEARCH_HEADER();
    });

})(jQuery, window);
