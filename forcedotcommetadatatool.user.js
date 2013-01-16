// ==UserScript==
// @id             ForceDotComMetadataTool
// @name           ForceDotComMetadataTool
// @version        0.1
// @namespace      
// @author         minoaw
// @description    
// @include        https://*.salesforce.com/*
// @run-at         document-end
// @require        lib/jquery-1.8.3.min.js
// @require        lib/Hogan.js/hogan-2.0.0.min.js
// @require        lib/JSZip/jszip.js
// @require        lib/JSZip/jszip-load.js
// @require        lib/JSZip/jszip-inflate.js
// @require        lib/JSZip/jszip-deflate.js
// @noframes       
// ==/UserScript==

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
GM_addStyle(
    '#phHeaderLogoImage, #AppPageLogo {' +
    '    cursor: pointer;' +
    '}' +
    '.mt-bg {' +
    '    opacity: 0.2;' +
    '    background-color: #000;' +
    '    width: 100%;' +
    '    height: 100%;' +
    '    position: fixed;' +
    '    top: 0;' +
    '    left: 0;' +
    '    z-index: 100;' +
    '}' +
    '.mt-panel {' +
    '    position: absolute;' +
    '    top: 20px;' +
    '    left: 100px;' +
    '    background-color: #fff;' +
    '    padding: 20px;' +
    '    border-radius: 20px;' +
    '    z-index: 101;' +
    '    min-width: 500px;' +
    '    min-height: 200px;' +
    '}' +

    '.mt-tab-list {' +
    '    position: absolute;' +
    '    top: 5px;' +
    '    left: 100px;' +
    '    z-index: 102;' +
    '    list-style-type: none;' +
    '    margin: 0;' +
    '    padding: 0;' +
    '    font-weight: bold;' +
    '}' +
    '.mt-tab {' +
    '    background-color: #FFFFFF;' +
    '    border-radius: 8px 8px 0 0;' +
    '    border: 1px solid #DDD;' +
    '    color: #ABC;' +
    '    width: 110px;' +
    '    margin: 0;' +
    '    padding: 5px 10px 5px 10px;' +
    '    cursor: pointer;' +
    '    float: left;' +
    '}' +
    '.mt-tab.selected {' +
    '    border-bottom: none;' +
    '}' +


    '.mt-gd-table {' +
    '    border-collapse: collapse;' +
    '}' +
    '.mt-gd-row {' +
    '}' +
    '.mt-gd-cell {' +
    '    border: 1px dotted #999;' +
    '}' +
    '.mt-gd-cell-view {' +
    '    margin-left: 10px;' +
    '    float: right;' +
    '}' +
    '.mt-sod-table {' +
    '    border-collapse: collapse;' +
    '}' +
    '.mt-sod-table-head {' +
    '    background-color: #747E96;' +
    '    color: #FFFFFF;' +
    '    font-size: larger;' +
    '    font-weight: bold;' +
    '}' +
    '.mt-sod-table-head th {' +
    '    padding: 5px 100px;' +
    '}' +
    '.mt-sod-row {' +
    '}' +
    '.mt-sod-head {' +
    '    background-color: #CCC;' +
    '    border: 1px dotted #000;' +
    '}' +
    '.mt-sod-cell {' +
    '    border: 1px dotted #000;' +
    '    padding: 3px;' +
    '}' +
    '.mt-gd-group-head {' +
    '    background-color: #EEECD1;' +
    '    border: 1px solid #CCCCCC;' +
    '    font-weight: bold;' +
    '}' +
    '.mt-so-tab-list {' +
    '    position: absolute;' +
    '    top: 50px;' +
    '    left: 10px;' +
    '    z-index: 102;' +
    '    list-style-type: none;' +
    '    margin: 0;' +
    '    padding: 0;' +
    '    font-weight: bold;' +
    '    text-align: right;' +
    '    cursor: default;' +
    '}' +
    '.mt-so-tab {' +
    '    background-color: #EEEEFF;' +
    '    border-radius: 8px 0 0 8px;' +
    '    border: 1px solid #DDD;' +
    '    color: #333;' +
    '    width: 95px;' +
    '    margin: 0;' +
    '    padding: 5px 10px 5px 0;' +
    '    cursor: pointer;' +
    '}' +
    '.mt-so-tab-list .selected {' +
    '    background-color: #FFF;' +
    '    border-right: none;' +
    '    color: #545454;' +
    '}' +

    '.mt-table {' +
    '    border-collapse: collapse;' +
    '}' +
    '.mt-table-head {' +
    '    background-color: #CCC;' +
    '    border: 1px dotted #000;' +
    '}' +
    '.mt-table-cell {' +
    '    border: 1px dotted #CCC;' +
    '}'+

    '.mt-deploy-panel input[type=text] {' +
    '    width: 300px;' +
    '}' +
    '#mt-deploy-content {' +
    '    width: 1000px;' +
    '    height: 600px;' +
    '}' +
    '#mt-deploy-meta {' +
    '    width: 1000px;' +
    '    height: 300px;' +
    '}'
);
var Template = {};
Template.GlobalDescribe =
    '<table class="mt-gd-table">' +
    '    {{#groups}}' +
    '        <tr class="mt-gd-group-head">' +
    '            <td colspan="{{config.columns}}">{{title}}</td>' +
    '        </tr>' +
    '        {{#rows}}' +
    '            <tr>' +
    '                {{#cells}}' +
    '                    <td class="mt-gd-cell">' +
    '                        <a href="javascript:void 0;" class="mt-gd-cell-sobject" data-sobject-name="{{name}}">{{label}}</a>' +
    '                        {{#keyPrefix}}' +
    '                            <a href="/{{keyPrefix}}" class="mt-gd-cell-view">view</a>' +
    '                        {{/keyPrefix}}' +
    '                        &nbsp;&nbsp;' +
    '                        {{#id}}<a href="/{{id}}" class="mt-gd-cell-view">setup</a>{{/id}}' +
    '                    </td>' +
    '                {{/cells}}' +
    '            </tr>' +
    '        {{/rows}}' +
    '    {{/groups}}' +
    '</table>';

