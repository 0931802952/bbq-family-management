// ========== 配置區域 ==========
// 請將此 URL 替換為您的 Google Apps Script 部署 URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkfwYBCzOcT41-6h_BK_BnsFkSmQlJDK_1QQJn3gwtSiQUvVm2sy4PMh1aA2lmxYgt/exec';

// ========== 數據存儲 ==========
let itemData = []; // 現在數據將從 Google Sheets 載入
let editingId = null;

// ========== DOM 元素 ==========
const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('addBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const meetingForm = document.getElementById('meetingForm');
const modalTitle = document.getElementById('modalTitle');
const statusFilter = document.getElementById('statusFilter');
const groupFilter = document.getElementById('groupFilter');
const refreshBtn = document.getElementById('refreshBtn');

// ========== API 調用函數 ==========

/**
 * 獲取所有項目（使用 GET 方法）
 */
async function fetchTasks() {
    if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        throw new Error('請先設置 Google Apps Script URL');
    }
    
    try {
        console.log('正在載入數據...');
        showLoading();
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL + '?t=' + Date.now(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('載入的數據:', data);
        
        // 檢查是否有錯誤
        if (data.error) {
            throw new Error(data.error + (data.details ? ': ' + data.details : ''));
        }
        
        // 確保返回陣列
        return Array.isArray(data) ? data : [];
        
    } catch (error) {
        console.error('獲取數據失敗:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * 新增任務（使用 POST 方法）
 */
async function addTask(taskData) {
    try {
        console.log('新增任務:', taskData);
        showLoading();
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'add',
                data: taskData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('新增結果:', result);
        
        if (result.error) {
            throw new Error(result.error + (result.details ? ': ' + result.details : ''));
        }
        
        // 檢查是否成功
        if (!result.success) {
            throw new Error('新增失敗：' + (result.message || '未知錯誤'));
        }
        
        return result;
    } catch (error) {
        console.error('新增任務失敗:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * 更新任務（使用 POST 方法）
 */
async function updateTask(taskData) {
    try {
        console.log('更新任務:', taskData);
        showLoading();
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'update',
                data: taskData
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('更新結果:', result);
        
        if (result.error) {
            throw new Error(result.error + (result.details ? ': ' + result.details : ''));
        }
        
        if (!result.success) {
            throw new Error('更新失敗：' + (result.message || '未知錯誤'));
        }
        
        return result;
    } catch (error) {
        console.error('更新任務失敗:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * 刪除任務（使用 POST 方法）
 */
async function deleteTask(taskId) {
    try {
        console.log('刪除任務:', taskId);
        showLoading();
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete',
                data: { id: taskId }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('刪除結果:', result);
        
        if (result.error) {
            throw new Error(result.error + (result.details ? ': ' + result.details : ''));
        }
        
        if (!result.success) {
            throw new Error('刪除失敗：' + (result.message || '未知錯誤'));
        }
        
        return result;
    } catch (error) {
        console.error('刪除任務失敗:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

/**
 * 載入所有項目
 */
async function loadItems() {
    try {
        itemData = await fetchTasks();
        renderTable();
        showSuccess('數據載入成功！共 ' + itemData.length + ' 筆項目');
    } catch (error) {
        console.error('載入數據失敗:', error);
        showError('載入數據失敗: ' + error.message);
    }
}

/**
 * 新增項目到 Google Sheets
 */
async function addItemToSheet(item) {
    try {
        const result = await addTask(item);
        
        // 重新載入數據以確保同步
        await loadItems();
        
        showSuccess('項目新增成功！');
        return result;
    } catch (error) {
        showError('新增項目失敗: ' + error.message);
        throw error;
    }
}

/**
 * 更新項目到 Google Sheets
 */
async function updateItemInSheet(item) {
    try {
        const result = await updateTask(item);
        
        // 重新載入數據以確保同步
        await loadItems();
        
        showSuccess('項目更新成功！');
        return result;
    } catch (error) {
        showError('更新項目失敗: ' + error.message);
        throw error;
    }
}

/**
 * 從 Google Sheets 刪除項目
 */
async function deleteItemFromSheet(id) {
    try {
        const result = await deleteTask(id);
        
        // 重新載入數據以確保同步
        await loadItems();
        
        showSuccess('項目刪除成功！');
        return result;
    } catch (error) {
        showError('刪除項目失敗: ' + error.message);
        throw error;
    }
}

// ========== 顯示功能 ==========

/**
 * 顯示載入中狀態
 */
function showLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
    }
}

/**
 * 隱藏載入中狀態
 */
function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

/**
 * 顯示成功訊息
 */
function showSuccess(message) {
    console.log('✅ ' + message);
    
    // 創建成功提示
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

/**
 * 顯示錯誤訊息
 */
function showError(message) {
    console.error('❌ ' + message);
    
    // 創建錯誤提示
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// ========== 表格渲染 ==========

/**
 * 渲染表格
 */
function renderTable() {
    const filteredData = getFilteredData();
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #666; padding: 20px;">
                    暫無數據，點擊"新增項目"開始添加
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name || ''}</td>
            <td><span class="group-tag group-${item.group || ''}">${item.group || ''}</span></td>
            <td><span class="status-tag status-${item.status || ''}">${item.status || ''}</span></td>
            <td>${item.assignee || ''}</td>
            <td>
                <button class="btn-edit" onclick="editItem('${item.id}')">編輯</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">刪除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * 獲取過濾後的數據
 */
function getFilteredData() {
    let filtered = [...itemData];
    
    const statusFilterValue = statusFilter.value;
    const groupFilterValue = groupFilter.value;
    
    if (statusFilterValue && statusFilterValue !== 'all') {
        filtered = filtered.filter(item => item.status === statusFilterValue);
    }
    
    if (groupFilterValue && groupFilterValue !== 'all') {
        filtered = filtered.filter(item => item.group === groupFilterValue);
    }
    
    return filtered;
}

// ========== 項目操作 ==========

/**
 * 編輯項目
 */
function editItem(id) {
    const item = itemData.find(item => item.id == id);
    if (!item) return;
    
    editingId = id;
    modalTitle.textContent = '編輯項目';
    
    document.getElementById('itemName').value = item.name || '';
    document.getElementById('itemGroup').value = item.group || '';
    document.getElementById('itemStatus').value = item.status || '';
    document.getElementById('itemAssignee').value = item.assignee || '';
    
    modal.style.display = 'block';
}

/**
 * 刪除項目
 */
async function deleteItem(id) {
    if (!confirm('確定要刪除這個項目嗎？')) return;
    
    try {
        await deleteItemFromSheet(id);
    } catch (error) {
        console.error('刪除失敗:', error);
    }
}

// ========== 事件監聽器 ==========

// 頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('頁面載入完成，開始初始化...');
    loadItems();
});

// 新增按鈕
addBtn.addEventListener('click', function() {
    editingId = null;
    modalTitle.textContent = '新增項目';
    meetingForm.reset();
    modal.style.display = 'block';
});

// 關閉按鈕
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

// 取消按鈕
cancelBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

// 點擊模態框外部關閉
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// 表單提交
meetingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(meetingForm);
    const item = {
        name: formData.get('itemName'),
        group: formData.get('itemGroup'),
        status: formData.get('itemStatus'),
        assignee: formData.get('itemAssignee')
    };
    
    try {
        if (editingId) {
            item.id = editingId;
            await updateItemInSheet(item);
        } else {
            await addItemToSheet(item);
        }
        
        modal.style.display = 'none';
        meetingForm.reset();
    } catch (error) {
        console.error('操作失敗:', error);
    }
});

// 過濾器變更
statusFilter.addEventListener('change', renderTable);
groupFilter.addEventListener('change', renderTable);

// 刷新按鈕
if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
        console.log('手動刷新數據...');
        loadItems();
    });
}

// 全域函數（供 HTML 調用）
window.editItem = editItem;
window.deleteItem = deleteItem;
