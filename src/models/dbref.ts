import { Brand } from "./brand";

export type dbref = Brand<number, "dbref">;

export const NOTHING = -1 as dbref;

export const DBREF_PATTERN = /^#(\d+)$/;

export function matchDbRef(input: string): dbref | undefined {
  const match = DBREF_PATTERN.exec(input);
  if (match) {
    return parseInt(match[1], 10) as dbref;
  }
  return undefined;
}