Template.DescribeMetadata =
    '<table class="mt-table">' +
    '    <tr>' +
    '        <th class="mt-table-head">XmlName</th>' +
    '        <th class="mt-table-head">InFolder</th>' +
    '        <th class="mt-table-head">MetaFile</th>' +
    '        <th class="mt-table-head">Suffix</th>' +
    '        <th class="mt-table-head">DirectoryName</th>' +
    '        <th class="mt-table-head">ChildXmlNames</th>' +
    '    </tr>' +
    '    {{#metadataObjects}}' +
    '    <tr>' +
    '        <td class="mt-table-cell"><a data-name="{{xmlName}}" class="mt-md-name" href="javascript:void 0;">{{xmlName}}</a></td>' +
    '        <td class="mt-table-cell">{{inFolder}}</td>' +
    '        <td class="mt-table-cell">{{metaFile}}</td>' +
    '        <td class="mt-table-cell">{{suffix}}</td>' +
    '        <td class="mt-table-cell">{{directoryName}}</td>' +
    '        <td class="mt-table-cell">{{#childXmlNames}}<a data-name="{{.}}" class="mt-md-name" href="javascript:void 0;">{{.}}</a><br />{{/childXmlNames}}</td>' +
    '    </tr>' +
    '    {{/metadataObjects}}' +
    '</table>';
Template.SObjectDescribe =
    '<table class="mt-sod-table">' +
    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="{{colLength}}">{{label}} {{name}}</th>' +
    '    </tr>' +
    '    <tr class="mt-sod-row">' +
    '        {{#titles}}' +
    '            <td class="mt-sod-head">{{{.}}}</td>' +
    '        {{/titles}}' +
    '    </tr>' +
    '    {{#fields}}' +
    '        <tr class="mt-sod-row">' +
    '            {{#values}}' +
    '                <td class="mt-sod-cell">{{{.}}}</td>' +
    '            {{/values}}' +
    '        </tr>' +
    '    {{/fields}}' +
    '</table>';
Template.SObjectTabList =
    '<ul class="mt-so-tab-list">' +
    '    {{#tabs}}' +
    '        <li class="mt-so-tab" data-title="{{title}}">{{title}}</li>' +
    '    {{/tabs}}' +
    '</ul>';
Template.ChildRelationships =
    '<table class="mt-sod-table">' +

    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="6">{{label}} {{name}}</th>' +
    '    </tr>' +

    '    <tr>' +
    '        <td class="mt-sod-head">オブジェクト</td>' +
    '        <td class="mt-sod-head">ラベル</td>' +
    '        <td class="mt-sod-head">項目</td>' +
    '        <td class="mt-sod-head">子リレーション名</td>' +
    '        <td class="mt-sod-head">連鎖削除</td>' +
    '        <td class="mt-sod-head">非推奨</td>' +
    '    </tr>' +
    '    {{#childRelationships}}' +
    '        <tr>' +
    '            <td class="mt-sod-cell">{{childSObject}}</td>' +
    '            <td class="mt-sod-cell">{{label}}</td>' +
    '            <td class="mt-sod-cell">{{field}}</td>' +
    '            <td class="mt-sod-cell">{{relationshipName}}</td>' +
    '            <td class="mt-sod-cell">{{cascadeDelete}}</td>' +
    '            <td class="mt-sod-cell">{{deprecatedAndHidden}}</td>' +
    '        </tr>' +
    '    {{/childRelationships}}' +
    '</table>';
Template.RecordTypeInfos =
    '<table class="mt-sod-table">' +

    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="4">{{label}} {{name}}</th>' +
    '    </tr>' +

    '    <tr>' +
    '        <td class="mt-sod-head">名前</td>' +
    '        <td class="mt-sod-head">ID</td>' +
    '        <td class="mt-sod-head">デフォルト</td>' +
    '        <td class="mt-sod-head">有効</td>' +
    '    </tr>' +
    '    {{#recordTypeInfos}}' +
    '        <tr>' +
    '            <td class="mt-sod-cell">{{name}}</td>' +
    '            <td class="mt-sod-cell">{{recordTypeId}}</td>' +
    '            <td class="mt-sod-cell">{{defaultRecordTypeMapping}}</td>' +
    '            <td class="mt-sod-cell">{{available}}</td>' +
    '        </tr>' +
    '    {{/recordTypeInfos}}' +
    '</table>';
Template.Details =
    '<table class="mt-sod-table">' +

    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="2">{{label}} {{name}}</th>' +
    '    </tr>' +

    '    {{#details}}' +
    '        <tr>' +
    '            <td class="mt-sod-head">{{title}}</td>' +
    '            <td class="mt-sod-cell">{{value}}</td>' +
    '        </tr>' +
    '    {{/details}}' +
    '</table>';
Template.FieldConfigurator =
    '<table class="mt-sod-table">' +

    '    {{#rows}}' +
    '        <tr>' +
    '            <td class="mt-sod-head">{{{title}}}</td>' +
    '            <td class="mt-sod-cell">' +
    '                <input type="checkbox" data-id="{{id}}" {{#checked}}checked{{/checked}} class="field-config" />' +
    '            </td>' +
    '        </tr>' +
    '    {{/rows}}' +
    '</table>';
