// ========== 配置區域 ==========
// 請將此 URL 替換為您的 Google Apps Script 部署 URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSmr3NFuGTxUXx7-xlTCDwljzBA3iUWH0_K3w5s7c/dev';

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

// ========== API 調用函數 ==========

/**
 * 調用 Google Apps Script API
 */
async function callAPI(action, data = {}) {
    if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        throw new Error('請先設置 Google Apps Script URL');
    }
    
    showLoading();
    
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                ...data
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.data.error || '操作失敗');
        }
        
        return result.data;
    } catch (error) {
        console.error('API 調用錯誤:', error);
        showError('操作失敗: ' + error.message);
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
        itemData = await callAPI('getItems');
        renderTable();
        showSuccess('數據載入成功！');
    } catch (error) {
        console.error('載入數據失敗:', error);
        showError('載入數據失敗，請檢查網路連線或配置');
    }
}

/**
 * 新增項目到 Google Sheets
 */
async function addItemToSheet(item) {
    try {
        const newItem = await callAPI('addItem', { item });
        itemData.push(newItem);
        renderTable();
        showSuccess('項目新增成功！');
        return newItem;
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
        const updatedItem = await callAPI('updateItem', { item });
        const index = itemData.findIndex(data => data.id == item.id);
        if (index !== -1) {
            itemData[index] = updatedItem;
            renderTable();
            showSuccess('項目更新成功！');
        }
        return updatedItem;
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
        await callAPI('deleteItem', { id });
        itemData = itemData.filter(item => item.id != id);
        renderTable();
        showSuccess('項目刪除成功！');
    } catch (error) {
        showError('刪除項目失敗: ' + error.message);
        throw error;
    }
}

/**
 * 切換項目狀態
 */
async function toggleItemStatusInSheet(id) {
    try {
        const result = await callAPI('toggleStatus', { id });
        const item = itemData.find(data => data.id == id);
        if (item) {
            item.status = result.status;
            renderTable();
            showSuccess('狀態更新成功！');
        }
    } catch (error) {
        showError('狀態更新失敗: ' + error.message);
        throw error;
    }
}

// ========== UI 狀態管理 ==========

/**
 * 顯示加載狀態
 */
function showLoading() {
    let loadingDiv = document.getElementById('loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>處理中...</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.style.display = 'flex';
}

/**
 * 隱藏加載狀態
 */
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

/**
 * 顯示成功訊息
 */
function showSuccess(message) {
    showMessage(message, 'success');
}

/**
 * 顯示錯誤訊息
 */
function showError(message) {
    showMessage(message, 'error');
}

/**
 * 顯示訊息
 */
function showMessage(message, type = 'info') {
    // 移除現有訊息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// ========== 初始化 ==========

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 檢查配置
    if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        showError('請先完成 Google Apps Script 配置！查看控制台獲取設置說明。');
        console.error(`
=============================================================
🚨 配置說明 🚨
=============================================================

請按照以下步驟完成設置：

1. 前往 https://script.google.com
2. 創建新項目，貼上 google-apps-script.js 中的代碼
3. 創建 Google Sheets 並複製 ID 
4. 在 Google Apps Script 中設置 SHEET_ID
5. 部署為網頁應用程式
6. 複製部署 URL 並更新此文件中的 GOOGLE_APPS_SCRIPT_URL

詳細說明請參考 Google-Sheets-設置指南.md

=============================================================
        `);
        return;
    }
    
    // 載入數據並初始化
    loadItems();
    bindEvents();
});

// ========== 事件綁定 ==========

// 綁定事件
function bindEvents() {
    addBtn.addEventListener('click', openAddModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    meetingForm.addEventListener('submit', handleFormSubmit);
    statusFilter.addEventListener('change', renderTable);
    groupFilter.addEventListener('change', renderTable);
    
    // 點擊模態框外部關閉
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // 鍵盤快捷鍵
    document.addEventListener('keydown', function(event) {
        // ESC 鍵關閉模態框
        if (event.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl+N 新增項目
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            openAddModal();
        }
    });
}

// ========== 表格渲染 ==========

// 渲染表格
function renderTable() {
    const statusFilterValue = statusFilter.value;
    const groupFilterValue = groupFilter.value;
    let filteredData = itemData;
    
    // 按狀態篩選
    if (statusFilterValue !== 'all') {
        filteredData = filteredData.filter(item => item.status === statusFilterValue);
    }
    
    // 按分組篩選
    if (groupFilterValue !== 'all') {
        filteredData = filteredData.filter(item => item.groupName === groupFilterValue);
    }
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    暫無數據
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.groupName}</td>
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>
                <span class="status ${item.status}">
                    ${item.status === 'completed' ? '已完成' : '未完成'}
                </span>
            </td>
            <td>
                <div class="actions">
                    <button class="btn btn-warning" onclick="editItem(${item.id})">
                        編輯
                    </button>
                    <button class="btn ${item.status === 'completed' ? 'btn-secondary' : 'btn-success'}" 
                            onclick="toggleStatus(${item.id})">
                        ${item.status === 'completed' ? '標記未完成' : '標記完成'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id})">
                        刪除
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ========== 模態框操作 ==========

// 打開新增模態框
function openAddModal() {
    editingId = null;
    modalTitle.textContent = '🍖 新增準備項目';
    meetingForm.reset();
    document.getElementById('status').value = 'incomplete';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 打開編輯模態框
function editItem(id) {
    const item = itemData.find(data => data.id == id);
    if (!item) return;
    
    editingId = id;
    modalTitle.textContent = '⚙️ 編輯準備項目';
    
    // 填充表單數據
    document.getElementById('groupName').value = item.groupName;
    document.getElementById('itemName').value = item.itemName;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('status').value = item.status;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 關閉模態框
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingId = null;
    meetingForm.reset();
}

// ========== 數據操作 ==========

// 處理表單提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(meetingForm);
    const item = {
        groupName: formData.get('groupName').trim(),
        itemName: formData.get('itemName').trim(),
        quantity: formData.get('quantity').trim(),
        status: formData.get('status')
    };
    
    // 驗證必填欄位
    if (!item.groupName || !item.itemName || !item.quantity) {
        showError('請填寫所有必填欄位！');
        return;
    }
    
    try {
        if (editingId) {
            // 編輯現有項目
            item.id = editingId;
            await updateItemInSheet(item);
        } else {
            // 新增項目
            await addItemToSheet(item);
        }
        
        closeModal();
    } catch (error) {
        // 錯誤已在 API 函數中處理
        console.error('表單提交錯誤:', error);
    }
}

// 切換狀態
async function toggleStatus(id) {
    try {
        await toggleItemStatusInSheet(id);
    } catch (error) {
        console.error('狀態切換錯誤:', error);
    }
}

// 刪除項目
async function deleteItem(id) {
    if (confirm('確定要刪除這個準備項目嗎？')) {
        try {
            await deleteItemFromSheet(id);
        } catch (error) {
            console.error('刪除項目錯誤:', error);
        }
    }
}

// ========== 手動刷新功能 ==========

/**
 * 手動刷新數據
 */
async function refreshData() {
    try {
        await loadItems();
    } catch (error) {
        console.error('刷新數據失敗:', error);
    }
}

// 在頁面可見時自動刷新
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        refreshData();
    }
});
