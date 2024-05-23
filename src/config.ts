import { join } from 'path';

const rootPath = __dirname;

const config = {
  rootPath,
  publicPath: join(rootPath, 'public'),
  mongoose: {
    db: 'mongodb://localhost/nest-spotify',
  },
};

export default config;