Template.GeneralTableView =
    '<table class="mt-table">' +
    '    <tr>' +
    '        {{#headers}}' +
    '        <th class="mt-table-head">' +
    '            {{.}}' +
    '        </th>' +
    '        {{/headers}}' +
    '    </tr>' +
    '    {{#rows}}' +
    '    <tr>' +
    '        {{#cells}}' +
    '            <td class="mt-table-cell">{{{.}}}</td>' +
    '        {{/cells}}' +
    '    </tr>' +
    '    {{/rows}}' +
    '</table>';

Template.RawDeploy =
    '<div class="mt-deploy-panel">' +
    '    <table>' +
    '        <tr>' +
    '            <td><label for="mt-deploy-name">name:</label></td>' +
    '            <td><input type="text" id="mt-deploy-name"></td>' +
    '        </tr>' +
    '        <tr>' +
    '            <td><label for="mt-deploy-member">member:</label></td>' +
    '            <td><input type="text" id="mt-deploy-member"></td>' +
    '        </tr>' +
    '        <tr>' +
    '            <td><label for="mt-retrieve-file">file:</label></td>' +
    '            <td><input type="text" id="mt-retrieve-file"></td>' +
    '        </tr>' +
    '        <tr>' +
    '            <td><label for="mt-deploy-dir">directory:</label></td>' +
    '            <td><input type="text" id="mt-deploy-dir"></td>' +
    '        </tr>' +
    '        <tr>' +
    '            <td><label for="mt-deploy-basename">basename:</label></td>' +
    '            <td><input type="text" id="mt-deploy-basename"></td>' +
    '        </tr>' +
    '        <tr>' +
    '            <td><label for="mt-deploy-ext">extension:</label></td>' +
    '            <td><input type="text" id="mt-deploy-ext"></td>' +
    '        </tr>' +
    '        <tr>' +
    '            <td><label for="mt-retrieve-has-meta">meta file:</label></td>' +
    '            <td><input type="checkbox" id="mt-retrieve-has-meta"></td>' +
    '        </tr>' +
    '    </table>' +
    '    <button id="mt-retrieve">retrieve</button>' +
    '    <button id="mt-deploy">deploy</button>' +
    '    <br />' +
    '    <textarea id="mt-deploy-content"></textarea>' +
    '    <br />' +
    '    <textarea id="mt-deploy-meta"></textarea>' +
    '</div>';
Template.TabList =
    '<ul id="{{id}}" class="mt-tab-list">' +
    '    {{#tabs}}' +
    '        <li class="mt-tab" id="{{id}}" data-id="{{id}}">{{text}}</li>' +
    '    {{/tabs}}' +
    '</ul>';

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
        p1 = ScriptLoader.promise('/soap/ajax/26.0/connection.js');
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
    setTripleClick(doc, '.mt-sod-table', function () {
        unsafeWindow.getSelection().selectAllChildren($('.mt-sod-table')[0]);
    });
    function setTripleClick($el, selector, fn) {
        var counter = 0;
        function clearCounter() {
            counter = 0;
        }
        $el.on('click', selector, function () {
            counter++;
            if (counter === 3) {
                fn();
                clearCounter();
            }
            setTimeout(clearCounter, 500);
        });
    }
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

var Data;

