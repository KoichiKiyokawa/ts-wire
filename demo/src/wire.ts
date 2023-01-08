import {
  BarRepository,
  db,
  FooController,
  FooRepository,
  FooService,
} from "./foo"

export const providers = [
  db,
  FooRepository,
  BarRepository,
  FooService,
  FooController,
]
