class DB {}
export const db = new DB()

export class FooRepository {
  constructor(private readonly db: DB) {}
}

export class BarRepository {
  constructor(private readonly db: DB) {}
}

export class FooService {
  constructor(
    private readonly fooRepository: FooRepository,
    private readonly barRepository: BarRepository
  ) {}
}

export class FooController {
  constructor(private readonly fooService: FooService) {}
}
