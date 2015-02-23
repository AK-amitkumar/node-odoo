var http = require('http'),
    jayson = require('jayson');

var Odoo = function (config) {
  config = config || {};

  this.host = config.host;
  this.port = config.port || 80;
  this.database = config.database;
  this.username = config.username;
  this.password = config.password;
};

// Connect
Odoo.prototype.connect = function (cb) {
  var params = {
    db: this.database,
    login: this.username,
    password: this.password
  };

  var json = JSON.stringify({ params: params });

  var options = {
    host: this.host,
    port: this.port,
    path: '/web/session/authenticate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': json.length
    }
  };

  var self = this;

  var req = http.request(options, function (res) {
    var response = '';

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      response += chunk;
    });

    res.on('end', function () {
      response = JSON.parse(response);

      if (response.error) {
        return cb(response.error, null);
      }

      self.uid = response.result.uid;
      self.sid = res.headers['set-cookie'][0].split(';')[0];
      self.session_id = response.result.session_id;

      return cb(null, response.result);
    });
  });

  req.write(json);
};

// Create model
Odoo.prototype.create = function (model, params, callback) {
  var options = {
    host: this.host,
    port: this.port,
    path: '/web/dataset/call_kw',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': this.sid + ';'
    }
  };

  var client = jayson.client.http(options);

  client.request('call', {
    kwargs: {},
    model: model,
    method: 'create',
    args: [params]
  }, function (e, err, res) {
    if (e || err) {
      return callback(e || err, null);
    }

    return callback(null, res);
  });
};

// Get model
Odoo.prototype.get = function () {

};

// Update model
Odoo.prototype.update = function () {

};

// Delete
Odoo.prototype.delete = function () {

};

// List models
Odoo.prototype.list = function () {

};

// Search models
Odoo.prototype.search = function () {

};

module.exports = Odoo;
