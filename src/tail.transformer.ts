import { TailResponse, TailRowModel } from './models';

export function transform(tail: TailResponse): TailResponse {
  const actions: string[] = new Array<string>();
  const tailRows = parse(tail.log);
  for (const row of tailRows) {
    const action = logToAction(row);
    if (action.length > 0) {
      actions.concat(action);
    }
  }
  const body = actions.join('\n\r');
  const output: TailResponse = {
    log: body,
    lastIncluded: tail.lastIncluded,
    lastScanned: tail.lastScanned,
  };
  return output;
}

const parse = (jsonString: string) => {
  const type = typeof jsonString;
  if (type !== 'string') {
    throw new Error(`Input have to be string but got ${type}`);
  }
  const jsonRows: string[] = jsonString.trimEnd().split(/\n|\n\r/);
  return jsonRows.map<TailRowModel>(jsonStringRow => JSON.parse(jsonStringRow) as TailRowModel);
};

const logToAction = (row: TailRowModel): string[] => {
  const output: string[] = new Array<string>();
  // const docType = getDocType(row.cuid);
  switch (row.type) {
    case 2300: // insert/update document
      output.push(JSON.stringify({ index: { _index: '', _type: '_doc', _id: row.data._key } }));
      const source = Object.assign(row.data);
      delete source?._key;
      delete source?._id;
      delete source?._rev;
      output.push(JSON.stringify(source));
      break;
    case 2302: // delete document.
      output.push(JSON.stringify({ delete: { _index: '', _id: row.data._key } }));
      break;
    default:
      break;
  }
  return output;
};

const getDocType = (cuid: string) => {
  switch (cuid) {
    case 'h759F9D12233/12345':
      return 'users';
    default:
      return '';
  }
};