Data = MetadataTool.Data = MetadataTool.Data = {
    data: {
        global: null,
        sobjects: {},
        describeMetadata: null,
        metadataList: {}
    },
    supportMetadata: null,
    setHook: function (obj, name, fn) {
        var oldFn = obj[name], ret;
        obj[name] = function () {
            ret = fn.apply(this, arguments);
            if (oldFn) {
                oldFn.apply(this, ret === undefined ? arguments : [ret]);
            }
        };
    },
    createCallback: function (obj, preSuccess, preFailure) {
        var callback = {onSuccess: obj.onSuccess || noop, onFailure: obj.onFailure || noop};
        if (preSuccess) {
            this.setHook(callback, 'onSuccess', preSuccess);
        }
        if (preFailure) {
            this.setHook(callback, 'onFailure', preFailure);
        }
        return callback;
    },
    promise: function (name, args) {
        var df = new $.Deferred();
        args = clone(args) || {};
        args.onSuccess = function (result) {
            df.resolve(result);
        };
        args.onFailure = function (fault) {
            df.reject(fault);
        };
        this[name](args);
        return df.promise();
    },
    getGlobalDescribe: function (args) {
        var data = this.data,
            callback;
        if (data.global && args.onSuccess) {
            args.onSuccess(data.global);
        } else {
            callback = this.createCallback(args, function (gd) {
                data.global = gd;
            });
            sforce.connection.describeGlobal(callback);
        }
    },
    getSObjectHash: function (args) {
        var callback = this.createCallback(args, function (gd) {
            var ret = {};
            gd.getArray('sobjects').forEach(function (so) {
                ret[so.name] = so;
            });
            return ret;
        });
        this.getGlobalDescribe(callback);
    },
    getSObjectDescribe: function (args) {
        var type = args.type,
            sobjects = this.data.sobjects,
            callback;
        if (sobjects[type] && args.onSuccess) {
            args.onSuccess(sobjects[type]);
        } else {
            callback = this.createCallback(args, function (sobject) {
                sobjects[type] = sobject;
            });
            sforce.connection.describeSObject(type, callback);
        }
    },
    describeMetadata: function (args) {
        var that = this,
            data = this.data,
            callback;
        if (data.describeMetadata && args.onSuccess) {
            args.onSuccess(data.describeMetadata);
        } else {
            callback = this.createCallback(
                args,
                function (md) {
                    that.supportMetadata = true;
                    data.describeMetadata = md;
                },
                function (fault) {
                    if (fault.faultcode === 'sf:INSUFFICIENT_ACCESS') {
                        that.supportMetadata = false;
                    } else {
                        alert(fault);
                        console.log(fault);
                    }
                }
            );
            sforce.metadata.describeMetadata(25, callback);
        }
    },
    getMetadataList: function (args) {
        var that = this,
            metadataList = this.data.metadataList,
            type = args.type,
            callback;
        if (metadataList[type] && args.onSuccess) {
            args.onSuccess(clone(metadataList[type]));
        } else {
            callback = this.createCallback(
                args,
                function (list) {
                    that.supportMetadata = true;
                    metadataList[type] = list;
                    return clone(list);
                },
                function (fault) {
                    if (fault.faultcode === 'sf:INSUFFICIENT_ACCESS') {
                        that.supportMetadata = false;
                    } else {
                        alert(fault);
                        console.log(fault);
                    }
                }
            );
            sforce.metadata.listMetadata({queries: [{type: type}]}, callback);
        }
    },
    retrieve: function (typeName, members, callback) {
        function waitForDone(callback) {
            function getResult(id) {
                sforce.metadata.checkRetrieveStatus(id, callback);
            }
            function check(results) {
                var done = results[0].getBoolean("done");
                if (!done) {
                    setTimeout(function () {
                        sforce.metadata.checkStatus([results[0].id], check);
                    }, 1000);
                } else {
                    getResult(results[0].id);
                }
            }
            return function (result) {
                check([result]);
            };
        }
        var req, result;
        req = new sforce.RetrieveRequest();
        req.apiVersion = "25.0";
        req.singlePackage = false;
        req.unpackaged = {
            types: [{name: typeName, members:members}]
        };
        sforce.metadata.retrieve(req, waitForDone(function (result) {
            var zip, data;
            zip = new JSZip(result.zipFile, {base64:true});
            callback(zip);
        }));
    },
    deploy: function (args, callback) {
        function waitForDone(callback) {
            function getResult(id) {
                sforce.metadata.checkDeployStatus(id, callback);
            }
            function check(results) {
                var done = results[0].getBoolean("done");
                if (!done) {
                    setTimeout(function () {
                        sforce.metadata.checkStatus([results[0].id], check);
                    }, 1000);
                } else {
                    getResult(results[0].id);
                }
            }
            return function (result) {
                check([result]);
            };
        }
        var req, pack, zip, path,
            meta = args.meta;
        pack = new sforce.Package();
        pack.version = 25;
        pack.types = [{name: args.name, members: args.member}];
        path = 'src/' + args.dir + '/' + args.basename + '.' + args.ext;
        req = new sforce.DeployRequest();
        zip = new JSZip();
        zip.file("src/package.xml", pack.toXml());
        zip.file(path, args.content);
        if (meta) {
            zip.file(path + "-meta.xml", meta);
        }
        req.zipFile = zip.generate({base64: true});
        this.describeMetadata({
            onSuccess: function (desc) {
                if (desc.testRequired) {
                    req.deployOptions = new sforce.Xml();
                    req.deployOptions.rollbackOnError = true;
                }
                sforce.metadata.deploy(req, waitForDone(function (result) {
                    console.log(result);
                }));
            }
        });
    }
};
var GeneralTableView;

GeneralTableView = MetadataTool.GeneralTableView = function () {
    this.$ = $(this);
    this.headers = [];
    this.rows = [];
    this.$.on('render', function () {
        if (!this.el) {
            this.el = $(this.renderer.render(this));
        }
        Panel.append(this.el);
    });
    this.$.on('remove', function () {
        if (this.el) {
            this.el.remove();
        }
    });
};
GeneralTableView.byHashArray = function (arr) {
    var v, first, keys;
    v = new GeneralTableView();
    first = arr[0];
    if (first) {
        v.headers = Object.keys(first);
    }
    arr.forEach(function (hash) {
        var row = {cells: []};
        v.headers.forEach(function (name) {
            row.cells.push(hash[name]);
        });
        v.rows.push(row);
    });
    return v;
};
GeneralTableView.prototype.renderer = Hogan.compile(Template.GeneralTableView);

var IdGenerator, TabList, Tab;


IdGenerator = (function () {
    var counter = 1;
    return {
        generate: function (name) {
            return (name || '') + counter++;
        }
    };
})();


TabList = function () {
    this.$ = $(this);
    this.id = IdGenerator.generate();
    this.tabs = [];
    this.$.on('run', function () {
        this.$.trigger('render');
        this.el.find('.mt-tab:first').trigger('click');
    });
    this.$.on('render', function () {
        var el, html;
        if (this.el) {
            this.el.remove();
        }
        html = this.renderer.render(this);
        el = this.el = $(html);
        el.appendTo(document.body);
        el.show();
    });
    var that = this;
    doc.on('click', '#' + this.id + ' .mt-tab', function (event) {
        that.$.trigger('click', event.target);
    });
    this.$.on('click', function (event, target) {
        var oldSelectedEl, oldSelected, id, selected;
        oldSelectedEl = that.el.find('.mt-tab.selected');
        oldSelected = that.tabs.filter(function (t) {
            return t.id === oldSelectedEl.data('id');
        })[0];
        if (oldSelected) {
            oldSelected.$.trigger('unselect');
            oldSelectedEl.removeClass('selected');
        }
        target = $(target);
        id = target.data('id');
        target.addClass('selected');
        selected = that.tabs.filter(function (t) {
            return t.id === id;
        })[0];
        that.$.trigger('refresh');
        selected.$.trigger('select');
    });
    this.$.on('hide', function () {
        if (this.el) {
            this.el.hide();
        }
    });
    this.select = function (id) {
        var target = this.el.find('#' + id);
        target.trigger('click');
    };
    this.getSelected = function () {
        var id, selectedTab;
        if (this.el) {
            id = this.el.find('.selected').data('id');
            selectedTab = this.tabs.filter(function (t) {
                return t.id === id;
            });
            return selectedTab && selectedTab[0];
        }
    };
};
TabList.prototype.renderer = Hogan.compile(Template.TabList);


