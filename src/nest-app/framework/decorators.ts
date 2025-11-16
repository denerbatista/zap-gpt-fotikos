import 'reflect-metadata';

export type Type<T = any> = new (...args: any[]) => T;
export type RequestMethod = 'get' | 'post' | 'patch';

export interface ModuleMetadata {
  imports?: Type[];
  controllers?: Type[];
  providers?: Type[];
}

export interface ControllerMetadata {
  prefix: string;
}

export interface RouteDefinition {
  method: RequestMethod;
  path: string;
  propertyKey: string | symbol;
}

export type ParamSource = 'body' | 'query' | 'param';

export interface ParamDefinition {
  index: number;
  source: ParamSource;
  key?: string;
}

const MODULE_METADATA = Symbol('module_metadata');
const CONTROLLER_METADATA = Symbol('controller_metadata');
const ROUTE_METADATA = Symbol('route_metadata');
const PARAM_METADATA = Symbol('param_metadata');

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MODULE_METADATA, metadata, target);
  };
}

export function getModuleMetadata(target: Type): ModuleMetadata {
  return Reflect.getMetadata(MODULE_METADATA, target) ?? {};
}

export function Injectable(): ClassDecorator {
  return () => {
    // decorator apenas para disparar metadata de injeção do TypeScript
  };
}

export function Controller(prefix = ''): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, { prefix }, target);
  };
}

export function getControllerMetadata(target: Type): ControllerMetadata {
  return Reflect.getMetadata(CONTROLLER_METADATA, target) ?? { prefix: '' };
}

function createRouteDecorator(method: RequestMethod) {
  return (path = ''): MethodDecorator => {
    return (target, propertyKey) => {
      const constructor = target.constructor as Type;
      const existing: RouteDefinition[] = Reflect.getMetadata(ROUTE_METADATA, constructor) ?? [];
      existing.push({ method, path, propertyKey });
      Reflect.defineMetadata(ROUTE_METADATA, existing, constructor);
    };
  };
}

export function getRouteDefinitions(target: Type): RouteDefinition[] {
  return Reflect.getMetadata(ROUTE_METADATA, target) ?? [];
}

function createParamDecorator(source: ParamSource) {
  return (key?: string): ParameterDecorator => {
    return (target, propertyKey, parameterIndex) => {
      const existing: ParamDefinition[] =
        Reflect.getMetadata(PARAM_METADATA, target, propertyKey as string | symbol) ?? [];
      existing.push({ index: parameterIndex, source, key });
      Reflect.defineMetadata(PARAM_METADATA, existing, target, propertyKey as string | symbol);
    };
  };
}

export function getParamMetadata(target: object, propertyKey: string | symbol): ParamDefinition[] {
  return Reflect.getMetadata(PARAM_METADATA, target, propertyKey) ?? [];
}

export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Patch = createRouteDecorator('patch');

export const Body = createParamDecorator('body');
export const Query = createParamDecorator('query');
export const Param = createParamDecorator('param');
