function GM_addStyle(css) {
    jQuery(function () {
        var el = document.createElement('style');
        el.type = 'text/css';
        el.innerHTML = css;
        document.head.appendChild(el);
    });
}
function GM_getValue(name) {
    return undefined;
}