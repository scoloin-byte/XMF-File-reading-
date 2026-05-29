// F1 25 XMF Reader - Main Application

class XMFReader {
    constructor() {
        this.files = new Map();
        this.currentFile = null;
        this.charts = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadSection = document.querySelector('.upload-section');

        // File input change
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Drag and drop
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.style.background = 'rgba(255, 30, 38, 0.2)';
        });

        uploadSection.addEventListener('dragleave', () => {
            uploadSection.style.background = 'rgba(255, 30, 38, 0.1)';
        });

        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.style.background = 'rgba(255, 30, 38, 0.1)';
            this.handleFileSelect(e.dataTransfer.files);
        });
    }

    handleFileSelect(fileList) {
        for (let file of fileList) {
            if (file.name.endsWith('.xmf') || file.name.endsWith('.xml')) {
                const reader = new FileReader();
                reader.onload = (e) => this.parseXMF(file.name, e.target.result);
                reader.readAsText(file);
            }
        }
    }

    parseXMF(fileName, xmlContent) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                alert('Error parsing XML file');
                return;
            }

            const compounds = xmlDoc.getElementsByTagName('Compound');
            const fileData = {
                fileName: fileName,
                compounds: []
            };

            for (let compound of compounds) {
                const compoundName = compound.getAttribute('name');
                const compoundData = this.parseCompound(compound, compoundName);
                fileData.compounds.push(compoundData);
            }

            this.files.set(fileName, fileData);
            this.updateFilesList();
            if (!this.currentFile) {
                this.currentFile = fileName;
                this.displayFileData(fileName);
            }
        } catch (error) {
            console.error('Error parsing XMF:', error);
            alert('Error reading file: ' + error.message);
        }
    }

    parseCompound(compoundElement, compoundName) {
        const data = {
            name: compoundName,
            tyres: []
        };

        const tyreModels = compoundElement.getElementsByTagName('TyreModel');
        for (let tyreModel of tyreModels) {
            const tyreData = this.parseTyreModel(tyreModel);
            data.tyres.push(tyreData);
        }

        const wearData = compoundElement.getElementsByTagName('Wear');
        if (wearData.length > 0) {
            data.wear = this.parseWear(wearData[0]);
        }

        return data;
    }

    parseTyreModel(tyreModel) {
        const data = {
            modelType: tyreModel.querySelector('ModelType')?.getAttribute('value') || 'Unknown',
            lateralLoads: [],
            longitudinalLoads: [],
            dynamicCamber: {}
        };

        // Parse lateral loads
        const lateralLoads = tyreModel.querySelectorAll('LateralLoad');
        for (let load of lateralLoads) {
            data.lateralLoads.push({
                load: parseFloat(load.getAttribute('Load')),
                peak: parseFloat(load.getAttribute('Peak')),
                peakMin: parseFloat(load.getAttribute('PeakMin')),
                peakMax: parseFloat(load.getAttribute('PeakMax')),
                downSlope: parseFloat(load.getAttribute('DownSlope')),
                upSlope: parseFloat(load.getAttribute('UpSlope')),
                shape: parseFloat(load.getAttribute('Shape'))
            });
        }

        // Parse longitudinal loads
        const longitudinalLoads = tyreModel.querySelectorAll('LongitudinalLoad');
        for (let load of longitudinalLoads) {
            data.longitudinalLoads.push({
                load: parseFloat(load.getAttribute('Load')),
                peak: parseFloat(load.getAttribute('Peak')),
                peakMin: parseFloat(load.getAttribute('PeakMin')),
                peakMax: parseFloat(load.getAttribute('PeakMax')),
                downSlope: parseFloat(load.getAttribute('DownSlope')),
                upSlope: parseFloat(load.getAttribute('UpSlope')),
                shape: parseFloat(load.getAttribute('Shape'))
            });
        }

        // Parse dynamic camber
        const dynamicCamber = tyreModel.querySelector('DynamicCamber');
        if (dynamicCamber) {
            data.dynamicCamber = {
                maxAngle: parseFloat(dynamicCamber.getAttribute('MaxAngle')),
                peakPoint: parseFloat(dynamicCamber.getAttribute('PeakPoint')),
                peakMultiple: parseFloat(dynamicCamber.getAttribute('PeakMultiple')),
                offPeakMultiple: parseFloat(dynamicCamber.getAttribute('OffPeakMultiple'))
            };
        }

        return data;
    }

    parseWear(wearElement) {
        const data = {
            wearRate: parseFloat(wearElement.querySelector('WearRate')?.getAttribute('value')) || 0,
            blisterRate: parseFloat(wearElement.querySelector('BlisterRate')?.getAttribute('value')) || 0,
            minBlisteringTemperature: parseFloat(wearElement.querySelector('MinBlisteringTemperature')?.getAttribute('value')) || 0,
            maxBlisteringTemperature: parseFloat(wearElement.querySelector('MaxBlisteringTemperature')?.getAttribute('value')) || 0,
            wearGrip: []
        };

        const wearGripElements = wearElement.querySelectorAll('WearGrip SplineElement');
        for (let element of wearGripElements) {
            data.wearGrip.push({
                x: parseFloat(element.getAttribute('x')),
                y: parseFloat(element.getAttribute('y'))
            });
        }

        return data;
    }

    updateFilesList() {
        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';

        this.files.forEach((fileData, fileName) => {
            const card = document.createElement('div');
            card.className = `file-card ${this.currentFile === fileName ? 'active' : ''}`;
            card.innerHTML = `
                <h3>${fileName}</h3>
                <p>${fileData.compounds.length} compound(s)</p>
                <div class="remove" onclick="app.removeFile('${fileName}')">✕ Remove</div>
            `;
            card.onclick = (e) => {
                if (!e.target.classList.contains('remove')) {
                    this.currentFile = fileName;
                    this.updateFilesList();
                    this.displayFileData(fileName);
                }
            };
            filesList.appendChild(card);
        });
    }

    removeFile(fileName) {
        this.files.delete(fileName);
        if (this.currentFile === fileName) {
            this.currentFile = this.files.keys().next().value || null;
        }
        this.updateFilesList();
        if (this.currentFile) {
            this.displayFileData(this.currentFile);
        } else {
            this.displayEmpty();
        }
    }

    displayFileData(fileName) {
        const fileData = this.files.get(fileName);
        if (!fileData || fileData.compounds.length === 0) {
            this.displayEmpty();
            return;
        }

        const content = document.getElementById('content');
        const compound = fileData.compounds[0];

        let html = `<div class="data-section"><h2 class="section-title">Compound: ${compound.name}</h2>`;

        // Display tire data
        if (compound.tyres.length > 0) {
            html += this.renderTyreData(compound.tyres[0]);
        }

        // Display wear data
        if (compound.wear) {
            html += this.renderWearData(compound.wear);
        }

        html += `</div>`;
        content.innerHTML = html;

        // Create charts
        if (compound.tyres.length > 0) {
            setTimeout(() => this.createCharts(compound.tyres[0]), 100);
        }
    }

    renderTyreData(tyreData) {
        let html = `
            <div class="data-grid">
                <div class="data-item">
                    <label>Model Type</label>
                    <value>${tyreData.modelType}</value>
                </div>
                <div class="data-item">
                    <label>Lateral Load Points</label>
                    <value>${tyreData.lateralLoads.length}</value>
                </div>
                <div class="data-item">
                    <label>Longitudinal Load Points</label>
                    <value>${tyreData.longitudinalLoads.length}</value>
                </div>
            </div>
        `;

        // Lateral loads table
        if (tyreData.lateralLoads.length > 0) {
            html += `<div class="data-section" style="margin-top: 20px;">
                <h3 class="section-title">Lateral Grip Curve</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Load (N)</th>
                                <th>Peak Grip</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Down Slope</th>
                                <th>Up Slope</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            tyreData.lateralLoads.forEach(load => {
                html += `<tr>
                    <td>${load.load.toFixed(0)}</td>
                    <td>${load.peak.toFixed(3)}</td>
                    <td>${load.peakMin.toFixed(3)}</td>
                    <td>${load.peakMax.toFixed(3)}</td>
                    <td>${load.downSlope.toFixed(3)}</td>
                    <td>${load.upSlope.toFixed(3)}</td>
                </tr>`;
            });
            html += `</tbody></table></div></div>`;
        }

        // Longitudinal loads table
        if (tyreData.longitudinalLoads.length > 0) {
            html += `<div class="data-section" style="margin-top: 20px;">
                <h3 class="section-title">Longitudinal Grip Curve</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Load (N)</th>
                                <th>Peak Grip</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Down Slope</th>
                                <th>Up Slope</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            tyreData.longitudinalLoads.forEach(load => {
                html += `<tr>
                    <td>${load.load.toFixed(0)}</td>
                    <td>${load.peak.toFixed(3)}</td>
                    <td>${load.peakMin.toFixed(3)}</td>
                    <td>${load.peakMax.toFixed(3)}</td>
                    <td>${load.downSlope.toFixed(3)}</td>
                    <td>${load.upSlope.toFixed(3)}</td>
                </tr>`;
            });
            html += `</tbody></table></div></div>`;
        }

        return html;
    }

    renderWearData(wearData) {
        return `
            <div class="data-section" style="margin-top: 20px;">
                <h3 class="section-title">Wear & Blistering</h3>
                <div class="data-grid">
                    <div class="data-item">
                        <label>Wear Rate</label>
                        <value>${wearData.wearRate.toFixed(4)}</value>
                    </div>
                    <div class="data-item">
                        <label>Blister Rate</label>
                        <value>${wearData.blisterRate.toFixed(4)}</value>
                    </div>
                    <div class="data-item">
                        <label>Min Blistering Temp</label>
                        <value>${(wearData.minBlisteringTemperature - 273.15).toFixed(0)}°C</value>
                    </div>
                    <div class="data-item">
                        <label>Max Blistering Temp</label>
                        <value>${(wearData.maxBlisteringTemperature - 273.15).toFixed(0)}°C</value>
                    </div>
                </div>
            </div>
        `;
    }

    createCharts(tyreData) {
        const content = document.getElementById('content');
        let chartsHtml = '<div class="charts-grid">';

        // Lateral grip chart
        if (tyreData.lateralLoads.length > 0) {
            chartsHtml += '<div class="chart-container"><canvas id="lateralChart"></canvas></div>';
        }

        // Longitudinal grip chart
        if (tyreData.longitudinalLoads.length > 0) {
            chartsHtml += '<div class="chart-container"><canvas id="longitudinalChart"></canvas></div>';
        }

        chartsHtml += '</div>';
        content.innerHTML += chartsHtml;

        // Create lateral chart
        if (tyreData.lateralLoads.length > 0) {
            this.createLateralChart(tyreData.lateralLoads);
        }

        // Create longitudinal chart
        if (tyreData.longitudinalLoads.length > 0) {
            this.createLongitudinalChart(tyreData.longitudinalLoads);
        }
    }

    createLateralChart(lateralLoads) {
        const ctx = document.getElementById('lateralChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.get('lateral')) {
            this.charts.get('lateral').destroy();
        }

        const loads = lateralLoads.map(l => l.load);
        const peaks = lateralLoads.map(l => l.peak);
        const mins = lateralLoads.map(l => l.peakMin);
        const maxs = lateralLoads.map(l => l.peakMax);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: loads.map(l => `${(l / 1000).toFixed(1)}k`),
                datasets: [
                    {
                        label: 'Peak Grip',
                        data: peaks,
                        borderColor: '#ff1e26',
                        backgroundColor: 'rgba(255, 30, 38, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Min',
                        data: mins,
                        borderColor: '#ffaa00',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Max',
                        data: maxs,
                        borderColor: '#00aa88',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e0e0e0' },
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Lateral Grip Characteristics',
                        color: '#ff1e26',
                        font: { size: 14 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#b0b0b0' },
                        grid: { color: 'rgba(255, 30, 38, 0.1)' },
                        title: { display: true, text: 'Load (N)', color: '#b0b0b0' }
                    },
                    y: {
                        ticks: { color: '#b0b0b0' },
                        grid: { color: 'rgba(255, 30, 38, 0.1)' },
                        title: { display: true, text: 'Grip Coefficient', color: '#b0b0b0' }
                    }
                }
            }
        });

        this.charts.set('lateral', chart);
    }

    createLongitudinalChart(longitudinalLoads) {
        const ctx = document.getElementById('longitudinalChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.get('longitudinal')) {
            this.charts.get('longitudinal').destroy();
        }

        const loads = longitudinalLoads.map(l => l.load);
        const peaks = longitudinalLoads.map(l => l.peak);
        const mins = longitudinalLoads.map(l => l.peakMin);
        const maxs = longitudinalLoads.map(l => l.peakMax);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: loads.map(l => `${(l / 1000).toFixed(1)}k`),
                datasets: [
                    {
                        label: 'Peak Grip',
                        data: peaks,
                        borderColor: '#ff1e26',
                        backgroundColor: 'rgba(255, 30, 38, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Min',
                        data: mins,
                        borderColor: '#ffaa00',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Max',
                        data: maxs,
                        borderColor: '#00aa88',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e0e0e0' },
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Longitudinal Grip Characteristics',
                        color: '#ff1e26',
                        font: { size: 14 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#b0b0b0' },
                        grid: { color: 'rgba(255, 30, 38, 0.1)' },
                        title: { display: true, text: 'Load (N)', color: '#b0b0b0' }
                    },
                    y: {
                        ticks: { color: '#b0b0b0' },
                        grid: { color: 'rgba(255, 30, 38, 0.1)' },
                        title: { display: true, text: 'Grip Coefficient', color: '#b0b0b0' }
                    }
                }
            }
        });

        this.charts.set('longitudinal', chart);
    }

    displayEmpty() {
        document.getElementById('content').innerHTML = `
            <div class="empty-state">
                <p>No files loaded yet</p>
                <p>Upload XMF files to get started</p>
            </div>
        `;
    }
}

// Initialize the application
const app = new XMFReader();