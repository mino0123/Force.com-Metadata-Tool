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
