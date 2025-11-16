import express, { RequestHandler, Router } from 'express';
import {
  ControllerMetadata,
  ModuleMetadata,
  RouteDefinition,
  Type,
  getControllerMetadata,
  getModuleMetadata,
  getParamMetadata,
  getRouteDefinitions,
} from './decorators';
import { HttpException } from './http';

interface Pipe<T = unknown> {
  transform(value: T): T;
}

class Injector {
  private readonly instances = new Map<Type, unknown>();
  private readonly registered = new Set<Type>();

  register(token: Type) {
    this.registered.add(token);
  }

  resolve<T>(token: Type<T>): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }
    if (!this.registered.has(token)) {
      this.register(token);
    }
    const paramTypes: Type[] = Reflect.getMetadata('design:paramtypes', token) ?? [];
    const dependencies = paramTypes.map((dep) => this.resolve(dep));
    const instance = new token(...dependencies);
    this.instances.set(token, instance);
    return instance as T;
  }
}

function joinPaths(...segments: string[]) {
  const sanitized = segments
    .map((segment) => segment.replace(/\/+$/, '').replace(/^\//, ''))
    .filter((segment) => segment !== '');
  return '/' + sanitized.join('/');
}

export class NestApplication {
  private readonly app = express();
  private readonly injector = new Injector();
  private readonly controllers: Type[] = [];
  private prefix = '';
  private readonly pipes: Pipe[] = [];

  constructor(rootModule: Type) {
    this.app.use(express.json());
    this.registerModule(rootModule);
  }

  private registerModule(moduleRef: Type) {
    const metadata: ModuleMetadata = getModuleMetadata(moduleRef);
    metadata.imports?.forEach((child) => this.registerModule(child));
    metadata.providers?.forEach((provider) => this.injector.register(provider));
    metadata.controllers?.forEach((controller) => {
      this.injector.register(controller);
      this.controllers.push(controller);
    });
  }

  setGlobalPrefix(prefix: string) {
    this.prefix = prefix;
  }

  useGlobalPipes(...pipes: Pipe[]) {
    this.pipes.push(...pipes);
  }

  registerHttpHandler(method: 'get' | 'post' | 'put' | 'patch' | 'delete', path: string, handler: RequestHandler) {
    this.app[method](joinPaths(this.prefix, path), handler);
  }

  async listen(port: number) {
    this.controllers.forEach((ControllerClass) => {
      const controllerInstance = this.injector.resolve(ControllerClass);
      const metadata: ControllerMetadata = getControllerMetadata(ControllerClass);
      const routes = getRouteDefinitions(ControllerClass);
      const router = Router();

      routes.forEach((route) => {
        const handler = this.createHandler(controllerInstance, route);
        (router as any)[route.method](route.path ? `/${route.path}`.replace(/\/+/g, '/') : '/', handler);
      });

      this.app.use(joinPaths(this.prefix, metadata.prefix), router);
    });

    return new Promise<void>((resolve) => {
      this.app.listen(port, () => resolve());
    });
  }

  private createHandler(instance: any, route: RouteDefinition) {
    const prototype = Object.getPrototypeOf(instance);
    const params = getParamMetadata(prototype, route.propertyKey);

    return async (req, res) => {
      try {
        const args: unknown[] = [];
        params.forEach((param) => {
          if (param.source === 'body') {
            let payload: unknown = param.key ? req.body?.[param.key] : req.body;
            this.pipes.forEach((pipe) => {
              payload = pipe.transform(payload);
            });
            args[param.index] = payload;
          } else if (param.source === 'query') {
            args[param.index] = param.key ? req.query[param.key] : req.query;
          } else if (param.source === 'param') {
            args[param.index] = param.key ? req.params[param.key] : req.params;
          }
        });

        let response = instance[route.propertyKey](...args);
        if (response instanceof Promise) {
          response = await response;
        }

        if (response === undefined) {
          res.status(204).end();
        } else {
          res.json(response);
        }
      } catch (error) {
        if (error instanceof HttpException) {
          res.status(error.status).json(error.response ?? { message: error.message });
          return;
        }
        console.error(`[framework] Erro ao executar ${String(route.propertyKey)}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    };
  }
}

export class ValidationPipe implements Pipe {
  constructor(private readonly options?: { whitelist?: boolean }) {}

  transform<T>(value: T): T {
    if (this.options?.whitelist && typeof value === 'object' && value !== null) {
      return JSON.parse(JSON.stringify(value));
    }
    return value;
  }
}

class NestFactoryStatic {
  async create(rootModule: Type) {
    return new NestApplication(rootModule);
  }
}

export const NestFactory = new NestFactoryStatic();
