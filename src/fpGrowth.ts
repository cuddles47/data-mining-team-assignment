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

// export function fpgrowth(transactions: string[][], minSupport: number): { items: string[]; support: number }[] {
//     const itemSupport: Map<string, number> = new Map();

//     // Step 1: Count item frequencies
//     for (const transaction of transactions) {
//         for (const item of transaction) {
//             itemSupport.set(item, (itemSupport.get(item) || 0) + 1);
//         }
//     }

//     // Step 2: Filter and sort frequent items
//     const frequentItems = Array.from(itemSupport.entries())
//         .filter(([_, count]) => count >= minSupport)
//         .sort((a, b) => {
//             // Sắp xếp giảm dần theo tần suất
//             if (b[1] !== a[1]) {
//                 return b[1] - a[1];
//             }
//             // Nếu tần suất bằng nhau, sắp xếp tăng dần theo mã ASCII
//             return a[0].localeCompare(b[0]);
//         })
//         .map(([item]) => item);

//     if (frequentItems.length === 0) return [];
//     console.log("Step 2: Frequent Items after filtering and sorting:", frequentItems);
//     // Step 3: Build FP-Tree
//     const tree = new FPTree();
//     for (const transaction of transactions) {
//         const filteredTransaction = transaction
//             .filter(item => frequentItems.includes(item))
//             .sort((a, b) => frequentItems.indexOf(a) - frequentItems.indexOf(b));

//         tree.addTransaction(filteredTransaction);
//         console.log("Filtered Transaction:", filteredTransaction);
//     }

//     console.log("🌳 FP-Tree Structure:");
//     logFPTree(tree.root);

//     // Step 4: Mine frequent itemsets
//     const frequentItemsets: { items: string[]; support: number }[] = [];

//     function mineTree(tree: FPTree, suffix: string[] = []) {
//         // Bước 1: Lấy danh sách các mục trong header table và sắp xếp theo thứ tự tăng dần độ phổ biến (giống hình)
//         const itemsInTree = Array.from(tree.headerTable.keys());

//         for (const item of itemsInTree.reverse()) {
//             // Bước 2: Tính tổng support
//             let support = 0;
//             let node: FPTreeNode | undefined = tree.headerTable.get(item);
//             while (node) {
//                 support += node.count;
//                 node = node.next;
//             }

//             if (support >= minSupport) {
//                 const newItemset = [item, ...suffix];
//                 frequentItemsets.push({ items: newItemset, support });

//                 // Bước 3: Lấy cơ sở mẫu điều kiện
//                 const conditionalPatternBase = tree.getConditionalPatternBase(item);

//                 // Bước 4: Tạo cây FP-Tree điều kiện
//                 const conditionalTree = new FPTree();
//                 for (const { pattern, count } of conditionalPatternBase) {
//                     conditionalTree.addTransaction(pattern, count);
//                 }

//                 // Bước 5: Đệ quy khai thác cây điều kiện
//                 if (conditionalTree.root.children.size > 0) {
//                     mineTree(conditionalTree, newItemset);
//                 }
//             }
//         }
//     }




//     mineTree(tree);
//     console.log("Frequent Itemsets:", frequentItemsets);

//     // Remove duplicate itemsets
//     return Array.from(new Map(
//         frequentItemsets.map(itemset => [itemset.items.sort().join(','), itemset])
//     ).values());
// }

