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
};