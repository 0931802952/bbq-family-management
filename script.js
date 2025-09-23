// 烤肉準備項目工作區 - 完整 CRUD 功能版
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRK7Q2jL7bGDigcuL6XHthkH1PJPtEEaWarfl-DDTw9CBU7FI80Rl80mVJSLpmV7ac/exec';

// 家庭分組和狀態選項
const FAMILY_GROUPS = ['郭家', '哥家', '翁家'];
const STATUS_OPTIONS = ['待處理', '進行中', '已完成'];

// 全局變量
let currentEditingRowIndex = null;
let allTasks = [];

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 烤肉準備項目工作區啟動 - 完整功能版');
    
    // 初始化表單選擇器
    initializeSelectors();
    
    // 綁定事件
    bindEvents();
    
    // 載入現有項目
    loadTasks();
    
    // 添加篩選重置功能
    addFilterResetButton();
    
    console.log('✅ 初始化完成');
});

// 添加篩選重置按鈕
function addFilterResetButton() {
    const filterGroup = document.querySelector('.filter-group');
    if (filterGroup) {
        const resetButton = document.createElement('button');
        resetButton.textContent = '重置篩選';
        resetButton.type = 'button';
        resetButton.style.cssText = 'padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;';
        
        resetButton.addEventListener('click', function() {
            document.getElementById('filterFamily').value = '';
            document.getElementById('filterStatus').value = '';
            applyFilters();
            console.log('篩選已重置');
        });
        
        filterGroup.appendChild(resetButton);
        console.log('✅ 重置按鈕已添加');
    }
}

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
        console.log('✅ 表單提交事件已綁定');
    }
    
    // 編輯表單提交事件
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleEditSubmit(event);
        });
        console.log('✅ 編輯表單事件已綁定');
    }
    
    // 篩選事件 - 家庭分組
    const filterFamily = document.getElementById('filterFamily');
    if (filterFamily) {
        filterFamily.addEventListener('change', function() {
            console.log('家庭分組篩選器變動:', this.value);
            applyFilters();
        });
        console.log('✅ 家庭分組篩選器事件已綁定');
    }
    
    // 篩選事件 - 狀態
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', function() {
            console.log('狀態篩選器變動:', this.value);
            applyFilters();
        });
        console.log('✅ 狀態篩選器事件已綁定');
    }
    
    // 模態框外部點擊關閉
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    });
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
        
        // 清空現有內容
        taskList.innerHTML = '';
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            taskList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666; padding: 20px;">暫無項目</td></tr>';
            allTasks = [];
            delete window[callbackName];
            return;
        }
        
        // 儲存原始數據供篩選使用
        allTasks = data;
        
        data.forEach(function(task) {
            if (!task) return;
            
            const row = document.createElement('tr');
            row.innerHTML = 
                '<td>' + (task.name || '') + '</td>' +
                '<td>' + (task.group || '') + '</td>' +
                '<td>' + (task.quantity || '1') + '</td>' +
                '<td><span class="status-badge status-' + getStatusClass(task.status) + '" onclick="toggleStatus(' + task.rowIndex + ', \'' + (task.status || '待處理') + '\')">' + (task.status || '待處理') + '</span></td>' +
                '<td class="action-buttons">' +
                    '<button class="action-btn edit-btn" onclick="openEditModal(' + task.rowIndex + ')">✏️ 編輯</button>' +
                    '<button class="action-btn delete-btn" onclick="deleteTask(' + task.rowIndex + ')">🗑️ 刪除</button>' +
                '</td>';
            taskList.appendChild(row);
        });
        
        console.log('載入了 ' + data.length + ' 個項目');
        
        // 載入完成後，立即應用當前的篩選條件
        setTimeout(function() {
            applyFilters();
        }, 100);
        
        delete window[callbackName];
    };
    
    const script = document.createElement('script');
    script.src = GOOGLE_APPS_SCRIPT_URL + '?callback=' + callbackName;
    script.onerror = function() {
        console.error('載入項目失敗');
        const taskList = document.getElementById('taskList');
        if (taskList) {
            taskList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #f44336; padding: 20px;">載入失敗，請重新整理頁面</td></tr>';
        }
        delete window[callbackName];
    };
    
    document.head.appendChild(script);
}

// 打開編輯模態框
function openEditModal(rowIndex) {
    // 找到要編輯的任務
    const task = allTasks.find(t => t.rowIndex === rowIndex);
    if (!task) {
        showMessage('找不到要編輯的項目', 'error');
        return;
    }
    
    currentEditingRowIndex = rowIndex;
    
    // 填充表單
    document.getElementById('editName').value = task.name || '';
    document.getElementById('editGroup').value = task.group || '';
    document.getElementById('editQuantity').value = task.quantity || '';
    document.getElementById('editStatus').value = task.status || '';
    
    // 顯示模態框
    document.getElementById('editModal').style.display = 'block';
    
    console.log('打開編輯模態框:', task);
}

// 關閉編輯模態框
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingRowIndex = null;
    document.getElementById('editForm').reset();
}

