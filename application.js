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

forms.getFormsAsync({}).tap(console.log)
.then(function(forms) {
  return {
    formids: _.map(forms.forms, '_id')
  };
})
.then(forms.getPopulatedFormListAsync).tap(console.log)
.catch(console.error);

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port);
});
