var doc,
    MetadataTool,
    SimpleElement,
    Bg,
    Panel,
    ScriptLoader;

doc = $(document);
MetadataTool = unsafeWindow.MetadataTool = {};
MetadataTool.$ = $(MetadataTool);
MetadataTool.jQuery = $;
MetadataTool.Hogan = Hogan;
MetadataTool.JSZip = JSZip;
sforce = unsafeWindow.sforce;
ApiUtils = unsafeWindow.ApiUtils;


function noop() {}

function clone(obj) {
    var ret, i;
    if (obj === null || obj === undefined || typeof obj in {'string': 1, 'number': 1, 'boolean': 1, 'function': 1}) {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(clone);
    } else {
        ret = {};
        for (i in obj) {
            ret[i] = clone(obj[i]);
        }
        return ret;
    }
}
MetadataTool.clone = clone;

function arrayToHash(arr, key) {
    var hash = {};
    arr.forEach(function (o) {
        hash[o[key]] = o;
    });
    return hash;
}

function arrayDivide(arr, n) {
    return [[]].concat(arr).reduce(function (ret, val) {
        var current = ret[ret.length - 1];
        if (!current || current.length === n) {
            ret.push(current = []);
        }
        current.push(val);
        return ret;
    });
}


SimpleElement = MetadataTool.SimpleElement = function (html) {
    var that = $(html)
        .on('show', function () {
            that.appendTo(document.body);
            that.show();
        })
        .on('hide', function () {
            // removeだとイベントまで消える
            that.hide();
        });
    return that;
};


Bg = MetadataTool.Bg = SimpleElement('<div class="mt-bg"></div>');

Panel = MetadataTool.Panel = SimpleElement('<div class="mt-panel"></div>');
Bg.on('hide', function () {
    Panel.trigger('hide');
});


ScriptLoader = MetadataTool.ScriptLoader = jQuery({});
ScriptLoader.on('run', function () {
    if (sforce && sforce.metadata) {
        ScriptLoader.trigger('loaded');
    } else {
        var p1, p2;
        p1 = ScriptLoader.promise('/soap/ajax/28.0/connection.js');
        p2 = ScriptLoader.promise('//github.com/mino0123/salesforce-metadata.js/raw/master/salesforce-metadata.js');
        $.when(p1, p2).then(function () {
            ScriptLoader.trigger('loaded');
        });
    }
});
ScriptLoader.promise = function (url) {
    var df = new $.Deferred();
    ScriptLoader.loadScript(url, function () {
        df.resolve();
    });
    return df.promise();
};
ScriptLoader.loadScript = function (url, onload) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = onload;
    document.head.appendChild(s);
};
ScriptLoader.on('loaded', function () {
    sforce = unsafeWindow.sforce;
    sforce.connection.sessionId = ApiUtils.getSessionId();
    sforce.metadata.sessionId = sforce.connection.sessionId;
});

ScriptLoader.on('loaded', function () {
    doc
        .on('click', '.mt-bg', function (event) {
            Bg.trigger('hide');
        })
        .on('click', '#phHeaderLogoImage, #AppPageLogo', function () {
            MetadataTool.$.trigger('run');
        });
});


MetadataTool.$.on('initialize', function () {
    ScriptLoader.trigger('run');
});


$(function () {
    if (!ApiUtils) {
        return;
    }
    MetadataTool.$.trigger('initialize');
});
