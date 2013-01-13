Template.GeneralTableView =
    '<table class="mt-table">' +
    '    <tr>' +
    '        {{#headers}}' +
    '        <th class="mt-table-head">' +
    '            {{.}}' +
    '        </th>' +
    '        {{/headers}}' +
    '    </tr>' +
    '    {{#rows}}' +
    '    <tr>' +
    '        {{#cells}}' +
    '            <td class="mt-table-cell">{{{.}}}</td>' +
    '        {{/cells}}' +
    '    </tr>' +
    '    {{/rows}}' +
    '</table>';
