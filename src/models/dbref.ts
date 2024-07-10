import { Brand } from "./brand";

export type dbref = Brand<number, "dbref">;

export const NOTHING = -1 as dbref;
