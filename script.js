// 烤肉準備工作區 - 正確欄位映射版本
console.log('開始載入正確映射版本腳本...');

const API_URL = 'https://script.google.com/macros/s/AKfycbyXTnq2WLNIDVpHQIp-gtT-MXgT-dWjSKBNgcU6WA7TWP8-Rw6NKdQ1CxGJeWasQBTY/exec';

let allItems = []; // 儲存所有項目

// 等待頁面完全載入
window.addEventListener('load', function() {
    console.log('頁面載入完成，開始初始化...');
    init();
});

function init() {
    try {
        console.log('開始初始化應用程式...');
        loadData();
        console.log('初始化完成');
    } catch (error) {
        console.error('初始化錯誤:', error);
    }
}

// 使用 JSONP 載入資料
function loadData() {
    console.log('開始載入資料...');
    updateTestStatus('正在載入資料...');
    
    try {
        // 創建回調函數
        const callbackName = 'callback_' + Date.now();
        window[callbackName] = function(data) {
            console.log('資料載入成功:', data);
            allItems = data;
            showData(data);
            // 清理回調函數
            delete window[callbackName];
        };

        // 創建 script 標籤
        const script = document.createElement('script');
        script.src = API_URL + '?callback=' + callbackName + '&t=' + Date.now();
        
        script.onerror = function() {
            console.error('載入失敗');
            updateTestStatus('載入失敗，請檢查網路連線');
        };

        document.head.appendChild(script);
        
        // 5秒後清理
        setTimeout(() => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }, 5000);
        
    } catch (error) {
        console.error('載入資料錯誤:', error);
        updateTestStatus('載入錯誤: ' + error.message);
    }
}

// 顯示資料 - 正確的欄位映射
function showData(items) {
    try {
        console.log('開始顯示資料，項目數量:', items.length);
        
        const itemListElement = document.getElementById('itemList');
        if (!itemListElement) {
            console.error('找不到 itemList 元素');
            return;
        }

        if (items.length === 0) {
            itemListElement.innerHTML = '<tr><td colspan="5" style="text-align: center;">暫無資料</td></tr>';
            updateTestStatus('無資料');
            return;
        }

        // 正確的欄位映射
        const html = items.map(item => {
            const familyGroup = item.assignee || '未指定'; // assignee 是真正的家庭分組
            const itemName = item.name || '未命名';
            const quantity = item.quantity || 1; // 如果沒有數量欄位，預設為1
            const status = item.status || '待處理';
            
            return `
                <tr>
                    <td><span class="family-${familyGroup.replace(/\s+/g, '-')}">${familyGroup}</span></td>
                    <td>${itemName}</td>
                    <td>${quantity}</td>
                    <td><span class="status-${status.replace(/\s+/g, '-')}">${status}</span></td>
                    <td>
                        <button onclick="updateStatus('${item.id}', '進行中')" class="btn-sm">開始</button>
                        <button onclick="updateStatus('${item.id}', '已完成')" class="btn-sm">完成</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        itemListElement.innerHTML = html;
        updateTestStatus(`成功載入 ${items.length} 個項目`);
        
    } catch (error) {
        console.error('顯示資料錯誤:', error);
        updateTestStatus('顯示錯誤: ' + error.message);
    }
}

// 新增項目
async function handleSubmit() {
    try {
        const itemName = document.getElementById('itemName').value.trim();
        const familyGroup = document.getElementById('familyGroup').value.trim();
        const quantity = document.getElementById('quantity').value.trim();

        if (!itemName || !familyGroup || !quantity) {
            alert('請填寫所有欄位');
            return;
        }

        updateTestStatus('正在新增項目...');

        // 發送到後端的資料格式
        const postData = {
            action: 'add',
            name: itemName,           // 項目名稱
            assignee: familyGroup,    // 家庭分組（對應後端的assignee）
            group: '用戶新增',        // 物品分類（後端需要）
            quantity: parseInt(quantity), // 數量
            status: '待處理'
        };

        console.log('發送新增請求:', postData);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.text();
        console.log('新增回應:', result);

        // 清空表單
        document.getElementById('itemName').value = '';
        document.getElementById('familyGroup').value = '';
        document.getElementById('quantity').value = '1';

        // 重新載入資料
        await loadData();
        updateTestStatus('項目新增成功！');

    } catch (error) {
        console.error('新增失敗:', error);
        alert('新增失敗: ' + error.message);
        updateTestStatus('新增失敗: ' + error.message);
    }
}

// 更新狀態
async function updateStatus(itemId, newStatus) {
    try {
        updateTestStatus('正在更新狀態...');

        const postData = {
            action: 'update',
            id: itemId,
            status: newStatus
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        await loadData();
        updateTestStatus('狀態更新成功！');

    } catch (error) {
        console.error('更新失敗:', error);
        alert('更新失敗: ' + error.message);
        updateTestStatus('更新失敗: ' + error.message);
    }
}

// 篩選功能
function filterItems() {
    try {
        const filterFamily = document.getElementById('filterFamily').value;
        const filterStatus = document.getElementById('filterStatus').value;

        let filteredItems = allItems.filter(item => {
            const familyMatch = !filterFamily || item.assignee === filterFamily;
            const statusMatch = !filterStatus || item.status === filterStatus;
            return familyMatch && statusMatch;
        });

        showData(filteredItems);
        updateTestStatus(`篩選結果: ${filteredItems.length} 個項目`);

    } catch (error) {
        console.error('篩選失敗:', error);
    }
}

// 更新測試狀態
function updateTestStatus(message) {
    console.log('狀態:', message);
    const statusElement = document.getElementById('testStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = message.includes('失敗') || message.includes('錯誤') ? 'red' : 'green';
    }
}

console.log('正確映射版本腳本載入完成');
