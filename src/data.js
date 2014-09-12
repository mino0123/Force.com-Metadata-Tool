var Data;

Data = MetadataTool.Data = {
    data: {
        global: null,
        sobjects: {},
        describeMetadata: null,
        metadataList: {},
        classes: null
    },
    supportMetadata: null,
    setHook: function (obj, name, fn) {
        var oldFn = obj[name], ret;
        obj[name] = function () {
            ret = fn.apply(this, arguments);
            if (oldFn) {
                oldFn.apply(this, ret === undefined ? arguments : [ret]);
            }
        };
    },
    createCallback: function (obj, preSuccess, preFailure) {
        var callback = {onSuccess: obj.onSuccess || noop, onFailure: obj.onFailure || noop};
        if (preSuccess) {
            this.setHook(callback, 'onSuccess', preSuccess);
        }
        if (preFailure) {
            this.setHook(callback, 'onFailure', preFailure);
        }
        return callback;
    },
    promise: function (name, args) {
        var df = new $.Deferred();
        args = clone(args) || {};
        args.onSuccess = function (result) {
            df.resolve(result);
        };
        args.onFailure = function (fault) {
            df.reject(fault);
        };
        this[name](args);
        return df.promise();
    },
    getGlobalDescribe: function (args) {
        var data = this.data,
            callback;
        if (data.global && args.onSuccess) {
            args.onSuccess(data.global);
        } else {
            callback = this.createCallback(args, function (gd) {
                data.global = gd;
            });
            sforce.connection.describeGlobal(callback);
        }
    },
    getSObjectHash: function (args) {
        var callback = this.createCallback(args, function (gd) {
            var ret = {};
            gd.sobjects.forEach(function (so) {
                ret[so.name] = so;
            });
            return ret;
        });
        this.getGlobalDescribe(callback);
    },
    getSObjectDescribe: function (args) {
        var type = args.type,
            sobjects = this.data.sobjects,
            callback;
        if (sobjects[type] && args.onSuccess) {
            args.onSuccess(sobjects[type]);
        } else {
            callback = this.createCallback(args, function (sobject) {
                sobjects[type] = sobject;
            });
            sforce.connection.describeSObject(type, callback);
        }
    },
    describeMetadata: function (args) {
        var that = this,
            data = this.data,
            callback;
        if (data.describeMetadata && args.onSuccess) {
            args.onSuccess(data.describeMetadata);
        } else {
            callback = this.createCallback(
                args,
                function (md) {
                    that.supportMetadata = true;
                    data.describeMetadata = md;
                },
                function (fault) {
                    if (fault.faultcode === 'sf:INSUFFICIENT_ACCESS') {
                        that.supportMetadata = false;
                    } else {
                        alert(fault);
                        console.log(fault);
                    }
                }
            );
            sforce.metadata.describeMetadata(29, callback);
        }
    },
    getMetadataList: function (args) {
        var that = this,
            metadataList = this.data.metadataList,
            type = args.type,
            callback;
        if (metadataList[type] && args.onSuccess) {
            args.onSuccess(clone(metadataList[type]));
        } else {
            callback = this.createCallback(
                args,
                function (list) {
                    that.supportMetadata = true;
                    metadataList[type] = list;
                    return clone(list);
                },
                function (fault) {
                    if (fault.faultcode === 'sf:INSUFFICIENT_ACCESS') {
                        that.supportMetadata = false;
                    } else {
                        alert(fault);
                        console.log(fault);
                    }
                }
            );
            sforce.metadata.listMetadata({queries: [{type: type}]}, callback);
        }
    },
    retrieve: function (typeName, members, callback) {
        function waitForDone(callback) {
            function getResult(id) {
                sforce.metadata.checkRetrieveStatus(id, callback);
            }
            function check(results) {
                var done = results[0].done === 'true';
                if (!done) {
                    setTimeout(function () {
                        sforce.metadata.checkStatus([results[0].id], check);
                    }, 1000);
                } else {
                    getResult(results[0].id);
                }
            }
            return function (result) {
                check([result]);
            };
        }
        var req, result;
        req = new sforce.RetrieveRequest();
        req.apiVersion = "29.0";
        req.singlePackage = false;
        req.unpackaged = {
            types: [{name: typeName, members:members}]
        };
        sforce.metadata.retrieve(req, waitForDone(function (result) {
            var zip, data;
            zip = new JSZip(result.zipFile, {base64:true});
            callback(zip);
        }));
    },
    deploy: function (args, callback) {
        function waitForDone(callback) {
            function getResult(id) {
                sforce.metadata.checkDeployStatus(id, callback);
            }
            function check(results) {
                var done = results[0].done === 'true';
                if (!done) {
                    setTimeout(function () {
                        sforce.metadata.checkStatus([results[0].id], check);
                    }, 1000);
                } else {
                    getResult(results[0].id);
                }
            }
            return function (result) {
                check([result]);
            };
        }
        var req, pack, zip, path,
            meta = args.meta;
        pack = new sforce.Package();
        pack.version = 29;
        pack.types = [{name: args.name, members: args.member}];
        path = 'src/' + args.dir + '/' + args.basename + '.' + args.ext;
        req = new sforce.DeployRequest();
        zip = new JSZip();
        zip.file("src/package.xml", pack.toXml());
        zip.file(path, args.content);
        if (meta) {
            zip.file(path + "-meta.xml", meta);
        }
        req.zipFile = zip.generate({base64: true});
        this.describeMetadata({
            onSuccess: function (desc) {
                if (desc.testRequired) {
                    req.deployOptions = new sforce.Xml();
                    req.deployOptions.rollbackOnError = true;
                }
                sforce.metadata.deploy(req, waitForDone(function (result) {
                    callback(result);
                }));
            }
        });
    },
    getApexClasses: function (args) {
        var data = this.data,
            classes = this.data,
            callback;
        if (data.classes) {
            args.onSuccess(classes);
        } else {
            callback = this.createCallback(args, function (qr) {
                data.classes = qr.records;
                return data.classes;
            });
            sforce.connection.query('SELECT Id, Name FROM ApexClass', callback);
        }
    },
    getTestQueueItem: function (args) {
        var id = args.id,
            soql = 'SELECT Status, ExtendedStatus FROM ApexTestQueueItem WHERE Id = \'' + id + '\'',
            callback;
        callback = this.createCallback({onSuccess: function (qr) {
            var records = qr.records;
            var r = Array.isArray(records) ? records[0] : records;
            if (r && ['Completed', 'Failed', 'Aborted'].indexOf(r.Status) >= 0) {
                args.onSuccess(qr);
            } else {
                setTimeout(query, 2000);
            }
        }});
        function query() {
            sforce.connection.query(soql, callback);
        }
        query();
    },
    getTestLog: function (args) {
        var queueItemId = args.queueItemId,
            soql = 'SELECT ApexLogId FROM ApexTestResult WHERE QueueItemId = \'' + queueItemId + '\'',
            callback;
        sforce.connection.query(soql, this.createCallback({
            onSuccess: function (qr) {
                if (Number(qr.size) <= 0) {
                    args.onSuccess(null);
                } else {
                    var records = qr.records;
                    var record = Array.isArray(records) ? records[0] : records;
                    var logId = record.ApexLogId;
                    $.get('/apexdebug/traceDownload.apexp', {id: logId}, args.onSuccess);
                }
            }
        }));
        query();
    }
};