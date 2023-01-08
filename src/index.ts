import { Project, SyntaxKind, VariableDeclarationKind } from "ts-morph"
import { DependencyGraph } from "./graph"

const project = new Project({
  tsConfigFilePath: "./demo/tsconfig.json",
})

const sourceFile = project.getSourceFile("./demo/src/wire.ts")
if (sourceFile == null) throw Error("Source file not found")

const providerIdentifiers = sourceFile
  .getVariableDeclaration("providers")
  ?.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression) // [FooRepository, BarRepository, FooService]
  ?.getFirstChildByKind(SyntaxKind.SyntaxList) // FooRepository, BarRepository, FooService
  ?.getChildrenOfKind(SyntaxKind.Identifier) // Identifier(FooRepository), Identifier(BarRepository), Identifier(FooService)

if (providerIdentifiers == null) throw Error("Providers not found")
const graph = new DependencyGraph(providerIdentifiers)
const generatingFile = project.createSourceFile(
  sourceFile.getFilePath().replace("wire.ts", "wire-generated.ts"),
  "",
  {
    overwrite: true,
  }
)
generatingFile.addVariableStatements([
  ...graph.getInitializeStatements().map((s) => ({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [s],
  })),
  {
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "leaves",
        initializer: `[${graph
          .getLeafNodes()
          .map((n) => n.getName())
          .join(", ")}]`,
      },
    ],
  },
])

generatingFile.fixMissingImports()
generatingFile.saveSync()
