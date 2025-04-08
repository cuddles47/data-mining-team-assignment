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

    // Step 1: Count item frequencies
    for (const transaction of transactions) {
        for (const item of transaction) {
            itemSupport.set(item, (itemSupport.get(item) || 0) + 1);
        }
    }

    // Step 2: Filter and sort frequent items
    const frequentItems = Array.from(itemSupport.entries())
        .filter(([_, count]) => count >= minSupport)
        .sort((a, b) => {
            // Sắp xếp giảm dần theo tần suất
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            }
            // Nếu tần suất bằng nhau, sắp xếp tăng dần theo mã ASCII
            return a[0].localeCompare(b[0]);
        })
        .map(([item]) => item);

    if (frequentItems.length === 0) return [];
    console.log("Step 2: Frequent Items after filtering and sorting:", frequentItems);
    // Step 3: Build FP-Tree
    const tree = new FPTree();
    for (const transaction of transactions) {
        const filteredTransaction = transaction
            .filter(item => frequentItems.includes(item))
            .sort((a, b) => frequentItems.indexOf(a) - frequentItems.indexOf(b));

        tree.addTransaction(filteredTransaction);
        console.log("Filtered Transaction:", filteredTransaction);
    }
    
    console.log("🌳 FP-Tree Structure:");
    logFPTree(tree.root);

    // Step 4: Mine frequent itemsets
    const frequentItemsets: { items: string[]; support: number }[] = [];

    function mineTree(tree: FPTree, suffix: string[] = []) {
        // Bước 1: Lấy danh sách các mục trong header table và sắp xếp theo thứ tự tăng dần độ phổ biến (giống hình)
        const itemsInTree = Array.from(tree.headerTable.keys());
    
        for (const item of itemsInTree.reverse()) {
            // Bước 2: Tính tổng support
            let support = 0;
            let node: FPTreeNode | undefined = tree.headerTable.get(item);
            while (node) {
                support += node.count;
                node = node.next;
            }
    
            if (support >= minSupport) {
                const newItemset = [item, ...suffix];
                frequentItemsets.push({ items: newItemset, support });
    
                // Bước 3: Lấy cơ sở mẫu điều kiện
                const conditionalPatternBase = tree.getConditionalPatternBase(item);
    
                // Bước 4: Tạo cây FP-Tree điều kiện
                const conditionalTree = new FPTree();
                for (const { pattern, count } of conditionalPatternBase) {
                    conditionalTree.addTransaction(pattern, count);
                }
    
                // Bước 5: Đệ quy khai thác cây điều kiện
                if (conditionalTree.root.children.size > 0) {
                    mineTree(conditionalTree, newItemset);
                }
            }
        }
    }
    
    
    

    mineTree(tree);
    console.log("Frequent Itemsets:", frequentItemsets);
    
    // Remove duplicate itemsets
    return Array.from(new Map(
        frequentItemsets.map(itemset => [itemset.items.sort().join(','), itemset])
    ).values());
}
