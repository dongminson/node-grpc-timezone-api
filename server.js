const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const moment = require('moment-timezone');

const packageDef = protoLoader.loadSync('timezone.proto', {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const timezonePackage = grpcObj.timezonePackage;

function convertTimezone(call, callback) {
  const { time, fromTimezone, toTimezone } = call.request;

  if (!time || !fromTimezone || !toTimezone) {
    const error = new Error('Missing required parameters');
    return callback(error, null);
  }

  const isValidTime = moment(time, moment.ISO_8601, true).isValid();
  if (!isValidTime) {
    const error = new Error(
      'Invalid time format. Please provide time in ISO 8601 format',
    );
    return callback(error, null);
  }

  const isValidFromTimezone = moment.tz.zone(fromTimezone) !== null;
  const isValidToTimezone = moment.tz.zone(toTimezone) !== null;
  if (!isValidFromTimezone || !isValidToTimezone) {
    const error = new Error('Invalid timezone(s)');
    return callback(error, null);
  }

  const convertedTime = moment
    .tz(time, fromTimezone)
    .tz(toTimezone)
    .format('YYYY-MM-DD HH:mm:ss');
  callback(null, { convertedTime });
}

const server = new grpc.Server();
server.bindAsync(
  '0.0.0.0:40000',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('Server started on port 40000');
  },
);
server.addService(timezonePackage.TimezoneConverter.service, {
  ConvertTimezone: convertTimezone,
});
