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