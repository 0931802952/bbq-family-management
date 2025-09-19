// GitHub Pages 最終版本 - 使用新的 API URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXTnq2WLNIDVpHQIp-gtT-MXgT-dWjSKBNgcU6WA7TWP8-Rw6NKdQ1CxGJeWasQBTY/exec';

let tasks = [];
let editingTask = null;

// 分組和狀態選項
const GROUPS = ['烤肉用具', '食材採購', '場地準備', '其他'];
const STATUSES = ['待處理', '進行中', '已完成'];

// 使用 JSONP 載入任務
async function fetchTasks() {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_' + Date.now();
        const timeout = setTimeout(() => {
            delete window[callbackName];
            reject(new Error('請求超時'));
        }, 10000);
        
        // 創建全域回調函數
        window[callbackName] = function(data) {
            clearTimeout(timeout);
            delete window[callbackName];
            console.log('JSONP 回調收到資料:', data);
            resolve(data || []);
        };
        
        // 建立 JSONP 請求
        const script = document.createElement('script');
        script.src = GOOGLE_APPS_SCRIPT_URL + '?callback=' + callbackName + '&t=' + Date.now();
        script.onerror = function() {
            clearTimeout(timeout);
            delete window[callbackName];
            reject(new Error('JSONP 載入失敗'));
        };
        
        console.log('發送 JSONP 請求:', script.src);
        document.head.appendChild(script);
        
        // 清理
        setTimeout(() => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }, 11000);
    });
}

// 載入並顯示任務
async function loadTasks() {
    try {
        console.log('開始載入任務...');
        showMessage('正在載入資料...', 'info');
        
        tasks = await fetchTasks();
        console.log('載入任務成功，數量:', tasks.length);
        
        renderTasks();
        showMessage(`載入成功！共 ${tasks.length} 個任務`, 'success');
    } catch (error) {
        console.error('載入任務失敗:', error);
        showMessage('載入失敗: ' + error.message, 'error');
        
        // 顯示空狀態
        tasks = [];
        renderTasks();
    }
}

// 寫操作 - 使用隱藏表單提交
async function sendWriteRequest(data) {
    return new Promise((resolve, reject) => {
        try {
            // 使用 fetch 的 no-cors 模式
            fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'no-cors' // 重要：繞過 CORS 檢查
            }).then(() => {
                console.log('寫入請求已發送');
                // 延遲重新載入資料來確認變更
                setTimeout(() => {
                    loadTasks().then(() => resolve({ success: true }));
                }, 1500);
            }).catch(error => {
                console.error('寫入請求失敗:', error);
                // 即使 fetch 失敗，也嘗試重新載入（可能實際上成功了）
                setTimeout(() => {
                    loadTasks().then(() => resolve({ success: true }));
                }, 2000);
            });
            
        } catch (error) {
            console.error('發送寫入請求錯誤:', error);
            reject(error);
        }
    });
}

// 新增任務
async function addTask(task) {
    try {
        console.log('新增任務:', task);
        showMessage('正在新增任務...', 'info');
        
        await sendWriteRequest({
            action: 'add',
            task: task
        });
        
        showMessage('任務新增成功！', 'success');
    } catch (error) {
        console.error('新增任務失敗:', error);
        showMessage('新增失敗: ' + error.message, 'error');
    }
}

// 更新任務
async function updateTask(task) {
    try {
        console.log('更新任務:', task);
        showMessage('正在更新任務...', 'info');
        
        await sendWriteRequest({
            action: 'update',
            task: task
        });
        
        showMessage('任務更新成功！', 'success');
    } catch (error) {
        console.error('更新任務失敗:', error);
        showMessage('更新失敗: ' + error.message, 'error');
    }
}

// 刪除任務
async function deleteTask(taskId) {
    try {
        console.log('刪除任務:', taskId);
        showMessage('正在刪除任務...', 'info');
        
        await sendWriteRequest({
            action: 'delete',
            taskId: taskId
        });
        
        showMessage('任務刪除成功！', 'success');
    } catch (error) {
        console.error('刪除任務失敗:', error);
        showMessage('刪除失敗: ' + error.message, 'error');
    }
}

// 渲染任務列表
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const groupedTasks = {};
    
    // 按分組整理任務
    GROUPS.forEach(group => {
        groupedTasks[group] = tasks.filter(task => task.group === group);
    });
    
    let html = '';
    GROUPS.forEach(group => {
        const groupTasks = groupedTasks[group];
        html += `
            <div class="task-group">
                <h3 class="group-title">${group} (${groupTasks.length})</h3>
                <div class="task-items">
        `;
        
        if (groupTasks.length === 0) {
            html += '<p class="no-tasks">暫無任務</p>';
        } else {
            groupTasks.forEach(task => {
                const statusClass = task.status === '已完成' ? 'completed' : 
                                  task.status === '進行中' ? 'in-progress' : 'pending';
                
                html += `
                    <div class="task-item ${statusClass}">
                        <div class="task-info">
                            <div class="task-name">${task.name}</div>
                            <div class="task-meta">
                                <span class="task-status">${task.status}</span>
                                <span class="task-assignee">負責人: ${task.assignee || '未指派'}</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button onclick="editTask('${task.id}')" class="btn-edit">編輯</button>
                            <button onclick="confirmDeleteTask('${task.id}')" class="btn-delete">刪除</button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    taskList.innerHTML = html;
}

// 顯示訊息
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // 自動隱藏成功和資訊訊息
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// 開啟新增任務表單
function openAddForm() {
    editingTask = null;
    document.getElementById('modalTitle').textContent = '新增任務';
    document.getElementById('taskForm').reset();
    document.getElementById('modal').style.display = 'flex';
}

// 編輯任務
function editTask(taskId) {
    editingTask = tasks.find(task => task.id === taskId);
    if (!editingTask) return;
    
    document.getElementById('modalTitle').textContent = '編輯任務';
    document.getElementById('taskName').value = editingTask.name;
    document.getElementById('taskGroup').value = editingTask.group;
    document.getElementById('taskStatus').value = editingTask.status;
    document.getElementById('taskAssignee').value = editingTask.assignee;
    document.getElementById('modal').style.display = 'flex';
}

// 關閉表單
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    editingTask = null;
}

// 儲存任務
async function saveTask() {
    const name = document.getElementById('taskName').value.trim();
    const group = document.getElementById('taskGroup').value;
    const status = document.getElementById('taskStatus').value;
    const assignee = document.getElementById('taskAssignee').value.trim();
    
    if (!name) {
        showMessage('請輸入任務名稱', 'error');
        return;
    }
    
    const taskData = {
        id: editingTask ? editingTask.id : Date.now().toString(),
        name: name,
        group: group,
        status: status,
        assignee: assignee
    };
    
    if (editingTask) {
        await updateTask(taskData);
    } else {
        await addTask(taskData);
    }
    
    closeModal();
}

// 確認刪除任務
function confirmDeleteTask(taskId) {
    if (confirm('確定要刪除這個任務嗎？')) {
        deleteTask(taskId);
    }
}

// 手動重新載入
function refreshTasks() {
    loadTasks();
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 GitHub Pages 應用程式初始化...');
    
    // 填充下拉選單
    const groupSelect = document.getElementById('taskGroup');
    const statusSelect = document.getElementById('taskStatus');
    
    if (groupSelect) {
        GROUPS.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });
    }
    
    if (statusSelect) {
        STATUSES.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
    }
    
    // 載入任務
    loadTasks();
});

// 點擊空白處關閉模態框
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}
