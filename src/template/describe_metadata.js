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