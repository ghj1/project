define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Template', 'DepthAbstract', 'AutoComplete', 'TabSlider'
], function (require, $, _, Common, Util, Template, DepthAbstract, AutoComplete) {
    'use strict';

    var _self,
        _VARIABLES = {
            'API_URL': '/zf_user/jobs/api/auto-complete'
        };

    var Subway = function () {
        this.name = 'subway';
        this.data = {
            text: '지하철역',
            stateId: 'subway_cd'
        };
        this.$wrapper = $('div.subway_section');
        this.oneDepthTemplate = 'sp_subway_1depth_template';
        this.oneDepthText = 'subway_city_name';
        this.subDepthTemplate = 'sp_subway_subDepth_template';
        this.lastDepthTemplate = 'sp_subway_lastDepth_template';
        this.lastDepthArea = 'sp_subway_lastDepth';
        this.subDepthArea = 'sp_subway_subDepth';
        this.$stationPanel = $('#select_station_panel');
        this.$stationAroundPanel = $('#subway_around_panel');
        this.stationTemplate = 'select_station_template';
        this.$slideArea = $('#subway_tab_slider_ul');
        this.$overlapStation = $('.wrap_subway_result .box_different');
        this.$subwayLoc      = $('.wrap_subway_result');

        this.params = {};
        this.subwayName = [];
        this.eventFlowName = 'subway';
        this.subwayInfo = { //광역별 역세권 코드 그룹핑
            gyeonggi: [101, 102, 103, 104, 105, 106, 107, 108, 109, 201, 202, 203, 301, 302, 303, 701, 901, 1001, 1101, 1201, 1301, 1501, 1601],
            daejeon : [801],
            daegu   : [501,502,503],
            gwangju : [601],
            busan   : [401, 402, 403, 404, 405, 406]
        };
    };

    Subway.prototype = _.create(DepthAbstract.prototype, {
        constructor: Subway,

        init: function() {
            _self = this;
            _self.initLogging();
            _self.initOptions();
            _self.initVariables();
            _self.bindEvents();
            _self.generateDefaultDepth(!_self.isSectionHome ? _self.oneDepthCode : []);
             _self.AutoComplete.init();
            _self.initParams();
            _self.generateDefaultStation(); // 사방역
            _self.defaultBindEvent();

            return _self;
        },

        initOptions: function() {
            _self.options        = Common.getOption(_self.name);
            _self.depth1Options  = Common.getOption(_self.name + '_1depth');
            _self.isSectionHome = true;

            var subway_mcd = Common.getParamToArray('subway_mcd'), subway_cd  = Common.getParamToArray('subway_cd');

            _self.oneDepthCode   = Common.getUpperCodes('subway_cd', 'mcode') || [];
            _self.subDepthCode   = Common.getUpperCodes('subway_cd', 'bcode') || [];

            if (!Util.Lang.isEmpty(subway_mcd)) {
                _self.oneDepthCode = subway_mcd;
                return;
            }

            _self.isSectionHome = _self.oneDepthCode.length > 0 && _self.subDepthCode.length === 0;
        },

        initVariables: function() {
            _self.$depth1        = _self.$wrapper.find('.depth1');
            _self.$depth2        = _self.$wrapper.find('.depth2');
            _self.lineClassMap = {
                
            }
        },

        // overriding
        // 기본 1depth append
        generateDefaultDepth: function (params) {
            var tmplData = { list : [] };

            _.forEach(Common.getOption(this.oneDepthText), function (val, key) {
                tmplData.list.push({
                    code: key, name: val, selected: (params.indexOf(key) > -1) ? 'selected' : ''
                });
            });

            $('#' + this.oneDepthTemplate).after(Template.get(this.oneDepthTemplate, tmplData));
        },

        initParams: function () {
            var subway_cd  = Common.getParamToArray('subway_cd'), subway_mcd = Common.getParamToArray('subway_mcd');

            Common.setEnabledAlert(false);

            if (_self.isSectionHome) {
                _self.$depth1.find('[data-code=' + _self.oneDepthCode[0] + ']')
                    .parent().addClass('on')
                    .children('button').triggerClick();
            }

            // 1depth 선택 후 subDepth 선택처리
            if (_self.$depth1.find('li.selected').length > 0) {
                _self.$depth1.find('li.selected').children('button').triggerClick();
                _self.$depth1.find('li.selected:first').addClass('on');

                var depth2AreaId = _self.$depth1.find('li.selected:first').children('button').attr('data-code');
                _self.$depth2.find('li.selected').children('button').triggerClick();
                $('#' + _self.subDepthArea + '_' + depth2AreaId).find('li.selected:first').addClass('on').children('button').triggerClick();
            }

            if (!Util.Lang.isEmpty(subway_cd)) {
                _.forEach(subway_cd, _self.initParam.bind(_self));
            }

            _self.$depth1.find('li.selected:first').children('button').triggerClick();
            _self.initTabIfParamIsInvalid();

            if (_self.$stationAroundPanel.find('#station_tab_slider').length > 0) {
                _self.$slideArea.find('li').each(function () {
                    var stationInfo = _self.getStationOption($(this).data('code')),
                        stationCount = stationInfo.option.count;

                    if(stationInfo.option.transfer.length > 0){
                        _.forEach(stationInfo.option.transfer, function (code) {
                            stationInfo = _self.getStationOption(code);
                            if(stationCount < stationInfo.option.count) {
                                stationCount = stationInfo.option.count;
                            }
                        });
                    }

                    $(this).find('.num').text('('+stationCount+')');
                });
            }

            Common.setEnabledAlert(true);
        },

        validate: function () {
            if (Common.getParam('action') === 'unified') {
                return true;
            }
            var currentSelectedCount = this.$wrapper.find('.wrap_depth_category :checkbox:checked').length;
            if (currentSelectedCount === 0 && Common.getParam('action') === 'subway') {
                alert('선택한 지하철역이 없습니다.\n지하철역을 선택하세요.');
                _self.showDefaultSection('job_category');
                return false;
            }
            return true;
        },

        bindEvents: function() {
            // 패널 1 depth 선택
            _self.$wrapper.find('div.wrap_scroll.depth1').on('click', 'button', function () {
                _self.generateSubDepth($(this).data('code'));
            });
            // 패널 2depth 선택
            _self.$wrapper.find('div.wrap_scroll.depth2').on('click', 'button', function () {
                if (Common.getParam('action') !== 'unified') { //통검 가변영역 - 역세권 추가로 인하여 중복 호출x (통검쪽 확인필요)
                    _self.generateLastDepth($(this).data('code'), $(this).data('bcode'), false);
                }
            });

            _self.$stationAroundPanel.on('click', '#subway_tab_slider_ul button.station', function () {
                _self.generateStation($(this).data('code'));
            });

            _self.$stationAroundPanel.find('#station_tab_slider').tabSlider({
                onSelected: function (obj) {
                    _self.generateStation(obj.data('code'));
                }
            });

            _self.$stationAroundPanel.on('click', 'button.btn_around_station', function () {
                //lastdepth 체크
                if ($('#'+_self.lastDepthArea+'_'+$(this).data('bcode')).length==0) {
                    _self.$depth1.find('button[data-code="'+$(this).data('mcode')+'"]').triggerClick();
                    _self.$depth2.find('button[data-code="'+$(this).data('bcode')+'"]').triggerClick();
                }

                _self.generateStation($(this).data('code'));

                // Logging 처리
                var eventAction = Common.Logging.getEventAction();
                Common.Logging.pushDataLayer('ga_lead', eventAction, 'around_station', '');
                Common.Logging.trackEvent('panel_search', eventAction, 'around_station', '');
            });

            // 최근본 메뉴 선택
            _self.$wrapper.find('div.recently_keyword').on('click', 'button', function () {
                var code = $(this).data('code').toString();

                // logging param
                Common.Logging.setEventFlow(_self.eventFlowName + '_recently');
                Common.Logging.setLoggingValue($(this).index());

                _self.makeLastDepth(code, _self.depth1Options[code]);

                var $target = _self.$wrapper.find('input:checkbox[id=subway_cd_' + code + ']'), mcode = code.replace(/([0-9]{2})$/i,'');

                _self.clickCheckBox($target, true);
                if (!_self.validateCheckedCount($target, true)) {
                    $target.prop('checked', false);
                    _self.setPreviewAndState($target);
                    return false;
                }
                _self.addSelectedClass(_self.depth1Options[code], mcode);
                _self.addTransfer($target);
                _self.showSelectedCountAndTitle($target);
            });

            _self.$stationPanel.on('click', 'button.btn_add', function () {
                _self.initParam($(this).data('code'));
            });

            _self.$overlapStation.on('change',function () {
                _self.generateStation($(this).val());
            });

            _self.$overlapStation.find(".btn_view_other").on("click",function () {
               $(this).toggleClass('open').siblings('.inbox').toggle();
            });

            _self.$overlapStation.on("click","button.overlap_btn",function(){
               var currentStation = $(this).text();
                _self.$overlapStation.find(".btn_view_other").text(currentStation).removeClass('open').siblings('.inbox').hide();
                _self.$overlapStation.find(".list_other_subway").children("li").removeClass("selected");
                $(this).parent("li").addClass("selected");
                var request = Util.Http.ajax('/zf_user/search/overlap-station', 'subway_cd='+$(this).data('code')+'&searchword='+$(this).data('name'));
                _self.generateStation($(this).data('code'));
                request.success(function (response){ //동일역세권명 선택시 해당 역세권공고리스트 비동기 호출
                    $("#subway_recruit_list").empty().html(response.innerHTML);
                    _self.getLocInfo(currentStation);
                });
            });

            _self.$stationAroundPanel.on('click', 'button.btn_around_station_prev', function () {
                window.open("/zf_user/jobs/list/subway?subway_cd="+$(this).data("code"),"_blank");
            });

            _self.$stationAroundPanel.on('click', 'button.btn_around_station_next', function () {
                window.open("/zf_user/jobs/list/subway?subway_cd="+$(this).data("code"),"_blank");
            });

            _self.$stationAroundPanel.on('click','.link_subway',function(){
                window.open("/zf_user/jobs/list/subway?subway_cd="+$(this).data("subway_cd")+$(this).data("params"),"_blank");
            });
        },

        AutoComplete: {
            init: function () {
                _self.AutoComplete.$wrapper = _self.$wrapper.find('.wrap_auto_keyword');

                _self.autoCompleteInstance = new AutoComplete({
                    'url': _VARIABLES.API_URL,
                    'params': {'domain': 10},
                    'target': _self.AutoComplete.$wrapper.find('#'+_self.name+'_ipt_keyword'),
                    'minimum_character_length': 2,
                    'useKeyEvent' : true,
                    'result': {
                        'wrapper': _self.AutoComplete.$wrapper.find('#autocomplete_has_result'),
                        'list'   : _self.AutoComplete.$wrapper.find('.list_keyword'),
                        'none'   : _self.AutoComplete.$wrapper.find('#autocomplete_no_result')
                    },
                    'button': {'remove': _self.AutoComplete.$wrapper.find('.btn_delete')},
                    'callback': {
                        'bindEvents': _self.AutoComplete.bindEvents,
                        'search': {
                            'generate': _self.AutoComplete.search,
                            'post': function() {
                                this.$resultList.find(':checkbox:checked').trigger('change');
                            }
                        }
                    }
                });
            },

            /** @this AutoComplete */
            bindEvents: function() {
                var instance = this;

                this.$target
                    .on('keydown', _self.AutoComplete.hidePlaceholder)
                    .on('blur', _self.AutoComplete.togglePlaceholder);

                this.$resultList
                    .on('click', 'input[name="search_subway_cd[]"]', function() {
                        _self.AutoComplete.clickItem.call(instance, 'subway_cd', $(this));
                    })
                ;

                _self.AutoComplete.$wrapper.find('.btn_close').on('click', this.reset.bind(this));

                _self.AutoComplete.togglePlaceholder.call(this.$target);
            },

            hidePlaceholder: function() {
                $(this).siblings('.placeholder').hide();
            },

            togglePlaceholder: function() {
                $(this).siblings('.placeholder').toggle(Util.Lang.isEmpty($(this).val()));
            },

            /** @this AutoComplete */
            search: function(response, keyword) {
                var tmplData = {'list': []};
                _.forEach(_.groupBy(response.result_list, 'keyword_info2'), function(list) {
                    var data = Util.Object.first(list),
                        code = data.keyword_info;
                    if (list.length > 1) {
                        code = _.pluck(list, 'keyword_info').join(',');
                    }
                    tmplData.list.push({
                        'type': 'subway_cd',
                        'name': 'search_subway_cd',
                        'id': _self.generateIdUsingCode(code),
                        'code': code,
                        'text': data.keyword_info2,
                        'description': data.keyword,
                        'checked': _self.isExist(code) ? 'checked="checked"' : ''
                    });
                });

                return Template.get('sp_'+_self.name+'_auto_complete_tmpl', tmplData);
            },

            /** @this AutoComplete */
            clickItem: function(type, $el) {
                var val       = $el.val(),
                    isChecked = $el.is(':checked'),
                    subwayCodes = val.split(',');

                if ($el.is(':checked')) {
                    _.forEach(subwayCodes, function(code) {
                        _self.makeLastDepth(code, _self.depth1Options[code]);
                    });
                }

                _.forEach(subwayCodes, function (code) {
                    // logging param
                    Common.Logging.setEventFlow(_self.eventFlowName + '_inputbox');
                    var $target = _self.$wrapper.find('input:checkbox[id=' + type + '_' + code + ']');
                    _self.clickCheckBox($target, $el.is(':checked'));
                    if (!_self.validateCheckedCount($target, true)) {
                        if(isChecked) {
                            $el.prop('checked', false);
                            $target.prop('checked', false);
                        } else {
                            $el.prop('checked', true);
                            $target.prop('checked', true);
                        }
                        _self.setPreviewAndState($target);
                        return false;
                    }
                    _self.addSelectedClass($target.attr('data-mcode'), $target.attr('data-bcode'));
                    _self.showSelectedCountAndTitle($target);
                });
            },

            /** @this AutoComplete */
            reset: function(code) {
                this.$resultList.find('input[name="search_subway_cd[]"]:checked').filter('[value="' + code + '"]').triggerClick();
            }
        },

        // 자동완성에서 선택시 html 요소가 없다면 그리기
        makeLastDepth: function (code, bcode) {
            var code = code.replace(/([0-9]{2})$/i,'');
            _self.appendSubDepth(bcode, true);
            _self.appendLastDepth(code, bcode, true);
            _self.resizeForTinyScrollbar();
        },

        isExist: function(code) {
            var subwayCodes = code.split(',');
            var length = _.find(subwayCodes, function(code) {
                return _self.$wrapper.find('input[name="subway_cd[]"]:checked').filter('[value="' + code + '"]').length;
            });

            return length > 0;
        },

        getCheckedEl: function() {
            return _self.$wrapper.find('.depth_check :checkbox:checked');
        },

        generateIdUsingCode: function(code) {
            return Util.String.replaceAll(',', '_', code);
        },

        // 초기 사방역
        generateDefaultStation: function() {
            var subway_cd  = Common.getParamToArray('subway_cd');
            if($("#set_subway_cd").val() !== undefined && $("#set_subway_cd").val() !== '') { //통검 hidden 값에 쌓인 subway_cd
                var count        = 0;
                $("#set_subway_cd").val().split(",").forEach(function(code){
                    _self.subwayName[count] = _self.generateTongStation(code);
                    ++count;
                });
                count = 0;
                var su_line      = 0;
                var daejeon_line = 0;
                var daegu_line   = 0;
                var gwangju_line = 0;
                var busan_line   = 0;
                this.$stationPanel.html(Template.get(this.stationTemplate, _self.subwayName[0]));
                var overlap = _self.overlapStation(_self.subwayName);
                var overlapStation         = [];
                var overlapStation_Su      = [];
                var overlapStation_Daejeon = [];
                var overlapStation_DaeGu   = [];
                var overlapStation_GwangJu = [];
                var overlapStation_Busan   = [];
                var overlapStationTitle    = []; //드롭다운 초기 역세권명
                if(overlap) { //환승역 제외 동일역세권명 드롭다운 노출
                    _self.subwayName.forEach(function(info) {
                        Object.keys(_self.subwayInfo).forEach(function (loc) {
                            _self.subwayInfo[loc].forEach(function (subwayLine) {
                                if (loc === 'gyeonggi' && Number(info.main.bcode) === subwayLine) {
                                    if(info.main.lines[su_line] === undefined ) { //동일지역 역세권명 처리 ex)양평
                                        overlapStationTitle[count] = "수도권 " + info.main.lines[0].name + " " + info.main.stationName + "역";
                                        overlapStation_Su[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>수도권 " + info.main.lines[0].name + " " + info.main.stationName + "역</button></li>";
                                    } else {
                                        overlapStationTitle[count] = "수도권 " + info.main.lines[su_line].name + " " + info.main.stationName + "역";
                                        overlapStation_Su[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>수도권 " + info.main.lines[su_line].name + " " + info.main.stationName + "역</button></li>";
                                    }
                                    ++count;
                                    ++su_line;
                                } else if (loc === 'daejeon' && Number(info.main.bcode) === subwayLine) {
                                    if (info.main.lines[daejeon_line] === undefined) {
                                        overlapStationTitle[count] = "대전 " + info.main.lines[0].name + " " + info.main.stationName + "역";
                                        overlapStation_Daejeon[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>대전 " + info.main.lines[0].name + " " + info.main.stationName + "역</button></li>";
                                    } else {
                                        overlapStationTitle[count] = "대전 " + info.main.lines[daejeon_line].name + " " + info.main.stationName + "역";
                                        overlapStation_Daejeon[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>대전 " + info.main.lines[daejeon_line].name + " " + info.main.stationName + "역</button></li>";
                                    }
                                    ++count;
                                    ++daejeon_line;
                                } else if (loc === 'daegu' && Number(info.main.bcode) === subwayLine) {
                                    if (info.main.lines[daegu_line] === undefined) {
                                        overlapStationTitle[count] = "대구 " + info.main.lines[0].name + " " + info.main.stationName + "역";
                                        overlapStation_DaeGu[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>대구 " + info.main.lines[0].name + " " + info.main.stationName + "역</button></li>";
                                    } else {
                                        overlapStationTitle[count] = "대구 " + info.main.lines[daegu_line].name + " " + info.main.stationName + "역";
                                        overlapStation_DaeGu[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>대구 " + info.main.lines[daegu_line].name + " " + info.main.stationName + "역</button></li>";
                                    }
                                    ++count;
                                    ++daegu_line;
                                } else if (loc === 'gwangju' && Number(info.main.bcode) === subwayLine) {
                                    if (info.main.lines[gwangju_line] === undefined) {
                                        overlapStationTitle[count] = "광주 " + info.main.lines[0].name + " " + info.main.stationName + "역";
                                        overlapStation_GwangJu[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>광주 " + info.main.lines[0].name + " " + info.main.stationName + "역</button></li>";
                                    } else {
                                        overlapStationTitle[count] = "광주 " + info.main.lines[gwangju_line].name + " " + info.main.stationName + "역";
                                        overlapStation_GwangJu[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>광주 " + info.main.lines[gwangju_line].name + " " + info.main.stationName + "역</button></li>";
                                    }
                                    ++count;
                                    ++gwangju_line;
                                } else if (loc === 'busan' && Number(info.main.bcode) === subwayLine) {
                                    if (info.main.lines[busan_line] === undefined) {
                                        overlapStationTitle[count] = "부산 " + info.main.lines[0].name + " " + info.main.stationName + "역";
                                        overlapStation_Busan[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>부산 " + info.main.lines[0].name + " " + info.main.stationName + "역</button></li>";
                                    } else {
                                        overlapStationTitle[count] = "부산 " + info.main.lines[busan_line].name + " " + info.main.stationName + "역";
                                        overlapStation_Busan[count] = "<li><button type='button' class='overlap_btn' data-code='" + info.main.code + "' data-name='" + info.main.stationName + "'>부산 " + info.main.lines[busan_line].name + " " + info.main.stationName + "역</button></li>";
                                    }
                                    ++count;
                                    ++busan_line;
                                }
                            });
                        });
                    });
                    //중복역세권 지역 정렬 수도권->대전->대구->광주->부산
                    overlapStation = overlapStation.concat(overlapStation_Su,overlapStation_Daejeon,overlapStation_DaeGu,overlapStation_GwangJu,overlapStation_Busan);
                    _self.$overlapStation.find(".btn_view_other").html(overlapStationTitle[0]);
                    _self.getLocInfo(overlapStationTitle[0]);
                   overlapStation.forEach(function(overlapList){
                       _self.$overlapStation.find(".list_other_subway").append(overlapList);
                   });
                    _self.$overlapStation.find(".list_other_subway li").first().addClass("selected");
                    _self.$overlapStation.show();
                }
            } else { //기존 역세권페이지에서 사용하는 로직
                if (!Util.Lang.isEmpty(subway_cd)) {
                    var first_subway_cd = subway_cd[0]
                    _self.generateStation(first_subway_cd);
                }
            }
        },

        // 사방역
        generateStation: function(subway_cd) {
            var tplData = _self.getStationPanelInfo(subway_cd)
            this.$stationPanel.html(Template.get(this.stationTemplate, tplData));
        },

       //통검 역세권정보 노출
        generateTongStation: function(subway_cd) {
            var tplData = _self.getStationPanelInfo(subway_cd);
            return tplData;
        },

        getStationPanelInfo: function(subway_cd) {
            // 역정보
            var stationOption = _self.getStationOption(subway_cd);
            var option = stationOption.option;
            var tranStationOption = {};
            var transLines = [];
            var tplWing = [];

            var transCodes = _.clone(option.transfer);
            var wingCodeGroup = ['left', 'right'];
            var transCount = 0;
            
            transCodes.unshift(subway_cd);
            transCodes.sort(function (p, n) {
                p = parseInt(p);
                n = parseInt(n);
                return p > n ? 1 : p < n ? -1 : 0;
            });

            for (var i=0,cnt=transCodes.length; i<cnt; i++) {
                if (transCodes[i] == subway_cd) {
                    tranStationOption = stationOption;
                }   
                else {
                    tranStationOption = _self.getStationOption(transCodes[i]);
                }

                if (tranStationOption.option.count == 0) {
                    transCount += tranStationOption.option.count;
                } else {
                    if (transCount <= 1) {
                        transCount = tranStationOption.option.count;
                    }
                }

                transLines.push({
                    'bcode':tranStationOption.bcode, 
                    'name': tranStationOption.lineName, 
                    'shortName':tranStationOption.shortLineName, 
                    'txt': tranStationOption.txt
                });


                var maxWingCount = tranStationOption.option.left.length > tranStationOption.option.right.length ? 
                  tranStationOption.option.left.length : tranStationOption.option.right.length;

                for (var k=0; k<maxWingCount; k++) {
                    var wingData = {};
                    for(var j=0; j<2; j++) {
                        var wingSideData = {
                            'class': 'no_station',
                            'count': 0,
                            'name': '',
                            'code': '',
                            'mcode': '',
                            'bcode': ''
                        };

                        var wingCodes = tranStationOption.option[wingCodeGroup[j]];

                        if (wingCodes.length > k) {
                            var wingStationOption = _self.getStationOption(wingCodes[k]);
                            wingSideData.class = 'bg_line'+ wingStationOption.bcode;
                            wingSideData.count = wingStationOption.option.count;
                            wingSideData.name = wingStationOption.option.name;
                            wingSideData.code = wingStationOption.option.code;
                            wingSideData.bcode = wingStationOption.option.bcode;
                            wingSideData.mcode = wingStationOption.option.mcode;
                        }

                        wingData[wingCodeGroup[j]] = wingSideData;
                    }

                    tplWing.push(wingData);
                }

            }
            
            var tplMain = {
                'stationName': option.name,
                'count': transCount,
                'recExist': transCount>0,
                'bcode': transLines[0].bcode,
                'code': option.code,
                'lines': transLines,
                'isLinesVisible': transLines.length > 1,
                'has_transfer': tplWing.length>1,
                'notCheckedStation' : !$('#subway_cd_'+subway_cd).prop('checked')
            };

            return {'main': tplMain, 'wing': tplWing};
        },

        getLocInfo: function(locName) { // 역세권명 지역 노출
            if (locName.indexOf("수도권") !== -1) {
                this.$subwayLoc.find(".subway_loc").html("수도권");
            } else if (locName.indexOf("대전") !== -1) {
                this.$subwayLoc.find(".subway_loc").html("대전");
            } else if (locName.indexOf("대구") !== -1) {
                this.$subwayLoc.find(".subway_loc").html("대구");
            } else if (locName.indexOf("광주") !== -1) {
                this.$subwayLoc.find(".subway_loc").html("광주");
            } else if (locName.indexOf("부산") !== -1) {
                this.$subwayLoc.find(".subway_loc").html("부산");
            }
        },

        getBcodeFromCode: function(subway_cd) {
            var subway_cd_str = ""+subway_cd;
            var bcode = subway_cd_str.substr(0, subway_cd_str.length-2);
            return bcode;
        },
        
        getBcodeIndexInMcode: function(mcode, bcode) {
            var d1Array = _self.options[mcode];
            var index = 0;
            for (var i=0,cnt=d1Array.length; i<cnt; i++) {
                if (d1Array[i].code == bcode) {
                    index = i;
                    break;
                }
            }
            return index;
        },

        getStationOption: function(subway_cd) {
            var mcode = _self.depth1Options[subway_cd]; // 권역번호(mcode)
            var bcode = _self.getBcodeFromCode(subway_cd);
            var bcodeIndex = _self.getBcodeIndexInMcode(mcode, bcode);
            var lineStationArray = _self.options[mcode][bcodeIndex].keyword;
            var lineName = _self.options[mcode][bcodeIndex].name;
            var shortLineName = lineName.replace('호선','');
            var stationInfo = {};

            for (var j = 0, cnt = lineStationArray.length; j < cnt; j++) {
                if (lineStationArray[j].code == subway_cd) {
                    var stationInfo = lineStationArray[j];
                    break;
                }
            }

            return {
                'mcode': mcode, 
                'bcode': bcode,
                'subway_cd': subway_cd,
                'lineName': lineName,
                'shortLineName': shortLineName,
                'txt': shortLineName.length>1 ? 'txt': '',
                'option': stationInfo
            }
        },

        addTransfer: function($el) {
            var _self = this,
                transfer = $el.data('transfer').toString();
            if (!Util.Lang.isEmpty(transfer)) {
                transfer.split(',').forEach(function (code) {
                    _self.makeLastDepth(code, _self.depth1Options[code]);
                    var $target = _self.$wrapper.find('input:checkbox[id=subway_cd_' + code + ']');
                    _self.clickCheckBox($target, true);
                    _self.addSelectedClass($target.attr('data-mcode'), $target.attr('data-bcode'));
                });
            }
        },

        getPreviewText: function ($this) {
            var checkBoxText = $('label[for=' + $this.attr('id') + ']').find('span.txt').text(),
                depth1Text = $this.parents('.wrap_depth_category')
                    .find('#depth1_btn_' + $this.attr('data-mcode') + ' span.txt').text()
                    .replace(/\s$/, '');

            // 무조건 1depth 텍스트 표시
            return depth1Text + '>' + checkBoxText;
        },

        overlapStation: function(station) {
            var overlap = false;
            for (var i = 0; i < station.length; i++) {
                if (i !== 0) {
                    if(station[i-1].main.bcode === station[i].main.bcode) {
                        overlap = false;
                    } else {
                        overlap = true;
                        break; // 타지역 중복역세권있을경우 드롭다운ui 노출해야하므로 loop 탈출
                    }
                }
            }
            return overlap;
        }

    });

    return new Subway();
});