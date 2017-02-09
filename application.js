var $fh = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = $fh.mbaasExpress();
var Promise = require('bluebird');
var forms = Promise.promisifyAll($fh.forms);
var _ = require('lodash');
var streamToString = require('stream-to-string');

// list the endpoints which you want to make securable here
var app = express();

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

function wrapper(property, fn) {
  return function(req, res, next) {
    res.payload = res.payload || {};
    fn().then(function(result) {
      res.payload[property] = result;
      next();
    }).catch(next);
  };
}

function getFormsTest() {
  return forms.getFormsAsync({})
  .then(function(forms) {
    return { formids: _.map(forms.forms, '_id') };
  })
  .then(function(ids) {
    return Promise.join(
      forms.getPopulatedFormListAsync(ids),
      forms.getSubmissionsAsync(ids),
      function(formList, submissions) {
        return {
          formIds: ids,
          formList: formList,
          submissions: submissions
        };
      });
  });
}

function getThemeTest() {
  return forms.getThemeAsync({});
}

function getAppClientTest() {
  return forms.getAppClientConfig({});
}

function exportCSVTest() {
  return forms.exportCSVAsync({})
  .then(streamToString);
}



app.get('/test',
  wrapper('forms', getFormsTest),
  wrapper('theme', getThemeTest),
  wrapper('appClient', getAppClientTest),
  wrapper('csv', exportCSVTest),
  function(req, res) {
    res.json(res.payload);
  }
);

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port);
});
