# Electron-api-ipc

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Travis](https://img.shields.io/travis/charjac/electron-api-ipc.svg)](https://travis-ci.org/charjac/electron-api-ipc)
[![Coveralls](https://img.shields.io/coveralls/charjac/electron-ipc-api.svg)](https://coveralls.io/github/charjac/electron-ipc-api)
[![dependencies Status](https://david-dm.org/charjac/electron-api-ipc/status.svg)](https://david-dm.org/charjac/electron-api-ipc)
[![devDependencies Status](https://david-dm.org/charjac/electron-api-ipc/dev-status.svg)](https://david-dm.org/charjac/electron-api-ipc?type=dev)
[![peerDependencies Status](https://david-dm.org/charjac/electron-api-ipc/peer-status.svg)](https://david-dm.org/charjac/electron-api-ipc?type=peer)

A set of decorators and a inversifyJS wrapper to manage ipc event on the main process, the same way you would manage nestjs http routes.

check the [doc](https://charjac.github.io/electron-api-ipc/)

### Installation

```bash
npm i electron-api-ipc

yarn add electron-api-ipc
```

### Getting started

main process

```js
import { bootstrapIpcApi, IpcController, IpcEvent } from 'electron-api-ipc';
import { injectable, inject } from 'inversify';

@injectable()
class MyDummyService {
  doSomething() {
    console.log('i am useless');
  }
}

const $$dummy = Symbol('dummy-service');

@IpcController('test')
class MyCtrl {
  constructor(@inject($$dummy) dummyService) {
    this.dummy = dummyService;
  }

  @IpcEvent('foo')
  handleFoo(event, data) {
    console.log(data); // print hello world
    this.dummy.doSomething();
  }
}

const app = bootstrapIpcApi({
  controllers: [MyCtrl],
  services: [{ provide: $$dummy, useClass: MyDummyService }]
});

app.listen();
```

renderer process

```js
import { ipcRenderer } from 'electron';

ipcRenderer.send('test-foo', 'hello world');
```
