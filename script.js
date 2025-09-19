// 數據存儲
let itemData = [
    // 郭家準備（海鮮類、雞、包肉菜葉）
    {
        id: 1,
        groupName: "郭家",
        itemName: "玉筍草蝦",
        quantity: "12尾",
        status: "incomplete"
    },
    {
        id: 2,
        groupName: "郭家",
        itemName: "活生蝦",
        quantity: "15隻",
        status: "incomplete"
    },
    {
        id: 3,
        groupName: "郭家",
        itemName: "雞胸",
        quantity: "15片",
        status: "incomplete"
    },
    {
        id: 4,
        groupName: "郭家",
        itemName: "牛肉",
        quantity: "1份",
        status: "incomplete"
    },
    {
        id: 5,
        groupName: "郭家",
        itemName: "豬肉",
        quantity: "2盒",
        status: "incomplete"
    },
    {
        id: 6,
        groupName: "郭家",
        itemName: "肥腸鮮蝦",
        quantity: "2隻",
        status: "incomplete"
    },
    {
        id: 7,
        groupName: "郭家",
        itemName: "蠔蛋主菜",
        quantity: "2包",
        status: "incomplete"
    },
    {
        id: 8,
        groupName: "郭家",
        itemName: "蠔青菜",
        quantity: "28片",
        status: "incomplete"
    },
    {
        id: 9,
        groupName: "郭家",
        itemName: "青菜",
        quantity: "1包",
        status: "incomplete"
    },
    {
        id: 10,
        groupName: "郭家",
        itemName: "青豆",
        quantity: "2罐",
        status: "incomplete"
    },
    {
        id: 11,
        groupName: "郭家",
        itemName: "木炭",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 12,
        groupName: "郭家",
        itemName: "塑膠杯",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 13,
        groupName: "郭家",
        itemName: "烤肉用具",
        quantity: "1組",
        status: "incomplete"
    },
    {
        id: 14,
        groupName: "郭家",
        itemName: "肉包/蛋汁",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 15,
        groupName: "郭家",
        itemName: "百穀",
        quantity: "適量",
        status: "incomplete"
    },
    
    // 哥家準備（牛羊豬）
    {
        id: 16,
        groupName: "哥家",
        itemName: "好市多牛小排",
        quantity: "3盒",
        status: "incomplete"
    },
    {
        id: 17,
        groupName: "哥家",
        itemName: "好市多羊小排",
        quantity: "1盒",
        status: "incomplete"
    },
    {
        id: 18,
        groupName: "哥家",
        itemName: "好市多松阪豬切片",
        quantity: "2盒",
        status: "incomplete"
    },
    {
        id: 19,
        groupName: "哥家",
        itemName: "白豆",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 20,
        groupName: "哥家",
        itemName: "紅豆",
        quantity: "1包",
        status: "incomplete"
    },
    {
        id: 21,
        groupName: "哥家",
        itemName: "蠔汁泡菜",
        quantity: "2盒",
        status: "incomplete"
    },
    {
        id: 22,
        groupName: "哥家",
        itemName: "塑膠湯匙",
        quantity: "適量",
        status: "incomplete"
    },
    
    // 翁家準備（飲料、水果、食器）
    {
        id: 23,
        groupName: "翁家",
        itemName: "香茅雞湯",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 24,
        groupName: "翁家",
        itemName: "紅茶湯包",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 25,
        groupName: "翁家",
        itemName: "杯子",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 26,
        groupName: "翁家",
        itemName: "音樂設備",
        quantity: "1組",
        status: "incomplete"
    },
    {
        id: 27,
        groupName: "翁家",
        itemName: "打火機",
        quantity: "數個",
        status: "incomplete"
    },
    {
        id: 28,
        groupName: "翁家",
        itemName: "音響接駁",
        quantity: "1組",
        status: "incomplete"
    },
    {
        id: 29,
        groupName: "翁家",
        itemName: "紙盤",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 30,
        groupName: "翁家",
        itemName: "濕巾",
        quantity: "數包",
        status: "incomplete"
    },
    {
        id: 31,
        groupName: "翁家",
        itemName: "衛生紙",
        quantity: "數包",
        status: "incomplete"
    },
    {
        id: 32,
        groupName: "翁家",
        itemName: "Asahi SUPER DRY啤酒",
        quantity: "金罐裝",
        status: "incomplete"
    },
    {
        id: 33,
        groupName: "翁家",
        itemName: "可樂果汁",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 34,
        groupName: "翁家",
        itemName: "花椰大烤肉醬",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 35,
        groupName: "翁家",
        itemName: "蒜泥",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 36,
        groupName: "翁家",
        itemName: "香茅調料",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 37,
        groupName: "翁家",
        itemName: "檸檬水和肉湯",
        quantity: "適量",
        status: "incomplete"
    },
    {
        id: 38,
        groupName: "翁家",
        itemName: "汽水果汁",
        quantity: "適量",
        status: "incomplete"
    }
];

