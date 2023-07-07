import { ClientOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';

const protoDir = 'paastech-proto/proto';

const gitHost = process.env.GIT_HOST;
const gitPort = process.env.GIT_PORT;

const pomegranateHost = process.env.POMEGRANATE_HOST;
const pomegranatePort = process.env.POMEGRANATE_PORT;

export const grpcClientOptions: ClientOptions[] = [
  {
    transport: Transport.GRPC,
    options: {
      url: `${gitHost}:${gitPort}`,
      package: ['gitrepomanager'],
      protoPath: [path.join(__dirname, '../../', protoDir, 'git-repo-manager.proto')],
      loader: {
        keepCase: true,
        longs: Number,
        enums: String,
        defaults: false,
        arrays: true,
        objects: true,
        includeDirs: [path.join(__dirname, '../../', protoDir)],
      },
    },
  },
  {
    transport: Transport.GRPC,
    options: {
      url: `${pomegranateHost}:${pomegranatePort}`, // Replace with your other service's host and port
      package: ['pomegranate'], // Replace with the package name of your other service
      protoPath: [path.join(__dirname, '../../', protoDir, 'pomegranate.proto')], // Replace with the proto file path of your other service
      loader: {
        keepCase: true,
        longs: Number,
        enums: String,
        defaults: false,
        arrays: true,
        objects: true,
        includeDirs: [path.join(__dirname, '../../', protoDir)],
      },
    },
  },
];
