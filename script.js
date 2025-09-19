// GitHub Pages 專用版本 - 使用 JSONP 繞過 CORS
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwre3AkbB074ytIgapRxZAVJycKsrN0hmTWuy4eBg6NQl1GZrhBHtLMOM_fr6AOwGAw/exec';

let tasks = [];
let editingTask = null;

// 分組和狀態選項
const GROUPS = ['烤肉用具', '食材採購', '場地準備', '其他'];
const STATUSES = ['待處理', '進行中', '已完成'];

// JSONP 載入函數
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// 使用 JSONP 載入任務
async function fetchTasks() {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // 創建全域回調函數
        window[callbackName] = function(data) {
            delete window[callbackName];
            resolve(data);
        };
        
        // 載入 JSONP
        const script = document.createElement('script');
        script.src = GOOGLE_APPS_SCRIPT_URL + '?action=get&callback=' + callbackName;
        script.onerror = function() {
            delete window[callbackName];
            reject(new Error('JSONP 載入失敗'));
        };
        
        document.head.appendChild(script);
        
        // 清理 script 標籤
        setTimeout(() => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }, 1000);
    });
}

// 載入並顯示任務
async function loadTasks() {
    try {
        console.log('開始載入任務...');
        
        tasks = await fetchTasks();
        console.log('載入任務成功:', tasks);
        
        renderTasks();
        showMessage('數據載入成功！', 'success');
    } catch (error) {
        console.error('載入任務失敗:', error);
        showMessage('載入數據失敗，請檢查網路連線或配置', 'error');
    }
}

// 使用 img 標籤進行寫操作（簡單的 GET 請求技巧）
async function sendWriteRequest(data) {
    return new Promise((resolve, reject) => {
        // 對於寫操作，我們仍然需要使用 fetch，但先嘗試
        fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'no-cors' // 這會讓請求發送但無法讀取回應
        }).then(() => {
            // 寫操作發送成功，重新載入數據來確認
            setTimeout(() => {
                loadTasks().then(() => resolve({ success: true }));
            }, 1000);
        }).catch(reject);
    });
}

// 新增任務
async function addTask(task) {
    try {
        console.log('新增任務:', task);
        
        await sendWriteRequest({
            action: 'add',
            task: task
        });
        
        showMessage('任務新增成功！', 'success');
    } catch (error) {
        console.error('新增任務失敗:', error);
        showMessage('新增任務失敗', 'error');
    }
}

// 更新任務
async function updateTask(task) {
    try {
        console.log('更新任務:', task);
        
        await sendWriteRequest({
            action: 'update',
            task: task
        });
        
        showMessage('任務更新成功！', 'success');
    } catch (error) {
        console.error('更新任務失敗:', error);
        showMessage('更新任務失敗', 'error');
    }
}

// 刪除任務
async function deleteTask(taskId) {
    try {
        console.log('刪除任務:', taskId);
        
        await sendWriteRequest({
            action: 'delete',
            taskId: taskId
        });
        
        showMessage('任務刪除成功！', 'success');
    } catch (error) {
        console.error('刪除任務失敗:', error);
        showMessage('刪除任務失敗', 'error');
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
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
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

// 初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    // 填充下拉選單
    const groupSelect = document.getElementById('taskGroup');
    const statusSelect = document.getElementById('taskStatus');
    
    GROUPS.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
    });
    
    STATUSES.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
    
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
