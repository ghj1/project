define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template'
], function (require, $, _, Common, Util, Preview, Template) {
    'use strict';

    var _self;
    var Career = function () {
        this.$wrapper = $('#sp_main_wrapper');
        this.$careerOption = this.$wrapper.find('.career_option');
        this.$zero_experience = this.$careerOption.find('.area_check div:first-child input:checkbox');
        this.$experience = this.$careerOption.find('.area_check div:nth-child(2) input:checkbox');
        this.$no_experience = this.$careerOption.find('.area_check div:last-child input:checkbox');

        this.arr = [];
        this.textInput = new TextInput();
        this.arr.push(new Element(0, '~1년', '1년 이하', 0));
        for (var i = 1; i < 21; i++) {
            this.arr.push(new Element(i, i + '년', i + '년', i));
        }
        this.arr.push(new Element(21, '20년~', '20년 이상', 21));
    };

    Career.prototype = {
        init: function () {
            _self = this;
            this.bindEvent();
            this.draw();
            this.initParams();
        },
        bindEvent: function () {
            //선택 초기화
            this.$careerOption.find('.area_btn .btn_reset').on('click', function(){
                // 신입
                _self.$zero_experience.prop('checked', false).trigger('change');
                _self.textInput.unsetZeroExperience();

                // 경력
                _self.$experience.prop('checked', false).trigger('change');
                _self.textInput.unsetExperience();

                // 상세경력 초기화
                _self.firstClickedElem = undefined;
                _self.secondClickedElem = undefined;
                _self.selectRange();

                // 경력 무관
                _self.$no_experience.prop('checked', false).trigger('change');
                _self.textInput.unsetNoExperience();

                // text, preview reset
                _self.textInput.showNames();
                _self.textInput.setPreview();
            });

            // 신입
            this.$zero_experience.on('change', function () {
                if ($(this).prop('checked')) {
                    _self.textInput.setZeroExperience();
                } else {
                    _self.textInput.unsetZeroExperience();
                }
                _self.textInput.showNames();
                _self.textInput.setPreview();
            });

            // 경력
            this.$experience.on('change', function () {
                if ($(this).prop('checked')) {
                    _self.textInput.setExperience();
                } else {
                    _self.textInput.unsetExperience();
                    // 경력 해제 시 상세경력 초기화
                    _self.firstClickedElem = undefined;
                    _self.secondClickedElem = undefined;
                    _self.selectRange();
                }
                _self.textInput.showNames();
                _self.textInput.setPreview();
            });

            // 경력무관
            this.$no_experience.on('change', function () {
                if ($(this).prop('checked')) {
                    _self.textInput.setNoExperience();
                } else {
                    _self.textInput.unsetNoExperience();
                }
                _self.textInput.showNames();
                _self.textInput.setPreview();
            });
        },
        initParams: function () {
            // 섹션홈, 직업/직종 1depth 일 경우 프리뷰 안보임
            var isVisible = true;
            if (Common.getParam('isSectionHome')
                || ((Common.getParam('action') === 'job-category' || Common.getParam('action') === 'samsung' || Common.getParam('action') === 'sba-seoul'
                || Common.getParam('action') === 'tech' || Common.getParam('action') === 'wiest' || Common.getParam('action') === 'youthstay'
                || Common.getParam('action') === 'cjpi' || Common.getParam('action') === 'ex' || Common.getParam('action') === 'winwin-doosan'
                || Common.getParam('action') === 'with-komipo' || Common.getParam('action') === 'kova' || Common.getParam('action') === 'incheon-airport'
                || Common.getParam('action') === 'ketep'
                || Common.getParam('action') === 'hdepartnership'
                || Common.getParam('action') === 'skgeocentric'
                || Common.getParam('action') === 'cjpi2'
                || Common.getParam('action') === 'dispatch' || Common.getParam('action') === 'highschool') && Common.getParam('cat_mcls') !== null && Common.getParam('cat_kewd') === null)
                || (Common.getParam('action') === 'industry' && Common.getParam('ind_bcd') !== null && Common.getParam('ind_cd') === null)
                //|| Common.getParam('isSearchResultEmpty')
            ) {
                isVisible = false;
            }

            // 신입 셋팅
            if (this.$zero_experience.attr('checked') === 'checked') {
                this.$zero_experience.prop('checked', true);
                _self.textInput.setZeroExperience();
            }
            // 경력 셋팅
            if (this.$experience.attr('checked') === 'checked') {
                this.$experience.prop('checked', true);
                _self.textInput.setExperience();
            }
            // 경력 무관 셋팅
            if (this.$no_experience.attr('checked') === 'checked') {
                this.$no_experience.prop('checked', true);
                _self.textInput.setNoExperience();
            }

            // 경력 상세 세팅
            var exp_min = Common.getParam('exp_min'),
                exp_max = Common.getParam('exp_max');

            if (exp_min === null && exp_max === null) {
                _self.textInput.showNames();
                _self.textInput.setPreview(isVisible);
                return;
            }

            _self.firstClickedElem = undefined;
            _self.secondClickedElem = undefined;
            if (exp_min !== null && exp_max !== null) {
                if (exp_min !== exp_max) {
                    _self.secondClickedElem = parseInt(exp_max);
                }
                _self.firstClickedElem = parseInt(exp_min);
            } else if (exp_min !== null && exp_max === null) {
                _self.firstClickedElem = 21;
                if (parseInt(exp_min) !== 20) {
                    _self.secondClickedElem = exp_min;
                }
            } else if (exp_min === null && exp_max !== null) {
                _self.firstClickedElem = 0;
                if (parseInt(exp_max) !== 1) {
                    _self.secondClickedElem = exp_max;
                }
            }

            _self.selectRange(_self.arr[_self.firstClickedElem], _self.arr[typeof _self.secondClickedElem === 'undefined' ? _self.firstClickedElem : _self.secondClickedElem], isVisible);
        },
        draw: function () {
            this.$careerOption.find('.area_detail_select ul').html(Template.get('career_template', {list: this.arr}));
            this.checkboxBindEvents();
        },
        firstClickedElem: undefined,
        secondClickedElem: undefined,
        checkboxBindEvents: function () {
            // 상세 경력 선택
            this.$careerOption.find('.area_detail_select ul input:checkbox').on('change', function () {
                var index = $(this).data('index');

                _self.$experience.prop('checked', true).trigger('change');

                // 이미 화면에 2개 선택 되어있는 경우
                if (typeof _self.firstClickedElem !== 'undefined' && typeof _self.secondClickedElem !== 'undefined') {
                    _self.firstClickedElem = index;
                    _self.secondClickedElem = undefined;
                    _self.selectRange(_self.arr[_self.firstClickedElem], _self.arr[_self.firstClickedElem]);
                    return;
                }

                // 처음 버튼을 선택 할 경우
                if (typeof _self.firstClickedElem === 'undefined') {
                    _self.firstClickedElem = index;
                    _self.selectRange(_self.arr[_self.firstClickedElem], _self.arr[_self.firstClickedElem]);
                    return;
                }

                // 같은 경력 두번 선택할 경우 || ~1년,20년~ 동시 선택했을 경우
                if (_self.firstClickedElem === index || [_self.firstClickedElem, index].every(function (i) { return [0, 21].indexOf(i) > -1 }))  {
                    _self.firstClickedElem = undefined;
                    _self.secondClickedElem = undefined;
                    _self.selectRange();
                    return;
                }

                // 이미 1개 선택했고 두번째 선택하는 경우
                _self.secondClickedElem = index;
                _self.selectRange(_self.arr[_self.firstClickedElem], _self.arr[_self.secondClickedElem]);
            });
        },
        selectRange: function (elem1, elem2, isVisible) {
            if (_self.firstClickedElem === 0 && _self.secondClickedElem === 21) {
                elem1 = undefined;
                elem2 = undefined;
                _self.firstClickedElem = undefined;
                _self.secondClickedElem = undefined;
            }
            // 선택 글자 출력
            this.textInput.setDetailExperience(elem1, elem2);
            this.textInput.showNames();
            this.textInput.setPreview(isVisible);

            var start, end;
            // selected, mark 초기화
            this.arr.forEach(function (obj) {
                obj.selected = false;
                obj.mark = false;
            });
            // validation
            if (!elem1 && !elem2) {
                this.draw();
                return;
            }

            // start, end 값 설정
            if (elem1.sequence > elem2.sequence) {
                start = elem2.value;
                end = elem1.value;
            } else {
                start = elem1.value;
                end = elem2.value;
            }

            // mark 설정
            this.arr[start].mark = true;
            this.arr[end].mark = true;

            // start부터 end 까지 체크박스 선택 셋팅
            for (var i = start; i <= end; i++) {
                this.arr[i].selected = true;
            }
            this.draw();
        },

        isSelected: function() {
            return !(this.textInput.isZeroExperience === false && this.textInput.isExperience === false && this.textInput.isNoExperience === false);
        }
    };

    function TextInput() {
        this.isZeroExperience = false;
        this.isExperience = false;
        this.isNoExperience = false;
        this.detailExperienceFirtst = undefined;
        this.detailExperienceSecond = undefined;
    }

    TextInput.prototype = {
        setZeroExperience: function () {
            this.isZeroExperience = true;
        },
        unsetZeroExperience : function () {
            this.isZeroExperience = false;
        },
        setExperience: function () {
            this.isExperience = true;
        },
        unsetExperience: function () {
            this.isExperience = false;
        },
        setNoExperience: function () {
            this.isNoExperience = true;
        },
        unsetNoExperience: function () {
            this.isNoExperience = false;
        },
        setDetailExperience: function (elem1, elem2) {
            if (typeof elem1 === 'undefined' && typeof elem2 === 'undefined') {
                this.detailExperienceFirtst = undefined;
                this.detailExperienceSecond = undefined;
                return;
            }
            if (elem1 === elem2) {
                this.detailExperienceFirtst = elem1;
                this.detailExperienceSecond = elem1;
                return;
            }
            // 더 큰 경력이 Second에 셋팅된다
            if (elem1.sequence > elem2.sequence) {
                this.detailExperienceFirtst = elem2;
                this.detailExperienceSecond = elem1;
            } else {
                this.detailExperienceFirtst = elem1;
                this.detailExperienceSecond = elem2;
            }
        },

        showNames: function () {
            var result = [];

            // 신입 체크박스 선택했을 경우
            if (this.isZeroExperience) {
                result.push('신입');
            }

            // 상세경력 체크 없이 경력만 선택한 경우
            if (typeof this.detailExperienceFirtst === 'undefined' && typeof this.detailExperienceSecond === 'undefined' && this.isExperience) {
                result.push('경력');
            }

            // 00년 상세경력 선택을 경우
            if (typeof this.detailExperienceFirtst !== 'undefined' && typeof this.detailExperienceSecond !== 'undefined') {
                var text = '경력 ';
                if (this.detailExperienceFirtst === this.detailExperienceSecond) {
                    // 경력 1개만 선택했을 경우
                    if (this.detailExperienceFirtst.minEdge) {
                        text += this.detailExperienceFirtst.alias;
                    } else if (this.detailExperienceFirtst.maxEdge) {
                        text += this.detailExperienceFirtst.alias;
                    } else {
                        text += this.detailExperienceFirtst.value + '년';
                    }
                } else {
                    // 값이 두개 모두 존재 할 때
                    if (this.detailExperienceFirtst.minEdge) {
                        text += this.detailExperienceSecond.alias + ' 이하';
                    } else if (this.detailExperienceSecond.maxEdge) {
                        text += this.detailExperienceFirtst.alias + ' 이상';
                    } else {
                        text += this.detailExperienceFirtst.value + '~' + this.detailExperienceSecond.alias;
                    }
                }
                result.push(text);
            }

            // 경력 무관 선택했을 경우
            if (this.isNoExperience && !this.isZeroExperience && !this.isExperience) {
                result.push('경력 무관');
            } else if (this.isNoExperience) {
                result.push('무관');
            }

            // 아무것도 선택하지 않았을 경우
            var isEmpty = result.length === 0;

            var $careerOption = $(".career_option");
            $careerOption.find('.tit').text(isEmpty ? '경력 전체' : result.join(', '));
            $careerOption.find('.btn_open_layer').text(isEmpty ? '경력 선택' : result.join(', '));
        },

        setPreview: function (isVisible) {
            isVisible = typeof isVisible === 'undefined' ? true : isVisible;

            var $careerOption = $(".career_option"),
                $zero_experience = $careerOption.find('.area_check div:first-child input:checkbox'),
                $experience = $careerOption.find('.area_check div:nth-child(2) input:checkbox'),
                $no_experience = $careerOption.find('.area_check div:last-child input:checkbox');

            // 신입 체크박스 선택했을 경우
            if (this.isZeroExperience) {
                Common.setState('exp_cd', 'sp_preview_zero_experience', 1);
                Preview.append('sp_preview_zero_experience', '신입', '', function () {
                    $zero_experience.prop('checked', false).trigger('change');
                }, '', isVisible);
            } else {
                Common.removeState('exp_cd', 'sp_preview_zero_experience');
                Preview.remove('sp_preview_zero_experience');
            }

            var expStateId = 'exp_cd',
                expMinStateId = 'exp_min',
                expMaxStateId = 'exp_max',
                expPreviewId1 = 'sp_preview_experience_1',
                expPreviewId2 = 'sp_preview_experience_2',
                expPreviewId3 = 'sp_preview_experience_3';

            // 상세경력 체크 없이 경력만 선택한 경우

            Common.removeState(expStateId, expPreviewId1);
            Common.removeState(expMinStateId, expPreviewId2);
            Common.removeState(expMinStateId, expPreviewId3);
            Common.removeState(expMaxStateId, expPreviewId2);
            Common.removeState(expMaxStateId, expPreviewId3);

            if (this.isExperience) {
                Common.setState(expStateId, expPreviewId1, 2);
                Preview.append(expPreviewId1, '경력', '', function () {
                    $experience.prop('checked', false).trigger('change');
                }, '', isVisible);
            } else {
                Preview.remove(expPreviewId1);
            }

            // 00년 상세경력 선택을 경우
            if (typeof this.detailExperienceFirtst !== 'undefined' && typeof this.detailExperienceSecond !== 'undefined') {

                if (this.detailExperienceFirtst === this.detailExperienceSecond) {
                    Preview.remove(expPreviewId3);
                    // 경력 1개만 선택했을 경우
                    var text = '';
                    if (this.detailExperienceFirtst.minEdge) {
                        text = this.detailExperienceFirtst.alias + ' 전체';
                        Common.setState(expMaxStateId, expPreviewId2, 1);
                    } else if (this.detailExperienceFirtst.maxEdge) {
                        text = this.detailExperienceFirtst.alias + ' 전체';
                        Common.setState(expMinStateId, expPreviewId2, 20);
                    } else {
                        text = this.detailExperienceFirtst.value + '년';
                        Common.setState(expMinStateId, expPreviewId2, this.detailExperienceFirtst.value);
                        Common.setState(expMaxStateId, expPreviewId2, this.detailExperienceFirtst.value);
                    }
                    Preview.append(expPreviewId2, text, '', function () {
                        _self.firstClickedElem = undefined;
                        _self.secondClickedElem = undefined;
                        _self.selectRange();
                    }, '', isVisible);

                } else {
                    // 값이 두개 모두 존재 할 때
                    if (this.detailExperienceFirtst.minEdge) {
                        Common.setState(expMaxStateId, expPreviewId2, this.detailExperienceSecond.value);
                        Preview.append(expPreviewId2, this.detailExperienceSecond.alias + ' 이하', '', function () {
                            _self.firstClickedElem = undefined;
                            _self.secondClickedElem = undefined;
                            _self.selectRange();
                        }, '', isVisible);
                    } else if (this.detailExperienceSecond.maxEdge) {
                        Common.setState(expMinStateId, expPreviewId2, this.detailExperienceFirtst.value);
                        Preview.append(expPreviewId2, this.detailExperienceFirtst.alias + ' 이상', '', function () {
                            _self.firstClickedElem = undefined;
                            _self.secondClickedElem = undefined;
                            _self.selectRange();
                        }, '', isVisible);
                    } else {
                        Common.setState(expMinStateId, expPreviewId2, this.detailExperienceFirtst.value);
                        Common.setState(expMaxStateId, expPreviewId3, this.detailExperienceSecond.value);
                        Preview.append(expPreviewId2, this.detailExperienceFirtst.alias + ' 이상', '', function () {
                            _self.firstClickedElem = 0;
                            _self.selectRange(_self.arr[0], _self.arr[_self.secondClickedElem]);
                        }, '', isVisible);
                        Preview.append(expPreviewId3, this.detailExperienceSecond.alias + ' 이하', '', function () {
                            _self.secondClickedElem = 21;
                            _self.selectRange(_self.arr[_self.firstClickedElem], _self.arr[21]);
                        }, '', isVisible);
                    }
                }
            } else {
                Preview.remove(expPreviewId2);
                Preview.remove(expPreviewId3);
            }

            // 경력 무관
            var noStateId = 'exp_none',
                noPreviewId = 'sp_preview_no_experience';
            if ((this.isNoExperience && !this.isZeroExperience && !this.isExperience) || this.isNoExperience) {
                Preview.append(noPreviewId, '경력무관', '', function () {
                    $no_experience.prop('checked', false).trigger('change');
                }, '', isVisible);
                Common.setState(noStateId, noPreviewId, 'y');
            } else {
                Preview.remove(noPreviewId);
                Common.removeState(noStateId, noPreviewId);
            }
        }
    };

    function Element(sequence, name, alias, value) {
        this.sequence = sequence;
        this.name = name;
        this.alias = alias;
        this.value = value;
        this.selected = false;
        this.mark = false;
        this.minEdge = false;
        this.maxEdge = false;
        this.edge = false;
        if (value === 0 || value === 21) {
            if (value === 0) {
                this.minEdge = true;
            }
            if (value === 21) {
                this.maxEdge = true;
            }
            this.edge = true;
        }
    }

    return new Career();
});