define([
    'require', 'jquery', 'handlebars', 'lodash', 'Util'
], function (require, $, Handlebars, _, Util) {
    'use strict';

    Handlebars.registerHelper('toStringByComma', function(num) {
        return _.isNumber(num) ? Util.Number.toStringByComma(num) : num;
    });

    Handlebars.registerHelper('highlight', function(keyword, text) {
        return new Handlebars.SafeString(Util.String.replaceAll(keyword, '<em>$1</em>', text));
    });

    Handlebars.registerHelper('hasCountInOverseas', function (id, mcode, count, options) {
        // 국내 지역이거나 해외지역 count 0 이상일 경우만 리턴 (해외지역의 대표지역은 있어야함)
        if (mcode < 210000 || ((mcode >= 210000 && count >
            0)) || id !== 'loc_cd') {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('hasCountInJobCategory', function(count, options){
        if (count > 0){
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('isNotAllType', function (type, options) {
        if (type !== 'all') {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('optionsMarked', function (mark, options) {
        if (mark) {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('optionsChecked', function (selected, options) {
        if (selected) {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('safeStr', function (str) {
        return new Handlebars.SafeString(str);
    });

    return {
        get: function(id, data) {
            var $el = $('#' + id);
            if ($el.length === 0) {
                return "";
            }
            var template = Handlebars.compile($el.html());
            return template(data || {});
        }
    };
});