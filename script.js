// 烤肉準備工作區 - 全JSONP功能修正版
console.log('開始載入全JSONP功能版本...');

const API_URL = 'https://script.google.com/macros/s/AKfycbyXTnq2WLNIDVpHQIp-gtT-MXgT-dWjSKBNgcU6WA7TWP8-Rw6NKdQ1CxGJeWasQBTY/exec';

let allItems = [];

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

// 通用JSONP請求函數
function makeJSONPRequest(params, successCallback, errorCallback) {
    try {
        const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 創建全域回調函數
        window[callbackName] = function(data) {
            console.log('JSONP回應:', data);
            if (successCallback) successCallback(data);
            // 清理回調函數
            delete window[callbackName];
        };

        // 構建URL參數
        const urlParams = new URLSearchParams(params);
        urlParams.set('callback', callbackName);
        urlParams.set('t', Date.now());

        // 創建script標籤
        const script = document.createElement('script');
        script.src = API_URL + '?' + urlParams.toString();
        
        console.log('JSONP請求URL:', script.src);
        
        script.onerror = function() {
            console.error('JSONP請求失敗');
            if (errorCallback) errorCallback('JSONP請求失敗');
            delete window[callbackName];
        };

        document.head.appendChild(script);
        
        // 10秒後清理
        setTimeout(() => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            if (window[callbackName]) {
                delete window[callbackName];
                if (errorCallback) errorCallback('請求超時');
            }
        }, 10000);
        
    } catch (error) {
        console.error('JSONP請求錯誤:', error);
        if (errorCallback) errorCallback(error.message);
    }
}

// 載入資料
function loadData() {
    console.log('開始載入資料...');
    updateTestStatus('正在載入資料...');
    
    makeJSONPRequest(
        {}, // 空參數表示載入所有資料
        function(data) {
            console.log('資料載入成功:', data);
            allItems = data;
            showData(data);
            updateTestStatus(`成功載入 ${data.length} 個項目`);
        },
        function(error) {
            console.error('載入失敗:', error);
            updateTestStatus('載入失敗: ' + error);
        }
    );
}

// 顯示資料
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
            return;
        }

        // 正確的欄位映射
        const html = items.map(item => {
            const familyGroup = item.assignee || '未指定';
            const itemName = item.name || '未命名';
            const quantity = item.quantity || 1;
            const status = item.status || '待處理';
            
            return `
                <tr>
                    <td><span class="family-${familyGroup.replace(/\s+/g, '-')}">${familyGroup}</span></td>
                    <td>${itemName}</td>
                    <td>${quantity}</td>
                    <td><span class="status-${status.replace(/\s+/g, '-')}">${status}</span></td>
                    <td>
                        <button onclick="updateStatus('${item.id}', '進行中')" class="btn-sm btn-start">開始</button>
                        <button onclick="updateStatus('${item.id}', '已完成')" class="btn-sm btn-complete">完成</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        itemListElement.innerHTML = html;
        
    } catch (error) {
        console.error('顯示資料錯誤:', error);
        updateTestStatus('顯示錯誤: ' + error.message);
    }
}

// 新增項目 - 使用JSONP方式
function handleSubmit() {
    try {
        const itemName = document.getElementById('itemName').value.trim();
        const familyGroup = document.getElementById('familyGroup').value.trim();
        const quantity = document.getElementById('quantity').value.trim();

        if (!itemName || !familyGroup || !quantity) {
            alert('請填寫所有欄位');
            return;
        }

        updateTestStatus('正在新增項目...');

        // 使用JSONP方式發送新增請求
        const params = {
            action: 'add',
            name: itemName,
            assignee: familyGroup,
            group: '用戶新增',
            quantity: quantity,
            status: '待處理'
        };

        console.log('發送新增請求 (JSONP):', params);

        makeJSONPRequest(
            params,
            function(response) {
                console.log('新增成功回應:', response);
                
                // 清空表單
                document.getElementById('itemName').value = '';
                document.getElementById('familyGroup').value = '';
                document.getElementById('quantity').value = '1';

                // 重新載入資料
                updateTestStatus('項目新增成功，重新載入...');
                setTimeout(() => {
                    loadData();
                }, 1000);
            },
            function(error) {
                console.error('新增失敗:', error);
                alert('新增失敗: ' + error);
                updateTestStatus('新增失敗: ' + error);
            }
        );

    } catch (error) {
        console.error('新增項目錯誤:', error);
        alert('發生錯誤: ' + error.message);
        updateTestStatus('發生錯誤: ' + error.message);
    }
}

// 更新狀態 - 使用JSONP方式
function updateStatus(itemId, newStatus) {
    try {
        updateTestStatus('正在更新狀態...');

        const params = {
            action: 'update',
            id: itemId,
            status: newStatus
        };

        console.log('發送狀態更新請求 (JSONP):', params);

        makeJSONPRequest(
            params,
            function(response) {
                console.log('狀態更新成功:', response);
                updateTestStatus('狀態更新成功，重新載入...');
                setTimeout(() => {
                    loadData();
                }, 1000);
            },
            function(error) {
                console.error('狀態更新失敗:', error);
                alert('狀態更新失敗: ' + error);
                updateTestStatus('狀態更新失敗: ' + error);
            }
        );

    } catch (error) {
        console.error('更新狀態錯誤:', error);
        alert('發生錯誤: ' + error.message);
        updateTestStatus('發生錯誤: ' + error.message);
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
        statusElement.style.color = message.includes('失敗') || message.includes('錯誤') ? 'red' : 
                                   message.includes('成功') ? 'green' : 'blue';
    }
}

console.log('全JSONP功能版本載入完成');
