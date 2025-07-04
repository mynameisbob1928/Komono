import { Ansi } from "./ansi";
import util from "util";

export namespace Log {
    function Timestamp() {
        const now = new Date();
        const year = now.getFullYear().toString().padStart(4, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    export function Write(message: any, color?: string) {
        let formatted: string;

        if (message instanceof Error) {
            formatted = message.stack || message.message;
        } else if (typeof message === "string") {
            formatted = message
        } else {
            formatted = util.inspect(message, {
                depth: null,
                colors: false,
                breakLength: Infinity
            });
        };

        const output = `[${Timestamp()}] ${formatted}`;
        process.stdout.write(color ? Ansi.Format(output, color) + '\n' : output + '\n');
    };
};