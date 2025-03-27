import { Apriori, IAprioriResults } from "../src/aprori";
document.addEventListener('DOMContentLoaded', () => {
    const transactionsTextarea = document.getElementById('transactions') as HTMLTextAreaElement;
    const supportInput = document.getElementById('support') as HTMLInputElement;
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

        const transactions = transactionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line) 
            .map(line => line.split(',').map(item => item.trim()));

        frequentItemsetsDiv.innerHTML = '';
        executionStatsDiv.innerHTML = '';

        const apriori = new Apriori<string>(support);
        apriori.on('data', (itemset) => {
            const itemsetDiv = document.createElement('div');
            itemsetDiv.className = 'itemset';
            itemsetDiv.textContent = `Itemset { ${itemset.items.join(', ')} } is frequent and has a support of ${itemset.support}`;
            frequentItemsetsDiv.appendChild(itemsetDiv);
        });

        apriori.exec(transactions)
            .then((result: IAprioriResults<string>) => {
                executionStatsDiv.textContent = `Finished executing Apriori. ${result.itemsets.length} frequent itemsets were found in ${result.executionTime}ms.`;
            })
            .catch(error => {
                console.error('Error executing Apriori:', error);
                executionStatsDiv.textContent = `Error: ${error.message}`;
            });
    });
});