let currentId = 39;
let editingId = null;

// DOM 元素
const tableBody = document.getElementById('tableBody');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('addBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const meetingForm = document.getElementById('meetingForm');
const modalTitle = document.getElementById('modalTitle');
const statusFilter = document.getElementById('statusFilter');
const groupFilter = document.getElementById('groupFilter');



// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    bindEvents();
});

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
}



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
    const item = itemData.find(data => data.id === id);
    if (!item) return;
    
    editingId = id;
    modalTitle.textContent = '⚙️ 編輯烤肉項目';
    
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

// 處理表單提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(meetingForm);
    const newItem = {
        groupName: formData.get('groupName').trim(),
        itemName: formData.get('itemName').trim(),
        quantity: formData.get('quantity').trim(),
        status: formData.get('status')
    };
    
    // 驗證必填欄位
    if (!newItem.groupName || !newItem.itemName || !newItem.quantity) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    if (editingId) {
        // 編輯現有項目
        const index = itemData.findIndex(item => item.id === editingId);
        if (index !== -1) {
            itemData[index] = { ...newItem, id: editingId };
            showNotification('🍖 烤肉項目已更新！', 'success');
        }
    } else {
        // 新增項目
        newItem.id = currentId++;
        itemData.push(newItem);
        showNotification('🎉 烤肉項目已新增！', 'success');
    }
    
    renderTable();
    closeModal();
}

// 切換狀態
function toggleStatus(id) {
    const item = itemData.find(data => data.id === id);
    if (item) {
        item.status = item.status === 'completed' ? 'incomplete' : 'completed';
        const statusText = item.status === 'completed' ? '已完成' : '未完成';
        showNotification(`狀態已更新為：${statusText}`, 'info');
        renderTable();
    }
}

// 刪除項目
function deleteItem(id) {
    if (confirm('確定要刪除這個烤肉項目嗎？')) {
        const index = itemData.findIndex(item => item.id === id);
        if (index !== -1) {
            itemData.splice(index, 1);
            showNotification('🗑️ 烤肉項目已刪除！', 'error');
            renderTable();
        }
    }
}

// 顯示通知
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // 添加通知樣式（如果還沒有）
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
            }
            
            .notification-success {
                background: #28a745;
            }
            
            .notification-error {
                background: #dc3545;
            }
            
            .notification-info {
                background: #17a2b8;
            }
            
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 15px;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 3秒後自動移除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

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

// 自動保存到 localStorage
function saveToLocalStorage() {
    localStorage.setItem('itemData', JSON.stringify(itemData));
    localStorage.setItem('currentId', currentId.toString());
}

// 從 localStorage 載入數據
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('itemData');
    const savedId = localStorage.getItem('currentId');
    
    if (savedData) {
        itemData = JSON.parse(savedData);
    }
    
    if (savedId) {
        currentId = parseInt(savedId);
    }
}

// 在數據變更時自動保存
const originalPush = itemData.push;
const originalSplice = itemData.splice;

// 重寫 push 方法
Object.defineProperty(itemData, 'push', {
    value: function(...args) {
        const result = originalPush.apply(this, args);
        saveToLocalStorage();
        return result;
    }
});

// 監聽數據變更
function updateItemData() {
    saveToLocalStorage();
}

// 在頁面載入時從 localStorage 載入數據
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderTable();
});

// 在每次操作後保存數據
const originalToggleStatus = toggleStatus;
const originalDeleteItem = deleteItem;
const originalHandleFormSubmit = handleFormSubmit;

toggleStatus = function(id) {
    originalToggleStatus(id);
    saveToLocalStorage();
};

deleteItem = function(id) {
    originalDeleteItem(id);
    saveToLocalStorage();
};

handleFormSubmit = function(event) {
    originalHandleFormSubmit(event);
    saveToLocalStorage();
};
