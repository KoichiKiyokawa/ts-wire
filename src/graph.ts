import {
  Identifier,
  OptionalKind,
  SyntaxKind,
  ts,
  VariableDeclarationStructure,
} from "ts-morph"
import { camelize } from "./utils"

class ProviderPreprocessor {
  constructor(private readonly identifier: Identifier) {}

  getDependencyIdentifiers() {
    return this.getInitializeParameters().flatMap(
      (p) =>
        p
          .getLastChildByKind(SyntaxKind.TypeReference)
          ?.getFirstChildByKind(SyntaxKind.Identifier) ?? []
    )
  }

  getDefinitionKind() {
    return this.identifier.getDefinitions()[0].getKind()
  }

  private getInitializeParameters() {
    switch (this.getDefinitionKind()) {
      case ts.ScriptElementKind.classElement:
        return this.identifier
          .getDefinitionNodes()[0]
          .asKind(SyntaxKind.ClassDeclaration)!
          .getConstructors()[0]
          .getParameters()
      case ts.ScriptElementKind.functionElement:
        return this.identifier
          .getDefinitionNodes()[0]
          .asKind(SyntaxKind.FunctionDeclaration)!
          .getParameters()
    }
    return []
  }
}

export class DependencyGraph {
  nodes: DependencyGraphNode[]

  constructor(providerIdentifiers: Identifier[]) {
    this.nodes = providerIdentifiers.map((providerIdentifier) => {
      return new DependencyGraphNode(providerIdentifier)
    })

    // ----------------------
    // setup dependencies
    for (let i = 0; i < providerIdentifiers.length; i++) {
      new ProviderPreprocessor(providerIdentifiers[i])
        .getDependencyIdentifiers()
        .forEach((d) => {
          const applicableProviderIndex = providerIdentifiers.findIndex(
            (p) => p.getType().getSymbol() === d.getType().getSymbol()
          )
          if (applicableProviderIndex === -1) {
            throw new Error(
              `${d.getText()} is in providers, but it's dependencies are not in providers`
            )
          }
          this.nodes[i].addDependency(this.nodes[applicableProviderIndex])
        })
    }
    // ----------------------

    // ----------------------
    // evaluate used count
    this.nodes.forEach((node) => {
      node.dependencies.forEach((dep) => {
        dep.usedCount++
      })
    })
    // ----------------------

    // ----------------------
    // evaluate initialize cost
    let prevEvaluatedNodeCount = 0
    let evaluatedNodeCount = 0
    while (evaluatedNodeCount < this.nodes.length) {
      this.nodes.forEach((node) => {
        if (node.initializeCost !== undefined) return

        if (node.dependencies.length === 0) {
          node.initializeCost = 0
        } else if (
          node.dependencies.some((dep) => dep.initializeCost === undefined)
        ) {
          // we cannot evaluate initializeCost of this node yet, so go to next node
          return
        } else {
          node.initializeCost = node.dependencies.reduce(
            // we check initializeCost is not undefined in the above if statement
            (acc, dep) => acc + dep.initializeCost! + 1,
            0
          )
        }

        evaluatedNodeCount++
      })

      if (prevEvaluatedNodeCount === evaluatedNodeCount) {
        throw new Error(
          `Circular dependency detected: ${this.nodes
            .filter((node) => node.initializeCost === undefined)
            .map((node) => node.providerIdentifier.getText())
            .join(", ")}`
        )
      }
      prevEvaluatedNodeCount = evaluatedNodeCount
    }
    // ----------------------
  }

  getLeafNodes() {
    return this.nodes.filter((node) => node.usedCount === 0)
  }

  getInitializeStatements() {
    return this.getNodesSortedByInitializeCost().flatMap(
      (node) => node.getInitializeStatement() ?? []
    )
  }

  private getNodesSortedByInitializeCost() {
    return this.nodes.sort((a, b) => {
      if (a.initializeCost === undefined || b.initializeCost === undefined)
        throw new Error("initializeCost is not evaluated")

      return a.initializeCost - b.initializeCost
    })
  }
}

class DependencyGraphNode {
  kind: "class" | "function" | "value"
  dependencies: DependencyGraphNode[] = []
  initializeCost: number | undefined = undefined
  usedCount = 0

  constructor(public readonly providerIdentifier: Identifier) {
    switch (new ProviderPreprocessor(providerIdentifier).getDefinitionKind()) {
      case ts.ScriptElementKind.classElement:
        this.kind = "class"
        break
      case ts.ScriptElementKind.functionElement:
        this.kind = "function"
        break
      default:
        this.kind = "value"
    }
  }

  addDependency(node: DependencyGraphNode) {
    this.dependencies.push(node)
  }

  getName() {
    if (this.kind === "class")
      return camelize(this.providerIdentifier.getText())

    return this.providerIdentifier.getText()
  }

  getInitializeStatement(): OptionalKind<VariableDeclarationStructure> | null {
    if (this.kind === "function" || this.kind === "value") return null
    return {
      name: this.getName(),
      initializer: `new ${this.providerIdentifier.getText()}(${this.dependencies
        .map((d) => d.getName())
        .join(", ")})`,
    }
  }
}
