var unsafeWindow,
    GM_addStyle,
    sforce,
    ApiUtils;

if (!unsafeWindow && window) {
    unsafeWindow = window;
}

if (!GM_addStyle) {
    GM_addStyle = function () {};
}

(function (unsafeWindow, $) {