Tab = function (id, text, onselect, onunselect) {
    this.$ = $(this);
    this.id = id;
    this.text = text;
    this.$.on('select', onselect);
    if (onunselect) {
        this.$.on('unselect', onunselect);
    }
};


globalTabList = MetadataTool.globalTabList = new TabList();
globalTabList.tabs.push(new Tab('gd', 'Describe', function () {
    DescribeGlobal.$.trigger('run');
}, function () {
    DescribeGlobal.$.trigger('remove');
}));
Bg.on('hide', function () {
    globalTabList.$.trigger('hide');
});
MetadataTool.$.on('run', function () {
    globalTabList.$.trigger('run');
});
var DescribeGlobal;


DescribeGlobal = MetadataTool.DescribeGlobal = {};
DescribeGlobal.$ = $(DescribeGlobal);
DescribeGlobal.config = {
    columns: 4
};
DescribeGlobal.$.on('run', function (event) {
    var p1, p2, gd, objects;
    p1 = Data.promise('getGlobalDescribe');
    p2 = Data.promise('getMetadataList', {type: 'CustomObject'});
    function onEnd(gd, objects) {
        if (objects) {
            var metaHash = arrayToHash(objects, 'fullName');
            gd.getArray('sobjects').forEach(function (so) {
                var name = so.name,
                    nonamespace = name.replace(/^.*?__/, ''),
                    m = metaHash[name] || metaHash[nonamespace];
                if (m) {
                    so.id = m.id || undefined;
                }
            });
        }
        DescribeGlobal.$.trigger('loaded', gd);
    }
    $.when(p1).done(function (result) {
        gd = result;
        if (p2.state() !== 'pending') {
            onEnd(gd, objects);
        }
    });
    $.when(p2).done(function (result) {
        objects = result;
        if (p1.state() === 'resolved') {
            onEnd(gd, objects);
        }
    });
    $.when(p2).fail(function (fault) {
        if (p1.state() === 'rejected') {
            onEnd(gd, objects);
        }
    });
});
DescribeGlobal.$.on('loaded', function (event, globalDescribe) {
    DescribeGlobal.data = globalDescribe;
    DescribeGlobal.$.trigger('render');
});
DescribeGlobal.renderer = Hogan.compile(Template.GlobalDescribe);
DescribeGlobal.$.on('render', function (event) {
    var grouper = new DescribeGlobal.Grouper(this.data, this.config);
    grouper.group();
    if (this.el) {
        this.el.remove();
    }
    var html = this.renderer.render(grouper);
    this.el = $(html);
    Bg.trigger('show');
    Panel.trigger('show');
    Panel.append(this.el);
});
DescribeGlobal.$.on('remove', function () {
    if (this.el) {
        this.el.remove();
    }
});

DescribeGlobal.Grouper = function (globalDescribe, config) {
    this.sobjects = globalDescribe.getArray('sobjects');
    this.config = config;
};

DescribeGlobal.Grouper.prototype.group = function () {
    var that = this;
    this.groups = [];
    this.definitions.forEach(function (def) {
        var matched = that.sobjects.filter(def.matcher);
        if (matched.length > 0) {
            var rows = arrayDivide(matched, that.config.columns);
            var g = new DescribeGlobal.Group(def, rows);
            that.groups.push(g);
        }
    });
};

DescribeGlobal.Group = function (def, rows) {
    this.title = def.title;
    this.rows = rows.map(function (r) {
        return new DescribeGlobal.GroupRow(r);
    });
};

DescribeGlobal.GroupRow = function (cells) {
    this.cells = cells;
};

DescribeGlobal.Grouper.prototype.definitions = [
    {
        title: 'カスタム',
        matcher: function(sobject) {
            return sobject.getBoolean('custom');
        }
    },
    {
        title: '取引先',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                /Account/.test(sobject.name);
        }
    },
    {
        title: '取引先責任者',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                /Contact/.test(sobject.name);
        }
    },
    {
        title: 'リード',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                /Lead/.test(sobject.name);
        }
    },
    {
        title: '商談/商品/価格表/契約/見積',
        matcher: function(sobject) {
            var name = sobject.name;
            return ! sobject.getBoolean('custom') &&
                (/Opportunity/.test(name) || /Pricebook/.test(name) || /Product/.test(name) ||
                /Asset/.test(name) || /Quote/.test(name) || /Contract/.test(name));
        }
    },
    {
        title: 'キャンペーン',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                /Campaign/.test(sobject.name);
        }
    },
    {
        title: 'ケース/ソリューション',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                (/Case/.test(sobject.name) || /Solution/.test(sobject.name));
        }
    },
    {
        title: '活動',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                (/Activity/.test(sobject.name) || /Event/.test(sobject.name) || /Task/.test(sobject.name));
        }
    },
    {
        title: 'ユーザ/プロファイル/ロール',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                (/User/.test(sobject.name) || /Profile/.test(sobject.name) || /^Role/.test(sobject.name));
        }
    },
    {
        title: 'ドキュメント/コンテンツ',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                (/Document/.test(sobject.name) || /Content/.test(sobject.name) || /File/.test(sobject.name));
        }
    },
    {
        title: '履歴',
        matcher: function(sobject) {
            return (/History$/).test(sobject.name);
        }
    },
    {
        title: 'Apex',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                /Apex/.test(sobject.name);
        }
    },
    {
        title: 'Chatter/コラボレーション',
        matcher: function(sobject) {
            var name = sobject.name;
            return ! sobject.getBoolean('custom') &&
                /^Chatter/.test(name) ||
                /^Collaboration/.test(name);
        }
    },
    {
        title: 'フィード',
        matcher: function(sobject) {
            return ! sobject.getBoolean('custom') &&
                /Feed/.test(sobject.name);
        }
    },
    {
        title: 'その他',
        matcher: function(sobject) {
            var defs, i, len;
            defs = DescribeGlobal.Grouper.prototype.definitions;
            for (i = 0, len = defs.length - 1; i < len; i += 1) {
                if (defs[i].matcher(sobject)) {
                    return false;
                }
            }
            return true;
        }
    }
];