// 處理編輯表單提交
function handleEditSubmit(event) {
    if (!currentEditingRowIndex) {
        showMessage('編輯會話已失效，請重新操作', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const taskData = {
        name: formData.get('name') || '',
        group: formData.get('group') || '',
        quantity: formData.get('quantity') || '',
        status: formData.get('status') || ''
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
    
    console.log('準備編輯項目:', taskData, '行號:', currentEditingRowIndex);
    editTask(currentEditingRowIndex, taskData);
}

// 編輯項目
function editTask(rowIndex, taskData) {
    const callbackName = 'edit_callback_' + Date.now();
    
    // 建立請求參數
    const params = new URLSearchParams({
        action: 'edit',
        rowIndex: rowIndex,
        name: taskData.name,
        group: taskData.group,
        quantity: taskData.quantity,
        status: taskData.status,
        callback: callbackName
    });
    
    const url = GOOGLE_APPS_SCRIPT_URL + '?' + params.toString();
    console.log('編輯項目 URL:', url);
    
    // 定義回調函數
    window[callbackName] = function(response) {
        console.log('編輯項目回應:', response);
        
        if (response && response.success) {
            showMessage('項目編輯成功！', 'success');
            closeEditModal();
            loadTasks(); // 重新載入項目列表
        } else {
            const errorMsg = response && response.error ? response.error : '編輯失敗';
            showMessage('編輯失敗: ' + errorMsg, 'error');
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

// 刪除項目
function deleteTask(rowIndex) {
    // 找到要刪除的任務
    const task = allTasks.find(t => t.rowIndex === rowIndex);
    if (!task) {
        showMessage('找不到要刪除的項目', 'error');
        return;
    }
    
    // 確認對話框
    if (!confirm('確定要刪除「' + task.name + '」嗎？\n\n此操作無法復原。')) {
        return;
    }
    
    const callbackName = 'delete_callback_' + Date.now();
    
    // 建立請求參數
    const params = new URLSearchParams({
        action: 'delete',
        rowIndex: rowIndex,
        callback: callbackName
    });
    
    const url = GOOGLE_APPS_SCRIPT_URL + '?' + params.toString();
    console.log('刪除項目 URL:', url);
    
    // 定義回調函數
    window[callbackName] = function(response) {
        console.log('刪除項目回應:', response);
        
        if (response && response.success) {
            showMessage('項目刪除成功！', 'success');
            loadTasks(); // 重新載入項目列表
        } else {
            const errorMsg = response && response.error ? response.error : '刪除失敗';
            showMessage('刪除失敗: ' + errorMsg, 'error');
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

// 切換狀態
function toggleStatus(rowIndex, currentStatus) {
    // 狀態切換循環：待處理 → 進行中 → 已完成 → 待處理
    let newStatus;
    switch (currentStatus) {
        case '待處理':
            newStatus = '進行中';
            break;
        case '進行中':
            newStatus = '已完成';
            break;
        case '已完成':
            newStatus = '待處理';
            break;
        default:
            newStatus = '進行中';
    }
    
    updateStatus(rowIndex, newStatus);
}

// 更新狀態
function updateStatus(rowIndex, newStatus) {
    const callbackName = 'status_callback_' + Date.now();
    
    // 建立請求參數
    const params = new URLSearchParams({
        action: 'updateStatus',
        rowIndex: rowIndex,
        status: newStatus,
        callback: callbackName
    });
    
    const url = GOOGLE_APPS_SCRIPT_URL + '?' + params.toString();
    console.log('更新狀態 URL:', url);
    
    // 定義回調函數
    window[callbackName] = function(response) {
        console.log('更新狀態回應:', response);
        
        if (response && response.success) {
            showMessage('狀態更新為：' + response.newStatus, 'success');
            loadTasks(); // 重新載入項目列表
        } else {
            const errorMsg = response && response.error ? response.error : '狀態更新失敗';
            showMessage('狀態更新失敗: ' + errorMsg, 'error');
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

// 應用篩選
function applyFilters() {
    const familyFilter = document.getElementById('filterFamily').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const rows = document.querySelectorAll('#taskList tr');
    
    console.log('開始篩選 - 家庭:', familyFilter, '狀態:', statusFilter);
    
    let visibleCount = 0;
    
    rows.forEach(function(row) {
        const cells = row.querySelectorAll('td');
        
        // 跳過標題行或空行
        if (cells.length < 5) {
            return;
        }
        
        // 獲取文本內容（第2列是家庭分組，第4列是狀態）
        const familyText = cells[1].textContent.trim();
        const statusElement = cells[3].querySelector('.status-badge');
        const statusText = statusElement ? statusElement.textContent.trim() : cells[3].textContent.trim();
        
        console.log('檢查項目:', familyText, statusText);
        
        let showRow = true;
        
        // 家庭分組篩選
        if (familyFilter && familyFilter !== '' && familyText !== familyFilter) {
            showRow = false;
            console.log('家庭不匹配:', familyText, '!=', familyFilter);
        }
        
        // 狀態篩選
        if (statusFilter && statusFilter !== '' && statusText !== statusFilter) {
            showRow = false;
            console.log('狀態不匹配:', statusText, '!=', statusFilter);
        }
        
        // 顯示或隱藏行
        row.style.display = showRow ? '' : 'none';
        
        if (showRow) {
            visibleCount++;
        }
    });
    
    console.log('篩選完成 - 顯示項目數:', visibleCount);
    
    // 如果沒有符合的項目，顯示提示
    if (visibleCount === 0 && rows.length > 0) {
        const taskList = document.getElementById('taskList');
        const noResultRow = document.createElement('tr');
        noResultRow.id = 'no-result-row';
        noResultRow.innerHTML = '<td colspan="5" style="text-align: center; color: #666; font-style: italic; padding: 20px;">沒有符合篩選條件的項目</td>';
        
        // 移除之前的提示行
        const existingNoResult = document.getElementById('no-result-row');
        if (existingNoResult) {
            existingNoResult.remove();
        }
        
        taskList.appendChild(noResultRow);
    } else {
        // 移除無結果提示
        const existingNoResult = document.getElementById('no-result-row');
        if (existingNoResult) {
            existingNoResult.remove();
        }
    }
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

console.log('烤肉準備項目工作區已載入完成 - 完整 CRUD 功能版');
