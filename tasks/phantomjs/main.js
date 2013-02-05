/*
 * grunt-lib-phantomjs
 * http://gruntjs.com/
 *
 * Modified by Yuta Minowa
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

/*global phantom:true*/

'use strict';


var fs = require('fs');

// The temporary file used for communications.
var tmpfile = phantom.args[0];
// The page .html file to load.
var url = phantom.args[1];
// Extra, optionally overridable stuff.
var options = JSON.parse(phantom.args[2] || {});

// Default options.
if (!options.timeout) { options.timeout = 5000; }

// Keep track of the last time a client message was sent.
var last = new Date();

// Messages are sent to the parent by appending them to the tempfile.
var sendMessage = function(arg) {
  var args = Array.isArray(arg) ? arg : [].slice.call(arguments);
  last = new Date();
  fs.write(tmpfile, JSON.stringify(args) + '\n', 'a');
};

// This allows grunt to abort if the PhantomJS version isn't adequate.
sendMessage('private', 'version', phantom.version);

// Abort if the page doesn't send any messages for a while.
setInterval(function() {
  if (new Date() - last > options.timeout) {
    sendMessage('fail.timeout');
    phantom.exit();
  }
}, 100);

// Create a new page.
var page = require('webpage').create();

// Inject bridge script into client page.
var injected;
var inject = function() {
  if (injected) { return; }
  // Inject client-side helper script.
  sendMessage('inject', options.inject);
  page.injectJs(options.inject);
  injected = true;
};

// Keep track if the client-side helper script already has been injected.
page.onUrlChanged = function(newUrl) {
  injected = false;
  sendMessage('onUrlChanged', newUrl);
};

// The client page must send its messages via alert(jsonstring).
page.onAlert = function(str) {
  // The only thing that should ever alert "inject" is the custom event
  // handler this script adds to be executed on DOMContentLoaded.
  if (str === 'inject') {
    inject();
    return;
  }
  // Otherwise, parse the specified message string and send it back to grunt.
  // Unless there's a parse error. Then, complain.
  try {
    sendMessage(JSON.parse(str));
  } catch(err) {
    sendMessage('error.invalidJSON', str);
  }
};

// Relay console logging messages.
page.onConsoleMessage = function(message) {
  sendMessage('console', message);
};

// For debugging.
page.onResourceRequested = function(request) {
  sendMessage('onResourceRequested', request.url);
};

page.onResourceReceived = function(request) {
  if (request.stage === 'end') {
    sendMessage('onResourceReceived', request.url);
  }
};

page.onError = function(msg, trace) {
  sendMessage('error.onError', msg, trace);
  phantom.exit();
};

// Run before the page is loaded.
page.onInitialized = function() {
  sendMessage('onInitialized');

  // Customization for mocha, passing mocha options from task config
  page.evaluate(function(options) {
    window.PHANTOMJS = options;
  }, options);

  // Abort if there is no bridge to inject.
  if (!options.inject) { return; }
  // Tell the client that when DOMContentLoaded fires, it needs to tell this
  // script to inject the bridge. This should ensure that the bridge gets
  // injected before any other DOMContentLoaded or window.load event handler.
  page.evaluate(function() {
    /*jshint browser:true, devel:true */
    document.addEventListener('DOMContentLoaded', function() {
      alert('inject');
    }, false);
  });
};

function setOnLoadFinished(callback, filter) {
  page.onLoadFinished = function (status) {
    var currentUrl = page.url;
    sendMessage('onLoadFinished', currentUrl);
    if (status !== 'success') {
      sendMessage('log', status);
      sendMessage('fail.load', currentUrl);
      phantom.exit();
    } else {
      if (filter && !(page.evaluate(filter))) {
        return;
      }
      try {
        callback();
      } catch(e) {
        sendMessage('error', e);
      }
    }
  };
}

