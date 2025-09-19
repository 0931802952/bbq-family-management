// 烤肉準備項目工作區 - GitHub Pages 安全版本
// 包含完整的錯誤處理和 DOM 準備檢查

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXTnq2WLNIDVpHQIp-gtT-MXgT-dWjSKBNgcU6WA7TWP8-Rw6NKdQ1CxGJeWasQBTY/exec';

// 確保 DOM 完全載入後再執行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 已準備完成，初始化應用程式...');
    initializeApp();
});

// 如果 DOMContentLoaded 已經觸發過，立即執行
if (document.readyState === 'loading') {
    // DOM 仍在載入中，等待 DOMContentLoaded 事件
    console.log('等待 DOM 載入完成...');
} else {
    // DOM 已經載入完成
    console.log('DOM 已準備好，立即初始化...');
    initializeApp();
}

function initializeApp() {
    try {
        // 檢查所有必要的 DOM 元素是否存在
        const requiredElements = [
            'taskList',
            'taskForm',
            'taskName',
            'taskGroup',
            'taskAssignee',
            'filterGroup',
            'filterStatus'
        ];

        const missingElements = [];
        const elements = {};

        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                elements[id] = element;
                console.log(`✓ 找到元素: ${id}`);
            } else {
                missingElements.push(id);
                console.error(`✗ 缺失元素: ${id}`);
            }
        });

        if (missingElements.length > 0) {
            console.error('缺失的 HTML 元素:', missingElements);
            showError(`缺失 HTML 元素: ${missingElements.join(', ')}`);
            return;
        }

        // 初始化應用程式
        console.log('所有元素已準備好，開始初始化功能...');
        
        // 綁定事件監聽器
        bindEventListeners(elements);
        
        // 載入初始資料
        loadTasks();
        
        console.log('應用程式初始化完成！');
        
    } catch (error) {
        console.error('初始化失敗:', error);
        showError('應用程式初始化失敗: ' + error.message);
    }
}

function bindEventListeners(elements) {
    // 表單提交事件
    if (elements.taskForm) {
        elements.taskForm.addEventListener('submit', handleFormSubmit);
    }

    // 篩選器事件
    if (elements.filterGroup) {
        elements.filterGroup.addEventListener('change', filterTasks);
    }
    if (elements.filterStatus) {
        elements.filterStatus.addEventListener('change', filterTasks);
    }
}

let tasks = [];

// JSONP 回調函數
function jsonpCallback(data) {
    console.log('JSONP 資料載入成功:', data);
    tasks = data;
    displayTasks();
}

// 載入任務（使用 JSONP）
async function loadTasks() {
    try {
        console.log('開始載入任務資料...');
        showLoading('正在載入任務...');

        // 使用 JSONP 方式載入資料
        const callbackName = 'jsonpCallback_' + Date.now();
        
        // 創建全域回調函數
        window[callbackName] = function(data) {
            console.log('JSONP 資料載入成功:', data);
            tasks = data;
            displayTasks();
            hideLoading();
            
            // 清理全域回調函數
            delete window[callbackName];
        };

        // 創建 script 標籤
        const script = document.createElement('script');
        script.src = `${GOOGLE_APPS_SCRIPT_URL}?callback=${callbackName}&t=${Date.now()}`;
        
        // 錯誤處理
        script.onerror = function() {
            console.error('JSONP 載入失敗');
            showError('無法載入任務資料，請檢查網路連線');
            hideLoading();
            delete window[callbackName];
        };

        // 添加到頁面
        document.head.appendChild(script);
        
        // 5秒後移除 script 標籤（清理）
        setTimeout(() => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }, 5000);

    } catch (error) {
        console.error('載入任務失敗:', error);
        showError('載入任務失敗: ' + error.message);
        hideLoading();
    }
}

