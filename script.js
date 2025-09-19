// 烤肉準備項目工作區 - 更新版前端 JavaScript
// 配合移除 assignee 欄位的後端

// Google Apps Script URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRK7Q2jL7bGDigcuL6XHthkH1PJPtEEaWarfl-DDTw9CBU7FI80Rl80mVJSLpmV7ac/exec';

// 狀態選項
const STATUS_OPTIONS = ['待處理', '進行中', '已完成'];

// 家庭分組選項
const FAMILY_GROUPS = ['郭家', '哥家', '翁家'];

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 烤肉準備項目工作區啟動！');
    
    // 初始化狀態選擇器
    populateStatusSelect();
    
    // 初始化家庭分組選擇器
    populateFamilyGroupSelect();
    
    // 載入現有項目
    loadTasks();
    
    // 綁定表單提交事件
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleFormSubmit);
    }
    
    // 綁定篩選功能
    const filterSelect = document.getElementById('filterStatus');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterTasks);
    }
});

// 填充狀態選擇器
function populateStatusSelect() {
    const statusSelect = document.getElementById('taskStatus');
    const filterSelect = document.getElementById('filterStatus');
    
    // 清空現有選項
    if (statusSelect) {
        statusSelect.innerHTML = '';
        STATUS_OPTIONS.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
    }
    
    // 填充篩選選擇器
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">全部狀態</option>';
        STATUS_OPTIONS.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            filterSelect.appendChild(option);
        });
    }
}

// 填充家庭分組選擇器
function populateFamilyGroupSelect() {
    const familyGroupSelect = document.getElementById('familyGroup');
    
    if (familyGroupSelect) {
        familyGroupSelect.innerHTML = '<option value="">請選擇家庭分組</option>';
        FAMILY_GROUPS.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            familyGroupSelect.appendChild(option);
        });
    }
}

// 處理表單提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = {
        name: formData.get('itemName'),
        group: formData.get('familyGroup'),
        quantity: formData.get('quantity') || '1',
        status: formData.get('status') || '待處理'
    };
    
    console.log('準備新增項目:', taskData);
    addTask(taskData);
}

// 新增項目（使用 JSONP）
function addTask(taskData) {
    try {
        const callbackName = 'jsonp_callback_' + Date.now();
        
        // 建立請求參數
        const params = new URLSearchParams({
            action: 'add',
            name: taskData.name,
            group: taskData.group,
            quantity: taskData.quantity,
            status: taskData.status,
            callback: callbackName
        });
        
        const url = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
        console.log('新增項目 URL:', url);
        
        // 定義回調函數
        window[callbackName] = function(response) {
            console.log('新增項目回應:', response);
            
            if (response.success) {
                console.log('✅ 項目新增成功:', response.message);
                showMessage('項目新增成功！', 'success');
                
                // 重新載入項目列表
                loadTasks();
                
                // 清空表單
                document.getElementById('taskForm').reset();
            } else {
                console.error('❌ 新增失敗:', response.error);
                showMessage('新增失敗: ' + response.error, 'error');
            }
            
            // 清理回調函數
            delete window[callbackName];
            document.head.removeChild(script);
        };
        
        // 建立並執行 JSONP 請求
        const script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            console.error('❌ JSONP 請求失敗');
            showMessage('網路請求失敗，請檢查連線', 'error');
            delete window[callbackName];
            document.head.removeChild(script);
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('新增項目錯誤:', error);
        showMessage('發生錯誤: ' + error.message, 'error');
    }
}

// 載入所有項目
function loadTasks() {
    const callbackName = 'jsonp_callback_load_' + Date.now();
    
    console.log('開始載入項目列表...');
    
    // 定義回調函數
    window[callbackName] = function(data) {
        console.log('載入的項目數據:', data);
        
        if (Array.isArray(data)) {
            displayTasks(data);
            console.log(`✅ 成功載入 ${data.length} 個項目`);
        } else if (data.error) {
            console.error('❌ 載入失敗:', data.error);
            showMessage('載入失敗: ' + data.error, 'error');
        } else {
            console.log('📝 無項目數據');
            displayTasks([]);
        }
        
        // 清理
        delete window[callbackName];
        document.head.removeChild(script);
    };
    
    // 建立 JSONP 請求
    const script = document.createElement('script');
    script.src = `${GOOGLE_APPS_SCRIPT_URL}?callback=${callbackName}`;
    script.onerror = function() {
        console.error('❌ 載入項目失敗');
        showMessage('載入項目失敗，請檢查網路連線', 'error');
        delete window[callbackName];
        document.head.removeChild(script);
    };
    
    document.head.appendChild(script);
}

// 顯示項目列表
function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    if (!taskList) {
        console.error('找不到項目列表容器');
        return;
    }
    
    // 清空現有內容
    taskList.innerHTML = '';
    
    if (!tasks || tasks.length === 0) {
        taskList.innerHTML = '<tr><td colspan="4" class="text-center">暫無項目</td></tr>';
        return;
    }
    
    // 渲染每個項目
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(task.name || '')}</td>
            <td>${escapeHtml(task.group || '')}</td>
            <td>${escapeHtml(task.quantity || '1')}</td>
            <td>
                <span class="status-badge status-${getStatusClass(task.status)}">
                    ${escapeHtml(task.status || '待處理')}
                </span>
            </td>
        `;
        taskList.appendChild(row);
    });
    
    console.log(`🎯 顯示了 ${tasks.length} 個項目`);
}

// 篩選項目
function filterTasks() {
    const filterValue = document.getElementById('filterStatus').value;
    const rows = document.querySelectorAll('#taskList tr');
    
    rows.forEach(row => {
        if (filterValue === '') {
            row.style.display = '';
        } else {
            const statusCell = row.querySelector('td:last-child .status-badge');
            if (statusCell && statusCell.textContent.trim() === filterValue) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    console.log(`🔍 按狀態篩選: ${filterValue || '全部'}`);
}

// 取得狀態對應的 CSS 類別
function getStatusClass(status) {
    switch (status) {
        case '待處理': return 'pending';
        case '進行中': return 'in-progress';
        case '已完成': return 'completed';
        default: return 'pending';
    }
}

// HTML 轉義（防止 XSS）
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 顯示訊息
function showMessage(message, type = 'info') {
    // 移除現有訊息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 建立新訊息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    
    // 樣式
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transition: opacity 0.3s ease;
    `;
    
    // 根據類型設置背景色
    switch (type) {
        case 'success':
            messageDiv.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#f44336';
            break;
        default:
            messageDiv.style.backgroundColor = '#2196F3';
    }
    
    // 加到頁面
    document.body.appendChild(messageDiv);
    
    // 3秒後移除
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 除錯資訊
console.log('🔥 烤肉準備項目工作區 JavaScript 已載入');
console.log('📡 Google Apps Script URL:', GOOGLE_APPS_SCRIPT_URL);
console.log('📋 支援狀態:', STATUS_OPTIONS);
console.log('👨‍👩‍👧‍👦 家庭分組:', FAMILY_GROUPS);
