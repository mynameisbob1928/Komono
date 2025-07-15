const Colors: Record<string, string> = {
    "reset": "\u001b[0m",
    "black": "\u001b[30m",
    "red": "\u001b[31m",
    "green": "\u001b[32m",
    "yellow": "\u001b[33m",
    "blue": "\u001b[34m",
    "magenta": "\u001b[35m",
    "cyan": "\u001b[36m",
    "white": "\u001b[37m"
};

export const Aliases: Record<string, string> = {
    "rs": "reset",
    "b": "black",
    "r": "red",
    "g": "green",
    "y": "yellow",
    "bl": "blue",
    "m": "magenta",
    "c": "cyan",
    "w": "white"
};

export function Format(text: string, color: string) {
    if (!Colors[color] && !Aliases[color]) {
        throw new Error("Invalid ANSI Color");
    };

    if (!Colors[color]) {
        const alias = Aliases[color];
        if (!alias) {
            throw new Error("Invalid ANSI Color");
        };
        color = alias;
    };

    return `${Colors[color]}${text}${Colors["reset"]}`;
};