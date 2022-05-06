define([
    'require', 'jquery'
], function (require, $) {
    'use strict';
    var TabSlider = function () {
        $.fn.tabSlider = function (options) {
            return this.each(function () {
                var $this = $(this),
                    $viewport = $('.viewport', $this),
                    $tabContainer = $('.carousel', $this),
                    $tabItems = $('> li', $tabContainer),
                    tabLength = $tabItems.length,
                    itemsArray = Array.prototype.map.call($tabItems, function (el) {
                        return $(el).outerWidth();
                    }),
                    rightMargin = itemsArray.reduce(function (a, b) {
                        return a + b;
                    }, 0) - $viewport.width(),
                    currentIndex = 0,
                    defaults = {
                        slideCount: 3,
                        $tabBtnPrev: $('.btn_prev', $this),
                        $tabBtnNext: $('.btn_next', $this),
                        onSelected: function () {
                        }
                    },
                    settings = $.extend({}, defaults, options);

                function slide(idx) {
                    if (idx <= settings.slideCount) {
                        $tabContainer.css('transform', 'translateX(0px)');
                        return;
                    }
                    var tmpIndex = idx - settings.slideCount,
                        indentWidth = 0;
                    for (var i = 0; i < tmpIndex; i++) {
                        indentWidth = indentWidth + itemsArray[i];
                    }
                    $tabContainer.css('transform', 'translateX(-' + (indentWidth > rightMargin ? rightMargin : indentWidth) + 'px)');
                }

                function highlight(idx) {
                    var $target = $tabItems.eq(idx);
                    $tabItems.removeClass('on');
                    $target.addClass('on');
                    settings.onSelected($target, currentIndex);
                    slide(idx);
                }

                function bindEvents() {

                    $tabItems.find('button')
                        .on('focus', function () {
                            currentIndex = $tabItems.index($(this).closest('li'));
                            setTimeout(function () {
                                slide(currentIndex);
                            }, 200);
                        })
                        .on('click', function () {
                            currentIndex = $tabItems.index($(this).closest('li'));
                            highlight(currentIndex);
                        });

                    if (tabLength < 2) {
                        $this.addClass('inactive');
                        return;
                    }

                    settings.$tabBtnPrev.on('click', function () {
                        currentIndex--;
                        if (currentIndex < 0) {
                            currentIndex = tabLength - 1;
                        }
                        highlight(currentIndex);
                    });

                    settings.$tabBtnNext.on('click', function () {
                        currentIndex++;
                        if (currentIndex >= tabLength) {
                            currentIndex = 0;
                        }
                        highlight(currentIndex);
                    });
                }

                bindEvents();
            });
        };
    };

    return new TabSlider();
});
