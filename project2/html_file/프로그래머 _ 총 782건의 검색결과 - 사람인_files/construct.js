var STICKY = {};

(function ($) {
    var _self = {};

    var Construct = function() {
        _self = this;

        _self.version         = '1.0.0';
        _self.exposed         = [];
    };

    Construct.prototype = {
        init: function () {
            _self.run();
        },
        run: function (behavior, pathname) {
            if (typeof jQuery === "undefined") {
                console.log('not exist jquery');
                return false;
            }

            behavior = behavior || _self.getBehavior();
            pathname = pathname || window.location.pathname;

            if (!pathname) {
                return false;
            }
            _self.getSticky(behavior, pathname);
        },
        setCode: function (code) {
            if (!code) {
                return false;
            }
            _self.exposed.push(code);
        },
        getCode: function () {
            return _self.exposed;
        },
        getBehavior: function () {
            if (document.referrer !== '' && document.referrer.indexOf('saramin') < 0) {
                return 'referrer';
            }

            if (document.referrer.indexOf('saramin') > 0) {
                return 'saramin';
            }
        },
        getSticky: function(behavior, pathname) {
            search_values = _self.getSearch();
            if (checkResumeCompletePathname(pathname)) {
                search_values = getResumeCompleteQueryString(pathname, search_values);
                pathname = '/zf_user/resume/resume-complete';
            }
            _self.clearStickyWrap();
            $.ajax({
                url : '/zf_user/connect/get-sticky',
                type: 'POST',
                data: {
                    'page'     : pathname,
                    'behavior' : behavior,
                    'search'   : search_values,
                    'exposed'  : _self.getCode()
                },
                dataType: 'JSON'
            }).done(function (response) {
                if (isStickyRequestFailed(response)) {
                    return false;
                }
                if (isNotDefinedSticky()) {
                    appendStickyScript();

                    if (isNotDefinedSticky()) {
                        return false;
                    }
                }
                _self.setCode(getActiveCode(response));
                STICKY.Main.run(response);
            });

            function isStickyRequestFailed (response) {
                return typeof response === 'undefined' || response.code !== 200;
            }
            function isNotDefinedSticky () {
                return (typeof STICKY.Main) === 'undefined';
            }
            function appendStickyScript () {
                $('body').append("<script src='/js/sticky/main.js?ts=" + new Date().getTime() + "'></script>");
            }
            function getActiveCode(response) {
                return response.data.activeCode;
            }
            function checkResumeCompletePathname(pathname) {
                var search_text = '/zf_user/resume/resume-complete';
                return pathname.search(search_text) > -1 && !window.location.search ? true : false;
            }
            function getResumeCompleteQueryString(pathname, search_values) {
                if (search_values) {
                    return search_values;
                }

                var paramArr = pathname.replace('/zf_user/resume/resume-complete/', '').split("/"),
                    obj = {};

                for (var i = 0; i < paramArr.length; i=i+2) {
                    if (paramArr[i] == 'undifined' || paramArr[i] == '' || paramArr[i].length < 1) {
                        continue;
                    }
                    obj[paramArr[i]] = paramArr[i+1];
                }

                if ($.isEmptyObject(obj)) {
                    return search_values;
                }
                return _self.getSearch('?' + $.param(obj));
            }
        },
        getSearch: function (search, type) {
            type   = type   || 'json';
            search = search || window.location.search;

            if (!search) {
                return null;
            }

            var result = {},
                string = search.substr(1).split('&'),
                string_length = string.length;

            var rs = '';
            for (var idx = 0; idx < string_length; ++idx) {
                rs = string[idx].split('=', 2);
                try {
                    result[rs[0]] = rs.length === 1 ? "" : decodeURIComponent(rs[1].replace(/\+/g, " "));
                } catch (e) {}
            }

            return type === 'json' ? JSON.stringify(result) : result;
        },
        clearStickyWrap : function () {
            $('#_sticky_warp').html('');
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        STICKY.Construct = new Construct();
        STICKY.Construct.init();
        STICKY.during_process = false;
    }, false);

}(jQuery, window));
