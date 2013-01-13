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