// 顯示任務
function displayTasks() {
    try {
        const taskList = document.getElementById('taskList');
        if (!taskList) {
            console.error('找不到 taskList 元素');
            return;
        }

        if (!tasks || tasks.length === 0) {
            taskList.innerHTML = '<tr><td colspan="5" class="text-center">暫無任務</td></tr>';
            return;
        }

        const html = tasks.map(task => `
            <tr>
                <td>${escapeHtml(task.name || '')}</td>
                <td><span class="group-${escapeHtml(task.group || '').replace(/\s+/g, '-')}">${escapeHtml(task.group || '')}</span></td>
                <td><span class="status-${escapeHtml(task.status || '').replace(/\s+/g, '-')}">${escapeHtml(task.status || '')}</span></td>
                <td>${escapeHtml(task.assignee || '')}</td>
                <td>
                    <button onclick="updateTaskStatus('${task.id}', '進行中')" class="btn-sm">開始</button>
                    <button onclick="updateTaskStatus('${task.id}', '已完成')" class="btn-sm">完成</button>
                </td>
            </tr>
        `).join('');

        taskList.innerHTML = html;
        console.log('任務列表已更新');

    } catch (error) {
        console.error('顯示任務失敗:', error);
        showError('顯示任務失敗: ' + error.message);
    }
}

// HTML 轉義函數
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 表單提交處理
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const taskName = document.getElementById('taskName');
        const taskGroup = document.getElementById('taskGroup');
        const taskAssignee = document.getElementById('taskAssignee');

        if (!taskName || !taskGroup || !taskAssignee) {
            showError('找不到表單元素');
            return;
        }

        const name = taskName.value.trim();
        const group = taskGroup.value.trim();
        const assignee = taskAssignee.value.trim();

        if (!name || !group || !assignee) {
            showError('請填寫所有欄位');
            return;
        }

        showLoading('正在新增任務...');

        // 使用 POST 新增任務
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                name: name,
                group: group,
                assignee: assignee,
                status: '待處理'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.text();
        console.log('新增任務回應:', result);

        // 清空表單
        taskName.value = '';
        taskGroup.value = '';
        taskAssignee.value = '';

        // 重新載入任務
        await loadTasks();
        
        hideLoading();
        showSuccess('任務新增成功！');

    } catch (error) {
        console.error('新增任務失敗:', error);
        showError('新增任務失敗: ' + error.message);
        hideLoading();
    }
}

// 更新任務狀態
async function updateTaskStatus(taskId, newStatus) {
    try {
        showLoading('正在更新狀態...');

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update',
                id: taskId,
                status: newStatus
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 重新載入任務
        await loadTasks();
        
        hideLoading();
        showSuccess('狀態更新成功！');

    } catch (error) {
        console.error('更新狀態失敗:', error);
        showError('更新狀態失敗: ' + error.message);
        hideLoading();
    }
}

// 篩選任務
function filterTasks() {
    try {
        const filterGroup = document.getElementById('filterGroup');
        const filterStatus = document.getElementById('filterStatus');
        
        if (!filterGroup || !filterStatus) {
            console.error('找不到篩選器元素');
            return;
        }

        const groupFilter = filterGroup.value;
        const statusFilter = filterStatus.value;

        const filteredTasks = tasks.filter(task => {
            const groupMatch = !groupFilter || task.group === groupFilter;
            const statusMatch = !statusFilter || task.status === statusFilter;
            return groupMatch && statusMatch;
        });

        // 暫時替換 tasks 陣列來顯示篩選結果
        const originalTasks = tasks;
        tasks = filteredTasks;
        displayTasks();
        tasks = originalTasks;

    } catch (error) {
        console.error('篩選失敗:', error);
        showError('篩選失敗: ' + error.message);
    }
}

// 顯示載入狀態
function showLoading(message = '載入中...') {
    const existingLoader = document.getElementById('loader');
    if (existingLoader) {
        existingLoader.textContent = message;
        return;
    }

    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    loader.textContent = message;
    document.body.appendChild(loader);
}

// 隱藏載入狀態
function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.remove();
    }
}

// 顯示錯誤訊息
function showError(message) {
    showMessage(message, 'error');
}

// 顯示成功訊息
function showSuccess(message) {
    showMessage(message, 'success');
}

// 顯示訊息
function showMessage(message, type = 'info') {
    const messageId = 'message-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    
    const bgColor = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1001;
        max-width: 300px;
        word-wrap: break-word;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    // 3秒後自動移除
    setTimeout(() => {
        const msg = document.getElementById(messageId);
        if (msg) {
            msg.remove();
        }
    }, 3000);
}

console.log('腳本載入完成');
