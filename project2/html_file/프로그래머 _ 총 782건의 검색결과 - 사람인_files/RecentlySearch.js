define([
    'require', 'jquery', 'lodash', 'Common', 'Util'
], function (require, $, _, Common, Util) {
    'use strict';

    var _self;
    var RecentlySearch = function () {

    };

    RecentlySearch.prototype = {
        init: function() {
            _self = this;

            // _self.initOptions();
            // _self.initRelativeToAction();
            // _self.bindEvents();
            // _self.initParams();

            return _self;
        }
    };

    return new RecentlySearch();
});