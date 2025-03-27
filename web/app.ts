import { Apriori, IAprioriResults } from "../src/aprori";
document.addEventListener('DOMContentLoaded', () => {
    const transactionsTextarea = document.getElementById('transactions') as HTMLTextAreaElement;
    const supportInput = document.getElementById('support') as HTMLInputElement;
    const minConfidenceInput = document.getElementById('min-confidence') as HTMLInputElement; // Add reference to min confidence input
    const executeButton = document.getElementById('execute-btn') as HTMLButtonElement;
    const frequentItemsetsDiv = document.getElementById('frequent-itemsets') as HTMLDivElement;
    const executionStatsDiv = document.getElementById('execution-stats') as HTMLDivElement;

    executeButton.addEventListener('click', () => {
        const transactionsText = transactionsTextarea.value.trim();
        if (!transactionsText) {
            alert('Please enter transactions');
            return;
        }

        const support = parseFloat(supportInput.value);
        if (isNaN(support) || support <= 0 || support > 1) {
            alert('Support must be a number between 0 and 1');
            return;
        }

        const minConfidence = parseFloat(minConfidenceInput.value);
        if (isNaN(minConfidence) || minConfidence <= 0 || minConfidence > 1) {
            alert('Minimum confidence must be a number between 0 and 1');
            return;
        }

        const transactions = transactionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line) 
            .map(line => line.split(',').map(item => item.trim()));

        frequentItemsetsDiv.innerHTML = '<h3>Danh sách Tập phổ biến:</h3>';
        executionStatsDiv.innerHTML = '';
        
        const frequentItemsets: Array<{items: string[], support: number}> = [];

        const apriori = new Apriori<string>(support);
        apriori.on('data', (itemset) => {
            frequentItemsets.push(itemset);
            
            const itemsetDiv = document.createElement('div');
            itemsetDiv.className = 'itemset';
            itemsetDiv.innerHTML = `{ itemset: ['${itemset.items.join("', '")}'], support: ${itemset.support.toFixed(4)} }`;
            frequentItemsetsDiv.appendChild(document.createElement('br'));
            frequentItemsetsDiv.appendChild(itemsetDiv);
            frequentItemsetsDiv.appendChild(document.createElement('br'));
        });

        apriori.exec(transactions)
            .then((result: IAprioriResults<string>) => {
                executionStatsDiv.textContent = `Finished executing Apriori. ${result.itemsets.length} frequent itemsets were found in ${result.executionTime}ms.`;
                
                // Thêm bảng hiển thị items, support count và support %
                const tableDiv = document.createElement('div');
                tableDiv.className = 'support-table';
                tableDiv.innerHTML = '<h3>Bảng Tần suất các Mục:</h3>';
                
                // Tạo bảng HTML
                const table = document.createElement('table');
                table.className = 'itemset-table';
                
                // Tạo header cho bảng
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                ['Tập mục', 'Support Count', 'Support %'].forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
                
                // Tạo nội dung bảng
                const tbody = document.createElement('tbody');
                
                // Sắp xếp itemsets theo độ dài của items và theo support
                const sortedItemsets = [...frequentItemsets].sort((a, b) => {
                    // Sắp xếp theo kích thước của itemset (tăng dần)
                    if (a.items.length !== b.items.length) {
                        return a.items.length - b.items.length;
                    }
                    // Nếu cùng kích thước, sắp xếp theo support (giảm dần)
                    return b.support - a.support;
                });
                
                // Thêm từng dòng vào bảng
                sortedItemsets.forEach(itemset => {
                    const row = document.createElement('tr');
                    
                    // Cột Item
                    const itemCell = document.createElement('td');
                    itemCell.textContent = `{${itemset.items.join(', ')}}`;
                    row.appendChild(itemCell);
                    
                    // Cột Support Count
                    const supportCountCell = document.createElement('td');
                    supportCountCell.textContent = itemset.support.toString();
                    row.appendChild(supportCountCell);
                    
                    // Cột Support %
                    const supportPercentCell = document.createElement('td');
                    const supportPercent = (itemset.support / transactions.length * 100).toFixed(2);
                    supportPercentCell.textContent = `${supportPercent}%`;
                    row.appendChild(supportPercentCell);
                    
                    tbody.appendChild(row);
                });
                
                table.appendChild(tbody);
                tableDiv.appendChild(table);
                
                // Thêm bảng vào trang
                frequentItemsetsDiv.appendChild(tableDiv);
                
                // Generate and display association rules
                const rulesDiv = document.createElement('div');
                rulesDiv.innerHTML = '<h3>Luật kết hợp:</h3>';
                
                // Use the configurable minimum confidence value
                
                frequentItemsets.forEach(itemset => {
                    if(itemset.items.length > 1) {
                        for(let i = 0; i < itemset.items.length; i++) {
                            const consequent = [itemset.items[i]];
                            const antecedent = itemset.items.filter((_, idx) => idx !== i);
                            
                            // Find the support of the antecedent
                            const antecedentItemset = frequentItemsets.find(is => 
                                is.items.length === antecedent.length && 
                                antecedent.every(item => is.items.includes(item))
                            );
                            
                            if(antecedentItemset) {
                                const confidence = itemset.support / antecedentItemset.support;
                                
                                if(confidence >= minConfidence) {
                                    const ruleDiv = document.createElement('div');
                                    ruleDiv.className = 'rule';
                                    ruleDiv.innerHTML = `{ điều kiện: ['${antecedent.join("', '")}'], kết quả: ['${consequent.join("', '")}'], min_conf: ${confidence.toFixed(2)} }`;
                                    rulesDiv.appendChild(document.createElement('br'));
                                    rulesDiv.appendChild(ruleDiv);
                                    rulesDiv.appendChild(document.createElement('br'));
                                }
                            }
                        }
                    }
                });
                
                frequentItemsetsDiv.appendChild(rulesDiv);
            })
            .catch(error => {
                console.error('Error executing Apriori:', error);
                executionStatsDiv.textContent = `Error: ${error.message}`;
            });
    });
});
