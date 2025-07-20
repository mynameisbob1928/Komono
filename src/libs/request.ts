import http from 'http';
import https from 'https';
import Env from './env';

export namespace Request {
  export type RequestMethods = 'GET' | 'POST';

  export interface RequestResponse {
    TEXT: string;
    JSON: { [key: string]: any };
    BUFFER: Buffer;
  }

  export interface RequestOptions<T extends keyof RequestResponse> {
    url: string;
    data?: any;
    method?: RequestMethods;
    response?: T;
    params?: { [key: string]: any };
    headers?: { [key: string]: any };
  }

  export function Request<T extends keyof RequestResponse>(options: RequestOptions<T>): Promise<RequestResponse[T]> {
    return new Promise((resolve, reject) => {
      if (!options.url.startsWith('http')) {
        return reject('Invalid protocol');
      }

      const protocol = options.url.startsWith('https') ? https : http;

      let splited = options.url.split('/').slice(2);

      let path = `/${splited.slice(1).join('/')}`;

      if (!splited[0]) {
        return reject('Invalid URL format');
      }
      splited = splited[0].split(':');

      let [port, host] =
        splited.length > 1
          ? [splited[splited.length - 1], splited.slice(0, splited.length - 1).join(':')]
          : ['', splited.join(':')];

      const req = protocol.request({ path, port, host, method: options.method, headers: options.headers }, (res) => {
        let buffer = Buffer.alloc(0);

        res.on('data', (chunk) => {
          buffer = Buffer.concat([buffer, chunk]);
        });

        res.on('end', () => {
          if (options.response == 'BUFFER') return resolve(buffer as any);
          else if (options.response == 'JSON') return resolve(JSON.parse(buffer.toString('utf-8')));
          else return resolve(buffer.toString('utf-8') as any);
        });
      });

      if (options.data) {
        if (options.method == 'GET') {
          return reject('GET cannot have data');
        }

        req.write(Env.ToString(options.data));
      }

      req.end();
    });
  }
}
