import { AppDependencies, AppOptions } from './types';
import { Container } from './container';

export function bootstrapIpcApi(dependencies: AppDependencies, options?: AppOptions): Container {
  return new Container(dependencies, options);
}
