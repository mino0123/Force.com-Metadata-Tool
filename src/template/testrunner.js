Template.TestRunner =
    '<table class="mt-table">' +
    '    <tr class="mt-table-head">' +
    '        <td>Id</td>' +
    '        <td>Name</td>' +
    '    </tr>' +
    '    {{#classes}}' +
    '    <tr>' +
    '        <td class="mt-table-cell">{{Id}}</td>' +
    '        <td class="mt-table-cell">{{Name}}</td>' +
    '        <td class="mt-table-cell"><a href="/{{Id}}">view</a></td>' +
    '        <td class="mt-table-cell"><a href="javascript:void 0;" class="test_run" data-id="{{Id}}" >run</a></td>' +
    '    </tr>' +
    '    {{/classes}}' +
    '</table>';
Template.TestRunnerLog =
    '<pre class="mt-test-log">{{log}}</pre>';
