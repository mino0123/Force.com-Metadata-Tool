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
