import { FormatAnsi } from './ansi';
import { inspect } from 'util';

function Timestamp() {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function Log(message: any, color?: string) {
  const timestamp = Timestamp();
  const formatted =
    typeof message === 'string' ? message : inspect(message, { depth: 3, colors: false, breakLength: Infinity });

  const output = `${color ? FormatAnsi(`[${timestamp}]`, color) : `[${timestamp}]`} ${formatted}`;
  process.stdout.write(color ? FormatAnsi(output, color) + '\n' : output + '\n');
}
