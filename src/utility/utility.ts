

export const objectToPipe = (o: { [key: string]: any }): string => Object.keys(o).reduce((a, c) => `${a}|${o[c]}`, "").slice(1);
export const listToPipe = (list: object[]): string => list.map(o => objectToPipe(o)).join('\n');

export const objectToCSV = (o: { [key: string]: any }): string => Object.keys(o).reduce((a, c) => `${a};${o[c]}`, "").slice(1);
export const listToCSV = (list: object[]): string => [Object.keys(list[0]).reduce((a, c) => `${a};${c}`, "").slice(1), ...list.map(o => objectToCSV(o))].join('\n');
