import { Apriori, IAprioriResults } from "../src/apriori";
import { KMeans, Point } from "../src/kmeans_clustering";


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
    const confidenceabc=document.getElementById('confidence-group') as HTMLDivElement;
    const kClustersInput = document.getElementById('k-clusters') as HTMLInputElement;
    const maxIterationsInput = document.getElementById('max-iterations') as HTMLInputElement;
    const useKmeansPPInput = document.getElementById('use-kmeans-pp') as HTMLInputElement;
    const visualizationContainer = document.getElementById('visualization-container') as HTMLDivElement;
    const xAxisSelect = document.getElementById('x-axis') as HTMLSelectElement;
    const yAxisSelect = document.getElementById('y-axis') as HTMLSelectElement;
    const clusterCanvas = document.getElementById('cluster-canvas') as HTMLCanvasElement;
    const inputTitle = document.getElementById('input-title') as HTMLHeadingElement;
    const inputDescription = document.getElementById('input-description') as HTMLParagraphElement;

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
        }else{
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
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv, .tsv, .txt';

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

                // Loại bỏ BOM nếu có (UTF-8 BOM)
                if (content.charCodeAt(0) === 0xFEFF) {
                    content = content.slice(1);
                }

                // Xác định dấu phân cách CSV
                const firstLine = content.split('\n')[0];
                let delimiter = detectDelimiter(firstLine);

                // Chuyển đổi CSV thành mảng các giao dịch
                const lines = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line);

                if (lines.length <= 1) {
                    alert('Invalid CSV format');
                    return;
                }

                // Lấy dòng tiêu đề
                const headers = parseCSVLine(lines[0], delimiter);
                if (headers.length < 2) {
                    alert('CSV must have at least two columns');
                    return;
                }

                // Xử lý dữ liệu, bỏ TransactionID
                const transactions = lines
                    .slice(1) // Bỏ dòng tiêu đề
                    .map(line => {
                        const columns = parseCSVLine(line, delimiter);
                        return columns.slice(1).join(','); // Bỏ cột đầu tiên
                    });

                transactionsTextarea.value = transactions.join('\n');
            };

            reader.onerror = () => alert('Error reading file.');
            reader.readAsText(file);
        });

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
        useKmeansPPInput.checked = true;

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
        }else{
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

        const frequentItemsets: Array<{items: string[], support: number}> = [];

        const apriori = new Apriori<string>(support);
        apriori.on('data', (itemset) => {
            frequentItemsets.push(itemset);
        });

        apriori.exec(transactions)
            .then((result: IAprioriResults<string>) => {
                executionStatsDiv.textContent = `Finished executing Apriori. ${result.itemsets.length} frequent itemsets were found in ${result.executionTime}ms.`;

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
                    // Thêm style cho cell
                    itemCell.style.border = '1px solid #ddd';
                    itemCell.style.padding = '10px';
                    itemCell.style.textAlign = 'center';
                    row.appendChild(itemCell);

                    // Cột Support Count
                    const supportCountCell = document.createElement('td');
                    supportCountCell.textContent = itemset.support.toString();
                    // Thêm style cho cell
                    supportCountCell.style.border = '1px solid #ddd';
                    supportCountCell.style.padding = '10px';
                    supportCountCell.style.textAlign = 'center';
                    row.appendChild(supportCountCell);

                    // Cột Support %
                    const supportPercentCell = document.createElement('td');
                    const supportPercent = (itemset.support / transactions.length * 100).toFixed(2);
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
    }

    function executeKMeans(dataText: string) {
        try {
            // Parse parameters
            const k = parseInt(kClustersInput.value);
            const maxIterations = parseInt(maxIterationsInput.value);
            const useKMeansPP = useKmeansPPInput.checked;

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

            // Initialize and run K-means
            const kmeans = new KMeans(k, maxIterations);

            // Normalize data (recommended for K-means)
            const normalizedData = KMeans.normalizeData(dataPoints);

            // Fit the model
            kmeans.fit(normalizedData, useKMeansPP);

            // Get results
            const clusters = kmeans.getClusters();
            const centroids = kmeans.getCentroids();
            const wcss = kmeans.calculateWCSS();

            // Record end time
            const endTime = performance.now();
            const executionTime = endTime - startTime;

            // Display results
            displayKMeansResults(clusters, centroids, wcss, executionTime);

            // Setup visualization
            setupClusterVisualization(dataPoints, clusters, centroids);

        } catch (error: any) {
            console.error('Error executing K-means:', error);
            executionStatsDiv.textContent = `Error: ${error.message}`;
        }
    }
    
    function executeFpGrowth(transactionsText: string) {
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
    
        // Chuyển đổi dữ liệu giao dịch
        const transactions = transactionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => line.split(',').map(item => item.trim()));
    
        const minSupportCount = Math.ceil(support * transactions.length);
    
        // Gọi hàm fpgrowth để chạy thuật toán FP-Growth
        const { fpgrowth } = require('../src/fpGrowth'); // Import FP-Growth implementation
        const frequentItemsets = fpgrowth(transactions, minSupportCount);
    
        // Hiển thị kết quả
        executionStatsDiv.textContent = `Finished executing FP-Growth. ${frequentItemsets.length} frequent itemsets were found.`;
    
        // Hiển thị các tập mục phổ biến
        const tableDiv = document.createElement('div');
        tableDiv.className = 'support-table';
        tableDiv.innerHTML = '<h3>Frequent Itemsets:</h3>';
    
        const table = document.createElement('table');
        table.className = 'itemset-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.margin = '20px 0';
        table.style.border = '2px solid #ddd';
    
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Itemset'].forEach(headerText => {
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
    
        const tbody = document.createElement('tbody');
        frequentItemsets.forEach((itemset: { items: string[]; support: number }) => {
            const row = document.createElement('tr');
    
            const itemCell = document.createElement('td');
            itemCell.textContent = `{${itemset.items.join(', ')}}`;
            itemCell.style.border = '1px solid #ddd';
            itemCell.style.padding = '10px';
            itemCell.style.textAlign = 'center';
            row.appendChild(itemCell);
    
            // const supportCountCell = document.createElement('td');
            // supportCountCell.textContent = itemset.support.toString();
            // supportCountCell.style.border = '1px solid #ddd';
            // supportCountCell.style.padding = '10px';
            // supportCountCell.style.textAlign = 'center';
            // row.appendChild(supportCountCell);
    
            // const supportPercentCell = document.createElement('td');
            // const supportPercent = ((itemset.support / transactions.length) * 100).toFixed(2);
            // supportPercentCell.textContent = `${supportPercent}%`;
            // supportPercentCell.style.border = '1px solid #ddd';
            // supportPercentCell.style.padding = '10px';
            // supportPercentCell.style.textAlign = 'center';
            // row.appendChild(supportPercentCell);
    
            tbody.appendChild(row);
        });
    
        table.appendChild(tbody);
        tableDiv.appendChild(table);
        frequentItemsetsDiv.appendChild(tableDiv);
    
        // Hiển thị luật kết hợp
        const rulesDiv = document.createElement('div');
        rulesDiv.innerHTML = '<h3>Association Rules:</h3>';
    
        frequentItemsets.forEach((itemset: { items: string[]; support: number }) => {
            if (itemset.items.length > 1) {
                for (let i = 0; i < itemset.items.length; i++) {
                    const consequent = [itemset.items[i]];
                    // const antecedent = itemset.items.filter((_, idx) => idx !== i);
    
                    // const antecedentItemset = frequentItemsets.find((is: { items: string[]; support: number }) =>
                    //     is.items.length === antecedent.length &&
                    //     antecedent.every(item => is.items.includes(item))
                    // );
    
                    // if (antecedentItemset) {
                    //     // const confidence = itemset.support / antecedentItemset.support;
    
                    //     if (confidence >= minConfidence) {
                    //         const ruleDiv = document.createElement('div');
                    //         ruleDiv.className = 'rule';
                    //         ruleDiv.innerHTML = `{ antecedent: ['${antecedent.join("', '")}'], consequent: ['${consequent.join("', '")}'], confidence: ${confidence.toFixed(2)} }`;
                    //         rulesDiv.appendChild(document.createElement('br'));
                    //         rulesDiv.appendChild(ruleDiv);
                    //         rulesDiv.appendChild(document.createElement('br'));
                    //     }
                    // }
                }
            }
        });
    
        frequentItemsetsDiv.appendChild(rulesDiv);
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

                        // Create a point from this data row
                        const point: Point = {};
                        values.forEach((val, i) => {
                            const numVal = parseFloat(val);
                            if (!isNaN(numVal)) {
                                point[headers[i]] = numVal;
                            }
                        });

                        if (Object.keys(point).length > 0) {
                            dataPoints.push(point);
                        }
                    }
                    headerCreated = true;
                    break;
                }
            } else {
                // Process data rows
                const point: Point = {};
                values.forEach((val, i) => {
                    if (i < headers.length) {
                        const numVal = parseFloat(val);
                        if (!isNaN(numVal)) {
                            point[headers[i]] = numVal;
                        }
                    }
                });

                if (Object.keys(point).length > 0) {
                    dataPoints.push(point);
                }
            }
        });

        return dataPoints;
    }

    function displayKMeansResults(clusters: Point[][], centroids: Point[], wcss: number, executionTime: number) {
        // Display execution stats
        executionStatsDiv.textContent = `Finished executing K-means with ${clusters.length} clusters in ${executionTime.toFixed(2)}ms. WCSS: ${wcss.toFixed(4)}`;

        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'kmeans-results';

        // Display centroids
        const centroidsDiv = document.createElement('div');
        centroidsDiv.innerHTML = '<h3>Cluster Centroids:</h3>';

        const centroidsTable = document.createElement('table');
        centroidsTable.className = 'itemset-table';
        centroidsTable.style.width = '100%';
        centroidsTable.style.borderCollapse = 'collapse';
        centroidsTable.style.margin = '20px 0';
        centroidsTable.style.border = '2px solid #ddd';

        // Create table header with dimension names
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Add cluster column header
        const clusterHeader = document.createElement('th');
        clusterHeader.textContent = 'Cluster';
        clusterHeader.style.border = '1px solid #ddd';
        clusterHeader.style.padding = '10px';
        clusterHeader.style.backgroundColor = '#f2f2f2';
        clusterHeader.style.fontWeight = 'bold';
        headerRow.appendChild(clusterHeader);

        // Add size column header
        const sizeHeader = document.createElement('th');
        sizeHeader.textContent = 'Size';
        sizeHeader.style.border = '1px solid #ddd';
        sizeHeader.style.padding = '10px';
        sizeHeader.style.backgroundColor = '#f2f2f2';
        sizeHeader.style.fontWeight = 'bold';
        headerRow.appendChild(sizeHeader);

        // Add dimension headers
        if (centroids.length > 0) {
            const dimensions = Object.keys(centroids[0]);
            dimensions.forEach(dim => {
                const th = document.createElement('th');
                th.textContent = dim;
                th.style.border = '1px solid #ddd';
                th.style.padding = '10px';
                th.style.backgroundColor = '#f2f2f2';
                th.style.fontWeight = 'bold';
                headerRow.appendChild(th);
            });
        }

        thead.appendChild(headerRow);
        centroidsTable.appendChild(thead);

        // Create table body with centroid values
        const tbody = document.createElement('tbody');

        centroids.forEach((centroid, i) => {
            const row = document.createElement('tr');

            // Cluster label cell
            const clusterCell = document.createElement('td');
            clusterCell.textContent = `Cluster ${i+1}`;
            clusterCell.style.border = '1px solid #ddd';
            clusterCell.style.padding = '10px';
            clusterCell.style.textAlign = 'center';
            row.appendChild(clusterCell);

            // Cluster size cell
            const sizeCell = document.createElement('td');
            sizeCell.textContent = clusters[i].length.toString();
            sizeCell.style.border = '1px solid #ddd';
            sizeCell.style.padding = '10px';
            sizeCell.style.textAlign = 'center';
            row.appendChild(sizeCell);

            // Centroid dimension values
            Object.values(centroid).forEach(value => {
                const valueCell = document.createElement('td');
                valueCell.textContent = value.toFixed(4);
                valueCell.style.border = '1px solid #ddd';
                valueCell.style.padding = '10px';
                valueCell.style.textAlign = 'center';
                row.appendChild(valueCell);
            });

            tbody.appendChild(row);
        });

        centroidsTable.appendChild(tbody);
        centroidsDiv.appendChild(centroidsTable);
        resultsContainer.appendChild(centroidsDiv);

        // Display cluster statistics
        const statsDiv = document.createElement('div');
        statsDiv.innerHTML = '<h3>Clustering Statistics:</h3>';

        const statsList = document.createElement('ul');
        statsList.style.listStyleType = 'none';
        statsList.style.padding = '10px';
        statsList.style.backgroundColor = '#f8f8f8';
        statsList.style.border = '1px solid #ddd';
        statsList.style.borderRadius = '5px';

        // Add WCSS (Within-Cluster Sum of Squares)
        const wcssItem = document.createElement('li');
        wcssItem.innerHTML = `<strong>Within-Cluster Sum of Squares (WCSS):</strong> ${wcss.toFixed(4)}`;
        wcssItem.style.margin = '10px 0';
        statsList.appendChild(wcssItem);

        // Add average distance to centroid for each cluster
        clusters.forEach((cluster, i) => {
            if (cluster.length > 0) {
                let totalDistance = 0;
                cluster.forEach(point => {
                    // Calculate Euclidean distance to centroid
                    let sum = 0;
                    for (const key in point) {
                        if (centroids[i].hasOwnProperty(key)) {
                            sum += Math.pow(point[key] - centroids[i][key], 2);
                        }
                    }
                    totalDistance += Math.sqrt(sum);
                });

                const avgDistance = totalDistance / cluster.length;
                const avgDistItem = document.createElement('li');
                avgDistItem.innerHTML = `<strong>Cluster ${i+1} Average Distance:</strong> ${avgDistance.toFixed(4)}`;
                avgDistItem.style.margin = '10px 0';
                statsList.appendChild(avgDistItem);
            }
        });

        statsDiv.appendChild(statsList);
        resultsContainer.appendChild(statsDiv);

        // Add results to the page
        frequentItemsetsDiv.appendChild(resultsContainer);

        // Show visualization container
        visualizationContainer.style.display = 'block';
    }

    function setupClusterVisualization(data: Point[], clusters: Point[][], centroids: Point[]) {
        if (data.length === 0 || clusters.length === 0) return;

        // Get all dimension names from the first data point
        const dimensions = Object.keys(data[0]);

        // We need at least 2 dimensions to visualize
        if (dimensions.length < 2) {
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Need at least 2 dimensions to visualize clusters.';
            errorMsg.style.color = 'red';
            visualizationContainer.appendChild(errorMsg);
            return;
        }

        // Clear previous options
        xAxisSelect.innerHTML = '';
        yAxisSelect.innerHTML = '';

        // Populate dimension selects
        dimensions.forEach((dim, i) => {
            const xOption = document.createElement('option');
            xOption.value = dim;
            xOption.textContent = dim;
            xAxisSelect.appendChild(xOption);

            const yOption = document.createElement('option');
            yOption.value = dim;
            yOption.textContent = dim;

            // Select different defaults for x and y if possible
            if (i === 0) {
                xOption.selected = true;
            } else if (i === 1) {
                yOption.selected = true;
            }

            yAxisSelect.appendChild(yOption);
        });

        // Function to draw the visualization
        const drawVisualization = () => {
            const xDim = xAxisSelect.value;
            const yDim = yAxisSelect.value;

            if (!xDim || !yDim) return;

            // Create merged data with cluster assignments
            const mergedData: Array<{point: Point, cluster: number}> = [];
            clusters.forEach((cluster, i) => {
                cluster.forEach(point => {
                    mergedData.push({ point, cluster: i });
                });
            });

            drawClusterScatterplot(mergedData, centroids, xDim, yDim);
        };

        // Add event listeners to axis selects
        xAxisSelect.addEventListener('change', drawVisualization);
        yAxisSelect.addEventListener('change', drawVisualization);

        // Initial draw
        drawVisualization();
    }

    function drawClusterScatterplot(
        data: Array<{point: Point, cluster: number}>, 
        centroids: Point[], 
        xDim: string, 
        yDim: string
    ) {
        const canvas = clusterCanvas;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Define cluster colors (make sure we have enough colors)
        const clusterColors = [
            '#FF5733', '#33FF57', '#3357FF', '#FFFF33', '#FF33FF',
            '#33FFFF', '#FF9933', '#9933FF', '#33FF99', '#FF99FF',
            '#99FFFF', '#FFCC33', '#CC33FF', '#33FFCC', '#FFCCFF'
        ];

        // Find min and max for scaling
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        data.forEach(item => {
            if (item.point[xDim] < minX) minX = item.point[xDim];
            if (item.point[xDim] > maxX) maxX = item.point[xDim];
            if (item.point[yDim] < minY) minY = item.point[yDim];
            if (item.point[yDim] > maxY) maxY = item.point[yDim];
        });

        centroids.forEach(centroid => {
            if (centroid[xDim] < minX) minX = centroid[xDim];
            if (centroid[xDim] > maxX) maxX = centroid[xDim];
            if (centroid[yDim] < minY) minY = centroid[yDim];
            if (centroid[yDim] > maxY) maxY = centroid[yDim];
        });

        // Add a small margin
        const xMargin = (maxX - minX) * 0.1;
        const yMargin = (maxY - minY) * 0.1;

        minX -= xMargin;
        maxX += xMargin;
        minY -= yMargin;
        maxY += yMargin;

        // Define margins for axes and labels
        const margin = {
            left: 50,
            right: 20,
            top: 20,
            bottom: 50
        };

        // Calculate plotting area dimensions
        const plotWidth = canvas.width - margin.left - margin.right;
        const plotHeight = canvas.height - margin.top - margin.bottom;

        // Scaling functions
        const xScale = (x: number) => margin.left + (x - minX) * plotWidth / (maxX - minX);
        const yScale = (y: number) => canvas.height - margin.bottom - (y - minY) * plotHeight / (maxY - minY);

        // Draw axes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, canvas.height - margin.bottom);
        ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, canvas.height - margin.bottom);
        ctx.stroke();

        // Draw axis labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        // X-axis label
        ctx.fillText(xDim, canvas.width / 2, canvas.height - 10);

        // Y-axis label (rotated)
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(yDim, 0, 0);
        ctx.restore();

        // Draw data points
        data.forEach(item => {
            const x = xScale(item.point[xDim]);
            const y = yScale(item.point[yDim]);
            const colorIndex = item.cluster % clusterColors.length;

            ctx.fillStyle = clusterColors[colorIndex];
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw centroids (larger, with X marks)
        centroids.forEach((centroid, i) => {
            const x = xScale(centroid[xDim]);
            const y = yScale(centroid[yDim]);
            const colorIndex = i % clusterColors.length;

            // Draw X mark
            ctx.strokeStyle = clusterColors[colorIndex];
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x - 8, y - 8);
            ctx.lineTo(x + 8, y + 8);
            ctx.moveTo(x + 8, y - 8);
            ctx.lineTo(x - 8, y + 8);
            ctx.stroke();

            // Draw circle around the X
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.stroke();

            // Add cluster label
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`C${i+1}`, x + 12, y + 5);
        });

        // Draw legend
        const legendX = canvas.width - margin.right - 100;
        const legendY = margin.top + 20;
        const legendSpacing = 25;

        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        for (let i = 0; i < centroids.length; i++) {
            const y = legendY + i * legendSpacing;
            const colorIndex = i % clusterColors.length;

            // Draw color marker
            ctx.fillStyle = clusterColors[colorIndex];
            ctx.beginPath();
            ctx.arc(legendX, y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw label
            ctx.fillStyle = '#000';
            ctx.fillText(`Cluster ${i+1}`, legendX + 15, y + 4);
        }
    }
});
