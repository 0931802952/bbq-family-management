// 烤肉準備工作區 - 正確欄位版本
console.log('開始載入正確欄位版本腳本...');

const API_URL = 'https://script.google.com/macros/s/AKfycbyXTnq2WLNIDVpHQIp-gtT-MXgT-dWjSKBNgcU6WA7TWP8-Rw6NKdQ1CxGJeWasQBTY/exec';

// 等待頁面完全載入
window.addEventListener('load', function() {
    console.log('頁面載入完成，開始初始化...');
    init();
});

function init() {
    try {
        console.log('開始初始化應用程式...');
        
        // 載入資料
        loadData();
        
        console.log('初始化完成');
    } catch (error) {
        console.error('初始化錯誤:', error);
    }
}

// 使用 JSONP 載入資料
function loadData() {
    console.log('開始載入資料...');
    
    try {
        // 創建回調函數
        const callbackName = 'callback_' + Date.now();
        window[callbackName] = function(data) {
            console.log('資料載入成功:', data);
            console.log('檢查第一個項目的欄位:', data[0]);
            showData(data);
            // 清理回調函數
            delete window[callbackName];
        };

        // 創建 script 標籤
        const script = document.createElement('script');
        script.src = API_URL + '?callback=' + callbackName + '&t=' + Date.now();
        
        script.onerror = function() {
            console.error('載入失敗');
            alert('載入資料失敗，請檢查網路連線');
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
        alert('發生錯誤: ' + error.message);
    }
}

// 顯示資料 - 使用正確的欄位：家庭分組、項目名稱、數量、狀態
function showData(items) {
    try {
        console.log('開始顯示資料...');
        console.log('接收到的項目資料:', items);
        
        // 檢查第一個項目的所有欄位
        if (items && items.length > 0) {
            console.log('第一個項目的所有欄位:', Object.keys(items[0]));
        }
        
        // 檢查是否有項目列表元素
        const itemListElement = document.getElementById('itemList');
        if (!itemListElement) {
            console.error('找不到 itemList 元素');
            
            // 嘗試在頁面上顯示資料
            const body = document.body;
            const div = document.createElement('div');
            div.innerHTML = `
                <h3>項目資料載入成功！</h3>
                <p>共載入 ${items.length} 個項目</p>
                <h4>欄位檢查：</h4>
                <pre>${JSON.stringify(items, null, 2)}</pre>
            `;
            body.appendChild(div);
            return;
        }

        // 顯示項目 - 使用正確的欄位映射
        if (items.length === 0) {
            itemListElement.innerHTML = '<tr><td colspan="5">暫無資料</td></tr>';
        } else {
            const html = items.map(item => {
                // 列印每個項目的欄位，幫助調試
                console.log('處理項目:', item);
                
                // 支援多種可能的欄位名稱
                const familyGroup = item.familyGroup || item.family || item.group || item.assignee || '';
                const itemName = item.itemName || item.name || item.title || '';
                const quantity = item.quantity || item.amount || item.count || '1';
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
        }
        
        console.log('資料顯示完成');
        
        // 更新測試狀態
        updateTestStatus(`成功載入 ${items.length} 個項目`);
        
    } catch (error) {
        console.error('顯示資料錯誤:', error);
        alert('顯示資料失敗: ' + error.message);
    }
}

// 新增項目 - 使用正確的欄位：家庭分組、項目名稱、數量、狀態
async function handleSubmit() {
    try {
        console.log('開始處理表單提交...');
        
        const itemName = document.getElementById('itemName');
        const familyGroup = document.getElementById('familyGroup');
        const quantity = document.getElementById('quantity');

        if (!itemName || !familyGroup || !quantity) {
            alert('找不到表單元素');
            return;
        }

        const name = itemName.value.trim();
        const family = familyGroup.value.trim();
        const qty = quantity.value.trim();

        if (!name || !family || !qty) {
            alert('請填寫所有欄位');
            return;
        }

        console.log('準備發送的資料:', { name, family, qty });
        updateTestStatus('正在新增項目...');

        // 使用與GAS後端完全一致的欄位名稱
        const postData = {
            action: 'add',
            itemName: name,        // 項目名稱
            familyGroup: family,   // 家庭分組（可能GAS中是group或assignee）
            name: name,           // 備用欄位名稱
            group: family,        // 備用欄位名稱  
            assignee: family,     // 備用欄位名稱
            quantity: parseInt(qty), // 數量
            status: '待處理'       // 預設狀態
        };

        console.log('發送 POST 請求，資料:', postData);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        console.log('POST 回應狀態:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.text();
        console.log('新增項目回應:', result);

        // 清空表單
        itemName.value = '';
        familyGroup.value = '';
        quantity.value = '1';

        // 重新載入項目
        updateTestStatus('項目新增成功，重新載入資料...');
        await loadData();
        
        updateTestStatus('項目新增完成！');

    } catch (error) {
        console.error('新增項目失敗:', error);
        alert('新增項目失敗: ' + error.message);
        updateTestStatus('新增項目失敗: ' + error.message);
    }
}

// 更新項目狀態
async function updateStatus(itemId, newStatus) {
    try {
        console.log('更新項目狀態:', itemId, newStatus);
        updateTestStatus('正在更新狀態...');

        // 使用與GAS後端完全一致的欄位名稱
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
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 重新載入項目
        await loadData();
        updateTestStatus('狀態更新成功！');

    } catch (error) {
        console.error('更新狀態失敗:', error);
        alert('更新狀態失敗: ' + error.message);
        updateTestStatus('更新狀態失敗: ' + error.message);
    }
}

// 更新測試狀態
function updateTestStatus(message) {
    console.log('狀態更新:', message);
    const statusElement = document.getElementById('testStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// 篩選功能
function filterItems() {
    try {
        const filterFamily = document.getElementById('filterFamily');
        const filterStatus = document.getElementById('filterStatus');
        
        if (!filterFamily || !filterStatus) {
            console.error('找不到篩選器元素');
            return;
        }

        console.log('篩選功能開發中，選擇的家庭:', filterFamily.value, '狀態:', filterStatus.value);
        
        // TODO: 實現篩選邏輯
        updateTestStatus('篩選功能開發中...');

    } catch (error) {
        console.error('篩選失敗:', error);
    }
}

console.log('正確欄位版本腳本載入完成');