var DescribeSObject,
    SObjectTabList, SObjectTab, FieldList,
    ChildRelationships, RecordTypeInfos, Details,
    FieldConfigurator;


DescribeSObject = MetadataTool.DescribeSObject = {};
DescribeSObject.$ = jQuery(DescribeSObject);
DescribeSObject.$.on('run', function (event, name) {
    var that = this;
    Data.getSObjectDescribe({type: name, onSuccess: function (describeResult) {
        that.dr = describeResult;
        that.$.trigger('render');
    }});
});
DescribeSObject.$.on('render', function () {
    DescribeGlobal.$.trigger('remove');
    SObjectTabList.dr = DescribeSObject.dr;
    SObjectTabList.$.trigger('render');
    var first = SObjectTabList.tabs[0];
    first.dr = SObjectTabList.dr;
    SObjectTabList.el.find('.mt-so-tab:first').addClass('selected');
    first.$.trigger('select');
});
doc
    .on('click', '.mt-gd-cell-sobject', function (event) {
        var name = $(event.target).data('sobject-name');
        DescribeSObject.$.trigger('run', name);
    });


SObjectTab = function (title) {
    this.title = title;
    this.$ = $(this);
    this.$.on('select', function () {
        this.$.trigger('render');
    });
    this.$.on('render', function () {
        var html = this.renderer.render(this.dr);
        Panel.html(html);
    });
};


SObjectTabList = MetadataTool.SObjectTabList = {};
SObjectTabList.$ = $(SObjectTabList);
SObjectTabList.renderer = Hogan.compile(Template.SObjectTabList);
SObjectTabList.$.on('render', function () {
    this.el = $(this.renderer.render(this));
    this.el.appendTo(document.body);
    this.el.show();
});
SObjectTabList.$.on('remove', function () {
    if (this.el) {
        this.el.remove();
        Panel.html(''); //手抜き. 複雑さが増すと使えなくなるかも
    }
});
SObjectTabList.tabs = [];
doc.on('click', '.mt-so-tab', function (event) {
    var target, list, title, selected;
    target = $(event.target);
    list = target.parent();
    title = target.data('title');
    selected = SObjectTabList.tabs.filter(function (t) {
        return t.title === title;
    })[0];
    list.find('.mt-so-tab').removeClass('selected');
    target.addClass('selected');
    selected.dr = SObjectTabList.dr;
    selected.$.trigger('select');
});
Bg.on('hide', function () {
    SObjectTabList.$.trigger('remove');
});
globalTabList.$.on('refresh', function () {
    SObjectTabList.$.trigger('remove');
});

FieldList = DescribeSObject.FieldList = new SObjectTab('項目一覧');
FieldList.$ = $(DescribeSObject.FieldList);
FieldList.renderer = Hogan.compile(Template.SObjectDescribe);

FieldList.Field = function (values) {
    this.values = values;
};

FieldList.$.off('render');
FieldList.$.on('render', function (event) {
    var fields, columns, html, viewData;
    fields = this.dr.getArray('fields');
    columns = FieldList.columns;
    viewData = {};
    viewData.name = this.dr.name;
    viewData.label = this.dr.label;
    viewData.colLength = columns.length;
    viewData.titles = columns.map(function (c) {
        return c.title;
    });
    viewData.fields = fields.map(function (f) {
        return new FieldList.Field(columns.map(function (c) {
            return c.data(f);
        }));
    });
    html = this.renderer.render(viewData);
    Bg.trigger('show');
    Panel.trigger('show');
    Panel.html(html);
});

