import { FooRepository, db, BarRepository, FooService, FooController } from "./foo";

const fooRepository = new FooRepository(db);
const barRepository = new BarRepository(db);
const fooService = new FooService(fooRepository, barRepository);
const fooController = new FooController(fooService);
export const leaves = [fooController];
