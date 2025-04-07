class FPTreeNode {
    item: string | null;
    count: number;
    parent: FPTreeNode | null;
    children: Map<string, FPTreeNode>;
    next: FPTreeNode | undefined;

    constructor(item: string | null, parent: FPTreeNode | null = null) {
        this.item = item;
        this.count = 1;
        this.parent = parent;
        this.children = new Map();
        this.next = undefined;
    }
}

class FPTree {
    root: FPTreeNode;
    headerTable: Map<string, FPTreeNode>;

    constructor() {
        this.root = new FPTreeNode(null);
        this.headerTable = new Map();
    }

    addTransaction(transaction: string[], count: number = 1) {
        let currentNode = this.root;

        for (const item of transaction) {
            if (currentNode.children.has(item)) {
                currentNode.children.get(item)!.count += count;
            } else {
                const newNode = new FPTreeNode(item, currentNode);
                newNode.count = count;
                currentNode.children.set(item, newNode);

                if (!this.headerTable.has(item)) {
                    this.headerTable.set(item, newNode);
                } else {
                    let lastNode = this.headerTable.get(item)!;
                    while (lastNode.next !== undefined) {
                        lastNode = lastNode.next;
                    }
                    lastNode.next = newNode;
                }
            }

            currentNode = currentNode.children.get(item)!;
        }
    }

    getConditionalPatternBase(item: string): { pattern: string[], count: number }[] {
        const patternBase: { pattern: string[], count: number }[] = [];
        let node = this.headerTable.get(item);

        while (node) {
            let path: string[] = [];
            let currentNode = node.parent;

            while (currentNode && currentNode.item) {
                path.push(currentNode.item);
                currentNode = currentNode.parent;
            }

            if (path.length > 0) {
                patternBase.push({ pattern: path.reverse(), count: node.count });
            }

            node = node.next;
        }

        return patternBase;
    }
}

function logFPTree(node: FPTreeNode, indent: string = "") {
    if (node.item !== null) {
        console.log(`${indent}${node.item} (${node.count})`);
    }

    for (const child of node.children.values()) {
        logFPTree(child, indent + "  ");
    }
}

export function fpgrowth(transactions: string[][], minSupport: number): { items: string[]; support: number }[] {
    const itemSupport: Map<string, number> = new Map();

    for (const transaction of transactions) {
        for (const item of transaction) {
            itemSupport.set(item, (itemSupport.get(item) || 0) + 1);
        }
    }

    const frequentItems = Array.from(itemSupport.entries())
        .filter(([_, count]) => count >= minSupport)
        .sort((a, b) => b[1] - a[1])
        .map(([item]) => item);

    if (frequentItems.length === 0) return [];

    const tree = new FPTree();
    for (const transaction of transactions) {
        const filteredTransaction = transaction
            .filter(item => frequentItems.includes(item))
            .sort((a, b) => (itemSupport.get(b) || 0) - (itemSupport.get(a) || 0));

        tree.addTransaction(filteredTransaction);
    }

    console.log("🌳 FP-Tree Structure:");
    logFPTree(tree.root);

    const frequentItemsets: { items: string[]; support: number }[] = [];

    function mineTree(tree: FPTree, suffix: string[] = []) {
        for (const item of frequentItems.slice().reverse()) {
            const conditionalPatternBase = tree.getConditionalPatternBase(item);
            if (conditionalPatternBase.length === 0) continue;

            const conditionalTree = new FPTree();
            for (const { pattern, count } of conditionalPatternBase) {
                conditionalTree.addTransaction(pattern, count);
            }

            const support = itemSupport.get(item) || 0;
            if (support >= minSupport) {
                frequentItemsets.push({ items: [item, ...suffix], support });
                mineTree(conditionalTree, [item, ...suffix]);
            }
        }
    }

    mineTree(tree);

    return Array.from(new Map(
        frequentItemsets.map(itemset => [itemset.items.sort().join(','), itemset])
    ).values());
}
