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