// ログイン画面ではエラーを無視する
// "ReferenceError: Can't find variable: loader Use --force to continue."
var _onError = page.onError;
page.onError = function () {};
setOnLoadFinished(onLoginOpen);
function onLoginOpen() {
  setOnLoadFinished(function () {
    sendMessage('log', 'login end');
    sendMessage('log', options.targetUrl);
    onLoginEnd();
  }, function () {
    return !!ApiUtils && !!ApiUtils.getSessionId();// has session id
  });
  page.evaluate(function (un, pw) {
    document.getElementById('username').value = un;
    document.getElementById('password').value = pw;
    document.getElementById('Login').click();
  }, options.username, options.password);
  page.onError = _onError;
}
function onLoginEnd() {
  setOnLoadFinished(onTargetPageOpen);
  page.open(options.targetUrl);
}
function onTargetPageOpen() {
  try {
    injectJsFiles();
    captureLogo();
    captureGlobalDescribe();
  } catch (e) {
    sendMessage('error', e);
  }
}
function injectJsFiles() {
  page.injectJs('tasks/phantomjs/inject.js');
  page.injectJs('lib/jquery-1.8.3.min.js');
  page.injectJs('lib/Hogan.js/hogan-2.0.0.min.js');
  page.injectJs('lib/JSZip/jszip.js');
  page.injectJs('lib/JSZip/jszip-load.js');
  page.injectJs('lib/JSZip/jszip-inflate.js');
  page.injectJs('lib/JSZip/jszip-deflate.js');
  page.injectJs('forcedotcommetadatatool.user.js');
}
function wait(callback, filter) {
  function loop() {
    if (page.evaluate(filter)) {
      callback();
    } else {
      setTimeout(loop, 300);
    }
  }
  loop();
}
function captureLogo() {
  page.evaluate(function () {
    document.getElementById('phHeaderLogoImage').style.border = '2px solid red';
  });
  page.clipRect = { top: 0, left: 0, width: 300, height: 100 };
  page.render('img/click_target.png');
  page.clipRect = {};
  page.evaluate(function () {
    document.getElementById('phHeaderLogoImage').style.border = null;
  });
}
function captureGlobalDescribe() {
  wait(function () {
    wait(function () {
      page.clipRect = { top: 0, left: 0, width: 1200, height: 800 };
      page.render('img/global_describe.png');
      page.clipRect = { top: 40, left: 80, width: 340, height: 50 };
      page.render('img/global_describe_detail.png');
      page.clipRect = {};
      captureSObject();
    }, function() {
      return MetadataTool.Panel.css('display') === 'block';
    });
    page.evaluate(function() {
      MetadataTool.$.trigger('run');
    })
  }, function () {
    return typeof sforce === 'object' && !!sforce.metadata;
  });
}
function captureSObject() {
  wait(function () {
    function clickListItem(title) {
      page.evaluate(function (title) {
        jQuery('li[data-title="' + title + '"]').trigger('click');
      }, title);
    }
    page.clipRect = { top: 0, left: 0, width: 500, height: 250 };
    page.render('img/sobject_fields.png');
    clickListItem('子リレーション');
    page.render('img/sobject_childrelationships.png');
    clickListItem('レコードタイプ');
    page.render('img/sobject_recordtypes.png');
    clickListItem('詳細');
    page.render('img/sobject_detail.png');
    clickListItem('表示項目');
    page.render('img/sobject_config.png');
    page.clipRect = {};
    captureMetadata();
  }, function () {
    return document.getElementsByClassName('mt-sod-table').length > 0;
  });
  page.evaluate(function () {
    MetadataTool.DescribeSObject.$.trigger('run', 'Account');
  });
}
function captureMetadata() {
  wait(function () {
    page.render('img/metadata_describe.png');
    phantom.exit();
  }, function () {
    return !!MetadataTool.DescribeMetadata.el;
  });
  page.evaluate(function() {
    // MetadataTool.DescribeMetadata.$.trigger('run');
    jQuery('#md').trigger('click');
  });
}

page.viewportSize = { width: 1200, height: 800 };

page.open(options.loginUrl);
