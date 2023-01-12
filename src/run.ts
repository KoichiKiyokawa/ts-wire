import { Project, SyntaxKind, VariableDeclarationKind } from 'ts-morph'
import { DependencyGraph } from './graph'

export function run({
  tsConfigFilePath,
  inputFilePath,
  outputFilePath,
}: {
  tsConfigFilePath: string
  inputFilePath: string
  outputFilePath: string
}) {
  const project = new Project({ tsConfigFilePath })
  const sourceFile = project.getSourceFile(inputFilePath)
  if (sourceFile == null) throw Error(`Source file not found: ${inputFilePath}`)

  const providerIdentifiers = sourceFile
    .getVariableDeclaration('providers')
    ?.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression) // [FooRepository, BarRepository, FooService]
    ?.getFirstChildByKind(SyntaxKind.SyntaxList) // FooRepository, BarRepository, FooService
    ?.getChildrenOfKind(SyntaxKind.Identifier) // Identifier(FooRepository), Identifier(BarRepository), Identifier(FooService)

  if (providerIdentifiers == null) throw Error('Providers not found')
  const graph = new DependencyGraph(providerIdentifiers)
  const generatingFile = project.createSourceFile(outputFilePath, '', {
    overwrite: true,
  })
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
          name: 'leaves',
          initializer: `[${graph
            .getLeafNodes()
            .map((n) => n.getName())
            .join(', ')}]`,
        },
      ],
    },
  ])

  generatingFile.fixMissingImports()
  generatingFile.saveSync()
}
