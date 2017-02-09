var $fh = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = $fh.mbaasExpress();
var Promise = require('bluebird');
var forms = Promise.promisifyAll($fh.forms);
var _ = require('lodash');

// list the endpoints which you want to make securable here
var app = express();

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());
console.log(forms);

forms.getFormsAsync({})
.tap(console.log.bind(console, '#getFormsAsync'))
.then(function(forms) {
  return {
    formids: _.map(forms.forms, '_id')
  };
})
.then(function(ids) {
  forms.getPopulatedFormListAsync(ids)
    .then(console.log.bind(console, '#getPopulatedFormListAsync'));
  forms.getSubmissionsAsync(ids)
    .then(console.log.bind(console, '#getSubmissions'));
})
.catch(console.error);

forms.getThemeAsync({})
.then(console.log.bind(console, '#getThemeAsync'))
.catch(console.error);

forms.getAppClientConfig({})
.then(console.log.bind(console, '#getAppClientConfig'))
.catch(console.error);

forms.exportCSV({})
.then(function(stream) {
  console.log('#exportCSV');
  stream.pipe(process.stdout);
})
.catch(console.error);

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port);
});
