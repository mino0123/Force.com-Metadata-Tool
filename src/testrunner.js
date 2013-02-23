var TestRunner;

TestRunner = MetadataTool.TestRunner = {};
TestRunner.$ = $(TestRunner);

TestRunner.$.on('run', function () {
    var that = this;
    Data.getApexClasses({onSuccess: function (classes) {
        that.classes = classes;
        that.$.trigger('render');
    }});
});
TestRunner.$.on('render', function () {
    if (!this.el) {
        this.el = $(this.renderer.render(this));
    }
    this.el.appendTo(this.container);
    this.container.appendTo(Panel);
});
TestRunner.$.on('remove', function () {
    this.el.remove();
    this.logEl.remove();
    this.container.remove();
});
TestRunner.$.on('runtest', function (event, classId) {
    var that = this,
        item = new sforce.SObject('ApexTestQueueItem');
    item.ApexClassId = classId;
    console.log(this.logEl);
    if (this.logEl) {
        this.logEl.remove();
        delete this.logEl;
    }
    sforce.connection.create([item], function (results) {
        that.$.trigger('checkstatus', results[0].id);
    });
});
TestRunner.$.on('checkstatus', function (event, queueItemId) {
    var that = this;
    Data.getTestQueueItem({id: queueItemId, onSuccess: function (qr) {
        var record = qr.getArray('records')[0];
        if (record.Status in {'Completed':1, 'Failed':1}) {
            that.$.trigger('showtestlog', queueItemId);
        }
    }});
});
TestRunner.$.on('showtestlog', function (event, queueItemId) {
    var that = this;
    Data.getTestLog({queueItemId: queueItemId, onSuccess: function (log) {
        that.$.trigger('renderlog', log);
    }});
});
TestRunner.$.on('renderlog', function (event, log) {
    if (this.logEl) {
        this.logEl.remove();
    }
    this.logEl = $(this.logrenderer.render({log: log}));
    this.container.append(this.logEl);
});

TestRunner.container = $('<div></div>')
    .css('display', 'box')
    .css('display', '-moz-box');
TestRunner.renderer = Hogan.compile(Template.TestRunner);
TestRunner.logrenderer = Hogan.compile(Template.TestRunnerLog);

globalTabList.tabs.push(
    new Tab('tr', 'Test', function () {
            TestRunner.$.trigger('run');
        }, function () {
            TestRunner.$.trigger('remove');
        }
    )
);

Panel.on('click', '.test_run', function (event) {
    var id = $(this).data('id');
    TestRunner.$.trigger('runtest', id);
});