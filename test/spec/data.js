var sforce;

describe('Data', function () {
    var checkStatusCounter = 0;
    function retTrue() {return true;}
    function retFalse() {return false;}
    before(function(){
        sforce = {};
        sforce.connection = {};
        sforce.metadata = {};
        sforce.metadata.checkStatus = function (id, callback) {
            if ((++checkStatusCounter) > 1) {
                callback([{getBoolean: retTrue}]);
            } else {
                callback([{getBoolean: retFalse}]);
            }
        };
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
    describe("describeMetadata", function () {
        var r = {}, result;
        before(function () {
            sforce.metadata.describeMetadata = function (version, callback) {
                callback.onSuccess(r);
            };
            Data.describeMetadata({onSuccess: function (r) {
                result = r;
            }});
        });
        it("sforce.metadata.describeMetadataを実行", function () {
            expect(result).to.equal(r);
        });
        it("結果がキャッシュされる", function () {
            expect(Data.data.describeMetadata).to.equal(r);
        });
    });
    describe("getMetadataList", function () {
        var r = [{id: 'test_id'}], result;
        before(function () {
            sforce.metadata.listMetadata = function (query, callback) {
                callback.onSuccess(r);
            };
            Data.getMetadataList({type: 'CustomObject', onSuccess: function (r) {
                result = r;
            }});
        });
        it("sforce.metadata.getMetadataListを実行しクローンをコールバックに渡す", function () {
            expect(result[0].id).to.equal(r[0].id);
        });
        it("結果のクローンがキャッシュされる", function () {
            expect(Data.data.metadataList.CustomObject[0].id).to.equal(r[0].id);
        });
    });
    describe("retrieve", function () {
        var r = {};
        before(function () {
            sforce.RetrieveRequest = function () {};
            sforce.metadata.checkRetrieveStatus = function (id, callback) {
                callback(r);
            };
            sforce.metadata.retrieve = function (request, callback) {
                callback({getBoolean: retFalse});
            };
        });
        it("sforce.metadata.retrieveを実行", function () {
            checkStatusCounter = 0;
            Data.retrieve({}, [], function (result) {
                expect(result).not.to.equal(null)
            });
        });
    });
    describe("deploy", function () {
        var r = {};
        function toXml() {
            return '';
        }
        before(function () {
            sforce.DeployRequest = function () {};
            sforce.Package = function () {
                this.toXml = toXml;
            };
            sforce.metadata.checkDeployStatus = function (id, callback) {
                window.console.log('checkDeployStatus');
                callback({getBoolean: retTrue});
            };
            sforce.metadata.deploy = function (request, callback) {
                callback({getBoolean: retFalse});
            };
            Data.data.describeMetadata.testRequired = false;
        });
        it("sforce.metadata.deployを実行", function () {
            checkStatusCounter = 0;
            Data.deploy({
                name:     'name',
                member:   'member',
                dir:      'dir',
                basename: 'basename',
                ext:      'ext',
                content:  'content'
            }, function (result) {
                expect(result).not.to.equal(null);
            });
        });
    });
});