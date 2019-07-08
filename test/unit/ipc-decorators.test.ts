/* tslint:disable:no-empty */
import 'reflect-metadata';
import { expect } from 'chai';

import { IpcController, IpcEvent, EVENT_PREFIX } from '../../src/lib/ipc-decorators';

@IpcController('foo')
class TestApi {
  @IpcEvent('test')
  handleTest() {}

  @IpcEvent('testbis')
  handleTestBis() {}
}

describe('Ipc decorators', () => {
  let testController: TestApi;

  beforeEach(() => {
    testController = new TestApi();
  });

  it('should set the correct metadata to the controller instance', () => {
    const metas = Reflect.getMetadata(EVENT_PREFIX, testController);

    expect(metas).to.eql([
      { eventName: 'test', name: 'handleTest' },
      { eventName: 'testbis', name: 'handleTestBis' }
    ]);
  });
});