FieldList.columns = FieldList.Columns = [
    {
        id: 'api',
        title: 'API&#x53C2;&#x7167;&#x540D;',
        data: function (field) {
            return field.name;
        }
    },
    {
        id: 'label',
        title: '&#x30E9;&#x30D9;&#x30EB;',
        data: function (field) {
            return field.label;
        }
    },
    {
        id: 'type',
        title: 'データ型',
        data: function (field) {
            return field.type;
        }
    },
    {
        id: 'length',
        title: '&#x9577;&#x3055;',
        data: function (field) {
            var digits = field.getInt('digits'),
                precision = field.getInt('precision'),
                scale = field.getInt('scale'),
                length = field.getInt('length');
            if (digits !== 0) {
                return digits;
            } else if (precision !== 0) {
                return precision + ', ' + scale;
            } else {
                return length;
            }
        }
    },
    {
        id: 'required',
        title: '&#x5FC5;&#x9808;',
        data: function (field) {
            var nillable = field.getBoolean('nillable'),
                defaultedOnCreate = field.getBoolean('defaultedOnCreate'),
                createable = field.getBoolean('createable');
            if (nillable || defaultedOnCreate || !createable) {
                return '&#x2610;';
            }
            return '&#x2611;';
        }
    },
    {
        id: 'referenceTo',
        title: '&#x53C2;&#x7167;&#x5148;',
        data: function (field) {
            var arr = field.getArray('referenceTo');
            return arr.join('<br />');
        }
    },
    {
        id: 'picklistValues',
        title: '&#x9078;&#x629E;&#x80A2;',
        data: function (field) {
            var entries = field.getArray('picklistValues');
            return entries.map(function (entry) {
                var l = entry.label, v = entry.value;
                if (l === v) {
                    return l;
                } else {
                    return l + ' (' + v + ')';
                }
            }).join('<br />');
        }
    },
    {id: 'nillable'         , title: 'nillable', data: function (field) {return field.nillable; }},
    {id: 'unique'           , title: 'unique', data: function (field) {return field.unique; }},
    {id: 'externalId'       , title: 'externalId', data: function (field) {return field.externalId; }},
    {id: 'filterable'       , title: 'filterable', data: function (field) {return field.filterable; }},
    {id: 'calculatedFormula', title: 'calculatedFormula', data: function (field) {return field.calculatedFormula; }},
    {id: 'inlineHelpText'   , title: 'inlineHelpText', data: function (field) {return field.inlineHelpText; }},
    {id: 'createable'       , title: 'createable', data: function (field) {return field.createable; }},
    {id: 'updateable'       , title: 'updateable', data: function (field) {return field.updateable; }},
    {id: 'groupable'        , title: 'groupable', data: function (field) {return field.groupable; }},
    {
        id: 'log',
        title: 'log',
        data: function (field) {
            return '<a onclick=\'console.log(' + JSON.stringify(field) + ')\' href="javascript:void 0;">log</a>';
        }
    }
];

SObjectTabList.tabs.push(FieldList);


ChildRelationships = SObjectTabList.ChildRelationships = new SObjectTab('子リレーション');
ChildRelationships.renderer = Hogan.compile(Template.ChildRelationships);
ChildRelationships.$.off('render');
ChildRelationships.$.on('render', function () {
    var dr = this.dr,
        renderer = this.renderer;
    Data.getSObjectHash({onSuccess: function (soHash) {
        var viewData, children, html;
        viewData = $.extend({}, dr);
        children = viewData.getArray('childRelationships');
        children.forEach(function (rel) {
            rel.label = soHash[rel.childSObject].label;
        });
        html = renderer.render(viewData);
        Panel.html(html);
    }});
});
SObjectTabList.tabs.push(ChildRelationships);


RecordTypeInfos = SObjectTabList.RecordTypeInfos = new SObjectTab('レコードタイプ');
RecordTypeInfos.renderer = Hogan.compile(Template.RecordTypeInfos);
SObjectTabList.tabs.push(RecordTypeInfos);


Details = SObjectTabList.Details = new SObjectTab('詳細');
Details.renderer = Hogan.compile(Template.Details);
Details.$.off('render');
Details.$.on('render', function () {
    var dr = this.dr, keys, viewData, html;
    viewData = $.extend({}, dr);
    keys = Object.keys(dr).filter(function (k) {
        return typeof dr[k] === 'string';
    });
    viewData.details = keys.map(function (key) {
        return {
            title: key,
            value: dr[key]
        };
    });
    html = this.renderer.render(viewData);
    Panel.html(html);
});
SObjectTabList.tabs.push(Details);


FieldConfigurator = SObjectTabList.FieldConfigurator = new SObjectTab('表示項目');
FieldConfigurator.renderer = Hogan.compile(Template.FieldConfigurator);
FieldConfigurator.$.off('render');
FieldConfigurator.$.on('render', function () {
    var viewData, definitions, config, html;
    viewData = $.extend({}, this.dr);
    definitions = FieldList.Columns;
    config = this.loadConfig();
    viewData.rows = definitions.map(function (def) {
        return {
            id: def.id,
            title: def.title,
            checked: config[def.id]
        };
    });
    html = this.renderer.render(viewData);
    Panel.html(html);
});
FieldConfigurator.loadConfig = function () {
    var config = GM_getValue('FieldConfig');
    if (config) {
        return JSON.parse(config);
    } else {
        return this.defaults;
    }
};
FieldConfigurator.saveConfig = function (config) {
    GM_setValue('FieldConfig', JSON.stringify(config));
};
FieldConfigurator.defaults = {
    api: true,
    label: true,
    length: true
};
FieldConfigurator.$.on('change', function () {
    var checks = $('input.field-config'),
        config = {};
    checks.each(function (i) {
        var c = checks.eq(i);
        config[c.data('id')] = c.prop('checked');
    });
    this.setColumns(config);
    this.saveConfig(config);
});
FieldConfigurator.setColumns = function (config) {
    var columns = FieldList.Columns;
    columns = columns.filter(function (c) {
        return config[c.id];
    });
    FieldList.columns = columns;
};
FieldConfigurator.setColumns(FieldConfigurator.loadConfig());
SObjectTabList.tabs.push(FieldConfigurator);
doc
    .on('click', 'input.field-config', function () {
        FieldConfigurator.$.trigger('change');
    });

var DescribeMetadata;

DescribeMetadata = MetadataTool.DescribeMetadata = {};
DescribeMetadata.$ = $(DescribeMetadata);

DescribeMetadata.$.on('run', function () {
    var that = this;
    Data.describeMetadata({onSuccess: function (md) {
        that.md = md;
        that.$.trigger('render');
    }});
});
DescribeMetadata.$.on('render', function () {
    if (!this.el) {
        this.el = $(this.renderer.render(this.md));
    }
    Panel.append(this.el);
});
DescribeMetadata.$.on('remove', function () {
    this.el.remove();
});
DescribeMetadata.renderer = Hogan.compile(Template.DescribeMetadata);

