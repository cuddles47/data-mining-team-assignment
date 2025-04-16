import { Apriori, IKetQuaApriori } from "../src/apriori";
import { KMeans, Diem, KMeansKetqua, KMeansLap } from "../src/kmeans_clustering";
declare const Chart: any;


document.addEventListener('DOMContentLoaded', () => {
    const transactionsTextarea = document.getElementById('transactions') as HTMLTextAreaElement;
    const supportInput = document.getElementById('support') as HTMLInputElement;
    const minConfidenceInput = document.getElementById('min-confidence') as HTMLInputElement;
    const executeButton = document.getElementById('execute-btn') as HTMLButtonElement;
    const importButton = document.getElementById('import-btn') as HTMLButtonElement;

    const frequentItemsetsDiv = document.getElementById('frequent-itemsets') as HTMLDivElement;
    const executionStatsDiv = document.getElementById('execution-stats') as HTMLDivElement;

    // K-means specific elements
    const algorithmSelect = document.getElementById('algorithm-select') as HTMLSelectElement;
    const aprioriParams = document.getElementById('apriori-params') as HTMLDivElement;
    const kmeansParams = document.getElementById('kmeans-params') as HTMLDivElement;
    const confidenceabc = document.getElementById('confidence-group') as HTMLDivElement;
    const kClustersInput = document.getElementById('k-clusters') as HTMLInputElement;
    const maxIterationsInput = document.getElementById('max-iterations') as HTMLInputElement;
    const visualizationContainer = document.getElementById('visualization-container') as HTMLDivElement;
    const xAxisSelect = document.getElementById('x-axis') as HTMLSelectElement;
    const yAxisSelect = document.getElementById('y-axis') as HTMLSelectElement;
    const clusterCanvas = document.getElementById('cluster-canvas') as HTMLCanvasElement;
    const inputTitle = document.getElementById('input-title') as HTMLHeadingElement;
    const inputDescription = document.getElementById('input-description') as HTMLParagraphElement;

    // Define algorithm-specific placeholders
    const placeholders: { [key: string]: string } = {
        'apriori': `A,B,C
A,C
C,B,A
A,B`,
        'kmeans':  `1,1
2,1
4,3
5,4`
    };

    // Set initial placeholder based on default selected algorithm
    transactionsTextarea.placeholder = placeholders[algorithmSelect.value];

    // Update placeholder when algorithm changes
    algorithmSelect.addEventListener('change', function () {
        transactionsTextarea.placeholder = placeholders[this.value];
    });

    // Algorithm selection change handler
    algorithmSelect.addEventListener('change', () => {
        const selectedAlgorithm = algorithmSelect.value;

        if (selectedAlgorithm === 'apriori') {
            aprioriParams.style.display = 'block';
            kmeansParams.style.display = 'none';
            visualizationContainer.style.display = 'none';
            inputTitle.textContent = 'Input Transactions';
            inputDescription.textContent = 'Enter each transaction on a new line. Items within a transaction should be separated by commas.';
            executeButton.textContent = 'Execute Apriori';
        } else if (selectedAlgorithm === 'kmeans') {
            aprioriParams.style.display = 'none';
            kmeansParams.style.display = 'block';
            inputTitle.textContent = 'Input Data Points';
            inputDescription.textContent = 'Enter each data point on a new line. Values should be numeric and separated by commas.';
            executeButton.textContent = 'Execute K-means';
        } else {
            aprioriParams.style.display = 'block';
            kmeansParams.style.display = 'none';
            confidenceabc.style.display = 'none';
            visualizationContainer.style.display = 'none';
            inputTitle.textContent = 'Input Transactions';
            inputDescription.textContent = 'Enter each transaction on a new line. Items within a transaction should be separated by commas.';
            executeButton.textContent = 'Execute FP-Growth';
        }
    });

    importButton.addEventListener('click', () => {
        // Create a visible file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv, .tsv, .txt';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // Add change event listener
        fileInput.addEventListener('change', (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                let content = e.target?.result as string;
                if (!content) {
                    alert('File is empty or cannot be read.');
                    return;
                }

                // Remove BOM if present (UTF-8 BOM)
                if (content.charCodeAt(0) === 0xFEFF) {
                    content = content.slice(1);
                }

                // Determine CSV delimiter
                const firstLine = content.split('\n')[0];
                let delimiter = detectDelimiter(firstLine);

                // Convert CSV to array of records
                const lines = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line);

                if (lines.length <= 1) {
                    alert('Invalid CSV format');
                    return;
                }

                // Get header row
                const headers = parseCSVLine(lines[0], delimiter);
                if (headers.length < 2) {
                    alert('CSV must have at least two columns');
                    return;
                }

                // Process data, skip TransactionID column if present
                const selectedAlgorithm = algorithmSelect.value;

                if (selectedAlgorithm === 'apriori') {
                    // For Apriori: Skip first column (ID column) and join the rest
                    const transactions = lines
                        .slice(1) // Skip header
                        .map(line => {
                            const columns = parseCSVLine(line, delimiter);
                            return columns.slice(1).join(','); // Skip first column
                        });

                    transactionsTextarea.value = transactions.join('\n');
                } else {
                    // For K-means: Use all numeric columns
                    const dataPoints = lines
                        .slice(1) // Skip header
                        .map(line => {
                            return parseCSVLine(line, delimiter).join(',');
                        });

                    transactionsTextarea.value = dataPoints.join('\n');
                }

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.textContent = `File imported successfully: ${file.name}`;
                successMsg.style.color = 'green';
                successMsg.style.marginTop = '10px';
                successMsg.style.padding = '5px';

                // Remove previous success messages
                const prevMsg = document.querySelector('.import-success');
                if (prevMsg) prevMsg.remove();

                successMsg.className = 'import-success';
                document.querySelector('.input-section')?.appendChild(successMsg);

                // Auto-hide after 3 seconds
                setTimeout(() => {
                    successMsg.remove();
                }, 3000);
            };

            reader.onerror = () => alert('Error reading file.');
            reader.readAsText(file);

            // Clean up - remove the file input element
            document.body.removeChild(fileInput);
        });

        // Trigger file input click
        fileInput.click();
    });

    /**
     * Xác định dấu phân cách CSV (`,`, `;`, `\t`)
     */
    function detectDelimiter(sampleLine: string): string {
        const delimiters = [',', ';', '\t'];
        let detected = ',';
        let maxCount = 0;

        delimiters.forEach(delimiter => {
            const count = sampleLine.split(delimiter).length;
            if (count > maxCount) {
                maxCount = count;
                detected = delimiter;
            }
        });

        return detected;
    }

    /**
     * Tách dòng CSV, hỗ trợ dấu `"`
     */
    function parseCSVLine(line: string, delimiter: string): string[] {
        const regex = new RegExp(`\\s*${delimiter}\\s*(?=(?:[^"]*"[^"]*")*[^"]*$)`);
        return line.split(regex).map(cell => cell.replace(/^"|"$/g, '').trim());
    }

    const resetTextareaButton = document.getElementById('reset-textarea-btn') as HTMLButtonElement;

    // Reset button event handler
    resetTextareaButton.addEventListener('click', () => {
        // Clear textarea and input fields
        transactionsTextarea.value = '';
        supportInput.value = '0.5';
        minConfidenceInput.value = '0.5';
        kClustersInput.value = '3';
        maxIterationsInput.value = '100';

        // Clear results
        frequentItemsetsDiv.innerHTML = '';
        executionStatsDiv.innerHTML = '';
        visualizationContainer.style.display = 'none';

        // Reset visualization axes selects
        xAxisSelect.innerHTML = '';
        yAxisSelect.innerHTML = '';
    });

    executeButton.addEventListener('click', () => {
        const transactionsText = transactionsTextarea.value.trim();
        if (!transactionsText) {
            alert('Please enter data');
            return;
        }

        // Clear previous results
        frequentItemsetsDiv.innerHTML = '';
        executionStatsDiv.innerHTML = '';

        // Execute selected algorithm
        if (algorithmSelect.value === 'apriori') {
            executeApriori(transactionsText);
        } else if (algorithmSelect.value === 'kmeans') {
            executeKMeans(transactionsText);
        } else {
            executeFpGrowth(transactionsText);
        }
    });

    function executeApriori(transactionsText: string) {
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

        const frequentItemsets: Array<{ mathang: string[], hotro: number }> = [];

        const apriori = new Apriori<string>(support);
        apriori.on('data', (itemset) => {
            frequentItemsets.push(itemset);
        });

        apriori.thucthi(transactions)
            .then((result: IKetQuaApriori<string>) => {
                executionStatsDiv.textContent = `Finished executing Apriori. ${result.tapmathang.length} frequent itemsets were found in ${result.thoigianthaotac}ms.`;

                // 1. Trước tiên, hiển thị bảng tần suất các mục
                const tableDiv = document.createElement('div');
                tableDiv.className = 'support-table';
                tableDiv.innerHTML = '<h3>Bảng Tần suất các Mục:</h3>';

                // Tạo bảng HTML
                const table = document.createElement('table');
                table.className = 'itemset-table';
                // Thêm style trực tiếp cho bảng
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                table.style.margin = '20px 0';
                table.style.border = '2px solid #ddd';

                // Tạo header cho bảng
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                ['Tập mục', 'Support Count', 'Support %'].forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    // Thêm style cho header cells
                    th.style.border = '1px solid #ddd';
                    th.style.padding = '10px';
                    th.style.textAlign = 'center';
                    th.style.backgroundColor = '#f2f2f2';
                    th.style.fontWeight = 'bold';
                    th.style.borderBottom = '2px solid #ddd';
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Tạo nội dung bảng
                const tbody = document.createElement('tbody');

                // Sắp xếp itemsets theo độ dài của items và theo support
                const sortedItemsets = [...frequentItemsets].sort((a, b) => {
                    // Sắp xếp theo kích thước của itemset (tăng dần)
                    if (a.mathang.length !== b.mathang.length) {
                        return a.mathang.length - b.mathang.length;
                    }
                    // Nếu cùng kích thước, sắp xếp theo support (giảm dần)
                    return b.hotro - a.hotro;
                });

                // Thêm từng dòng vào bảng
                sortedItemsets.forEach(itemset => {
                    const row = document.createElement('tr');

                    // Cột Item
                    const itemCell = document.createElement('td');
                    itemCell.textContent = `{${itemset.mathang.join(', ')}}`;
                    // Thêm style cho cell
                    itemCell.style.border = '1px solid #ddd';
                    itemCell.style.padding = '10px';
                    itemCell.style.textAlign = 'center';
                    row.appendChild(itemCell);

                    // Cột Support Count
                    const supportCountCell = document.createElement('td');
                    supportCountCell.textContent = itemset.hotro.toString();
                    // Thêm style cho cell
                    supportCountCell.style.border = '1px solid #ddd';
                    supportCountCell.style.padding = '10px';
                    supportCountCell.style.textAlign = 'center';
                    row.appendChild(supportCountCell);

                    // Cột Support %
                    const supportPercentCell = document.createElement('td');
                    const supportPercent = (itemset.hotro / transactions.length * 100).toFixed(2);
                    supportPercentCell.textContent = `${supportPercent}%`;
                    // Thêm style cho cell
                    supportPercentCell.style.border = '1px solid #ddd';
                    supportPercentCell.style.padding = '10px';
                    supportPercentCell.style.textAlign = 'center';
                    row.appendChild(supportPercentCell);

                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                tableDiv.appendChild(table);

                // Thêm bảng vào trang
                frequentItemsetsDiv.appendChild(tableDiv);

                // 3. Cuối cùng hiển thị luật kết hợp
                const rulesDiv = document.createElement('div');
                rulesDiv.innerHTML = '<h3>Luật kết hợp:</h3>';

                // Use the configurable minimum confidence value

                frequentItemsets.forEach(itemset => {
                    if (itemset.mathang.length > 1) {
                        for (let i = 0; i < itemset.mathang.length; i++) {
                            const consequent = [itemset.mathang[i]];
                            const antecedent = itemset.mathang.filter((_, idx) => idx !== i);

                            // Find the support of the antecedent
                            const antecedentItemset = frequentItemsets.find(is =>
                                is.mathang.length === antecedent.length &&
                                antecedent.every(item => is.mathang.includes(item))
                            );

                            if (antecedentItemset) {
                                const confidence = itemset.hotro / antecedentItemset.hotro;

                                if (confidence >= minConfidence) {
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
    }

    /**
     * Converts Point objects to 2D numeric array for K-means processing
     */
    function convertPointsToNumericArray(points: Diem[]): number[][] {
        const result: number[][] = [];

        // Find all unique dimension keys across all points
        const dimensionKeys = new Set<string>();
        for (const point of points) {
            Object.keys(point).forEach(key => dimensionKeys.add(key));
        }

        // Sort dimension keys to ensure consistent ordering
        const sortedKeys = Array.from(dimensionKeys).sort();

        // Convert each point to an array of numbers
        for (const point of points) {
            const numericPoint: number[] = [];
            for (const key of sortedKeys) {
                numericPoint.push(point[key] || 0); // Use 0 for missing dimensions
            }
            result.push(numericPoint);
        }

        return result;
    }

    /**
     * Displays the input data as a table for better visualization
     */
    function displayInputDataTable(points: number[][]): void {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'input-data-table';
        tableContainer.innerHTML = '<h3>Input Data Points:</h3>';

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.margin = '15px 0';
        table.style.border = '1px solid #ddd';

        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Add point ID header
        const idHeader = document.createElement('th');
        idHeader.textContent = 'Point';
        idHeader.style.border = '1px solid #ddd';
        idHeader.style.padding = '8px';
        idHeader.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(idHeader);

        // Add dimension headers
        if (points.length > 0) {
            for (let i = 0; i < points[0].length; i++) {
                const dimHeader = document.createElement('th');
                dimHeader.textContent = `Dimension ${i + 1}`;
                dimHeader.style.border = '1px solid #ddd';
                dimHeader.style.padding = '8px';
                dimHeader.style.backgroundColor = '#f2f2f2';
                headerRow.appendChild(dimHeader);
            }
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body with data points
        const tbody = document.createElement('tbody');

        points.forEach((point, idx) => {
            const row = document.createElement('tr');

            // Add point ID
            const idCell = document.createElement('td');
            idCell.textContent = `P${idx + 1}`;
            idCell.style.border = '1px solid #ddd';
            idCell.style.padding = '8px';
            row.appendChild(idCell);

            // Add dimension values
            point.forEach(value => {
                const valueCell = document.createElement('td');
                valueCell.textContent = value.toString();
                valueCell.style.border = '1px solid #ddd';
                valueCell.style.padding = '8px';
                row.appendChild(valueCell);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);

        // Add the table to the page
        const resultsDiv = document.getElementById('frequent-itemsets');
        if (resultsDiv) {
            resultsDiv.appendChild(tableContainer);
        }
    }

    function executeKMeans(dataText: string) {
        try {
            // Parse parameters
            const k = parseInt(kClustersInput.value);
            const maxIterations = parseInt(maxIterationsInput.value);
            const useKMeansPP = true; // Default value for K-means++ initialization

            if (isNaN(k) || k < 2) {
                alert('Number of clusters must be at least 2');
                return;
            }

            if (isNaN(maxIterations) || maxIterations < 1) {
                alert('Max iterations must be a positive number');
                return;
            }

            // Parse data for K-means
            const dataPoints = parseDataForKMeans(dataText);

            /**
             * Parses the input data for K-means clustering.
             * Each line represents a data point, and values are separated by commas.
             */
            function parseDataForKMeans(dataText: string): Diem[] {
                return dataText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line)
                    .map(line => {
                        const values = line.split(',').map(value => parseFloat(value.trim()));
                        if (values.some(isNaN)) {
                            throw new Error('Invalid data point: All values must be numeric.');
                        }
                        const point: Diem = {};
                        values.forEach((value, index) => {
                            point[`dimension_${index + 1}`] = value;
                        });
                        return point;
                    });
            }

            if (dataPoints.length === 0) {
                alert('No valid data points found. Please check your input.');
                return;
            }

            // Ensure we have enough data points
            if (dataPoints.length < k) {
                alert(`Cannot create ${k} clusters from ${dataPoints.length} data points. Please reduce K or add more data.`);
                return;
            }

            // Record start time for performance measurement
            const startTime = performance.now();

            // Convert from Point objects to 2D number array for detailed tracking
            const numericDataPoints = convertPointsToNumericArray(dataPoints);

            // Add placeholder points as requested to prevent legend overlap
            // These points won't affect the clustering algorithm, only the visualization bounds
            const placeholderPoints: Diem[] = [];

            // Add the specific placeholders requested: (1,1), (2,1), (4,3), (5,4)
            if (numericDataPoints.length > 0 && numericDataPoints[0].length >= 2) {
                placeholderPoints.push({ dimension_1: 1, dimension_2: 1 });
                placeholderPoints.push({ dimension_1: 2, dimension_2: 1 });
                placeholderPoints.push({ dimension_1: 4, dimension_2: 3 });
                placeholderPoints.push({ dimension_1: 5, dimension_2: 4 });
            }

            const numericPlaceholders = convertPointsToNumericArray(placeholderPoints);

            // Add: Display input data as a table (only the real data points, not placeholders)
            displayInputDataTable(numericDataPoints);

            // Initialize and run K-means with detailed tracking (using only real data)
            const kmeans = new KMeans(k, maxIterations);

            // Run K-means with detailed tracking
            const result = kmeans.dichuyenvoidulieu(numericDataPoints);

            // Record end time
            const endTime = performance.now();
            const executionTime = endTime - startTime;

            // Display results with detailed tracking information
            displayDetailedKMeansResults(result, executionTime, numericDataPoints, numericPlaceholders);

        } catch (error: any) {
            console.error('Error executing K-means:', error);
            executionStatsDiv.textContent = `Error: ${error.message}`;
        }
    }

    function executeFpGrowth(transactionsText: string) {
        const support = parseFloat((document.getElementById('support') as HTMLInputElement).value);
        if (isNaN(support) || support <= 0 || support > 1) {
            alert('Support must be a number between 0 and 1');
            return;
        }

        // Chuyển đổi dữ liệu giao dịch
        const transactions = transactionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => line.split(',').map(item => item.trim()));

        const minSupportCount = Math.ceil(support * transactions.length);

        // Gọi hàm fpgrowth để chạy thuật toán FP-Growth
        const { fpgrowth } = require('../src/fpGrowth'); // Import FP-Growth implementation
        const { frequentItemsets, logs, frequentItemsetsData, treeNodes } = fpgrowth(transactions, minSupportCount);

        // Lấy container hiển thị kết quả
        const resultsContainer = document.getElementById('results-container')!;
        resultsContainer.innerHTML = ''; // Xóa nội dung cũ

        // Hiển thị Step 2: Frequent Items
        const step2Div = document.createElement('div');
        step2Div.innerHTML = '<h3>Step 2: Frequent Items</h3>';

        const step2Table = document.createElement('table');
        step2Table.className = 'itemset-table';
        step2Table.style.width = '100%';
        step2Table.style.borderCollapse = 'collapse';
        step2Table.style.margin = '20px 0';
        step2Table.style.border = '2px solid #ddd';

        // Tạo header cho bảng
        const step2Thead = document.createElement('thead');
        const step2HeaderRow = document.createElement('tr');
        ['Item', 'Support Count'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.border = '1px solid #ddd';
            th.style.padding = '10px';
            th.style.textAlign = 'center';
            th.style.backgroundColor = '#f2f2f2';
            th.style.fontWeight = 'bold';
            th.style.borderBottom = '2px solid #ddd';
            step2HeaderRow.appendChild(th);
        });
        step2Thead.appendChild(step2HeaderRow);
        step2Table.appendChild(step2Thead);

        // Tạo nội dung bảng
        const step2Tbody = document.createElement('tbody');
        (logs as string[]).filter(log => log.startsWith('Item:')).forEach(log => {
            const row = document.createElement('tr');

            const [item, supportCount] = log.replace('Item: ', '').split(', Support Count: ');

            const itemCell = document.createElement('td');
            itemCell.textContent = item;
            itemCell.style.border = '1px solid #ddd';
            itemCell.style.padding = '10px';
            itemCell.style.textAlign = 'center';
            row.appendChild(itemCell);

            const supportCountCell = document.createElement('td');
            supportCountCell.textContent = supportCount;
            supportCountCell.style.border = '1px solid #ddd';
            supportCountCell.style.padding = '10px';
            supportCountCell.style.textAlign = 'center';
            row.appendChild(supportCountCell);

            step2Tbody.appendChild(row);
        });
        step2Table.appendChild(step2Tbody);
        step2Div.appendChild(step2Table);
        resultsContainer.appendChild(step2Div);

        // Hiển thị FP-Tree
        const fpTreeDiv = document.createElement('div');
        fpTreeDiv.innerHTML = '<h3>FP-Tree Structure</h3>';

        // Tạo hoặc lấy phần tử <pre>
        let fpTreeList = document.getElementById('fp-tree') as HTMLPreElement;
        if (!fpTreeList) {
            fpTreeList = document.createElement('pre');
            fpTreeList.id = 'fp-tree';
        }

        // Dòng đầu tiên là root
        const treeLines: string[] = ['Root'];
        
        // Duyệt qua treeNodes và tạo chuỗi có indent đúng theo depth
        for (let i = 0; i < treeNodes.length; i++) {
            const current = treeNodes[i];
            const next = treeNodes[i + 1];
            const isLast =
                !next || next.depth <= current.depth; // Kiểm tra nếu node kế tiếp có depth nhỏ hơn hoặc bằng thì node hiện tại là cuối cùng ở level này
        
            const prefix = '│   '.repeat(current.depth);
            const connector = isLast ? '└── ' : '├── ';
            treeLines.push(`${prefix}${connector}${current.label}`);
        }

        // Gán nội dung vào <pre>
        fpTreeList.textContent = treeLines.join('\n');

        // Thêm vào DOM
        fpTreeDiv.appendChild(fpTreeList);
        resultsContainer.appendChild(fpTreeDiv);



        // Hiển thị Frequent Patterns
        displayFrequentItemsetsTable(frequentItemsetsData);
    }
    
    function displayFrequentItemsetsTable(frequentItemsetsData: Array<{
        x: string;
        conditionalBase: string[];
        fpTree: string[];
        frequentPatterns: string[];
    }>) {
        // Tạo container cho bảng
        const resultsContainer = document.getElementById('results-container') || document.body;
        const frequentItemsetsDiv = document.createElement('div');
        frequentItemsetsDiv.innerHTML = '<h3>Kết quả FP-Growth</h3>';

        // Tạo bảng
        const table = document.createElement('table');
        table.className = 'itemset-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.margin = '20px 0';
        table.style.border = '2px solid #ddd';

        // Tạo header cho bảng
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['x', 'Cơ sở mẫu điều kiện', 'Cây FP-tree', 'Sinh các mẫu phổ biến'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.border = '1px solid #ddd';
            th.style.padding = '10px';
            th.style.textAlign = 'center';
            th.style.backgroundColor = '#f2f2f2';
            th.style.fontWeight = 'bold';
            th.style.borderBottom = '2px solid #ddd';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Tạo nội dung bảng
        const tbody = document.createElement('tbody');
        frequentItemsetsData.forEach(itemset => {
            const row = document.createElement('tr');

            // Cột x
            const xCell = document.createElement('td');
            xCell.textContent = itemset.x;
            xCell.style.border = '1px solid #ddd';
            xCell.style.padding = '10px';
            xCell.style.textAlign = 'center';
            row.appendChild(xCell);

            // Cột Cơ sở mẫu điều kiện
            const conditionalBaseCell = document.createElement('td');
            conditionalBaseCell.textContent = itemset.conditionalBase.join(', ');
            conditionalBaseCell.style.border = '1px solid #ddd';
            conditionalBaseCell.style.padding = '10px';
            conditionalBaseCell.style.textAlign = 'center';
            row.appendChild(conditionalBaseCell);

            // Cột Cây FP-tree
            const fpTreeCell = document.createElement('td');
            fpTreeCell.textContent = itemset.fpTree.join(', ');
            fpTreeCell.style.border = '1px solid #ddd';
            fpTreeCell.style.padding = '10px';
            fpTreeCell.style.textAlign = 'center';
            row.appendChild(fpTreeCell);

            // Cột Sinh các mẫu phổ biến
            const frequentPatternsCell = document.createElement('td');
            frequentPatternsCell.textContent = itemset.frequentPatterns.join(', ');
            frequentPatternsCell.style.border = '1px solid #ddd';
            frequentPatternsCell.style.padding = '10px';
            frequentPatternsCell.style.textAlign = 'center';
            row.appendChild(frequentPatternsCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        frequentItemsetsDiv.appendChild(table);

        // Thêm bảng vào DOM
        resultsContainer.appendChild(frequentItemsetsDiv);
    }

    function parseDataForKMeans(dataText: string): Point[] {
        const lines = dataText.split('\n')
            .map(line => line.trim())
            .filter(line => line);

        const dataPoints: Point[] = [];
        const headers: string[] = [];
        let headerCreated = false;

        // Process data lines
        lines.forEach((line, lineIndex) => {
            // Split the line into values
            const values = line.split(',').map(val => val.trim());

            // Create default headers if this is the first line
            if (!headerCreated) {
                for (let i = 0; i < values.length; i++) {
                    // Try to parse as number to see if this is a header row or data row
                    const parsedValue = parseFloat(values[i]);
                    if (isNaN(parsedValue)) {
                        // This is likely a header row
                        headers.push(values[i]);
                    } else {
                        // This is a data row, create default headers
                        for (let j = 0; j < values.length; j++) {
                            headers.push(`dimension_${j + 1}`);
                        }
  function displayDetailedKMeansResults(result: KMeansKetqua, executionTime: number, originalData: number[][], placeholders?: number[][]) {
        // Clear previous results
        frequentItemsetsDiv.innerHTML = '';
        // Display execution stats
        executionStatsDiv.textContent = `Đã thực hiện K-means với ${result.tamcum.length} cụm trong ${executionTime.toFixed(2)}ms. Số vòng lặp: ${result.solap}`;

        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'kmeans-results';

        // 1. Display Input Data Table
        const inputDataDiv = document.createElement('div');
        inputDataDiv.innerHTML = '<h3>Dữ liệu đầu vào:</h3>';

        const inputTable = document.createElement('table');
        inputTable.className = 'data-table';
        inputTable.style.width = '100%';
        inputTable.style.borderCollapse = 'collapse';
        inputTable.style.margin = '20px 0';
        inputTable.style.border = '2px solid #ddd';

        // Create header
        const inputThead = document.createElement('thead');
        const inputHeaderRow = document.createElement('tr');

        // Add point ID column
        const pointHeader = document.createElement('th');
        pointHeader.textContent = 'Điểm';
        pointHeader.style.border = '1px solid #ddd';
        pointHeader.style.padding = '10px';
        pointHeader.style.backgroundColor = '#f2f2f2';
        pointHeader.style.fontWeight = 'bold';
        inputHeaderRow.appendChild(pointHeader);

        // Add dimension headers
        if (originalData.length > 0) {
            for (let i = 0; i < originalData[0].length; i++) {
                const th = document.createElement('th');
                th.textContent = `Tọa độ ${i + 1}`;
                th.style.border = '1px solid #ddd';
                th.style.padding = '10px';
                th.style.backgroundColor = '#f2f2f2';
                th.style.fontWeight = 'bold';
                inputHeaderRow.appendChild(th);
            }
        }

        inputThead.appendChild(inputHeaderRow);
        inputTable.appendChild(inputThead);

        // Create table body
        const inputTbody = document.createElement('tbody');

        originalData.forEach((point, idx) => {
            const row = document.createElement('tr');

            // Point ID cell
            const idCell = document.createElement('td');
            idCell.textContent = `Điểm ${idx + 1}`;
            idCell.style.border = '1px solid #ddd';
            idCell.style.padding = '10px';
            idCell.style.textAlign = 'center';
            row.appendChild(idCell);

            // Data point values
            point.forEach(value => {
                const valueCell = document.createElement('td');
                valueCell.textContent = value.toString();
                valueCell.style.border = '1px solid #ddd';
                valueCell.style.padding = '10px';
                valueCell.style.textAlign = 'center';
                row.appendChild(valueCell);
            });

            inputTbody.appendChild(row);
        });

        inputTable.appendChild(inputTbody);
        inputDataDiv.appendChild(inputTable);
        resultsContainer.appendChild(inputDataDiv);

        // 2. Display Initial Centroids
        const initialCentroidsDiv = document.createElement('div');
        initialCentroidsDiv.innerHTML = `<h3>Tâm cụm ban đầu (Số cụm k = ${result.chitietlap[0].tamcum.length}):</h3>`;

        // Create table for initial centroids
        const initialCentroidsTable = document.createElement('table');
        initialCentroidsTable.className = 'centroid-table';
        initialCentroidsTable.style.width = '100%';
        initialCentroidsTable.style.borderCollapse = 'collapse';
        initialCentroidsTable.style.margin = '20px 0';
        initialCentroidsTable.style.border = '2px solid #ddd';

        // Create header
        const centroidThead = document.createElement('thead');
        const centroidHeaderRow = document.createElement('tr');

        // Centroid column header
        const centroidHeader = document.createElement('th');
        centroidHeader.textContent = 'Tâm cụm';
        centroidHeader.style.border = '1px solid #ddd';
        centroidHeader.style.padding = '10px';
        centroidHeader.style.backgroundColor = '#f2f2f2';
        centroidHeader.style.fontWeight = 'bold';
        centroidHeaderRow.appendChild(centroidHeader);

        // Add dimension headers
        if (result.chitietlap[0].tamcum.length > 0) {
            for (let i = 0; i < result.chitietlap[0].tamcum[0].length; i++) {
                const th = document.createElement('th');
                th.textContent = `Tọa độ ${i + 1}`;
                th.style.border = '1px solid #ddd';
                th.style.padding = '10px';
                th.style.backgroundColor = '#f2f2f2';
                th.style.fontWeight = 'bold';
                centroidHeaderRow.appendChild(th);
            }
        }

        centroidThead.appendChild(centroidHeaderRow);
        initialCentroidsTable.appendChild(centroidThead);

        // Create table body for initial centroids
        const centroidTbody = document.createElement('tbody');

        result.chitietlap[0].tamcum.forEach((centroid, idx) => {
            const row = document.createElement('tr');

            // Centroid label cell
            const labelCell = document.createElement('td');
            labelCell.textContent = `Tâm cụm ${idx + 1}`;
            labelCell.style.border = '1px solid #ddd';
            labelCell.style.padding = '10px';
            labelCell.style.textAlign = 'center';
            row.appendChild(labelCell);

            // Centroid values
            centroid.forEach(value => {
                const valueCell = document.createElement('td');
                valueCell.textContent = value.toFixed(4);
                valueCell.style.border = '1px solid #ddd';
                valueCell.style.padding = '10px';
                valueCell.style.textAlign = 'center';
                row.appendChild(valueCell);
            });

            centroidTbody.appendChild(row);
        });

        initialCentroidsTable.appendChild(centroidTbody);
        initialCentroidsDiv.appendChild(initialCentroidsTable);
        resultsContainer.appendChild(initialCentroidsDiv);

        // 3. Display iteration details
        const iterationsDiv = document.createElement('div');
        iterationsDiv.innerHTML = '<h3>Chi tiết từng vòng lặp:</h3>';

        // Create accordion for iterations
        const accordion = document.createElement('div');
        accordion.className = 'iterations-accordion';
        accordion.style.border = '1px solid #ddd';
        accordion.style.borderRadius = '5px';
        accordion.style.marginBottom = '30px';

        // Add each iteration details
        result.chitietlap.forEach((iteration, idx) => {
            // Create iteration header
            const header = document.createElement('div');
            header.className = 'iteration-header';
            header.textContent = `Vòng lặp ${idx + 1}`;
            header.style.padding = '12px 15px';
            header.style.backgroundColor = '#f2f2f2';
            header.style.borderBottom = '1px solid #ddd';
            header.style.cursor = 'pointer';
            header.style.fontWeight = 'bold';
            header.style.fontSize = '16px';

            if (idx === 0) {
                header.style.backgroundColor = '#e0e0e0'; // Make first iteration active
            }

            // Create iteration content (initially hidden except first)
            const content = document.createElement('div');
            content.className = 'iteration-content';
            content.style.padding = '20px';
            content.style.backgroundColor = '#fafafa';
            content.style.display = idx === 0 ? 'block' : 'none';

            // 3.1 Calculate Euclidean distances
            const distancesDiv = document.createElement('div');
            distancesDiv.innerHTML = '<h4>Tính khoảng cách Euclid:</h4>';

            // Calculate and display distances in a structured table
            const distancesTable = document.createElement('table');
            distancesTable.className = 'distances-table';
            distancesTable.style.width = '100%';
            distancesTable.style.borderCollapse = 'collapse';
            distancesTable.style.margin = '15px 0';
            distancesTable.style.border = '1px solid #ddd';

            // Create header for distances table
            const distancesThead = document.createElement('thead');
            const distancesHeaderRow = document.createElement('tr');

            ['Điểm', 'Phép tính khoảng cách Euclid', 'Kết quả khoảng cách', 'Kết luận'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.border = '1px solid #ddd';
                th.style.padding = '10px';
                th.style.backgroundColor = '#f2f2f2';
                th.style.fontWeight = 'bold';
                distancesHeaderRow.appendChild(th);
            });

            distancesThead.appendChild(distancesHeaderRow);
            distancesTable.appendChild(distancesThead);

            // Create body for distances table
            const distancesTbody = document.createElement('tbody');

            originalData.forEach((point, pointIdx) => {
                const row = document.createElement('tr');

                // Point column
                const pointCell = document.createElement('td');
                pointCell.textContent = `Điểm ${pointIdx + 1}`;
                pointCell.style.border = '1px solid #ddd';
                pointCell.style.padding = '10px';
                pointCell.style.verticalAlign = 'top';
                row.appendChild(pointCell);

                // Euclidean distance calculation column
                const calculationCell = document.createElement('td');
                calculationCell.style.border = '1px solid #ddd';
                calculationCell.style.padding = '10px';
                calculationCell.style.verticalAlign = 'top';

                const distanceDetails = document.createElement('div');
                const distances: number[] = [];

                iteration.tamcum.forEach((centroid, centroidIdx) => {
                    // Calculate step-by-step Euclidean distance
                    let sumOfSquares = 0;
                    const steps = [];

                    for (let dim = 0; dim < point.length; dim++) {
                        const diff = point[dim] - centroid[dim];
                        const squaredDiff = diff * diff;
                        sumOfSquares += squaredDiff;

                        steps.push(`(${point[dim]} - ${centroid[dim].toFixed(4)})² = ${squaredDiff.toFixed(4)}`);
                    }

                    const distance = Math.sqrt(sumOfSquares);
                    distances.push(distance);

                    const detail = document.createElement('div');
                    detail.style.marginBottom = '12px';
                    detail.innerHTML = `
                        <strong>Đến tâm cụm ${centroidIdx + 1}:</strong><br>
                        d = √(${steps.join(' + ')}) = √${sumOfSquares.toFixed(4)} = ${distance.toFixed(4)}
                    `;
                    distanceDetails.appendChild(detail);
                });

                calculationCell.appendChild(distanceDetails);
                row.appendChild(calculationCell);

                // Results column
                const resultCell = document.createElement('td');
                resultCell.style.border = '1px solid #ddd';
                resultCell.style.padding = '10px';
                resultCell.style.verticalAlign = 'top';

                const resultList = document.createElement('ul');
                resultList.style.listStyleType = 'none';
                resultList.style.padding = '0';
                resultList.style.margin = '0';

                distances.forEach((distance, i) => {
                    const listItem = document.createElement('li');
                    listItem.style.marginBottom = '5px';
                    listItem.textContent = `Khoảng cách đến tâm cụm ${i + 1}: ${distance.toFixed(4)}`;
                    resultList.appendChild(listItem);
                });

                resultCell.appendChild(resultList);
                row.appendChild(resultCell);

                // Conclusion column
                const assignedCluster = iteration.phancum[pointIdx];
                const minDistance = Math.min(...distances);
                const minIndex = distances.indexOf(minDistance);

                const conclusionCell = document.createElement('td');
                conclusionCell.style.border = '1px solid #ddd';
                conclusionCell.style.padding = '10px';
                conclusionCell.style.verticalAlign = 'top';

                // Format nice conclusion with comparison
                const conclusion = document.createElement('div');
                conclusion.innerHTML = `<strong>Điểm ${pointIdx + 1} được gán vào Cụm ${assignedCluster + 1}</strong> vì:`;

                const comparisonList = document.createElement('ul');
                comparisonList.style.marginTop = '5px';

                distances.forEach((distance, i) => {
                    const listItem = document.createElement('li');
                    if (i === minIndex) {
                        listItem.innerHTML = `<strong style="color: green;">Khoảng cách đến Tâm cụm ${i + 1} = ${distance.toFixed(4)} (nhỏ nhất)</strong>`;
                    } else {
                        listItem.innerHTML = `Khoảng cách đến Tâm cụm ${i + 1} = ${distance.toFixed(4)} > ${minDistance.toFixed(4)}`;
                    }
                    comparisonList.appendChild(listItem);
                });

                conclusion.appendChild(comparisonList);
                conclusionCell.appendChild(conclusion);
                row.appendChild(conclusionCell);

                distancesTbody.appendChild(row);
            });

            distancesTable.appendChild(distancesTbody);
            distancesDiv.appendChild(distancesTable);
            content.appendChild(distancesDiv);

            // 3.2 Display cluster assignments table
            const clusterAssignmentsDiv = document.createElement('div');
            clusterAssignmentsDiv.innerHTML = '<h4>Bảng phân cụm:</h4>';

            // Group points by cluster for this iteration
            const clusteredPoints: { [key: number]: number[] } = {};
            iteration.phancum.forEach((clusterIdx, pointIdx) => {
                if (!clusteredPoints[clusterIdx]) {
                    clusteredPoints[clusterIdx] = [];
                }
                clusteredPoints[clusterIdx].push(pointIdx);
            });

            // Create cluster assignment table
            const assignmentsTable = document.createElement('table');
            assignmentsTable.className = 'assignments-table';
            assignmentsTable.style.width = '100%';
            assignmentsTable.style.borderCollapse = 'collapse';
            assignmentsTable.style.margin = '15px 0';
            assignmentsTable.style.border = '1px solid #ddd';

            // Create header
            const assignmentsThead = document.createElement('thead');
            const assignmentsHeaderRow = document.createElement('tr');

            const clusterHeader = document.createElement('th');
            clusterHeader.textContent = 'Cụm';
            clusterHeader.style.border = '1px solid #ddd';
            clusterHeader.style.padding = '10px';
            clusterHeader.style.backgroundColor = '#f2f2f2';
            assignmentsHeaderRow.appendChild(clusterHeader);

            const pointsHeader = document.createElement('th');
            pointsHeader.textContent = 'Các điểm trong cụm';
            pointsHeader.style.border = '1px solid #ddd';
            pointsHeader.style.padding = '10px';
            pointsHeader.style.backgroundColor = '#f2f2f2';
            assignmentsHeaderRow.appendChild(pointsHeader);

            const countHeader = document.createElement('th');
            countHeader.textContent = 'Số lượng';
            countHeader.style.border = '1px solid #ddd';
            countHeader.style.padding = '10px';
            countHeader.style.backgroundColor = '#f2f2f2';
            assignmentsHeaderRow.appendChild(countHeader);

            assignmentsThead.appendChild(assignmentsHeaderRow);
            assignmentsTable.appendChild(assignmentsThead);

            // Create table body
            const assignmentsTbody = document.createElement('tbody');

            Object.keys(clusteredPoints).sort((a, b) => Number(a) - Number(b)).forEach(clusterIdx => {
                const row = document.createElement('tr');

                // Cluster cell
                const clusterCell = document.createElement('td');
                clusterCell.textContent = `Cụm ${Number(clusterIdx) + 1}`;
                clusterCell.style.border = '1px solid #ddd';
                clusterCell.style.padding = '10px';
                clusterCell.style.textAlign = 'center';
                clusterCell.style.fontWeight = 'bold';
                row.appendChild(clusterCell);

                // Points cell
                const pointsCell = document.createElement('td');
                pointsCell.style.border = '1px solid #ddd';
                pointsCell.style.padding = '10px';

                // Format points list with commas between, but not after the last element
                pointsCell.textContent = clusteredPoints[Number(clusterIdx)]
                    .map(idx => `Điểm ${idx + 1}`)
                    .join(', ');

                row.appendChild(pointsCell);

                // Count cell
                const countCell = document.createElement('td');
                countCell.textContent = clusteredPoints[Number(clusterIdx)].length.toString();
                countCell.style.border = '1px solid #ddd';
                countCell.style.padding = '10px';
                countCell.style.textAlign = 'center';
                row.appendChild(countCell);

                assignmentsTbody.appendChild(row);
            });

            assignmentsTable.appendChild(assignmentsTbody);
            clusterAssignmentsDiv.appendChild(assignmentsTable);
            content.appendChild(clusterAssignmentsDiv);

            // 3.3. Calculate new centroids (if not the last iteration)
            if (idx < result.chitietlap.length - 1) {
                const newCentroidsDiv = document.createElement('div');
                newCentroidsDiv.innerHTML = '<h4>Tính toán tâm cụm mới:</h4>';

                const centroidUpdateTable = document.createElement('table');
                centroidUpdateTable.className = 'centroid-update-table';
                centroidUpdateTable.style.width = '100%';
                centroidUpdateTable.style.borderCollapse = 'collapse';
                centroidUpdateTable.style.margin = '15px 0';
                centroidUpdateTable.style.border = '1px solid #ddd';

                // Create header
                const updateThead = document.createElement('thead');
                const updateHeaderRow = document.createElement('tr');

                ['Cụm', 'Các điểm trong cụm', 'Phép tính tâm cụm mới', 'Tâm cụm mới', 'Thay đổi?'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    th.style.border = '1px solid #ddd';
                    th.style.padding = '10px';
                    th.style.backgroundColor = '#f2f2f2';
                    updateHeaderRow.appendChild(th);
                });

                updateThead.appendChild(updateHeaderRow);
                centroidUpdateTable.appendChild(updateThead);

                // Create table body
                const updateTbody = document.createElement('tbody');

                // Group points by cluster for calculating new centroids
                const clusterGroups: { [key: number]: number[][] } = {};
                originalData.forEach((point, i) => {
                    const clusterIdx = iteration.phancum[i];
                    if (!clusterGroups[clusterIdx]) {
                        clusterGroups[clusterIdx] = [];
                    }
                    clusterGroups[clusterIdx].push(point);
                });

                Object.keys(clusterGroups).sort((a, b) => Number(a) - Number(b)).forEach(clusterIdx => {
                    const clusterIndex = Number(clusterIdx);
                    const row = document.createElement('tr');

                    // Cluster cell
                    const clusterCell = document.createElement('td');
                    clusterCell.textContent = `Cụm ${clusterIndex + 1}`;
                    clusterCell.style.border = '1px solid #ddd';
                    clusterCell.style.padding = '10px';
                    clusterCell.style.verticalAlign = 'top';
                    clusterCell.style.fontWeight = 'bold';
                    row.appendChild(clusterCell);

                    // Points in cluster cell
                    const pointsCell = document.createElement('td');
                    pointsCell.style.border = '1px solid #ddd';
                    pointsCell.style.padding = '10px';
                    pointsCell.style.verticalAlign = 'top';

                    const pointsList = document.createElement('div');
                    const pointsInCluster = clusterGroups[clusterIndex];

                    if (pointsInCluster.length === 0) {
                        pointsList.textContent = 'Cụm rỗng';
                    } else {
                        pointsInCluster.forEach((point, pointIdx) => {
                            // Find original index of this point
                            const originalPointIdx = originalData.findIndex(p =>
                                p.every((val, i) => val === point[i])
                            );

                            const pointInfo = document.createElement('div');
                            pointInfo.style.marginBottom = '5px';
                            pointInfo.textContent = `Điểm ${originalPointIdx + 1}: (${point.join(', ')})`;
                            pointsList.appendChild(pointInfo);
                        });
                    }

                    pointsCell.appendChild(pointsList);
                    row.appendChild(pointsCell);

                    // Calculation cell
                    const calculationCell = document.createElement('td');
                    calculationCell.style.border = '1px solid #ddd';
                    calculationCell.style.padding = '10px';
                    calculationCell.style.verticalAlign = 'top';

                    const calculationDetails = document.createElement('div');
                    const pointsForCalculation = clusterGroups[clusterIndex];

                    if (pointsForCalculation.length === 0) {
                        calculationDetails.innerHTML = '<em>Giữ nguyên tâm cụm cũ (cụm rỗng)</em>';
                    } else {
                        // Calculate new centroid with details
                        const dimensions = pointsForCalculation[0].length;

                        for (let dim = 0; dim < dimensions; dim++) {
                            const dimensionCalc = document.createElement('div');
                            dimensionCalc.style.marginBottom = '8px';

                            let formula = `<strong>Tọa độ ${dim + 1}</strong> = (`;
                            let sum = 0;

                            pointsForCalculation.forEach((point, i) => {
                                sum += point[dim];
                                formula += point[dim];
                                if (i < pointsForCalculation.length - 1) formula += ' + ';
                            });

                            const average = sum / pointsForCalculation.length;
                            formula += `) / ${pointsForCalculation.length} = ${sum} / ${pointsForCalculation.length} = ${average.toFixed(4)}`;

                            dimensionCalc.innerHTML = formula;
                            calculationDetails.appendChild(dimensionCalc);
                        }
                    }

                    calculationCell.appendChild(calculationDetails);
                    row.appendChild(calculationCell);

                    // New centroid cell
                    const newCentroidCell = document.createElement('td');
                    newCentroidCell.style.border = '1px solid #ddd';
                    newCentroidCell.style.padding = '10px';
                    newCentroidCell.style.verticalAlign = 'top';

                    // Get the next iteration's centroid for this cluster
                    const nextCentroid = result.chitietlap[idx + 1].tamcum[clusterIndex];
                    newCentroidCell.textContent = `(${nextCentroid.map(v => v.toFixed(4)).join(', ')})`;

                    row.appendChild(newCentroidCell);

                    // Changed column - check if the centroid changed significantly
                    const changedCell = document.createElement('td');
                    changedCell.style.border = '1px solid #ddd';
                    changedCell.style.padding = '10px';
                    changedCell.style.verticalAlign = 'top';
                    changedCell.style.textAlign = 'center';

                    const currentCentroid = iteration.tamcum[clusterIndex];
                    const nextIterationCentroid = result.chitietlap[idx + 1].tamcum[clusterIndex];

                    // Calculate Euclidean distance between old and new centroid
                    let sumOfSquares = 0;
                    for (let dim = 0; dim < currentCentroid.length; dim++) {
                        const diff = currentCentroid[dim] - nextIterationCentroid[dim];
                        sumOfSquares += diff * diff;
                    }
                    const distance = Math.sqrt(sumOfSquares);

                    // Threshold for considering a centroid changed (using the same as in KMeans class)
                    const threshold = 0.0001;
                    const changed = distance > threshold;

                    changedCell.innerHTML = changed ?
                        `<span style="color: red; font-weight: bold;">Có (khoảng cách = ${distance.toFixed(6)})</span>` :
                        `<span style="color: green; font-weight: bold;">Không (khoảng cách = ${distance.toFixed(6)})</span>`;

                    row.appendChild(changedCell);
                    updateTbody.appendChild(row);
                });

                centroidUpdateTable.appendChild(updateTbody);
                newCentroidsDiv.appendChild(centroidUpdateTable);
                content.appendChild(newCentroidsDiv);
            }

            // 3.4. Visualization for this iteration
            const visualizationDiv = document.createElement('div');
            visualizationDiv.innerHTML = '<h4>Biểu đồ phân cụm:</h4>';
            visualizationDiv.style.marginTop = '20px';

            // Create canvas for visualization
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 400;
            canvas.style.backgroundColor = '#ffffff';
            canvas.style.border = '1px solid #ddd';
            canvas.style.borderRadius = '5px';
            canvas.style.marginTop = '10px';

            visualizationDiv.appendChild(canvas);

            // Function to draw visualization (will be called after appending to DOM)
            const drawVisualization = () => {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Only visualize 2D data properly
                if (originalData[0].length < 2) {
                    ctx.font = '14px Arial';
                    ctx.fillText('Cần ít nhất 2 chiều dữ liệu để hiển thị', 50, 50);
                    return;
                }

                // Define dimensions to use (first two dimensions)
                const xDimIndex = 0;
                const yDimIndex = 1;

                // Find min and max values for both dimensions
                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;

                originalData.forEach(point => {
                    minX = Math.min(minX, point[xDimIndex]);
                    maxX = Math.max(maxX, point[xDimIndex]);
                    minY = Math.min(minY, point[yDimIndex]);
                    maxY = Math.max(maxY, point[yDimIndex]);
                });

                // Consider placeholder points when calculating bounds
                if (placeholders && placeholders.length > 0) {
                    placeholders.forEach(point => {
                        if (point.length > xDimIndex && point.length > yDimIndex) {
                            minX = Math.min(minX, point[xDimIndex]);
                            maxX = Math.max(maxX, point[xDimIndex]);
                            minY = Math.min(minY, point[yDimIndex]);
                            maxY = Math.max(maxY, point[yDimIndex]);
                        }
                    });
                }

                // Add padding
                const xPadding = (maxX - minX) * 0.1;
                const yPadding = (maxY - minY) * 0.1;
                minX -= xPadding;
                maxX += xPadding;
                minY -= yPadding;
                maxY += yPadding;

                // Define colors for clusters
                const colors = [
                    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
                ];

                // Function to convert data coordinates to canvas coordinates
                const xToCanvas = (x: number) => ((x - minX) / (maxX - minX)) * canvas.width * 0.8 + canvas.width * 0.05;
                const yToCanvas = (y: number) => canvas.height - (((y - minY) / (maxY - minY)) * canvas.height * 0.8 + canvas.height * 0.05);

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw axes
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                ctx.beginPath();

                // X-axis
                ctx.moveTo(xToCanvas(minX), yToCanvas(0));
                ctx.lineTo(xToCanvas(maxX), yToCanvas(0));

                // Y-axis
                ctx.moveTo(xToCanvas(0), yToCanvas(minY));
                ctx.lineTo(xToCanvas(0), yToCanvas(maxY));

                ctx.stroke();

                // Draw axis labels
                ctx.font = '12px Arial';
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.fillText(`Tọa độ ${xDimIndex + 1}`, canvas.width / 2, canvas.height - 5);

                ctx.save();
                ctx.translate(10, canvas.height / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = 'center';
                ctx.fillText(`Tọa độ ${yDimIndex + 1}`, 0, 0);
                ctx.restore();

                // Draw data points with their assigned clusters
                originalData.forEach((point, idx) => {
                    const clusterIdx = iteration.phancum[idx];
                    const color = colors[clusterIdx % colors.length];

                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(xToCanvas(point[xDimIndex]), yToCanvas(point[yDimIndex]), 6, 0, Math.PI * 2);
                    ctx.fill();

                    // Add point label
                    ctx.fillStyle = '#333';
                    ctx.font = '11px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${idx + 1}`, xToCanvas(point[xDimIndex]), yToCanvas(point[yDimIndex]) - 8);
                });

                // Draw centroids
                iteration.tamcum.forEach((centroid, idx) => {
                    const color = colors[idx % colors.length];

                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.fillStyle = '#fff';

                    ctx.beginPath();
                    ctx.arc(xToCanvas(centroid[xDimIndex]), yToCanvas(centroid[yDimIndex]), 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Add centroid label
                    ctx.fillStyle = '#000';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`C${idx + 1}`, xToCanvas(centroid[xDimIndex]), yToCanvas(centroid[yDimIndex]) - 12);
                });

                // Add legend - Move to top-right and avoid overlapping
                const legendX = canvas.width - 100;
                let legendY = 30;

                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillStyle = '#333';
                ctx.fillText("Chú thích:", legendX - 30, legendY - 15);

                iteration.tamcum.forEach((_, idx) => {
                    const color = colors[idx % colors.length];
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#333';
                    ctx.fillText(`Cụm ${idx + 1}`, legendX + 15, legendY + 4);

                    legendY += 20;

            // Create merged data with cluster assignments
            const mergedData: Array<{ point: Point, cluster: number }> = [];
            clusters.forEach((cluster, i) => {
                cluster.forEach(point => {
                    mergedData.push({ point, cluster: i });
                });
            };

            // Schedule drawing after append to DOM
            setTimeout(drawVisualization, 0);

            content.appendChild(visualizationDiv);

            // Toggle visibility on header click
            header.addEventListener('click', () => {
                const isVisible = content.style.display === 'block';
                content.style.display = isVisible ? 'none' : 'block';
                header.style.backgroundColor = isVisible ? '#f2f2f2' : '#e0e0e0';
            });
            accordion.appendChild(header);
            accordion.appendChild(content);
        });

        iterationsDiv.appendChild(accordion);
        resultsContainer.appendChild(iterationsDiv);

        // 4. Display final centroids and clusters
        const finalResultsDiv = document.createElement('div');
        finalResultsDiv.innerHTML = '<h3>Kết quả phân cụm cuối cùng:</h3>';

        // Final centroids table
        const finalCentroidsTable = document.createElement('table');
        finalCentroidsTable.className = 'final-centroids-table';
        finalCentroidsTable.style.width = '100%';
        finalCentroidsTable.style.borderCollapse = 'collapse';
        finalCentroidsTable.style.margin = '15px 0';
        finalCentroidsTable.style.border = '2px solid #ddd';

        // Create header
        const finalThead = document.createElement('thead');
        const finalHeaderRow = document.createElement('tr');

        // Add headers
        ['Cụm', 'Số lượng điểm', ...Array.from({ length: result.tamcum[0].length }, (_, i) => `Tọa độ ${i + 1}`)].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.border = '1px solid #ddd';
            th.style.padding = '10px';
            th.style.backgroundColor = '#f2f2f2';
            th.style.fontWeight = 'bold';
            finalHeaderRow.appendChild(th);
        });

        finalThead.appendChild(finalHeaderRow);
        finalCentroidsTable.appendChild(finalThead);

        // Create table body
        const finalTbody = document.createElement('tbody');

        result.tamcum.forEach((centroid, idx) => {
            const row = document.createElement('tr');

            // Cluster label
            const labelCell = document.createElement('td');
            labelCell.textContent = `Cụm ${idx + 1}`;
            labelCell.style.border = '1px solid #ddd';
            labelCell.style.padding = '10px';
            labelCell.style.textAlign = 'center';
            labelCell.style.fontWeight = 'bold';
            row.appendChild(labelCell);

            // Points count
            const countCell = document.createElement('td');
            countCell.textContent = result.nhomcum[idx].length.toString();
            countCell.style.border = '1px solid #ddd';
            countCell.style.padding = '10px';
            countCell.style.textAlign = 'center';
            row.appendChild(countCell);

            // Centroid coordinates
            centroid.forEach(value => {
                const valueCell = document.createElement('td');
                valueCell.textContent = value.toFixed(4);
                valueCell.style.border = '1px solid #ddd';
                valueCell.style.padding = '10px';
                valueCell.style.textAlign = 'center';
                row.appendChild(valueCell);
            });

            finalTbody.appendChild(row);
        });

        finalCentroidsTable.appendChild(finalTbody);
        finalResultsDiv.appendChild(finalCentroidsTable);
        resultsContainer.appendChild(finalResultsDiv);

        // 5. Final visualization
        const finalVisualizationDiv = document.createElement('div');
        finalVisualizationDiv.innerHTML = '<h3>Biểu đồ phân cụm cuối cùng:</h3>';

        // Create visualization container
        const visualContainer = document.createElement('div');
        visualContainer.style.display = 'flex';
        visualContainer.style.flexDirection = 'column';
        visualContainer.style.alignItems = 'center';
        visualContainer.style.marginTop = '20px';

        // Create canvas for visualization
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 600;
        finalCanvas.height = 450;
        finalCanvas.style.backgroundColor = '#ffffff';
        finalCanvas.style.border = '1px solid #ddd';
        finalCanvas.style.borderRadius = '5px';

        // Add dropdown selectors for dimensions if we have more than 2D
        const dimensionSelectors = document.createElement('div');
        dimensionSelectors.style.margin = '15px 0';
        dimensionSelectors.style.textAlign = 'center';

        if (originalData[0].length > 2) {
            dimensionSelectors.innerHTML = `
                <label for="x-axis">Trục X:</label>
                <select id="x-axis" style="margin: 0 10px;"></select>

                <label for="y-axis">Trục Y:</label>
                <select id="y-axis" style="margin: 0 10px;"></select>

                <button id="update-viz" style="margin-left: 10px; padding: 5px 10px;">Cập nhật</button>
            `;

            visualContainer.appendChild(dimensionSelectors);
        }

        visualContainer.appendChild(finalCanvas);
        finalVisualizationDiv.appendChild(visualContainer);
        resultsContainer.appendChild(finalVisualizationDiv);

        // Add results to the page
        frequentItemsetsDiv.appendChild(resultsContainer);

        // Setup dimensions dropdowns if we have them
        if (originalData[0].length > 2) {
            const xAxisSelect = document.getElementById('x-axis') as HTMLSelectElement;
            const yAxisSelect = document.getElementById('y-axis') as HTMLSelectElement;
            const updateVizBtn = document.getElementById('update-viz') as HTMLButtonElement;

            if (xAxisSelect && yAxisSelect) {
                // Populate dimension options
                for (let i = 0; i < originalData[0].length; i++) {
                    const xOption = document.createElement('option');
                    xOption.value = i.toString();
                    xOption.textContent = `Tọa độ ${i + 1}`;
                    xAxisSelect.appendChild(xOption);

                    const yOption = document.createElement('option');
                    yOption.value = i.toString();
                    yOption.textContent = `Tọa độ ${i + 1}`;
                    yAxisSelect.appendChild(yOption);
                }

                // Default selections
                xAxisSelect.value = '0';
                yAxisSelect.value = originalData[0].length > 1 ? '1' : '0';

                // Draw initial visualization
                drawFinalVisualization(0, originalData[0].length > 1 ? 1 : 0);

                // Update on button click
                updateVizBtn.addEventListener('click', () => {
                    const xDim = parseInt(xAxisSelect.value);
                    const yDim = parseInt(yAxisSelect.value);
                    drawFinalVisualization(xDim, yDim);
                });
            }
        } else {
            // Draw 2D visualization directly
            drawFinalVisualization(0, originalData[0].length > 1 ? 1 : 0);
        }

        // Function to draw final visualization
        function drawFinalVisualization(xDimIndex: number, yDimIndex: number) {
            const ctx = finalCanvas.getContext('2d');
            if (!ctx) return;

            // If we have only 1D data but trying to visualize 2D
            if (originalData[0].length < 2 && xDimIndex !== yDimIndex) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.fillText('Chỉ có 1 chiều dữ liệu, không thể vẽ đồ thị 2D', finalCanvas.width / 2, finalCanvas.height / 2);
                return;
            }

            // Find min and max values for both dimensions
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            originalData.forEach(point => {
                minX = Math.min(minX, point[xDimIndex]);
                maxX = Math.max(maxX, point[xDimIndex]);
                minY = Math.min(minY, point[yDimIndex]);
                maxY = Math.max(maxY, point[yDimIndex]);
            });

            // Consider placeholder points when calculating bounds
            if (placeholders && placeholders.length > 0) {
                placeholders.forEach(point => {
                    if (point.length > xDimIndex && point.length > yDimIndex) {
                        minX = Math.min(minX, point[xDimIndex]);
                        maxX = Math.max(maxX, point[xDimIndex]);
                        minY = Math.min(minY, point[yDimIndex]);
                        maxY = Math.max(maxY, point[yDimIndex]);
                    }
                });
            }

            // Add padding
            const xPadding = (maxX - minX) * 0.1 || 0.1;  // Handle case when all points have same value
            const yPadding = (maxY - minY) * 0.1 || 0.1;
            minX -= xPadding;
            maxX += xPadding;
            minY -= yPadding;
            maxY += yPadding;

            // Define colors for clusters
            const colors = [
                '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
            ];

            // Function to convert data coordinates to canvas coordinates
            const xToCanvas = (x: number) => ((x - minX) / (maxX - minX)) * finalCanvas.width * 0.8 + finalCanvas.width * 0.1;
            const yToCanvas = (y: number) => finalCanvas.height - (((y - minY) / (maxY - minY)) * finalCanvas.height * 0.8 + finalCanvas.height * 0.1);

            // Clear canvas
            ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);

            // Draw grid
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;

            // Vertical grid lines
            for (let x = minX; x <= maxX; x += (maxX - minX) / 10) {
                ctx.beginPath();
                ctx.moveTo(xToCanvas(x), yToCanvas(minY));
                ctx.lineTo(xToCanvas(x), yToCanvas(maxY));
                ctx.stroke();
            }

            // Horizontal grid lines
            for (let y = minY; y <= maxY; y += (maxY - minY) / 10) {
                ctx.beginPath();
                ctx.moveTo(xToCanvas(minX), yToCanvas(y));
                ctx.lineTo(xToCanvas(maxX), yToCanvas(y));
                ctx.stroke();
            }

            // Draw axes
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.beginPath();

            // X-axis
            ctx.moveTo(xToCanvas(minX), yToCanvas(0));
            ctx.lineTo(xToCanvas(maxX), yToCanvas(0));

            // Y-axis
            ctx.moveTo(xToCanvas(0), yToCanvas(minY));
            ctx.lineTo(xToCanvas(0), yToCanvas(maxY));

            ctx.stroke();

            // Draw axis labels
            ctx.font = '14px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(`Tọa độ ${xDimIndex + 1}`, finalCanvas.width / 2, finalCanvas.height - 10);

            ctx.save();
            ctx.translate(15, finalCanvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText(`Tọa độ ${yDimIndex + 1}`, 0, 0);
            ctx.restore();

            // Get final iteration assignments
            const finalAssignments = result.chitietlap[result.chitietlap.length - 1].phancum;

            // Draw data points with their assigned clusters
            originalData.forEach((point, idx) => {
                const clusterIdx = finalAssignments[idx];
                const color = colors[clusterIdx % colors.length];

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(xToCanvas(point[xDimIndex]), yToCanvas(point[yDimIndex]), 7, 0, Math.PI * 2);
                ctx.fill();

                // Add point label
                ctx.fillStyle = '#333';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${idx + 1}`, xToCanvas(point[xDimIndex]), yToCanvas(point[yDimIndex]) - 10);
            });

            // Draw final centroids
            result.tamcum.forEach((centroid, idx) => {
                const color = colors[idx % colors.length];

                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.fillStyle = '#fff';

                ctx.beginPath();
                ctx.arc(xToCanvas(centroid[xDimIndex]), yToCanvas(centroid[yDimIndex]), 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Add centroid label
                ctx.fillStyle = '#000';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`C${idx + 1}`, xToCanvas(centroid[xDimIndex]), yToCanvas(centroid[yDimIndex]) - 15);
            });

            // Add legend - move to the top-right corner to avoid overlapping points
            const legendX = finalCanvas.width - 150; // Further to the left to make room
            let legendY = 30;

            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#333';
            ctx.fillText("Chú thích:", legendX - 10, legendY - 15);

            result.tamcum.forEach((_, idx) => {
                const color = colors[idx % colors.length];

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(legendX, legendY, 7, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#333';
                ctx.fillText(`Cụm ${idx + 1} (${result.nhomcum[idx].length})`, legendX + 15, legendY + 5);

                legendY += 25;
            });
        }

        // Setup visualization container for the final result
        visualizationContainer.style.display = 'block';

        // Instead of referring to undefined functions, define them here or remove the calls
        // Since these are likely optional visualizations, we'll just check if they're defined
        if (typeof (window as any)['setupClusterVisualizationFromNumeric'] === 'function') {
            const finalAssignments = result.chitietlap[result.chitietlap.length - 1].phancum;
            (window as any)['setupClusterVisualizationFromNumeric'](originalData, finalAssignments, result.tamcum);
        }

        if (typeof (window as any)['createConvergenceAnimation'] === 'function') {
            (window as any)['createConvergenceAnimation'](originalData, result.chitietlap);
        }
    }
});
