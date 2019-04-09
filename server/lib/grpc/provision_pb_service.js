// package: 
// file: provision.proto

var provision_pb = require("./provision_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ProvisionService = (function () {
  function ProvisionService() {}
  ProvisionService.serviceName = "ProvisionService";
  return ProvisionService;
}());

ProvisionService.Get = {
  methodName: "Get",
  service: ProvisionService,
  requestStream: false,
  responseStream: false,
  requestType: provision_pb.User,
  responseType: provision_pb.UserRolesList
};

ProvisionService.Provision = {
  methodName: "Provision",
  service: ProvisionService,
  requestStream: false,
  responseStream: false,
  requestType: provision_pb.RoleDiff,
  responseType: provision_pb.Status
};

exports.ProvisionService = ProvisionService;

function ProvisionServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ProvisionServiceClient.prototype.get = function get(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProvisionService.Get, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ProvisionServiceClient.prototype.provision = function provision(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProvisionService.Provision, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.ProvisionServiceClient = ProvisionServiceClient;

