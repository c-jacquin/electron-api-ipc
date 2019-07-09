/* tslint:disable:no-empty */
import { expect } from 'chai';
import { spy } from 'sinon';

import { bootstrapTestIpcApi, ipcRenderer } from '../../src/test';
import { IpcController, IpcEvent } from '../../src';
import { Container } from '../../src/lib/container';

@IpcController('log')
class TestApi {
  @IpcEvent('test')
  handleTest() {}
}

describe('debug & log', () => {
  let app: Container;
  const options = {
    logger: {
      log: () => {},
      error: () => {}
    }
  };

  beforeEach(() => {
    app = bootstrapTestIpcApi(
      {
        controllers: [TestApi]
      },
      options
    );

    app.listen();
  });

  afterEach(() => {
    app.close();
  });

  it('should use the given logger if logger is specified', done => {
    const logSpy = spy(options.logger, 'log');

    ipcRenderer.send('log-test', {});

    setTimeout(() => {
      expect(logSpy.called).to.equal(true);
      done();
    }, 1);
  });
});