export function fpgrowth(
    transactions: string[][],
    minSupport: number
): {
    frequentItemsets: { items: string[]; support: number }[], logs: string[], frequentItemsetsData: Array<{
        x: string;
        conditionalBase: string[];
        fpTree: string[];
        frequentPatterns: string[];
        support: number;
    }>, treeNodes: { label: string, depth: number }[]
} {
    const logs: string[] = [];
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
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            }
            return a[0].localeCompare(b[0]);
        })
        .map(([item]) => item);

    if (frequentItems.length === 0) return { frequentItemsets: [], logs, frequentItemsetsData: [], treeNodes: [] };
    frequentItems.forEach(item => {
        const supportCount = itemSupport.get(item) || 0; // Lấy support count từ itemSupport
        logs.push(`Item: ${item}, Support Count: ${supportCount}`);
    });

    // Step 3: Build FP-Tree
    const tree = new FPTree();
    for (const transaction of transactions) {
        const filteredTransaction = transaction
            .filter(item => frequentItems.includes(item))
            .sort((a, b) => frequentItems.indexOf(a) - frequentItems.indexOf(b));

        tree.addTransaction(filteredTransaction);
        logs.push(`Filtered Transaction: ${filteredTransaction.join(', ')}`);
    }
    const treeNodes: { label: string, depth: number }[] = [];
    logs.push("FP-Tree Structure:");
    function logFPTreeToLogs(node: FPTreeNode, indent: string = "", depth: number = 0) {
        if (node.item !== null) {
            treeNodes.push({ label: `${node.item} (${node.count})`, depth });
        }
        for (const child of node.children.values()) {
            logFPTreeToLogs(child, indent + "  ", depth + 1);
        }
    }
    logFPTreeToLogs(tree.root);

    // Step 4: Mine frequent itemsets
    const frequentItemsets: { items: string[]; support: number }[] = [];


    const frequentItemsetsData: Array<{
        x: string;
        conditionalBase: string[];
        fpTree: string[];
        frequentPatterns: string[];
        support: number;
    }> = [];
    function mineTree(tree: FPTree, suffix: string[] = []) {
        const itemsInTree = frequentItems.filter(item => tree.headerTable.has(item)).reverse();

        for (const item of itemsInTree) {
            let support = 0;
            let node: FPTreeNode | undefined = tree.headerTable.get(item);

            while (node) {
                support += node.count;
                node = node.next;
            }
            console.log(`Support Count: ${minSupport}`);
            if (support >= minSupport) {
                // Gộp item + suffix → như ảnh 1 (vd: I2, I5)
                const newItemset = [item, ...suffix];
                frequentItemsets.push({ items: newItemset, support });
                logs.push(`Frequent Itemset Found: {${newItemset.join(', ')}} with support ${support}`);
                console.log(`New Itemset Created: {${newItemset.join(', ')}}`);

                // Cơ sở mẫu điều kiện
                const conditionalPatternBase = tree.getConditionalPatternBase(item);
                logs.push(`Conditional Pattern Base for ${item}: ${JSON.stringify(conditionalPatternBase)}`);

                // Cây FP-tree điều kiện
                const conditionalTree = new FPTree();
                for (const { pattern, count } of conditionalPatternBase) {
                    conditionalTree.addTransaction(pattern, count);
                }

                const conditionalTreeLogs: string[] = [];
                function logConditionalTree(node: FPTreeNode, indent: string = "") {
                    if (node.item !== null) {
                        conditionalTreeLogs.push(`${indent}${node.item} (${node.count})`);
                    }
                    for (const child of node.children.values()) {
                        logConditionalTree(child, indent + "  ");
                    }
                }
                logConditionalTree(conditionalTree.root);
                console.log("Conditional FP-Tree Structure:", conditionalTreeLogs);

                // Kiểm tra các phần tử trong conditionalTreeLogs
                const validConditionalTreeLogs = conditionalTreeLogs.filter(log => {
                    const match = log.match(/\((\d+)\)$/); // Lấy số đếm (count) từ chuỗi log
                    if (match) {
                        const count = parseInt(match[1], 10);
                        return count >= minSupport;
                    }
                    return false;
                });




                console.log(`Valid Conditional FP-Tree Nodes for ${item}:`, validConditionalTreeLogs);
                const conditionalPatterns = [];

                if (validConditionalTreeLogs.length === 0) {
                    logs.push(`No valid nodes in Conditional FP-Tree for ${item} with support >= ${minSupport}`);
                    console.log(`No valid nodes in Conditional FP-Tree for ${item} with support >= ${minSupport}`);

                    // Nếu không có nút hợp lệ, chỉ thêm chính item vào conditionalPatterns
                    const singlePattern = { items: [item, ...suffix], support };
                    conditionalPatterns.push(singlePattern);
                    frequentItemsets.push(singlePattern);

                    console.log(`Conditional Frequent Itemset (Single Item): {${singlePattern.items.join(', ')}} with support ${singlePattern.support}`);

                    // Log vào bảng
                    frequentItemsetsData.push({
                        x: item,
                        conditionalBase: [],
                        fpTree: [],
                        frequentPatterns: [`{${singlePattern.items.join(', ')}}`],
                        support
                    });

                    continue; // Bỏ qua xử lý tiếp theo
                }
                // Sinh các mẫu phổ biến từ validConditionalTreeLogs


                for (const log of validConditionalTreeLogs) {
                    console.log("Log:", log);
                    const match = log.match(/^(.+?) \((\d+)\)$/); // Trích xuất item và count từ chuỗi log
                    console.log("match:", match);
                    if (match) {
                        const nodeItem = match[1]; // Item từ log
                        const nodeCount = parseInt(match[2], 10); // Count từ log
                        console.log(`Node Item: ${nodeItem}, Node Count: ${nodeCount}`);
                        // Tạo tổ hợp mở rộng mẫu phổ biến α ∪ β
                        let combinedItemset = [nodeItem, item, ...suffix];
                        combinedItemset = Array.from(new Set(combinedItemset)); // Loại bỏ các phần tử trùng lặp
                        const combinedItemset1 = uniqueArrays([combinedItemset]);
                        
                        console.log(`Combined Itemset: {${combinedItemset.join(', ')}} with support ${nodeCount}`);

                        conditionalPatterns.push({ items: combinedItemset1, support: nodeCount });
                        frequentItemsets.push({ items: combinedItemset, support: nodeCount });
                        logs.push(`Conditional Frequent Itemset: {${combinedItemset1.join(', ')}} with support ${nodeCount}`);
                        console.log(`Conditional Frequent Itemset: {${combinedItemset1.join(', ')}} with support ${nodeCount}`);
                    }
                }
                console.log("Conditional Patterns:", conditionalPatterns);
                
              



                frequentItemsetsData.push({
                    x: item,
                    conditionalBase: conditionalPatternBase.map(base => `{${base.pattern.join(', ')}: ${base.count}}`),
                    fpTree: validConditionalTreeLogs,
                    frequentPatterns: conditionalPatterns.map(pattern => `{${pattern.items.join(', ')}: ${pattern.support}}`),
                    support
                });


            }
        }
    }


    frequentItemsetsData.sort((a, b) => b.support - a.support);
    mineTree(tree);
    logs.push("Frequent Itemsets:");
    console.log("Frequent Itemsets:", frequentItemsets);
    console.log("Frequent Itemsets Data:", frequentItemsetsData);
    frequentItemsets.forEach(itemset => {
        logs.push(`{${itemset.items.join(', ')}}: ${itemset.support}`);
    });

    return {
        frequentItemsets: Array.from(new Map(
            frequentItemsets.map(itemset => [itemset.items.sort().join(','), itemset])
        ).values()),
        logs,
        frequentItemsetsData,
        treeNodes
    };
}
function uniqueArrays<T>(arrays: T[][], ignoreOrder: boolean = true): T[][] {
    const seen = new Set<string>();
    const result: T[][] = [];
  
    for (const arr of arrays) {
      const key = ignoreOrder ? [...arr].sort().join(',') : arr.join(',');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(arr);
      }
    }
  
    return result;
  }
  