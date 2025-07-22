import Redis from 'ioredis';
import Env from './env';

export default new Redis({
  host: Env.Required('redis_host'),
  port: Env.ToNumber(Env.Required('redis_port')),
  password: Env.Required('redis_pass'),
});
