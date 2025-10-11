// ==================== Configuration ====================
const API_BASE_URL = 'http://localhost:8000';
let currentImage = null;
let websocket = null;
let threatChart = null;
let quantumStateChart = null;

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    connectWebSocket();
    loadInitialData();
});

function initializeApp() {
    console.log('🛡️ Bharat Raksha - Initializing...');
    initializeCharts();
    showNotification('System initialized successfully', 'success');
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-blue)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        }
    });
}

// ==================== File Handling ====================
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        displayImage(file);
    }
}

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = file;
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImage');
        img.src = e.target.result;
        preview.style.display = 'block';
        showNotification('Image loaded successfully', 'success');
    };
    reader.readAsDataURL(file);
}

// ==================== API Calls ====================
async function detectObjects() {
    if (!currentImage) {
        showNotification('Please upload an image first', 'warning');
        return;
    }
    
    showLoading(true);
    
    const formData = new FormData();
    formData.append('file', currentImage);
    
    try {
        const response = await fetch(`${API_BASE_URL}/detect`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Detection failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        displayDetectionResult(result);
        showNotification(`Detected: ${result.object_type} (${(result.confidence * 100).toFixed(1)}%)`, 'success');
        
        // Refresh stats and blockchain
        await loadStatistics();
        await loadBlockchain();
        await loadQuantumMetrics();
        
    } catch (error) {
        console.error('Detection error:', error);
        showNotification(`Detection failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function processEOIR() {
    if (!currentImage) {
        showNotification('Please upload an image first', 'warning');
        return;
    }
    
    showLoading(true);
    
    const formData = new FormData();
    formData.append('file', currentImage);
    
    try {
        const response = await fetch(`${API_BASE_URL}/process/enhance`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Processing failed: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const img = document.getElementById('previewImage');
        img.src = url;
        
        showNotification('EO/IR enhancement applied', 'success');
        
    } catch (error) {
        console.error('EO/IR processing error:', error);
        showNotification(`Processing failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function processThermal() {
    if (!currentImage) {
        showNotification('Please upload an image first', 'warning');
        return;
    }
    
    showLoading(true);
    
    const formData = new FormData();
    formData.append('file', currentImage);
    
    try {
        const response = await fetch(`${API_BASE_URL}/process/thermal`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Thermal processing failed: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const img = document.getElementById('previewImage');
        img.src = url;
        
        showNotification('Thermal view applied', 'success');
        
    } catch (error) {
        console.error('Thermal processing error:', error);
        showNotification(`Processing failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) return;
        
        const stats = await response.json();
        
        // Update stat cards
        document.getElementById('totalDetections').textContent = stats.total_detections;
        
        const criticalCount = (stats.threat_distribution.high || 0) + (stats.threat_distribution.critical || 0);
        document.getElementById('criticalThreats').textContent = criticalCount;
        
        // Update blockchain blocks count
        const blockchainResponse = await fetch(`${API_BASE_URL}/blockchain/chain`);
        if (blockchainResponse.ok) {
            const blockchain = await blockchainResponse.json();
            document.getElementById('blockchainBlocks').textContent = blockchain.length;
        }
        
        // Update threat chart
        updateThreatChart(stats.threat_distribution);
        
        // Update threat legend counts
        document.getElementById('lowCount').textContent = stats.threat_distribution.low || 0;
        document.getElementById('mediumCount').textContent = stats.threat_distribution.medium || 0;
        document.getElementById('highCount').textContent = stats.threat_distribution.high || 0;
        document.getElementById('criticalCount').textContent = stats.threat_distribution.critical || 0;
        
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

async function loadDetectionHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/detections/history?limit=20`);
        if (!response.ok) return;
        
        const data = await response.json();
        const feed = document.getElementById('detectionFeed');
        
        if (data.detections.length === 0) {
            feed.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-radar"></i>
                    <p>No detections yet. Upload an image to start surveillance.</p>
                </div>
            `;
            return;
        }
        
        feed.innerHTML = '';
        data.detections.reverse().forEach(detection => {
            const item = createDetectionItem(detection);
            feed.appendChild(item);
        });
        
    } catch (error) {
        console.error('Failed to load detection history:', error);
    }
}

async function loadBlockchain() {
    try {
        const response = await fetch(`${API_BASE_URL}/blockchain/latest?count=10`);
        if (!response.ok) return;
        
        const data = await response.json();
        const feed = document.getElementById('blockchainFeed');
        
        if (data.blocks.length === 0) {
            feed.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-cubes"></i>
                    <p>Loading blockchain...</p>
                </div>
            `;
            return;
        }
        
        feed.innerHTML = '';
        data.blocks.reverse().forEach(block => {
            const item = createBlockItem(block);
            feed.appendChild(item);
        });
        
    } catch (error) {
        console.error('Failed to load blockchain:', error);
    }
}

async function verifyBlockchain() {
    try {
        const response = await fetch(`${API_BASE_URL}/blockchain/verify`);
        if (!response.ok) throw new Error('Verification failed');
        
        const result = await response.json();
        
        if (result.is_valid) {
            showNotification('✓ Blockchain integrity verified', 'success');
        } else {
            showNotification('⚠ Blockchain integrity compromised!', 'error');
        }
        
    } catch (error) {
        showNotification(`Verification error: ${error.message}`, 'error');
    }
}

async function loadQuantumMetrics() {
    try {
        const response = await fetch(`${API_BASE_URL}/quantum/metrics`);
        if (!response.ok) return;
        
        const metrics = await response.json();
        
        // Update progress bars
        const entanglementPercent = (metrics.entanglement_score * 100).toFixed(1);
        document.getElementById('entanglementBar').style.width = entanglementPercent + '%';
        document.getElementById('entanglementValue').textContent = metrics.entanglement_score.toFixed(3);
        
        const superpositionPercent = (metrics.superposition_probability * 100).toFixed(1);
        document.getElementById('superpositionBar').style.width = superpositionPercent + '%';
        document.getElementById('superpositionValue').textContent = metrics.superposition_probability.toFixed(3);
        
        document.getElementById('boostDisplay').textContent = metrics.inference_boost.toFixed(2) + 'x';
        document.getElementById('quantumBoost').textContent = ((metrics.inference_boost - 1) * 100).toFixed(1) + '%';
        
        // Update quantum state chart
        updateQuantumStateChart(metrics.quantum_state);
        
    } catch (error) {
        console.error('Failed to load quantum metrics:', error);
    }
}

async function loadInitialData() {
    await loadStatistics();
    await loadDetectionHistory();
    await loadBlockchain();
    await loadQuantumMetrics();
}

// ==================== Display Functions ====================
function displayDetectionResult(result) {
    const feed = document.getElementById('detectionFeed');
    
    // Remove no-data message if present
    const noData = feed.querySelector('.no-data');
    if (noData) {
        noData.remove();
    }
    
    const item = createDetectionItem(result);
    feed.insertBefore(item, feed.firstChild);
    
    // Limit to 20 items
    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

function createDetectionItem(detection) {
    const item = document.createElement('div');
    item.className = `detection-item threat-${detection.threat_level}`;
    
    const timestamp = new Date(detection.timestamp).toLocaleString();
    const confidence = (detection.confidence * 100).toFixed(1);
    const quantumConfidence = (detection.quantum_confidence * 100).toFixed(1);
    
    item.innerHTML = `
        <div class="detection-header">
            <div class="detection-title">
                <i class="fas fa-crosshairs"></i> ${detection.object_type.toUpperCase()}
            </div>
            <div class="detection-time">${timestamp}</div>
        </div>
        <div class="detection-details">
            <div class="detail-item">
                <span class="detail-label">Confidence</span>
                <span class="detail-value">${confidence}%</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Quantum Enhanced</span>
                <span class="detail-value">${quantumConfidence}%</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Threat Level</span>
                <span class="detail-value">${detection.threat_level.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">X:${(detection.location.x * 100).toFixed(0)}% Y:${(detection.location.y * 100).toFixed(0)}%</span>
            </div>
        </div>
        <div style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
            ${detection.description}
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--accent-green); font-family: monospace;">
            Hash: ${detection.blockchain_hash.substring(0, 32)}...
        </div>
    `;
    
    return item;
}

function createBlockItem(block) {
    const item = document.createElement('div');
    item.className = 'block-item';
    
    const timestamp = new Date(block.timestamp).toLocaleString();
    const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
    
    item.innerHTML = `
        <div class="block-header">
            <div>Block #${block.index}</div>
            <div>${timestamp}</div>
        </div>
        <div style="color: var(--text-secondary); font-size: 0.9rem;">
            Transactions: ${txCount}
        </div>
        <div class="block-hash">
            <strong>Hash:</strong> ${block.hash}
        </div>
        <div class="block-hash" style="color: var(--accent-orange);">
            <strong>Merkle Root:</strong> ${block.merkle_root}
        </div>
    `;
    
    return item;
}

// ==================== Charts ====================
function initializeCharts() {
    // Threat Distribution Chart
    const threatCtx = document.getElementById('threatChart');
    if (threatCtx) {
        threatChart = new Chart(threatCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Medium', 'High', 'Critical'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(244, 67, 54, 0.8)',
                        'rgba(211, 47, 47, 0.8)'
                    ],
                    borderColor: [
                        '#4caf50',
                        '#ff9800',
                        '#f44336',
                        '#d32f2f'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Quantum State Chart
    const quantumCtx = document.getElementById('quantumStateChart');
    if (quantumCtx) {
        quantumStateChart = new Chart(quantumCtx, {
            type: 'bar',
            data: {
                labels: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
                datasets: [{
                    label: 'Probability',
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(10, 77, 163, 0.8)',
                    borderColor: '#0a4da3',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            color: '#b0bec5'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#b0bec5'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

function updateThreatChart(threatDistribution) {
    if (threatChart) {
        threatChart.data.datasets[0].data = [
            threatDistribution.low || 0,
            threatDistribution.medium || 0,
            threatDistribution.high || 0,
            threatDistribution.critical || 0
        ];
        threatChart.update();
    }
}

function updateQuantumStateChart(quantumState) {
    if (quantumStateChart && quantumState) {
        quantumStateChart.data.datasets[0].data = quantumState;
        quantumStateChart.update();
    }
}

// ==================== WebSocket ====================
function connectWebSocket() {
    try {
        websocket = new WebSocket('ws://localhost:8000/ws');
        
        websocket.onopen = () => {
            console.log('✓ WebSocket connected');
            showNotification('Real-time surveillance feed connected', 'success');
        };
        
        websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };
        
        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        websocket.onclose = () => {
            console.log('WebSocket disconnected. Reconnecting...');
            setTimeout(connectWebSocket, 5000);
        };
        
    } catch (error) {
        console.error('WebSocket connection failed:', error);
        setTimeout(connectWebSocket, 5000);
    }
}

function handleWebSocketMessage(message) {
    switch (message.type) {
        case 'detection':
            displayDetectionResult(message.data);
            loadStatistics();
            break;
        case 'heartbeat':
            console.log('Heartbeat:', message.timestamp);
            break;
        case 'connected':
            console.log('Connected:', message.message);
            break;
    }
}

// ==================== Notifications ====================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 5000);
}

// ==================== Loading Overlay ====================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// ==================== Auto Refresh ====================
setInterval(() => {
    loadStatistics();
    loadDetectionHistory();
}, 30000); // Refresh every 30 seconds

// Export functions for HTML onclick handlers
window.detectObjects = detectObjects;
window.processEOIR = processEOIR;
window.processThermal = processThermal;
window.verifyBlockchain = verifyBlockchain;
window.loadBlockchain = loadBlockchain;
