define(['jquery'], function (jq) {
    var $j = jq.noConflict(true);
    return (typeof window.jQuery === 'function') ? window.jQuery : $j;
});