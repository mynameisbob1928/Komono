export namespace Utils {
  export const ReadableFileSizeUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  export function ReadableFileSize(bytes: number, micro = false, precision = 1) {
    const thresh = micro ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return `${bytes} B`;
    };

    let unit = -1;

    const round = 10 ** precision;

    do {
      bytes /= thresh;
      ++ unit;
    } while (((Math.round(Math.abs(bytes) * round) / round) >= thresh) && (unit < (ReadableFileSizeUnits.length - 1)));

    return `${bytes.toFixed(precision)} ${ReadableFileSizeUnits[unit]}`;
  };

  export function Format(duration: number | string) {
    const total = Math.floor(Number(duration) / 1000);
    const days = Math.floor(total / (24 * 60 * 60));
    const hours = Math.floor((total % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((total % (60 * 60)) / 60);
    const seconds = total % 60;
    const milliseconds = Math.floor(Number(duration) % 1000 / 100);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    if (milliseconds > 0 || (parts.length === 0 && Number(duration) < 1000)) parts.push(`${milliseconds}ms`);

    return parts.join(" ");
  };
};