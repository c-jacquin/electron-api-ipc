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

  it('should throw an error if no event', () => {
    expect(() => {
      @IpcController()
      class FailTest {
        @((IpcEvent as any)())
        fail() {}
      }
    }).to.throw('You must specify an event name for method fail of class FailTest');
  });

  it('should throw an error if no event in a controller', () => {
    expect(() => {
      @IpcController()
      class FailTest {}
    }).to.throw('The controller FailTest has no event registered, you must register at least one');
  });
});
