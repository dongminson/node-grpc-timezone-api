const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');

const packageDef = protoLoader.loadSync('timezone.proto', {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const timezonePackage = grpcObj.timezonePackage;

const client = new timezonePackage.TimezoneConverter(
  'localhost:40000',
  grpc.credentials.createInsecure(),
);

const time = process.argv[2];
const fromTimezone = process.argv[3];
const toTimezone = process.argv[4];

client.convertTimezone(
  {
    time: time,
    fromTimezone: fromTimezone,
    toTimezone: toTimezone,
  },
  (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log('response from server: ' + JSON.stringify(res));
    }
  },
);
