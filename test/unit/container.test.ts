/* tslint:disable:no-empty */
import { expect } from 'chai';
import { injectable, inject } from 'inversify';
import { spy } from 'sinon';
import { bootstrapTestIpcApi, ipcRenderer } from '../../src/test';
import { IpcController, IpcEvent } from '../../src/lib/ipc-decorators';
import { Container } from '../../src/lib/container';

@injectable()
class DummyService {
  foo() {
    return 'foo';
  }
}

const $$dummy = Symbol('$$dummyService');

@IpcController('foo')
class TestApi {
  constructor(@inject($$dummy) public dummy: DummyService) {}

  @IpcEvent('test')
  handleTest() {}
}

describe('Container', () => {
  let app: Container;

  beforeEach(() => {
    app = bootstrapTestIpcApi({
      controllers: [TestApi],
      services: [{ provide: $$dummy, useClass: DummyService }]
    });

    app.listen();
  });

  afterEach(() => {
    if (app.isListening) app.close();
  });

  describe('Controllers', () => {
    it('call the decorated method when event is fired', next => {
      const methodSpy = spy(TestApi.prototype, 'handleTest');

      ipcRenderer.send('foo-test', {});
      setTimeout(() => {
        expect(methodSpy.called).to.equal(true);
        next();
      }, 1);
    });
  });

  describe('Services', () => {
    it('should be injected properly', () => {
      const ctrl = app.get<TestApi>(TestApi);

      expect(ctrl.dummy).to.be.instanceOf(DummyService);
    });
  });
});
