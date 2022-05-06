define([
    "jquery", "lodash"
], function ($, _) {
    "use strict";

    var _exceptionCodes = {};

    var Util = {
        alert: function (msg) {
            alert(msg);
        },
        String: {
            disallowPattern: /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9:\-()\[\]&,.·+#~\/]$/gi,
            trim: function (str) {
                return _.trim(str);
            },
            replaceAll: function (search, replace, subject) {
                var re = new RegExp("(" + _.escapeRegExp(search) + ")", "gi");
                return subject.toString().replace(re, replace);
            },
            isAllowed: function (str) {
                return !this.disallowPattern.test(str);
            },
            removeDisallowed: function (str) {
                return str.replace(this.disallowPattern, "");
            },
            removeSpace: function (str) {
                return str.replace(/\s/g, "");
            },
        },
        Number: {
            toStringByComma: function (val) {
                return val.toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
            },
        },
        Lang: {
            // 입력 받은 인자가 전부 숫자인지 체크
            isNumberAll: _.restParam(function (args) {
                return _.every(args, Number);
            }),

            // 입력 받은 값이 빈 값인지 체크
            isEmpty: function (obj) {
                return _.isEmpty(obj) && !_.isNumber(obj);
            },

            // 입력 받은 인자가 전부 빈 값인지 체크
            isEmptyAll: _.restParam(function (args) {
                return _.every(args, function (obj) {
                    return Util.Lang.isEmpty(obj);
                });
            }),

            // 입력 받은 배열이 전부 빈 값인지 체크
            isEmptyAllByArr: function (arr) {
                return _.every(arr, function (obj) {
                    return Util.Lang.isEmpty(obj);
                });
            },

            // 입력 받은 selector 값이 전부 빈 값인지 체크
            isEmptyAllBySelector: function ($wrapper, arr) {
                return _.every(arr, function (selector) {
                    return Util.Lang.isEmpty($wrapper.find(selector).val());
                });
            },

            // 입력 받은 인자 중 한개 이상 빈 값이 있는지 체크
            isEmptyAnything: _.restParam(function (args) {
                return _.some(args, function (obj) {
                    return Util.Lang.isEmpty(obj);
                });
            }),

            // 입력 받은 인자 중 한개 이상 값이 있는지 체크
            isNotEmptyAnything: _.restParam(function (args) {
                return _.some(args, function (obj) {
                    return !Util.Lang.isEmpty(obj);
                });
            }),
        },
        Array: {
            has: function (val, arr) {
                return _.indexOf(arr, val) !== -1;
            },
        },
        Object: {
            first: function (obj) {
                if (_.isArray(obj)) {
                    return _.first(obj);
                }
                if (_.isPlainObject(obj)) {
                    return _.first(_.values(obj));
                }
                return obj;
            },
        },
        Element: {
            initValue: _.restParam(function (args) {
                _.forEach(args, function ($obj) {
                    $obj.val("");
                });
            }),
        },
        Event: {
            KEYCODE: {
                LEFT_CLICK: 1,
                BACKSPACE: 8,
                TAB: 9,
                ENTER: 13,
                SPACE: 32,
                LEFT_ARROW: 37,
                RIGHT_ARROW: 39,
                UP: 38,
                DOWN: 40,
                DELETE: 46,
                ZERO: 48,
                NINE: 57,
                DOT: 190,
            },
        },
        Http: {
            ajax: function (url, data, type, dataType, async) {
                if (typeof async === "undefined") {
                    async = true;
                }
                return $.ajax({
                    type: type || "get",
                    url: url,
                    data: data,
                    dataType: dataType || "json",
                    async: async,
                });
            },
        },
        Layer: {
            show: function ($el, callback) {
                $el.show();
                if (_.isFunction(callback)) {
                    callback();
                }
            },
            hide: function ($el, callback) {
                $el.hide();
                if (_.isFunction(callback)) {
                    callback();
                }
            },
            clonePosition: function ($target, $source, options) {
                options = _.merge(
                    {
                        setTop: true,
                        setLeft: true,
                        setWidth: false,
                        setHeight: false,
                        offsetTop: 0,
                        offsetLeft: 0,
                    },
                    options || {}
                );

                var css = {};
                if (options.setTop) {
                    css.top = $source.position().top + options.offsetTop;
                }
                if (options.setLeft) {
                    css.left = $source.position().left + options.offsetLeft;
                }
                if (options.setWidth) {
                    css.width = $source.outerWidth();
                }
                if (options.setHeight) {
                    css.height = $source.outerHeight();
                }

                $target.css(css);
            },
            // resizeDetailForTinyScrollbar: function() {
            //     $('.detail_option_section').find('.wrap_scroll').outerHeight(650);
            //     $(window).trigger('resize');
            // },
            arrangeDepthTinyScrollbar: function (fromDepth) {
                var $wrapSection = $("div.wrap_section_contents").find("div.option_content").not(".keyword_section").not(".subway_station_section"),
                    wrapScrollDepth1,
                    wrapScrollDepth2,
                    wrapScrollDepth3,
                    isLastDepthSpreadExpand = false,
                    $notiTxt,
                    //$notiTxtVisible,
                    scrollHeight,
                    $onEl,
                    $wrapDepthCategory;

                $.each($wrapSection, function () {
                    $notiTxt = $(this).find(".noti_txt");

                    // $notiTxtVisible = $notiTxt.is(':visible');
                    $notiTxt.css("height", 245);
                    // $notiTxt.hide();

                    $wrapDepthCategory = $(this)
                        .find(".area_btn")
                        .parents(".wrap_depth_category");

                    isLastDepthSpreadExpand = $wrapDepthCategory.hasClass("expand");
                    if (isLastDepthSpreadExpand) {
                        var tempHeight = -1;
                        $.each($wrapDepthCategory.find(".overview"), function () {
                            var tempOuterHeight = $(this).outerHeight();
                            if (tempHeight < tempOuterHeight) {
                                tempHeight = tempOuterHeight;
                            }
                        });
                        scrollHeight = tempHeight;
                    } else {
                        scrollHeight = 245;
                    }

                    wrapScrollDepth1 = $(this).find("div.wrap_scroll.depth1").filter(":visible");
                    wrapScrollDepth2 = $(this).find("div.wrap_scroll.depth2").filter(":visible");
                    wrapScrollDepth3 = $(this).find("div.wrap_scroll.depth_check").filter(":visible");

                    if (typeof fromDepth === "undefined") {
                        if (wrapScrollDepth1.length) {
                            $onEl = wrapScrollDepth1.find(".depth1_btn_wrapper.on");
                            if ($onEl.length) {
                                wrapScrollDepth1.data("plugin_tinyscrollbar").update($onEl.eq(0).position().top);
                                //wrapScrollDepth1.outerHeight(scrollHeight);
                            } else {
                                wrapScrollDepth1.data("plugin_tinyscrollbar").update(0);
                            }
                        }
                    }

                    if (typeof fromDepth === "undefined" || fromDepth === "depth1") {
                        if (wrapScrollDepth2.length) {
                            $onEl = wrapScrollDepth2.find(".depth2_btn_wrapper.on").filter(":visible");
                            if ($onEl.length) {
                                wrapScrollDepth2.data("plugin_tinyscrollbar").update($onEl.eq(0).position().top); // wrapScrollDepth2.outerHeight(scrollHeight);
                            } else {
                                wrapScrollDepth2.data("plugin_tinyscrollbar").update(0);
                            }
                        }
                    }

                    if (wrapScrollDepth3.length) {
                        $onEl = wrapScrollDepth3
                            .find("input[type=checkbox]:checked")
                            .filter(":visible");
                        if ($onEl.length) {
                            var temp = $onEl.eq(0).parent().position().top;

                            if (temp < wrapScrollDepth3.outerHeight() - $(".area_btn").outerHeight()) {
                                wrapScrollDepth3.data("plugin_tinyscrollbar").update(0);
                            } else {
                                wrapScrollDepth3.data("plugin_tinyscrollbar").update(temp);
                            }

                            //wrapScrollDepth3.outerHeight(scrollHeight);
                        } else {
                            wrapScrollDepth3.data("plugin_tinyscrollbar").update(0);
                        }
                    }

                    wrapScrollDepth1.outerHeight(scrollHeight);
                    wrapScrollDepth2.outerHeight(scrollHeight);
                    wrapScrollDepth3.outerHeight(scrollHeight);

                    // if ($notiTxtVisible) {
                    //     $notiTxt.css('height', scrollHeight);
                    //     $notiTxt.show();
                    // }

                    $notiTxt.css("height", scrollHeight);
                });

                // if (wrapScrollDetail.length) {
                //     wrapScrollDetail.data('plugin_tinyscrollbar').update(0);
                // }

                $(window).trigger("resize");
            },

            arrangeJobCategoryDepthTinyScrollbar: function () {
                var $wrapper = $("div.job_category_section"),
                    $panelWarpper = $wrapper.find("div.box_detail_jobs"),
                    $leftBox = $panelWarpper.find(".box_onedepth"),
                    $leftBoxScroll = $leftBox.find(".wrap_scroll"),
                    $rightBox = $panelWarpper.find(".box_detail_depth.on"),
                    $rightBoxScroll = $rightBox.find(".wrap_scroll"),
                    $wrapDetailBox = $wrapper.find(".details"),
                    $itemRows = $rightBoxScroll.find(".row_item"),
                    $focusEl = $(":focus"),
                    itemRowsHeight = 40,
                    maxHeight = 437;

                if ($wrapper.find(".box_jobs").css("display") !== "none") {
                    return;
                }

                $itemRows.each(function () {
                    itemRowsHeight += $(this).outerHeight();
                });

                var height = itemRowsHeight > maxHeight ? maxHeight : itemRowsHeight;

                $wrapDetailBox.css("maxHeight", height + "px");
                $leftBoxScroll.closest(".box_onedepth").css("height", height + "px");
                $rightBoxScroll.closest(".row.list").css("height", height - 40 + "px");

                var leftScroll = $leftBoxScroll.find(".on .first_depth").closest(".item_job").position().top,
                    maxLeftScroll = $leftBoxScroll.find(".on .first_depth").closest(".overview").height() - $leftBoxScroll.find(".on .first_depth").closest(".box_onedepth").height(),
                    rightScroll = 0,
                    maxRightScroll = 0;

                if (leftScroll > maxLeftScroll) {
                    leftScroll = maxLeftScroll;
                }

                if ($focusEl.hasClass("btn_expand")) {
                    maxRightScroll = $focusEl.closest(".overview").height() - $focusEl.closest(".row.list").height();
                    rightScroll = Math.abs(
                        parseInt($rightBoxScroll.find(".overview").css("top"))
                    );

                    if (maxRightScroll < 0) {
                        rightScroll = 0;
                    } else if (rightScroll > maxRightScroll) {
                        rightScroll = maxRightScroll;
                    }
                }

                $leftBoxScroll.tinyscrollbar().data("plugin_tinyscrollbar").update(leftScroll);
                $rightBoxScroll.tinyscrollbar().data("plugin_tinyscrollbar").update(rightScroll);


                // 펼치기 버튼 불필요한 경우 삭제처리
                if ($rightBox.is(':visible')) {
                    $rightBox.find('dl.row_item').each(function () {
                        var $sclsBtn = $(this).find('dt > button.btn_expand'),
                            $kewdBtns = $(this).find('dd > button[name="cat_kewd[]"]:visible'),
                            requiredExpand = 0,
                            kewdBtnPositionLeft = 0;

                        $kewdBtns.each(function () {
                            var position = $(this).position();

                            if (kewdBtnPositionLeft > position['left']) {
                                requiredExpand++;
                            }

                            kewdBtnPositionLeft = position['left'];
                        });

                        if (requiredExpand < 2) {
                            $sclsBtn.after("<span class='txt'>" + $sclsBtn.text() + "</span>");
                            $sclsBtn.remove();
                        }
                    });
                }
            },
        },
        Message: {
            bindData: function (msg, data) {
                if (Util.Lang.isEmpty(data)) {
                    return msg;
                }
                _.forEach(data, function (replace, search) {
                    msg = Util.String.replaceAll("{{" + search + "}}", replace, msg);
                });
                return msg;
            },
        },
        Cookie: {
            set: function (name, value, expireDays) {
                var todayDate = new Date();
                todayDate.setDate(todayDate.getDate() + expireDays);
                document.cookie = name + "=" + _.escape(value) + "; path=/; domain=.saramin.co.kr; expires=" + todayDate.toGMTString() + ";";
            },
            get: function (name) {
                var value = "";

                _.forEach(document.cookie.split("; "), function (cookie) {
                    var cookieArr = cookie.split("=");
                    if (cookieArr[0] === name) {
                        value = _.unescape(cookieArr[1]);
                        return false;
                    }
                });

                return value;
            },
        },
        Browser: {
            get: function () {
                var agent = navigator.userAgent.toLowerCase(),
                    name = navigator.appName,
                    browser = "";

                if (name === "Microsoft Internet Explorer" || agent.indexOf("trident") > -1 || agent.indexOf("edge/") > -1) {
                    browser = "ie";
                    if (name === "Microsoft Internet Explorer") {
                        // IE old version (IE 10 or Lower)
                        agent = /msie ([0-9]+[.0-9]+)/.exec(agent);
                        browser += parseInt(agent[1]);
                    } else {
                        // IE 11+
                        if (agent.indexOf("trident") > -1) {
                            // IE 11
                            browser += 11;
                        } else if (agent.indexOf("edge/") > -1) {
                            // Edge
                            browser = "edge";
                        }
                    }
                } else if (agent.indexOf("safari") > -1) {
                    // Chrome or Safari
                    if (agent.indexOf("opr") > -1) {
                        // Opera
                        browser = "opera";
                    } else if (agent.indexOf("chrome") > -1) {
                        // Chrome
                        browser = "chrome";
                    } else {
                        // Safari
                        browser = "safari";
                    }
                } else if (agent.indexOf("firefox") > -1) {
                    // Firefox
                    browser = "firefox";
                }

                return browser;
            },
            isIE8: function () {
                return this.get() === "ie8";
            },
            isUnderIE8: function () {
                return _.indexOf(["ie6", "ie7", "ie8"], this.get()) !== -1;
            },
            isUnderIE9: function () {
                return _.indexOf(["ie6", "ie7", "ie8", "ie9"], this.get()) !== -1;
            },
            isFirefox: function () {
                return this.get() === "firefox";
            },
        },
        Exception: {
            isError: function (code) {
                return _.has(_exceptionCodes, code);
            },
            getMessage: function (code) {
                return _.has(_exceptionCodes, code) ? _.get(_exceptionCodes, code) : "";
            },
        },
        swipe: function () {
            //S필터 스와이프
            var filterSwiper = "";
            var $swipe = $(".swiper-container");
            $swipe.find(".list_sfilter").show();
            $swipe.find(".filter_load").hide();
            var options = {
                slidesPerView: "auto",
                loop: false,
                setWrapperSize: true,
                preloadImages: true,
                updateOnImagesReady: true,
                navigation: {
                    nextEl: $swipe.find(".swiper-button-next"),
                    prevEl: $swipe.find(".swiper-button-prev"),
                },
            };
            try {
                filterSwiper = new Swiper($swipe, options);
            } catch (e) {
            } //최근 검색조건이 없을경우 swipe 할 s필터값 존재x

            // <> 버튼 클릭시 한번에 여러슬라이드 넘어가게끔
            $swipe.find(".swiper-button-next").on("click", function () {
                for (var i = 0; i < 3; i++) {
                    filterSwiper.slideNext();
                }
            });
            $swipe.find(".swiper-button-prev").on("click", function () {
                for (var i = 0; i < 3; i++) {
                    filterSwiper.slidePrev();
                }
            });

            try {
                //S필터 스와이프 <> 버튼
                filterSwiper.on("reachEnd", this.swipeAction.swipeEnd);
                filterSwiper.on("reachBeginning", this.swipeAction.swipeStart);
                filterSwiper.on("fromEdge", this.swipeAction.swipeMove);
            } catch (e) {
            }
        },
        swipeAction: {
            swipeEnd: function () {
                // 마지막 슬라이드 이벤트
                var $filter = $(".smart_filter");
                $filter.find(".info_btn .btn_next").attr("disabled", "disabled");
            },

            swipeStart: function () {
                //첫 슬라이드 이벤트
                var $filter = $(".smart_filter");
                $filter.find(".info_btn .btn_prev").attr("disabled", "disabled");
            },

            swipeMove: function () {
                // 슬라이드 진행 이벤트
                var $filter = $(".smart_filter");
                $filter.find(".info_btn .btn_next").removeAttr("disabled");
                $filter.find(".info_btn .btn_prev").removeAttr("disabled");
            },
        },
    };

    return Util;
});
