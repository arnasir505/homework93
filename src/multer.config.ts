import { resolve } from 'path';
import config from './config';
import { unlink } from 'fs';

export const clearImage = (imageName: string) => {
  unlink(resolve(config.publicPath, imageName), (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('File does not exist.');
      } else {
        throw err;
      }
    } else {
      console.log('File deleted!');
    }
  });
};
