import { Ansi } from "./ansi";

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
        let output = String(message);
        if (color) {
            output = Ansi.Format(output, color);
        };

        process.stdout.write(`[${Timestamp()}] ${output}\n`)
    };
};