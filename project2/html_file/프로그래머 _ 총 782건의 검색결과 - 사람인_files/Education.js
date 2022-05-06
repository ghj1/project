define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Preview', 'Template'
], function (require, $, _, Common, Util, Preview, Template) {
    'use strict';

    var _self;
    var Education = function () {
        this.$wrapper = $('#sp_main_wrapper');
        this.$eduOption = this.$wrapper.find('.edu_option');
        this.$checkBox = this.$eduOption.find('.area_check input:checkbox'); // 학력무관

        this.arr = [
            new Element(0, '고교 졸업<br>이하', '고교', -1, 9),
            new Element(1, '고등학교<br>졸업', '고교', 6, 9),
            new Element(2, '대학 졸업<br>(2,3년제)', '대학(2,3년)', 7, 10),
            new Element(3, '대학교 졸업<br>(4년제)', '대학교(4년)', 8, 11),
            new Element(4, '대학원 석사<br>졸업', '석사', 9, 12),
            new Element(5, '대학원 박사<br>졸업', '박사', 5, 13),
            new Element(6, '박사 졸업<br>이상', '박사', 5, -1)
        ];
        this.textInput = new TextInput();
    };

    Education.prototype = {
        init: function () {
            _self = this;
            _self.bindEvents();
            _self.draw();
            _self.initParams();
            return _self;
        },

        bindEvents: function () {
            var _self = this;

            // 학력 무관
            this.$checkBox.on('change', function () {
                if ($(this).prop('checked')) {
                    _self.textInput.setNoEducation();
                } else {
                    _self.textInput.unsetNoEducation();
                }
                _self.textInput.showNames();
                _self.textInput.setPreview();
            });
            // 선택 초기화
            this.$eduOption.find('.area_btn .btn_reset').on('click', function () {
                // 학력무관 초기화
                _self.$checkBox.prop('checked', false).trigger('change');
                _self.textInput.unsetNoEducation();
                // 상세학력 초기화
                _self.firstClickedElem = undefined;
                _self.secondClickedElem = undefined;
                _self.selectRange();
            });
        },

        initParams: function () {

            // 섹션홈, 직업/직종 1depth 일 경우 프리뷰 안보임
            var isVisible = true;
            if (Common.getParam('isSectionHome')
                || ((Common.getParam('action') === 'job-category' || Common.getParam('action') === 'samsung' || Common.getParam('action') === 'sba-seoul'
                || Common.getParam('action') === 'tech' || Common.getParam('action') === 'wiset' || Common.getParam('action') === 'youthstay'
                || Common.getParam('action') === 'cjpi' || Common.getParam('action') === 'winwin-doosan' || Common.getParam('action') === 'ex'
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

            // 학력무관 checked
            if (this.$checkBox.attr('checked') === 'checked') {
                this.$checkBox.prop('checked', true);
                this.textInput.setNoEducation();
            }

            // 학력선택
            var edu_min = Common.getParam('edu_min') || -1,
                edu_max = Common.getParam('edu_max') || -1;

            if (edu_min === -1 && edu_max === -1) {
                this.textInput.showNames();
                this.textInput.setPreview(isVisible);
                return;
            }

            var min = null, max = null;
            this.arr.forEach(function (obj) {
                if (obj.min == edu_min && obj.max == edu_max) {
                    min = obj.sequence;
                    max = obj.sequence;
                }
            });
            if (min === null || max === null) {
                this.arr.forEach(function (obj) {
                    if (obj.min == edu_min) {
                        min = obj.sequence;
                    } else if (obj.max == edu_max) {
                        max = obj.sequence;
                    }
                });
            }

            _self.firstClickedElem = undefined;
            _self.secondClickedElem = undefined;
            if (edu_min !== null && edu_max !== null) {
                if (min != max) {
                    _self.secondClickedElem = max;
                }
                _self.firstClickedElem = min;
            } else if (edu_min !== null && edu_max === null) {
                _self.firstClickedElem = min;
                _self.secondClickedElem = 6;

            } else if (edu_min === null && edu_max !== null) {
                _self.firstClickedElem = 0;
                _self.secondClickedElem = max;
            }
            _self.selectRange(_self.arr[_self.firstClickedElem], _self.arr[typeof _self.secondClickedElem === 'undefined' ? _self.firstClickedElem : _self.secondClickedElem], isVisible);
        },

        draw: function () {
            this.$eduOption.find('.area_detail_select ul').html(Template.get('education_template', {list: this.arr}));
            this.checkboxBindEvents();
        },

        firstClickedElem : undefined,
        secondClickedElem : undefined,
        checkboxBindEvents: function () {
            var $eduOption = $('.edu_option'),
                $checkBox = $eduOption.find('.area_detail_select ul input:checkbox');

            // 학력 선택
            $checkBox.on('change', function () {
                var index = $(this).data('index');

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

                // 같은 학력 두번 선택할 경우 || 고교졸업이하, 박사졸업이상 을 선택하는 경우
                if (_self.firstClickedElem === index || [_self.firstClickedElem, index].every(function (i) { return [0, 6].indexOf(i) > -1 })) {
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

        selectRange: function(elem1, elem2, isVisible){
            if (_self.firstClickedElem === 0 && _self.secondClickedElem === 6) {
                elem1 = undefined;
                elem2 = undefined;
                _self.firstClickedElem = undefined;
                _self.secondClickedElem = undefined;
            }
            // 선택 글자 출력
            this.textInput.setDetailEdu(elem1, elem2);
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
                start = elem2.sequence;
                end = elem1.sequence;
            } else {
                start = elem1.sequence;
                end = elem2.sequence;
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
            return !(this.textInput.isNoEducation === false && this.textInput.detailEducationFirtst === undefined && this.textInput.detailEducationSecond === undefined);
        }
    };

    function TextInput() {
        this.isNoEducation = false;
        this.detailEducationFirtst = undefined;
        this.detailEducationSecond = undefined;
    }

    TextInput.prototype = {
        setNoEducation: function () {
            this.isNoEducation = true;
        },
        unsetNoEducation: function () {
            this.isNoEducation = false;
        },
        setDetailEdu: function (elem1, elem2) {
            if (typeof elem1 === 'undefined' && typeof elem2 === 'undefined') {
                this.detailEducationFirtst = undefined;
                this.detailEducationSecond = undefined;
                return;
            }
            if (elem1 === elem2) {
                this.detailEducationFirtst = elem1;
                this.detailEducationSecond = elem1;
                return;
            }
            // 더 높은 학력이 Second에 셋팅된다
            if (elem1.sequence > elem2.sequence) {
                this.detailEducationFirtst = elem2;
                this.detailEducationSecond = elem1;
            } else {
                this.detailEducationFirtst = elem1;
                this.detailEducationSecond = elem2;
            }
        },
        showNames : function(){
            var result = [];

            if (typeof this.detailEducationFirtst !== 'undefined' && typeof this.detailEducationSecond !== 'undefined') {
                // 하나만 선택했을 때
                if (this.detailEducationFirtst.sequence === this.detailEducationSecond.sequence) {
                    if (this.detailEducationFirtst.minEdge) {
                        result.push(this.detailEducationFirtst.getMinName());
                    } else if (this.detailEducationFirtst.maxEdge) {
                        result.push(this.detailEducationFirtst.getMaxName());
                    } else {
                        result.push(this.detailEducationFirtst.getName());
                    }
                } else if (this.detailEducationFirtst.minEdge) {
                    // 두개 선택했지만 ~이하
                    result.push(this.detailEducationSecond.getMinName());
                } else if (this.detailEducationSecond.maxEdge) {
                    // 두개 선택했지만 ~이상
                    result.push(this.detailEducationFirtst.getMaxName());
                } else {
                    // 두개 선택했을 때
                    result.push(this.detailEducationFirtst.alias + '~' + this.detailEducationSecond.getName());
                }
            }

            if (typeof this.detailEducationFirtst === 'undefined' && typeof this.detailEducationSecond === 'undefined' && this.isNoEducation) {
                result.push('학력 무관');
            } else if (this.isNoEducation) {
                result.push('무관');
            }

            // 아무것도 선택하지 않았을 경우
            var isEmpty = result.length === 0;

            var $eduOption = $(".edu_option");
            $eduOption.find('.tit').text(isEmpty ? '학력 전체' : result.join(', '));
            $eduOption.find('.btn_open_layer').text(isEmpty ? '학력 선택' : result.join(', '));
        },
        setPreview: function(isVisible){
            isVisible = typeof isVisible === 'undefined' ? true : isVisible;
            var self = this;

            var detailEduMinStateId = 'edu_min',
                detailEduMaxStateId = 'edu_max',
                detailEduPreviewId1 = 'sp_preview_education1',
                detailEduPreviewId2 = 'sp_preview_education2';

            // 상세학력 초기화
            Common.removeState(detailEduMinStateId, detailEduPreviewId1);
            Common.removeState(detailEduMaxStateId, detailEduPreviewId1);
            Common.removeState(detailEduMaxStateId, detailEduPreviewId2);

            if (typeof this.detailEducationFirtst !== 'undefined' && typeof this.detailEducationSecond !== 'undefined') {

                if (this.detailEducationFirtst.sequence === this.detailEducationSecond.sequence) {
                    Preview.remove(detailEduPreviewId2);
                    if (this.detailEducationFirtst.min !== -1) {
                        Common.setState(detailEduMinStateId, detailEduPreviewId1, this.detailEducationFirtst.min);
                    }
                    if (this.detailEducationSecond.max !== -1) {
                        Common.setState(detailEduMaxStateId, detailEduPreviewId1, this.detailEducationSecond.max);
                    }
                    Preview.append(detailEduPreviewId1, this.detailEducationFirtst.getName(), '', function () {
                        _self.firstClickedElem = undefined;
                        _self.secondClickedElem = undefined;
                        _self.selectRange();
                    }, '', isVisible);
                } else if (this.detailEducationFirtst.sequence === 0) {
                    Common.setState(detailEduMaxStateId, detailEduPreviewId1, this.detailEducationSecond.max);
                    Preview.append(detailEduPreviewId1, this.detailEducationSecond.getMinName(), '', function () {
                        _self.selectRange();
                    }, '', isVisible);
                } else if (this.detailEducationSecond.sequence === 6) {
                    Common.setState(detailEduMinStateId, detailEduPreviewId1, this.detailEducationFirtst.min);
                    Preview.append(detailEduPreviewId1, this.detailEducationFirtst.getMaxName(), '', function () {
                        _self.selectRange();
                    }, '', isVisible);
                } else {
                    Common.setState(detailEduMinStateId, detailEduPreviewId1, this.detailEducationFirtst.min);
                    Common.setState(detailEduMaxStateId, detailEduPreviewId2, this.detailEducationSecond.max);
                    Preview.append(detailEduPreviewId1, this.detailEducationFirtst.getMaxName(), '', function () {
                        _self.firstClickedElem = 0;
                        _self.selectRange(_self.arr[0], _self.arr[self.detailEducationSecond.sequence]);
                    }, '', isVisible);
                    Preview.append(detailEduPreviewId2, this.detailEducationSecond.getMinName(), '', function () {
                        _self.secondClickedElem = 6;
                        _self.selectRange(_self.arr[self.detailEducationFirtst.sequence], _self.arr[6]);
                    }, '', isVisible);
                }
            } else {
                Preview.remove(detailEduPreviewId1);
                Preview.remove(detailEduPreviewId2);
            }

            var noEducationStateId = 'edu_none',
                noEducationPreviewId = 'sp_preview_edu_none';
            if (this.isNoEducation) {
                Common.setState(noEducationStateId, noEducationPreviewId, 'y');
                Preview.append(noEducationPreviewId, '학력무관', '', function () {
                    _self.$checkBox.prop('checked', false).trigger('change');
                }, '', isVisible);
            } else {
                Common.removeState(noEducationStateId, noEducationPreviewId);
                Preview.remove(noEducationPreviewId);
            }
        }
    };

    function Element(sequence, name, alias, min, max) {
        this.sequence = sequence;
        this.name = name;
        this.title = name.replace('<br>', ' ');
        this.alias = alias;
        this.min = min;
        this.max = max;
        this.selected = false;
        this.mark = false;
        this.minEdge = false;
        this.maxEdge = false;
        if (sequence === 0) {
            this.minEdge = true;
        }
        if (sequence === 6) {
            this.maxEdge = true;
        }
    }

    Element.prototype = {
        getName: function () {
            return this.alias + (this.minEdge ? ' 졸업 이하' : this.maxEdge ? ' 졸업 이상' : ' 졸업');
        },
        getMinName: function () {
            return this.alias + ' 졸업 이하';
        },
        getMaxName: function () {
            return this.alias + ' 졸업 이상';
        }
    };

    return new Education();
});