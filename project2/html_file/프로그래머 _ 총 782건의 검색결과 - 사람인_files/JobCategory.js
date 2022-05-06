define([
    "require", "jquery", "lodash", "Common", "Util", "Template", "DepthAbstract", "AutoComplete", "Preview", "main/Keyword"
], function (require, $, _, Common, Util, Template, DepthAbstract, AutoComplete, Preview, Keyword) {
    "use strict";

    var _self,
        _VARIABLES = {
            API_URL: "/zf_user/jobs/api/auto-complete",
        };

    var JobCategory = function () {
        this.name = "job_category";
        this.data = {
            text: "직업",
            stateId: "cat_kewd",
            stateIdCheckedAll: ["cat_mcls"],
        };
        this.type = "main";
        this.$wrapper = $("div.job_category_section");

        this.homeTemplate = "sp_job_category_home_template";
        this.oneDepthTemplate = "sp_job_category_oneDepth_template";
        this.subDepthTemplate = "sp_job_category_subDepth_template";

        this.lastDepthArea = "sp_job_category_subDepth";

        this.params = {};
        this.eventFlowName = "job";

        // setTimeout 실행 변수
        this.timeOut = {};
    };

    JobCategory.prototype = _.create(DepthAbstract.prototype, {
        constructor: JobCategory,

        init: function () {
            _self = this;
            _self.initLogging();
            _self.initOptions();
            _self.initVariables();

            _self.bindEvents();
            _self.generateDefaultDepth();
           // _self.filterRecentlyKeyword();
            _self.AutoComplete.init();
            _self.initParams();


            return _self;
        },

        initOptions: function () {
            _self.options = Common.getOption(_self.name);
            _self.upperCodes = Common.getUpperCodes("cat_kewd", "MCLS_CD_NO");
            _self.kewdCdCount = _self.getKewdCdCount();
            _self.isSectionHome = true;

            _self.params.cat_mcls = Common.getParamToArray("cat_mcls");
            _self.params.cat_kewd = Common.getParamToArray("cat_kewd");

            if (_self.params.cat_mcls.length > 0 || _self.params.cat_kewd.length > 0) {
                _self.isSectionHome = false;
            }
        },

        initVariables: function () {
            _self.$homeWarpper = this.$wrapper.find("div.box_jobs");
            _self.$panelWarpper = this.$wrapper.find("div.box_detail_jobs");

            _self.$depth1 = _self.$wrapper.find(".depth1");
            _self.$depth2 = _self.$wrapper.find(".depth2");
        },

        initParams: function () {
            Common.setEnabledAlert(false);

            if (!_self.isSectionHome) {
                for (var key in _self.params.cat_mcls) {
                    _self.$panelWarpper.find('[name="cat_mcls[]"]').filter('[data-code="' + _self.params.cat_mcls[key] + '"]').triggerClick();
                }

                for (var key in _self.params.cat_kewd) {
                    _self.$panelWarpper.find('[name="cat_kewd[]"]').filter('[data-code="' + _self.params.cat_kewd[key] + '"]').triggerClick();
                }
            }

            Common.setEnabledAlert(true);
        },

        validate: function () {
            var action = Common.getParam("action");
            if (action === "unified") {
                return true;
            }
            var currentSelectedCount =
                this.$wrapper.find(".details :checkbox:checked").length +
                this.$wrapper.find('.details button[name="cat_kewd[]"].on').length;
            if (currentSelectedCount === 0 && action === "job-category") {
                alert("선택한 직업이 없습니다.\n희망 직업을 선택하세요.");
                _self.showDefaultSection("area");
                return false;
            }
            return true;
        },

        bindEvents: function () {
            // 메인패널 1depth 선택
            _self.$homeWarpper.on("click", "button.btn_job", function () {
                _self.generateSubDepth($(this).data("mcls_cd_no"));
            });

            // 패널 1 depth 선택
            _self.$panelWarpper.find(".box_onedepth .wrap_scroll .list").on("click", "button.first_depth", function () {
                if ($(this).closest(".item_job ").hasClass("on")) {
                    return;
                }
                _self.generateSubDepth($(this).data("mcls_cd_no"));
            });

            // 2depth 패널 선택, 3depth 펼치기/접기 토글
            _self.$panelWarpper.on("click", "dt:has(button.btn_expand)", function () {
                $(this).closest(".row_item").toggleClass("expand");

                Util.Layer.arrangeJobCategoryDepthTinyScrollbar();

                // ga 이벤트 로깅 - 2depth 하위 3depth 펼치기
                if ($(this).closest(".row_item").hasClass("expand")) {
                    Common.Logging.pushDataLayer(
                        "ga_lead",
                        Common.Logging.getEventAction(),
                        "job_depth2_open",
                        $(this).data("scls_cd_no")
                    );
                }
            });

            // 3depth 패널내 정렬 (기본,카운트많은순,가나다순)
            _self.$panelWarpper.on("change", "select.select_sort", function () {
                var sortFlag = this.value,
                    $areaList = $(this).closest('.box_detail_depth').find('.area_list');

                $areaList.each(function () {
                    var $items = $(this).find("button.btn_three_depth");

                    $items.sort(function (a, b) {
                        switch (sortFlag) {
                            case "default":
                            case "name":
                                // var korRegExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/,
                                //     engRegExp = /[a-zA-Z]/;
                                //
                                // var firstTextA = $(a).data('kewd_cd_nm').substr(0,1),
                                //     firstTextB = $(b).data('kewd_cd_nm').substr(0,1),
                                //     textTypeA = korRegExp.test(firstTextA) ? 1 : (engRegExp.test(firstTextA) ? 2 : 3),
                                //     textTypeB = korRegExp.test(firstTextB) ? 1 : (engRegExp.test(firstTextB) ? 2 : 3);
                                //
                                // if(textTypeA === textTypeB){
                                //     return $(a).data('kewd_cd_nm').toUpperCase() <= $(b).data('kewd_cd_nm').toUpperCase() ? -1 : 1;
                                // } else {
                                //     return textTypeA < textTypeB ? -1 : 1;
                                // }
                                return $(a).data("sort") <= $(b).data("sort") ? -1 : 1;
                            case "favor":
                                if ($(a).data("count") === $(b).data("count")) {
                                    return $(a).data("sort") <= $(b).data("sort") ? -1 : 1;
                                }
                                return $(a).data("count") > $(b).data("count") ? -1 : 1;
                        }
                    });

                    $(this).append($items);
                });

                _self.$panelWarpper.find('select.select_sort').not(this).val(sortFlag);

                // ga 이벤트 로깅 - 3depth 키워드 정렬변경
                Common.Logging.pushDataLayer(
                    "ga_lead",
                    Common.Logging.getEventAction(),
                    "job_keywordsort",
                    sortFlag
                );
            });

            // 1depth 전체 선택
            _self.$panelWarpper.on("change", "input.select_all", function () {
                var $this = $(this);

                if (!_self.validateCheckedCount($this)) {
                    $this.prop("checked", false);
                    return false;
                }

                if (!Common.Logging.getEventFlow()) {
                    Common.Logging.setEventFlow(_self.eventFlowName + "_depth1");
                }

                _self.setPreviewAndState($this);
                _self.addSelectedClass($this.data("mcls_cd_no"), $this.data("code"));
                _self.showSelectedCountAndTitle($this);
            });

            // 3depth 키워드 선택
            _self.$panelWarpper.on("click", ".row.list button.btn_three_depth", function () {
                    var $this = $(this);

                    if (!_self.validateCheckedCount($this)) {
                        return false;
                    }

                    if (!Common.Logging.getEventFlow()) {
                        Common.Logging.setEventFlow(_self.eventFlowName + "_depth3");
                    }

                    _self.setPreviewAndState($this);
                    _self.addSelectedClass($this.data("mcls_cd_no"), $this.data("code"));
                    _self.showSelectedCountAndTitle($this);
                }
            );

            // 최근본 메뉴 선택
            _self.$wrapper.find("div.recently_keyword").on("click", "button", function () {
                var mclsCdNo = $(this).data("mcls_cd_no"),
                    kewdCdNo = $(this).data("kewd_cd_no"),
                    code = $(this).data("code");

                var $subdepth = _self.generateSubDepth(mclsCdNo);

                // logging param
                Common.Logging.setEventFlow(_self.eventFlowName + "_recently");
                Common.Logging.setLoggingValue($(this).index());

                switch (code) {
                    case mclsCdNo:
                        $subdepth.find('[name="cat_mcls[]"]').filter('[data-code="' + code + '"]').triggerClick();
                        break;
                    case kewdCdNo:
                        $subdepth.find('[name="cat_kewd[]"]').filter('[data-code="' + code + '"]').triggerClick();
                        break;
                }
            });
        },

        generateDefaultDepth: function () {
            var _self = this,
                tmplData = {mclsList: []},
                optionsData = !_self.options ? Common.getOption(_self.name) : _self.options;

            _.forEach(optionsData, function (mclsData) {
                tmplData.mclsList.push({
                    mclsCdNo: mclsData.MCLS_CD_NO,
                    mclsCdNm: mclsData.MCLS_CD_NM,
                    count: mclsData.COUNT,
                });
            });

            var $homeTmpl = $(Template.get(_self.homeTemplate, tmplData)),
                $oneDepthTmpl = $(Template.get(_self.oneDepthTemplate, tmplData));

            $("#" + _self.homeTemplate).after($homeTmpl);
            $("#" + _self.oneDepthTemplate).after($oneDepthTmpl);

            if (!_self.isSectionHome) {
                var mclsCdNo = [].concat(_self.params.cat_mcls, _self.upperCodes);

                for (var key in mclsCdNo) {
                    _self.generateSubDepth(mclsCdNo[key], key != mclsCdNo.length - 1);
                }
            }
        },

        generateSubDepth: function (mclsCdNo, displayNone) {
            var optionsData = !_self.options ? Common.getOption(_self.name) : _self.options,
                subOptionsData = optionsData.filter(function (row) {
                    return row["MCLS_CD_NO"] == mclsCdNo;
                }).shift();

            // 패널에 노출중이지 않은 1depth 는 생략
            if (subOptionsData['COUNT'] == 0) {
                return '';
            }

            
            var $subDepthArea = $("#" + _self.lastDepthArea + "_" + mclsCdNo);

            if ($subDepthArea.length === 0) {
                var tmplData = {
                    mclsCdNo: subOptionsData.MCLS_CD_NO,
                    mclsCdNm: subOptionsData.MCLS_CD_NM,
                    sclsList: [],
                };

                _.forEach(subOptionsData.SMALL_LIST, function (sclsData) {
                    var tmplRowData = {
                            mclsCdNo: subOptionsData.MCLS_CD_NO,
                            mclsCdNm: subOptionsData.MCLS_CD_NM,
                            sclsCdNo: sclsData.SCLS_CD_NO,
                            sclsCdNm: sclsData.SCLS_CD_NM,
                            kewdList: [],
                        },
                        sort = 0;

                    _.forEach(sclsData.KEYWORD_LIST, function (kewdData) {
                        tmplRowData.kewdList.push({
                            kewdCdNo: kewdData.KEWD_CD_NO,
                            kewdCdNm: kewdData.KEWD_CD_NM,
                            count: kewdData.COUNT,
                            sort: sort++,
                        });
                    });

                    if (tmplRowData.kewdList.length === 0) {
                        return;
                    }

                    tmplData.sclsList.push(tmplRowData);
                });

                $subDepthArea = $(Template.get(_self.subDepthTemplate, tmplData)).attr(
                    "id",
                    this.lastDepthArea + "_" + mclsCdNo
                );

                // 공고 0건인 직종 숨김처리
                $subDepthArea.find('button[name="cat_kewd[]"]').each(function(){
                    if ($(this).data('count') == '0') {
                        $(this).addClass('hide').css('display', 'none');
                    }
                });

                // 3depth 키워드가 없는 2depth 제거
                $subDepthArea.find('.row_item').each(function () {
                    if ($(this).find('button[name="cat_kewd[]"]').not('.hide').length == 0) {
                        $(this).remove();
                    }
                });

                $("#" + _self.subDepthTemplate).after($subDepthArea);
            }

            if (displayNone) {
                $subDepthArea.hide();
                return $subDepthArea;
            }

            // 기존 sort값 유지 및 3depth 키워드 재정렬
            if ($("#" + _self.subDepthTemplate).siblings(".box_detail_depth.on").length > 0) {
                var sortFlag = $("#" + _self.subDepthTemplate).siblings(".box_detail_depth.on").find('select.select_sort').val();

                $subDepthArea.find('select.select_sort').val(sortFlag).trigger('change');
            }

            $("#" + _self.subDepthTemplate).siblings(".box_detail_depth").removeClass("on").hide();
            $subDepthArea.addClass("on").show();

            _self.$panelWarpper.find("#depth1_btn_" + mclsCdNo).addClass("on").siblings(".on").removeClass("on");

            if (!_self.$panelWarpper.is(":visible") || _self.$homeWarpper.is(":visible")) {
                _self.$panelWarpper.show();
                _self.$homeWarpper.hide();
            }

            Util.Layer.arrangeJobCategoryDepthTinyScrollbar();

            // ga 이벤트 로깅 - 1depth 하위 2depth 펼치기
            Common.Logging.pushDataLayer("ga_lead", Common.Logging.getEventAction(), "job_depth1_open", mclsCdNo);

            return $subDepthArea;
        },

        setPreviewAndState: function ($this) {
            var _self = this;
            var value = $this.data("code"),
                previewId = "sp_preview_" + _self.name + "_" + value,
                elementId = $this.attr("name").replace("[]", ""),
                mclsCdNo = $this.data("mcls_cd_no"),
                mode;

            switch (elementId) {
                case "cat_kewd":
                    mode = $this.hasClass("on") ? "del" : "add";

                    var $catMcls = $this.closest(".box_detail_depth").find('[name="cat_mcls[]"]'),
                        mclsPreviewId = "sp_preview_" + _self.name + "_" + $catMcls.data("code"),
                        mclsElementId = $catMcls.attr("name").replace("[]", "");

                    if ($catMcls.prop("checked")) {
                        Common.removeState(mclsElementId, mclsPreviewId);
                        Preview.remove(mclsPreviewId);

                        _self.addSelectedClass($catMcls.data("mcls_cd_no"), $catMcls.data("code"));
                        $catMcls.prop("checked", false);

                        $("#search_cat_mcls_" + $catMcls.data("code")).prop("checked", false);
                    }
                    break;
                case "cat_mcls":
                    mode = $this.prop("checked") === false ? "del" : "add";

                    if ($this.closest(".box_detail_depth").find('[name="cat_kewd[]"]').filter(".on").length > 0) {
                        $this.closest(".box_detail_depth").find('[name="cat_kewd[]"]').filter(".on").each(function () {
                            var $catKewd = $(this),
                                kewdPreviewId = "sp_preview_" + _self.name + "_" + $catKewd.data("code"),
                                kewdElementId = $catKewd.attr("name").replace("[]", "");

                            Common.removeState(kewdElementId, kewdPreviewId);
                            Preview.remove(kewdPreviewId);

                            $catKewd.removeClass("on");

                            $("#search_cat_kewd_" + $catKewd.data("code")).prop("checked", false);
                        });
                    }
                    break;
            }

            if (mode === "add") {
                Common.setState(elementId, previewId, value);

                Preview.append(previewId, _self.getPreviewText($this), "", function () {
                    Common.removeState(elementId, previewId, value);

                    $this.prop("checked", false).trigger("change");
                    _self.addSelectedClass(mclsCdNo, value);
                    _self.showSelectedCountAndTitle($this);

                    // 자동완성 visible 일 경우 hide 처리
                    var $searchForm = $("#search_panel_form");
                    if (!$searchForm.find(".wrap_auto_keyword").has($this.target).length) {
                        $searchForm.find(".wrap_result").hide();
                    }
                });

                // ga 이벤트 로깅 - 1depth 전체, 3depth 키워드 선택
                var eventFlow = Common.Logging.getEventFlow(),
                    loggingValue = Common.Logging.getLoggingValue() || value;

                Common.Logging.pushDataLayer("ga_lead", Common.Logging.getEventAction(), eventFlow, loggingValue);
                Common.Logging.trackEvent("panel_search", Common.Logging.getEventAction(), eventFlow, loggingValue);
            } else {
                Common.removeState(elementId, previewId);
                Preview.remove(previewId);
            }

            // Logging 값 초기화
            Common.Logging.setEventFlow("");
            Common.Logging.setLoggingValue("");
        },

        getPreviewText: function ($this) {
            var previewText = [],
                mclsCdNm = $this.data("mcls_cd_nm"),
                kewdCdNm;

            switch ($this.attr("name")) {
                case "cat_mcls[]":
                    previewText.push(mclsCdNm + " 전체");
                    break;
                case "cat_kewd[]":
                    kewdCdNm = $this.data("kewd_cd_nm");

                    previewText.push(mclsCdNm);
                    previewText.push(kewdCdNm);
                    break;
            }

            return previewText.join(" > ");
        },

        getSelectedTitle: function (key, code) {
            var $el = _self.$panelWarpper.find('[name="' + key + '[]"]').filter('[data-code="' + code + '"]');

            if ($el.length === 0) {
                return "";
            }

            switch (key) {
                case "cat_mcls":
                    return $el.data("mcls_cd_nm");
                case "cat_kewd":
                    return $el.data("kewd_cd_nm");
                default:
                    return "";
            }
        },

        addSelectedClass: function (mclsCdNo, kewdCdNo) {
            if (kewdCdNo && mclsCdNo !== kewdCdNo) {
                var $kewdBtn = _self.$panelWarpper.find("button.btn_three_depth").filter('[data-code="' + kewdCdNo + '"]');

                if (Common.getState("cat_kewd", "sp_preview_job_category_" + kewdCdNo) !== null) {
                    $kewdBtn.addClass("on");
                } else {
                    $kewdBtn.removeClass("on");
                }
            }

            var $kewdList = _self.$panelWarpper.find("#sp_job_category_subDepth_" + mclsCdNo),
                $mclsBtn = _self.$panelWarpper.find("button.first_depth").filter('[data-mcls_cd_no="' + mclsCdNo + '"]');

            if ($kewdList.find("button.btn_three_depth.on").length > 0 || $kewdList.find('[name="cat_mcls[]"]').prop("checked") === true) {
                $mclsBtn.closest(".item_job").addClass("selected");
            } else {
                $mclsBtn.closest(".item_job").removeClass("selected");
            }
        },

        AutoComplete: {
            init: function () {
                _self.AutoComplete.$wrapper = _self.$wrapper.find(".wrap_auto_keyword");

                _self.autoCompleteInstance = new AutoComplete({
                    url: _VARIABLES.API_URL,
                    params: {domain: _self.name},
                    target: _self.AutoComplete.$wrapper.find("#" + _self.name + "_ipt_keyword"),
                    minimum_character_length: 1,
                    useKeyEvent: true,
                    result: {
                        wrapper: _self.AutoComplete.$wrapper.find("#autocomplete_has_result"),
                        list: _self.AutoComplete.$wrapper.find(".list_keyword"),
                        none: _self.AutoComplete.$wrapper.find("#autocomplete_no_result"),
                    },
                    button: {remove: _self.AutoComplete.$wrapper.find(".btn_delete")},
                    callback: {
                        bindEvents: _self.AutoComplete.bindEvents,
                        search: {
                            generate: _self.AutoComplete.search,
                            post: function () {
                                this.$resultList.find(":checkbox:checked").trigger("change");
                            },
                            isEmpty: _self.AutoComplete.isEmpty,
                            applyFilter : _self.AutoComplete.applyFilter,
                        },
                    },
                });
            },

            /** @this AutoComplete */
            bindEvents: function () {
                var instance = this;

                this.$resultList.on('click', 'input[name="search_cat_mcls[]"]', function () {
                    Common.Logging.setEventFlow('job_inputbox');

                    _self.AutoComplete.clickItem.call(instance, 'cat_mcls', $(this));
                }).on('click', 'input[name="search_cat_kewd[]"]', function () {
                    Common.Logging.setEventFlow('job_inputbox');

                    _self.AutoComplete.clickItem.call(instance, 'cat_kewd', $(this));
                }).on('click', 'input[name="search_keyword"]', function(){
                    var keyword = $(this).val();

                    Keyword.diffusionKeyword(keyword);
                    _self.AutoComplete.$wrapper.find("#" + _self.name + "_ipt_keyword").val("").trigger("keyup");
                });

                this.$result.on('change', '#search_check_all_job_category', function(){
                    var $autoComplete = _self.autoCompleteInstance.$resultList.find(
                        'input[name="search_cat_kewd[]"]'
                    );

                    Common.Logging.sendRecommendClickUrl($(this));

                    if ($(this).prop("checked")) {
                        var state = Common.state,
                            catMclsCnt = state.cat_mcls ? Object.keys(state.cat_mcls).length : 0,
                            catKewdCnt = state.cat_kewd ? Object.keys(state.cat_kewd).length : 0,
                            maxCnt = Common.searchMaxCount[_self.name];

                        $autoComplete = $autoComplete.not(":checked");

                        if (maxCnt - (catMclsCnt + catKewdCnt + $autoComplete.length) <= 0) {
                            alert("직업은 30개까지 선택 가능합니다.");
                            $(this).prop("checked", false);
                            return;
                        }
                    } else {
                        $autoComplete = $autoComplete.filter(":checked");
                    }

                    $autoComplete.each(function () {
                        _self.AutoComplete.clickItem.call(_self, "cat_kewd", $(this));
                    });

                    $autoComplete.prop("checked", $(this).prop("checked"));
                });

                _self.AutoComplete.$wrapper.find(".btn_close").on("click", this.reset.bind(this));
            },

            /** @this AutoComplete */
            search: function (response, keyword) {
                var tmplData = {keyword: keyword, list: []},
                    noneMathTmplData = {type: "keyword", name: "search_keyword", text: keyword},
                    optionsData = !_self.options ? Common.getOption(_self.name) : _self.options;

                _.forEach(response.result_list, function (val) {
                    var text = [],
                        mclsCdInfo = optionsData.filter(function (row) {
                            return row["MCLS_CD_NO"] == val.mcls_cd_no;
                        }).shift(),
                        sclsCdInfo = mclsCdInfo.SMALL_LIST ? mclsCdInfo.SMALL_LIST.filter(function (row) {
                            return row["SCLS_CD_NO"] == val.scls_cd_no;
                        }).shift() : {};

                    text.push(mclsCdInfo.MCLS_CD_NM);
                    text.push(sclsCdInfo.SCLS_CD_NM);
                    text.push(val.kewd_cd_nm);

                    tmplData.list.push({
                        type: "cat_kewd",
                        name: "search_cat_kewd",
                        kewdCdNo: val['kewd_cd_no'],
                        sclsCdNo: val['scls_cd_no'],
                        mclsCdNo: val['mcls_cd_no'],
                        code: val['kewd_cd_no'],
                        text: text.join(" > "),
                        checked: _self.isExist("cat_kewd", val['kewd_cd_no']) ? "checked" : "",
                        clickUrl: val['click_url'] ? val['click_url'] : '',
                    });

                    if(val.kewd_cd_nm.toLowerCase() == keyword.toLowerCase()){
                        noneMathTmplData.text = '';
                    }
                });

                var allChecked = true;
                for (var i in tmplData.list) {
                    if (tmplData.list[i]['checked'] != 'checked') {
                        allChecked = false;
                    }
                }

                // 검색결과 전체선택
                var $allCheck = $("<div>", {class: "area_check_all inpChk"}).append(
                    $("<input>", {type: "checkbox", id: "search_check_all_job_category"}).prop('checked', allChecked),
                    $("<label>", {class: "lbl", for: "search_check_all_job_category"}).text("검색결과 전체 선택")
                );

                _self.autoCompleteInstance.$resultList.closest(".wrap_result").find(".area_check_all").remove();
                _self.autoCompleteInstance.$resultList.closest(".wrap_scroll").after($allCheck);

                // ga 이벤트 로깅 - 자동완성 리스트 렌딩
                if (typeof _self.timeOut["ga_auto_complete"] !== "undefined") {
                    clearTimeout(_self.timeOut["ga_auto_complete"]);
                }

                _self.timeOut["ga_auto_complete"] = setTimeout(function () {
                    Common.Logging.pushDataLayer("ga_lead", Common.Logging.getEventAction(), "job_inputbox_open", "");
                }, 1000);

                var listTmpl = Template.get("sp_" + _self.name + "_auto_complete_tmpl", tmplData);

                if(noneMathTmplData.text != ''){
                    listTmpl = Template.get("sp_" + _self.name + "_auto_complete_none_result_tmpl", noneMathTmplData) + listTmpl;
                }

                return listTmpl;
            },

            isEmpty: function (response) {
                if (response.result_count > 0) {
                    return false;
                }

                var $empty = _self.autoCompleteInstance.$resultNone.find("p.empty"),
                    keyword = _self.autoCompleteInstance.params.seed;

                $empty.find(".go_link").remove();

                $empty.append(
                    $("<a>", {href: "#add_keyword", class: "go_link"}).append(
                        $("<span>", {class: "txt_point"}).text(keyword),
                        " 키워드 검색어로 추가"
                    ).on("click", function () {
                        Keyword.diffusionKeyword(keyword);
                        _self.AutoComplete.$wrapper.find("#" + _self.name + "_ipt_keyword").val("").trigger("keyup");
                    })
                );

                _self.autoCompleteInstance.$result.hide();
                _self.autoCompleteInstance.$resultNone.show();
                return true;
            },

            applyFilter: function (response) {
                if (response && response.result_list && response.result_list.length > 0) {
                    response.result_list = _.filter(response.result_list, function (row) {
                        return !_self.kewdCdCount[row.kewd_cd_no] || _self.kewdCdCount[row.kewd_cd_no] == 0 ? false : true;
                    });

                    response.result_count = response.result_list.length;
                }

                return response;
            },

            /** @this AutoComplete */
            clickItem: function (type, $el) {
                var code = parseInt($el.val()),
                    mclsCdNo = parseInt($el.data("mcls_cd_no"));

                var $subDepthArea = $("#" + _self.lastDepthArea + "_" + mclsCdNo),
                    $targetEl;

                if ($subDepthArea.length === 0) {
                    _self.generateSubDepth(mclsCdNo, true);
                    $subDepthArea = $("#" + _self.lastDepthArea + "_" + mclsCdNo);
                }

                if (code === mclsCdNo) {
                    $targetEl = $subDepthArea.find('[name="cat_mcls[]"]');
                    $targetEl.prop("checked", $el.prop("checked"));
                } else {
                    $targetEl = $subDepthArea.find('[name="cat_kewd[]"]').filter('[data-code="' + code + '"]');
                }

                if (!_self.validateCheckedCount($targetEl)) {
                    $el.prop("checked", false);
                    return false;
                }

                _self.setPreviewAndState($targetEl);
                _self.addSelectedClass($targetEl.data("mcls_cd_no"), $targetEl.data("code"));
                _self.showSelectedCountAndTitle($targetEl);
            },

            /** @this AutoComplete */
            reset: function (type, code) {
                this.$resultList.find('input[name="search_' + type + '[]"]:checked').filter('[value="' + code + '"]').triggerClick();
            },
        },

        // 자동완성에서 선택시 html 요소가 없다면 그리기
        makeLastDepth: function (code, bcode) {
            _self.generateSubDepth(bcode, true);
            _self.appendLastDepth(code, bcode, true);
            _self.resizeForTinyScrollbar();
        },

        isExist: function (type, code) {
            switch (type) {
                case "cat_mcls":
                    return (
                        _self.$wrapper.find('.box_detail_depth [name="cat_mcls[]"]:checked').filter('[data-code="' + code + '"]').length > 0
                    );
                case "cat_kewd":
                    return (
                        _self.$wrapper.find('.box_detail_depth [name="cat_kewd[]"].on').filter('[data-code="' + code + '"]').length > 0
                    );
            }
        },

        getCheckedEl: function () {
            return _self.$wrapper.find(".depth_check :checkbox:checked");
        },

        getKewdCdCount: function () {
            var kewdCdCount = {},
                mclsList = _self.options,
                sclsList = [],
                kewdList = [];

            for (var mclsIdx in mclsList) {
                sclsList = mclsList[mclsIdx]['SMALL_LIST'];

                for (var sclsIdx in sclsList) {
                    kewdList = sclsList[sclsIdx]['KEYWORD_LIST'];

                    for (var kewdIdx in kewdList) {
                        kewdCdCount[kewdList[kewdIdx]['KEWD_CD_NO']] = kewdList[kewdIdx]['COUNT'];
                    }
                }
            }
            return kewdCdCount;
        }
    });

    return new JobCategory();
});
