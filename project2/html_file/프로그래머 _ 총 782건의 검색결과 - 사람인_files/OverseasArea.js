define([
    'require', 'jquery', 'lodash', 'Common', 'Util', 'Template', 'DepthAbstract'
], function (require, $, _, Common, Util, Template, DepthAbstract) {
    'use strict';

    var _self,
        OverseasArea = function () {
        this.name = 'area';
        this.$wrapper = $('div.area_section');
        this.oneDepthTemplate = 'sp_overseas_area_1depth_template';
        this.oneDepthText = 'area_1depth_overseas_text';
        this.lastDepthTemplate = 'sp_overseas_area_lastDepth_template';
        this.lastDepthArea = 'sp_overseas_area_lastDepth';

        this.params = {};
        this.eventFlowName = 'fore';
    };

    OverseasArea.prototype = _.create(DepthAbstract.prototype, {
        constructor: OverseasArea,

        init: function() {
            _self = this;
            return _self;
        },

        generateDefaultDepth: function (params) {
            var _self = this,
                tmplData = { list : [] },
                oneDepthText = Common.getOption(_self.oneDepthText),
                sortKey = ['220200', '211200', '211300', '210000', '220000', '230000', '240000', '250000', '260000', '270000', '280000'],
                depth1Count = Common.getOption(_self.name + '_1depth_count');

            _.forEach(sortKey, function (key) {
                tmplData.list.push({
                    code: key, name: oneDepthText[key], count: depth1Count[key], selected: (params.indexOf(key) > -1) ? 'selected' : ''
                });
            });

            $('#' + _self.oneDepthTemplate).after(Template.get(_self.oneDepthTemplate, tmplData));
        }
    });

    return new OverseasArea();
});