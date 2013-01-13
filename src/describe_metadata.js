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