globalTabList.tabs.push(
    new Tab('md', 'Metaedata', function () {
            DescribeMetadata.$.trigger('run');
        }, function () {
            DescribeMetadata.$.trigger('remove');
        }
    )
);

var ListMetadata;

ListMetadata = MetadataTool.ListMetadata = {};
ListMetadata.$ = $(ListMetadata);

function zeropad(n) {
    return (n < 10 ? '0' + n : n);
}
function dateTimeToString(d) {
     return [d.getFullYear(), zeropad(d.getMonth() + 1), zeropad(d.getDate())].join('-') +
        ' ' + zeropad(d.getHours()) + ':' + zeropad(d.getMinutes());
}

ListMetadata.$.on('run', function (event, desc) {
    Data.getMetadataList({type: desc.xmlName, onSuccess: function (metadataArr) {
        DescribeMetadata.$.trigger('remove');
        metadataArr.forEach(function (m) {
            var basename = m.fileName.match(new RegExp('/.*?\\.'))[0];
            basename = basename.substring(1, basename.length - 1);
            m.lastModifiedDate = dateTimeToString(m.getDateTime('lastModifiedDate'));
            m.retrieve =
                $('<a />')
                    .attr({
                        'href': '#',
                        'class': 'mt-to-retrieve',
                        'data-file': m.fileName,
                        'data-name': m.type,
                        'data-member': m.fullName,
                        'data-dir': desc.directoryName,
                        'data-basename': basename,
                        'data-ext': desc.suffix,
                        'data-meta-file': desc.metaFile
                    }).text('retrieve')[0].outerHTML;
            if (m.id) {
                m.view =
                    $('<a />')
                    .attr('href', '/' + m.id)
                    .text('view')
                    [0].outerHTML;
            }
            delete m.createdById;
            delete m.createdByName;
            delete m.lastModifiedById;
            delete m.type;
            delete m.createdDate;
            delete m.lastModifiedByName;
            delete m.fileName;
            delete m.id;
            Object.keys(m).forEach(function (i) {
                if (typeof m[i] === 'function') {
                    delete m[i];
                }
            });
        });
        ListMetadata.view = GeneralTableView.byHashArray(metadataArr);
        ListMetadata.view.$.trigger('render');
    }});
});

doc
    .on('click', '.mt-md-name', function (event) {
        var name = $(event.target).data('name');
        Data.describeMetadata({onSuccess: function (md) {
            desc = md.metadataObjects.filter(function (m) {
                return m.xmlName === name;
            })[0];
            if (!desc) {
                md.metadataObjects.forEach(function (m) {
                    if (!m.childXmlNames) {
                        return;
                    }
                    m.getArray('childXmlNames').forEach(function (n) {
                        if (n === name) {
                            desc = $.extend(m);
                            desc.xmlName = n;
                        }
                    });
                });
            }
            ListMetadata.$.trigger('run', desc);
        }});
    })
    .on('click', '.mt-to-retrieve', function (event) {
        var target;
        target = $(event.target);
        globalTabList.select('rd');
        $('#mt-deploy-name').val(target.data('name'));
        $('#mt-deploy-member').val(target.data('member'));
        $('#mt-retrieve-file').val(target.data('file'));
        $('#mt-deploy-dir').val(target.data('dir'));
        $('#mt-deploy-basename').val(target.data('basename'));
        $('#mt-deploy-ext').val(target.data('ext'));
        $('#mt-retrieve-has-meta').prop('checked', target.data('meta-file'));
        $('#mt-deploy-content').val('');
        $('#mt-deploy-meta').val('');
        $('#mt-retrieve').trigger('click');
    });

globalTabList.$.on('refresh', function () {
    if (ListMetadata.view) {
        ListMetadata.view.$.trigger('remove');
    }
});

var DeployRetrieve;

DeployRetrieve = MetadataTool.DeployRetrieve = {};
DeployRetrieve.$ = $(DeployRetrieve);

DeployRetrieve.$.on('run', function () {
    this.$.trigger('render');
});
DeployRetrieve.renderer = Hogan.compile(Template.DeployRetrieve);
DeployRetrieve.$.on('render', function () {
    if (!this.el) {
        this.el = $(this.renderer.render(this));
    }
    Panel.append(this.el);
});
DeployRetrieve.$.on('remove', function () {
    if (this.el) {
        this.el.remove();
    }
});

doc
    .on('click', '#mt-retrieve', function () {
        var name, member, file, hasMeta;
        name = $('#mt-deploy-name').val();
        member = $('#mt-deploy-member').val();
        file = $('#mt-retrieve-file').val();
        hasMeta = $('#mt-retrieve-has-meta').prop('checked');
        if (!/^unpackaged\//.test(file)) {
            file = 'unpackaged/' + file;
        }
        Data.retrieve(name, member, function (zip) {
            var content = zip.file(file).asText();
            $('#mt-deploy-content').val(content);
            if (hasMeta) {
                $('#mt-deploy-meta').val(zip.file(file + '-meta.xml').asText());
            }
        });
    })
    .on('click', '#mt-deploy', function () {
        Data.deploy({
            name:     $('#mt-deploy-name').val(),
            member:   $('#mt-deploy-member').val(),
            dir:      $('#mt-deploy-dir').val(),
            basename: $('#mt-deploy-basename').val(),
            ext:      $('#mt-deploy-ext').val(),
            content:  $('#mt-deploy-content').val(),
            meta:     $('#mt-deploy-meta').val()
        }, function (result) {
            console.log(result);
        });
    });

globalTabList.tabs.push(
    new Tab('rd', 'Retrieve/Deploy', function () {
        DeployRetrieve.$.trigger('run');
    }, function () {
        DeployRetrieve.$.trigger('remove');
    })
);
})(unsafeWindow, jQuery);