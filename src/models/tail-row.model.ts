export class TailRowModel {
  tick: string;
  type: number;
  db: string;
  tid: string;
  cuid?: string;
  data: {
    _key: string;
    _id: string;
    [key: string]: any;
  };
}
