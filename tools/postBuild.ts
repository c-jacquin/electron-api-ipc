import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { Transform } from 'stream';
import tempy from 'tempy';

const DEF_PATH = join(process.cwd(), 'dist/types/test/index.d.ts');

class TypeTransformer extends Transform {
  _transform(chunk: Buffer, encoding: string, callback: (err?: Error) => void) {
    const lines = chunk.toString().split('\n');
    const topLines = lines.slice(0, 3).join('\n');
    const contentLines = lines.slice(3).map(line => `  ${line.replace('declare ', '')}`);
    contentLines.pop();
    this.push(`${topLines}
declare module 'electron-api-ipc/test' {
${contentLines.join('\n')}
}
`);
    callback();
  }
}

const tempFile = tempy.file();

createReadStream(DEF_PATH)
  .pipe(new TypeTransformer())
  .pipe(createWriteStream(tempFile))
  .on('close', () => {
    createReadStream(tempFile).pipe(createWriteStream(DEF_PATH));
  });

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
