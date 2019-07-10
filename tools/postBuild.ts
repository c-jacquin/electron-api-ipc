import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { Transform } from 'stream';

const PKG_PATH = join(process.cwd(), 'package.json');
const DIST_PKG_PATH = join(process.cwd(), 'dist/package.json');

class PkgTransformer extends Transform {
  _transform(chunk: Buffer, encoding: string, callback: () => void) {
    try {
      const {
        name,
        version,
        dependencies,
        description,
        peerDependencies,
        keywords,
        main,
        typings,
        author,
        repository,
        licence,
        engines
      } = JSON.parse(chunk.toString());

      this.push(
        JSON.stringify({
          name,
          version,
          dependencies,
          peerDependencies,
          description,
          keywords,
          main,
          typings,
          author,
          repository,
          licence,
          engines
        })
      );
      callback();
    } catch (err) {
      console.error(err);
    }
  }
}

createReadStream(PKG_PATH)
  .pipe(new PkgTransformer())
  .pipe(createWriteStream(DIST_PKG_PATH));

const LOCK_PATH = join(process.cwd(), 'yarn.lock');
const DIST_LOCK_PATH = join(process.cwd(), 'dist/yarn.lock');

createReadStream(LOCK_PATH).pipe(createWriteStream(DIST_LOCK_PATH));
