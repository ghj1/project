var QUICK_APPLY_OBJ = {};
(function ($, window) {
    var self = {};
    var QUICK_APPLY = function () {
        self = this;
    };
    QUICK_APPLY.prototype = {
        init: function () {
            self.params = {};
            self.applyUrl = '/zf_user/member/apply';
            self.loginUrl = '/zf_user/member/apply/login';
            self.layerWrapperDiv = $('#wrap_quick_apply_layer');
            self.iframeWrapper = $('#quick_apply_layer_frame');
            self.incidentBanner = $('#notice_service_info_layer');
            self.dimmedLpopIncident = $('.dimmed_lpop_incident');
            self.closeReload = false;
            self.setWindowScript();
        },
        quickApplyForm: function (rec_idx, company_nm, track_url, search_url, category) {
            self.params = {
                rec_idx: rec_idx,
                company_nm: company_nm,
                track_url: track_url || '',
                search_url: search_url || '',
                category: category || ''
            };
            self.checkLayerCondition();
        },

        checkLayerCondition: function () {
            return $.ajax({
                url: '/zf_user/member/apply/check-open-layer-condition',
                dataType: 'json',
                method: 'post',
                success: function (json) {
                    if (!json.code) {
                        return;
                    }
                    self.showQuickApplyLayer(json.code);
                },
                error: function () {
                    alert('오류가 발생했습니다. 다시 시도해 주세요.');
                }
            });
        },
        showQuickApplyLayer: function (code) {
            self.readJob();
            if (code === 'need_verify_name') {
                alert('휴대폰 또는 이메일 인증을 완료하신 후에 입사지원이 가능합니다.');
                return;
            }

            if (code === 'need_person_login') {
                if (!confirm('기업회원으로 로그인되어 있어 이용하실 수 없습니다.\n\n개인회원으로 로그인하시겠습니까?')) {
                    return;
                }

                return self.showLoginLayer();
            }

            if (code === 'need_login') {
                return self.showLoginLayer();
            }

            if (code === 'new_layer') {
                self.iframeWrapper.attr('src', self.makeApplyUrl());
                self.hideSticky();
                self.layerWrapperDiv.show();
                self.iframeWrapper.show();
            }
        },
        showLoginLayer: function (){
            self.closeReload = true;    // 레이어 닫을때 새로 고침해줌
            self.iframeWrapper.attr('src', self.makeLoginUrl());
            self.hideSticky();
            self.layerWrapperDiv.show();
            self.iframeWrapper.show();
        },
        closeQuickApplyLayer: function () {
            self.iframeWrapper.attr('src', 'about:blank');
            self.layerWrapperDiv.hide();
            self.showSticky();
            if(!self.isReloadTarget()) {
                return;
            }
            self.checkLoginStatus('', function () {
                location.reload();
            });
        },
        setStatisticVal: function () {
            var statisticEl = document.getElementById('goStatistic');
            if (statisticEl !== null && statisticEl.value === 'ready') {
                statisticEl.value = 'go';
            }
        },
        makeLoginUrl: function () {
            var params =   '?rec_idx=' + self.params.rec_idx + '&category=' + self.params.category;
            params += self.params.track_url ? '&' + self.params.track_url : '';
            params += self.params.search_url ? '&' + self.params.search_url : '';
            return self.loginUrl + params;
        },
        makeApplyUrl: function () {
            var params = '?rec_idx=' + self.params.rec_idx;
            params += self.params.track_url ? '&' + self.params.track_url : '';
            params += self.params.search_url ? '&' + self.params.search_url : '';
            return self.applyUrl + params;
        },
        hideSticky: function () {
            var stickyLayer = $('#_sticky_layer');
            if (stickyLayer.length > 0) {
                stickyLayer.hide();
            }
        },
        showSticky: function () {
            var stickyLayer = $('#_sticky_layer');
            if (stickyLayer.length > 0) {
                stickyLayer.show();
            }
        },
        readJob: function () {
            var spec = 'apply_status=y&reg_source_type=pc';
            try {
                if (typeof Saramin.readJob === 'function') {
                    Saramin.readJob(self.params.rec_idx, spec);
                }
            } catch (e) {

            }
        },
        setWindowScript: function () {
            window.quickApplyForm = self.quickApplyForm;
            window.closeQuickApplyLayer = self.closeQuickApplyLayer;
        },
        getParam: function (paramsStr, sname) {
            if(paramsStr === '' || sname === ''){
                return '';
            }
            var sval = '';
            paramsStr = paramsStr.split("&");
            for (var i = 0; i < paramsStr.length; i++) {
                temp = paramsStr[i].split("=");
                if ([temp[0]] == sname) { sval = temp[1]; }
            }
            return sval;
        },
        checkLoginStatus: function (memGb, callback) {
            $.ajax({
                url: '/zf_user/index/login-status?mem_gb=' + memGb,
                success: function (json) {
                    if(!!json){
                        callback();
                    }
                }
            });
        },
        isReloadTarget: function () {
            var paramsStr = self.params && self.params.track_url || '';
            return self.getParam(paramsStr, 't_category') === 'main' && self.closeReload;
        }
    };
    $(document).ready(function () {
        QUICK_APPLY_OBJ = new QUICK_APPLY();
        QUICK_APPLY_OBJ.init();
    });

})(jQuery, window);
