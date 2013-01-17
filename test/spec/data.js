var sforce;

describe('Data', function () {
    before(function(){
        sforce = {};
        sforce.connection = {};
    });
    describe("getGlobalDescribe", function () {
        var g = {},
            g2 = {},
            result;
        before(function () {
            sforce.connection.describeGlobal = function (callback) {
                callback.onSuccess(g);
            };
            Data.getGlobalDescribe({onSuccess: function (r) {
                result = r;
            }});
        });
        it('最初はsforce.connection.describeGlobalを実行', function () {
            expect(result).to.equal(g);
        });
        it("結果がキャッシュ変数に入る", function(){
            expect(Data.data.global).to.equal(g);
        });
        it("もう一度実行するとキャッシュを返す", function(){
            Data.data.global = g2;
            Data.getGlobalDescribe(function (result) {
                expect(result).to.equal(g2);
            });
        });
    });
    describe("getSObjectHash", function () {
        var g = {
                sobjects: [
                    {name: 'Account'},
                    {name: 'Contact'}
                ],
                getArray: function (name) {
                    return this[name];
                }
            },
            result;
        before(function () {
            Data.data.global = g;
            Data.getSObjectHash({onSuccess: function (r) {
                result = r;
            }});
        });
        it("オブジェクトのnameをキーにハッシュとして取得できる", function () {
            expect(result.Account).to.equal(g.sobjects[0]);
            expect(result.Contact).to.equal(g.sobjects[1]);
        });
    });
    describe("getSObjectDescribe", function () {
        var r = {name: 'Account'},
            result;
        before(function () {
            sforce.connection.describeSObject = function (type, callback) {
                callback.onSuccess(r);
            };
            Data.getSObjectDescribe({type: 'Account', onSuccess: function () {
                result = r;
            }});
        });
        it("sforce.connection.describeSObjectを実行", function () {
            expect(result).to.equal(r);
        });
        it("結果がキャッシュされる", function () {
            expect(Data.data.sobjects.Account).to.equal(r);
        });
    });
});