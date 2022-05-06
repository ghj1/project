var config = {
    baseUrl: '/js/search-panel/components',
    paths: {
        'jquery'            : '/js/libs/jquery-1.11.1.min',
        'jquery-private'    : '/js/libs/jquery-private',
        'handlebars'        : '/js/libs/handlebars-v4.0.5',
        'lodash'            : '/js/libs/lodash-3.10.1.min',
        'history'           : '//www.saraminimage.co.kr/js/libs/history/jquery.history',
        'Common'            : '/js/search-panel/Common',
        'Util'              : '/js/search-panel/Util',
        'EventBinding'      : '/js/search-panel/EventBinding',
        'Template'          : '/js/search-panel/Template',
        'DepthAbstract'     : '/js/search-panel/DepthAbstract',
        'Preview'           : '/js/search-panel/Preview',
        'AutoComplete'      : '/js/search-panel/AutoComplete',
        'TabStyleAbstract'  : '/js/search-panel/TabStyleAbstract',
        'tinyscrollbar'     : '//www.saraminimage.co.kr/js/libs/jquery.tinyscrollbar.min',
        'OverseasArea'      : '/js/search-panel/OverseasArea',
        'TabSlider'         : '/js/search-panel/TabSlider',
        'List'              : '/js/search-panel/List',
        'SearchHistory'     : '/js/search-panel/SearchHistory'
    },
    map: {
        '*': {'jquery': 'jquery-private'},
        'jquery-private': {'jquery': 'jquery'}
    },
    shim: {
        'history': {
            deps: ['jquery'],
            exports: 'History'
        }
    }
};

if (typeof window.JSON === 'undefined') {
    config.paths.json = '//www.saraminimage.co.kr/js/libs/history/json2';
    config.shim.history.deps.push('json');
    config.shim.json = {exports: 'JSON'};
}

require.config(config);
require(
    ['require', 'jquery', 'lodash', 'Util', 'Common', 'Preview', 'EventBinding', 'OverseasArea', 'List', 'SearchHistory'].concat(JSON.parse(window.searchPanelArgs.components) || []),
    function (require, $, _, Util, Common, Preview) {
        'use strict';

        var SearchPanel = function() {
            this.init.apply(this, arguments);
        };

        SearchPanel.prototype = {
            init: function(args) {
                this.setArguments(args);

                Common.setArguments({
                    'action': this.action,
                    'params': this.params,
                    'options': this.options,
                    'searchUpperCodes': this.searchUpperCodes,
                    'searchMaxCount': this.searchMaxCount,
                    'loggingOptions': this.loggingOptions
                }).setInitialParams();

                this.initComponent();
                if (this.action !== 'unified') {
                    this.initAdditionalComponent();
                }
            },

            setArguments: function(args) {
                this.action     = !Util.Lang.isEmpty(args.action) ? args.action : '';
                this.components = !Util.Lang.isEmpty(args.components) ? JSON.parse(args.components) : [];
                try {
                    this.params = !Util.Lang.isEmpty(args.params) ? JSON.parse(args.params) : {};
                } catch (e) {
                    this.params = {};
                }
                try {
                    this.options = !Util.Lang.isEmpty(args.options) ? JSON.parse(args.options) : {};
                } catch (e) {
                    this.options = {};
                }
                try {
                    this.searchUpperCodes = !Util.Lang.isEmpty(args.searchUpperCodes) ? JSON.parse(args.searchUpperCodes) : {};
                } catch (e) {
                    this.searchUpperCodes = {};
                }
                try {
                    this.searchMaxCount = !Util.Lang.isEmpty(args.searchMaxCount) ? JSON.parse(args.searchMaxCount) : {};
                } catch (e) {
                    this.searchMaxCount = {};
                }
                try {
                    this.loggingOptions = !Util.Lang.isEmpty(args.loggingOptions) ? JSON.parse(args.loggingOptions) : {};
                } catch (e) {
                    this.loggingOptions = {};
                }
            },

            initComponent: function() {
                Preview.pauseGettingCount();

                _.forEach(this.components, function(name) {
                    this.setComponent(name);
                }.bind(this));


                this.setComponent('OverseasArea');

                Preview.resumeGettingCount().getCount();
            },

            initAdditionalComponent: function() {
                $(document).ready(function() {
                    require('List').init();
                });
            },

            setComponent: function(name) {
                var component = require(name);
                if (_.isObject(component.init)) {
                    component.init();
                }
                Common.setComponent(name.replace(/([a-zA-Z])+\//g, ''), component);
                return component;
            },

            getComponent: function(name) {
                return Common.getComponent(name);
            }
        };

        window.SearchPanel = new SearchPanel(window.searchPanelArgs || {});
        //@todo 임시 // console 에서 쉽게 접근가능하도록
        window.SearchPanelStore = Common;
    }
);