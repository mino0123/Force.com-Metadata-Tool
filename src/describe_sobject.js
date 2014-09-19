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
    fields = this.dr.fields;
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
            var digits = Number(field.digits),
                precision = Number(field.precision),
                scale = Number(field.scale),
                length = Number(field.length);
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
            var nillable = field.nillable === 'true',
                defaultedOnCreate = field.defaultedOnCreate === 'true',
                createable = field.createable === 'true';
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
            var arr = field.referenceTo;
            if (!Array.isArray(arr)) {
                arr = [arr];
            }
            return arr.join('<br />');
        }
    },
    {
        id: 'picklistValues',
        title: '&#x9078;&#x629E;&#x80A2;',
        data: function (field) {
            var entries = field.picklistValues || [];
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
        children = viewData.childRelationships;
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


ScriptLoader.on('loaded', function () {
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
    setTripleClick(doc, '.mt-sod-table', function () {
        unsafeWindow.getSelection().selectAllChildren($('.mt-sod-table')[0]);
    });
});