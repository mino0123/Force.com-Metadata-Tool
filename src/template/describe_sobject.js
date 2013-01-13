Template.SObjectDescribe =
    '<table class="mt-sod-table">' +
    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="{{colLength}}">{{label}} {{name}}</th>' +
    '    </tr>' +
    '    <tr class="mt-sod-row">' +
    '        {{#titles}}' +
    '            <td class="mt-sod-head">{{{.}}}</td>' +
    '        {{/titles}}' +
    '    </tr>' +
    '    {{#fields}}' +
    '        <tr class="mt-sod-row">' +
    '            {{#values}}' +
    '                <td class="mt-sod-cell">{{{.}}}</td>' +
    '            {{/values}}' +
    '        </tr>' +
    '    {{/fields}}' +
    '</table>';
Template.SObjectTabList =
    '<ul class="mt-so-tab-list">' +
    '    {{#tabs}}' +
    '        <li class="mt-so-tab" data-title="{{title}}">{{title}}</li>' +
    '    {{/tabs}}' +
    '</ul>';
Template.ChildRelationships =
    '<table class="mt-sod-table">' +

    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="6">{{label}} {{name}}</th>' +
    '    </tr>' +

    '    <tr>' +
    '        <td class="mt-sod-head">オブジェクト</td>' +
    '        <td class="mt-sod-head">ラベル</td>' +
    '        <td class="mt-sod-head">項目</td>' +
    '        <td class="mt-sod-head">子リレーション名</td>' +
    '        <td class="mt-sod-head">連鎖削除</td>' +
    '        <td class="mt-sod-head">非推奨</td>' +
    '    </tr>' +
    '    {{#childRelationships}}' +
    '        <tr>' +
    '            <td class="mt-sod-cell">{{childSObject}}</td>' +
    '            <td class="mt-sod-cell">{{label}}</td>' +
    '            <td class="mt-sod-cell">{{field}}</td>' +
    '            <td class="mt-sod-cell">{{relationshipName}}</td>' +
    '            <td class="mt-sod-cell">{{cascadeDelete}}</td>' +
    '            <td class="mt-sod-cell">{{deprecatedAndHidden}}</td>' +
    '        </tr>' +
    '    {{/childRelationships}}' +
    '</table>';
Template.RecordTypeInfos =
    '<table class="mt-sod-table">' +

    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="4">{{label}} {{name}}</th>' +
    '    </tr>' +

    '    <tr>' +
    '        <td class="mt-sod-head">名前</td>' +
    '        <td class="mt-sod-head">ID</td>' +
    '        <td class="mt-sod-head">デフォルト</td>' +
    '        <td class="mt-sod-head">有効</td>' +
    '    </tr>' +
    '    {{#recordTypeInfos}}' +
    '        <tr>' +
    '            <td class="mt-sod-cell">{{name}}</td>' +
    '            <td class="mt-sod-cell">{{recordTypeId}}</td>' +
    '            <td class="mt-sod-cell">{{defaultRecordTypeMapping}}</td>' +
    '            <td class="mt-sod-cell">{{available}}</td>' +
    '        </tr>' +
    '    {{/recordTypeInfos}}' +
    '</table>';
Template.Details =
    '<table class="mt-sod-table">' +

    '    <tr class="mt-sod-table-head">' +
    '        <th colspan="2">{{label}} {{name}}</th>' +
    '    </tr>' +

    '    {{#details}}' +
    '        <tr>' +
    '            <td class="mt-sod-head">{{title}}</td>' +
    '            <td class="mt-sod-cell">{{value}}</td>' +
    '        </tr>' +
    '    {{/details}}' +
    '</table>';
Template.FieldConfigurator =
    '<table class="mt-sod-table">' +

    '    {{#rows}}' +
    '        <tr>' +
    '            <td class="mt-sod-head">{{{title}}}</td>' +
    '            <td class="mt-sod-cell">' +
    '                <input type="checkbox" data-id="{{id}}" {{#checked}}checked{{/checked}} class="field-config" />' +
    '            </td>' +
    '        </tr>' +
    '    {{/rows}}' +
    '</table>';