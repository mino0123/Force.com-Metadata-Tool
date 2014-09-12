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
                    m.childXmlNames.forEach(function (n) {
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
