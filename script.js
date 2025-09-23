// 烤肉準備項目工作區 - 完整功能版
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRK7Q2jL7bGDigcuL6XHthkH1PJPtEEaWarfl-DDTw9CBU7FI80Rl80mVJSLpmV7ac/exec';

// 家庭分組和狀態選項
const FAMILY_GROUPS = ['郭家', '哥家', '翁家'];
const STATUS_OPTIONS = ['待處理', '進行中', '已完成'];

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 烤肉準備項目工作區啟動');
    
    // 初始化表單選擇器
    initializeSelectors();
    
    // 載入現有項目
    loadTasks();
    
    // 綁定事件
    bindEvents();
});

// 初始化選擇器
function initializeSelectors() {
    // 家庭分組選擇器
    const familyGroupSelect = document.getElementById('familyGroup');
    if (familyGroupSelect) {
        familyGroupSelect.innerHTML = '<option value="">請選擇家庭分組</option>';
        FAMILY_GROUPS.forEach(function(group) {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            familyGroupSelect.appendChild(option);
        });
    }
    
    // 狀態選擇器
    const statusSelect = document.getElementById('taskStatus');
    if (statusSelect) {
        statusSelect.innerHTML = '';
        STATUS_OPTIONS.forEach(function(status) {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
    }
}

// 綁定事件
function bindEvents() {
    // 表單提交事件
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleFormSubmit(event);
        });
    }
    
    // 篩選事件
    const filterFamily = document.getElementById('filterFamily');
    const filterStatus = document.getElementById('filterStatus');
    
    if (filterFamily) {
        filterFamily.addEventListener('change', applyFilters);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', applyFilters);
    }
}

// 處理表單提交
function handleFormSubmit(event) {
    const formData = new FormData(event.target);
    const taskData = {
        name: formData.get('itemName') || '',
        group: formData.get('familyGroup') || '',
        quantity: formData.get('quantity') || '1',
        status: formData.get('status') || '待處理'
    };
    
    // 驗證必填欄位
    if (!taskData.name.trim()) {
        showMessage('請輸入項目名稱', 'error');
        return;
    }
    
    if (!taskData.group.trim()) {
        showMessage('請選擇家庭分組', 'error');
        return;
    }
    
    console.log('準備新增項目:', taskData);
    addTask(taskData);
}

// 新增項目
function addTask(taskData) {
    const callbackName = 'add_callback_' + Date.now();
    
    // 建立請求參數
    const params = new URLSearchParams({
        action: 'add',
        name: taskData.name,
        group: taskData.group,
        quantity: taskData.quantity,
        status: taskData.status,
        callback: callbackName
    });
    
    const url = GOOGLE_APPS_SCRIPT_URL + '?' + params.toString();
    console.log('新增項目 URL:', url);
    
    // 定義回調函數
    window[callbackName] = function(response) {
        console.log('新增項目回應:', response);
        
        if (response && response.success) {
            showMessage('項目新增成功！', 'success');
            loadTasks(); // 重新載入項目列表
            document.getElementById('taskForm').reset(); // 清空表單
        } else {
            const errorMsg = response && response.error ? response.error : '新增失敗';
            showMessage('新增失敗: ' + errorMsg, 'error');
        }
        
        // 清理
        delete window[callbackName];
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };
    
    // 建立並執行 JSONP 請求
    const script = document.createElement('script');
    script.src = url;
    script.onerror = function() {
        console.error('JSONP 請求失敗');
        showMessage('網路請求失敗，請檢查連線', 'error');
        delete window[callbackName];
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };
    
    document.head.appendChild(script);
}

// 載入所有項目
function loadTasks() {
    const callbackName = 'callback_' + Date.now();
    
    window[callbackName] = function(data) {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        taskList.innerHTML = '';
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            taskList.innerHTML = '<tr><td colspan="4">暫無項目</td></tr>';
            delete window[callbackName];
            return;
        }
        
        // 儲存原始數據供篩選使用
        window.allTasks = data;
        
        data.forEach(function(task) {
            if (!task) return;
            
            const row = document.createElement('tr');
            row.innerHTML = 
                '<td>' + (task.name || '') + '</td>' +
                '<td>' + (task.group || '') + '</td>' +
                '<td>' + (task.quantity || '1') + '</td>' +
                '<td><span class="status-badge status-' + getStatusClass(task.status) + '">' + (task.status || '待處理') + '</span></td>';
            taskList.appendChild(row);
        });
        
        console.log('載入了 ' + data.length + ' 個項目');
        delete window[callbackName];
    };
    
    const script = document.createElement('script');
    script.src = GOOGLE_APPS_SCRIPT_URL + '?callback=' + callbackName;
    document.head.appendChild(script);
}

// 應用篩選
function applyFilters() {
    const familyFilter = document.getElementById('filterFamily').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const rows = document.querySelectorAll('#taskList tr');
    
    rows.forEach(function(row) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 4) return; // 跳過標題行或空行
        
        const familyText = cells[1].textContent.trim(); // 家庭分組
        const statusText = cells[3].textContent.trim(); // 狀態
        
        let showRow = true;
        
        // 家庭分組篩選
        if (familyFilter && familyText !== familyFilter) {
            showRow = false;
        }
        
        // 狀態篩選
        if (statusFilter && statusText !== statusFilter) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
    
    console.log('篩選條件 - 家庭:', familyFilter || '全部', '狀態:', statusFilter || '全部');
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

// 顯示訊息
function showMessage(message, type) {
    type = type || 'info';
    
    // 移除現有訊息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 建立新訊息
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-toast message-' + type;
    messageDiv.textContent = message;
    
    // 樣式
    messageDiv.style.cssText = 
        'position: fixed; top: 20px; right: 20px; padding: 12px 20px; ' +
        'border-radius: 4px; color: white; font-weight: bold; z-index: 1000; ' +
        'transition: opacity 0.3s ease;';
    
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
    setTimeout(function() {
        messageDiv.style.opacity = '0';
        setTimeout(function() {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

console.log('烤肉準備項目工作區已載入完成 - 支援家庭分組篩選');
