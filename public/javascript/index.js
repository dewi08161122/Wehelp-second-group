// 台灣所有縣市列表
const counties = [
    '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣',
    '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市',
    '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣',
    '臺東縣', '澎湖縣', '金門縣', '連江縣'
];

// AQI 狀態判斷函數
function getAQIStatus(aqi) {
    if (aqi <= 50) return { status: '良好', class: 'good' };
    if (aqi <= 100) return { status: '普通', class: 'moderate' };
    if (aqi <= 150) return { status: '對敏感族群不健康', class: 'sensitive' };
    if (aqi <= 200) return { status: '對所有族群不健康', class: 'unhealthy' };
    if (aqi <= 300) return { status: '非常不健康', class: 'very-unhealthy' };
    return { status: '危害', class: 'hazardous' };
}

// 獲取單一縣市的空氣品質資料
async function fetchCountyAirQuality(county) {
    try {
        const response = await fetch(`/api/airquality?county=${encodeURIComponent(county)}`);
        const data = await response.json();
        
        if (data.error) {
            console.error(`無法取得 ${county} 的資料:`, data.message);
            return null;
        }
        
        // 取第一個測站資料
        if (data && data.length > 0) {
            return {
                county: county,
                station: data[0]
            };
        }
        return null;
    } catch (error) {
        console.error(`取得 ${county} 資料時發生錯誤:`, error);
        return null;
    }
}

// 創建縣市卡片 HTML
function createCountyCard(countyData) {
    if (!countyData || !countyData.station) return '';
    
    const station = countyData.station;
    const aqi = station.airquality?.AQI || 0;
    const aqiInfo = getAQIStatus(aqi);
    const siteName = station.location || '未知測站';
    
    return `
        <div class="county-card ${aqiInfo.class}" onclick="goToCityPage('${countyData.county}')">
            <div class="county-header">
                <div class="county-badge">一般站</div>
                <h3 class="county-name">${countyData.county}</h3>
                <p class="station-name">${siteName}</p>
            </div>
            
            <div class="aqi-display">
                <div class="aqi-value">${aqi}</div>
                <div class="aqi-status">${aqiInfo.status}</div>
            </div>
            
            <div class="pollutant-grid">
                <div class="pollutant-item">
                    <div class="pollutant-label">PM2.5</div>
                    <div class="pollutant-value">${station.airquality?.['pm2.5'] ?? 'N/A'}</div>
                    <div class="pollutant-unit">μg/m³</div>
                </div>
                
                <div class="pollutant-item">
                    <div class="pollutant-label">PM10</div>
                    <div class="pollutant-value">${station.airquality?.pm10 ?? 'N/A'}</div>
                    <div class="pollutant-unit">μg/m³</div>
                </div>
                
                <div class="pollutant-item">
                    <div class="pollutant-label">O3</div>
                    <div class="pollutant-value">${station.airquality?.o3 ?? 'N/A'}</div>
                    <div class="pollutant-unit">ppb</div>
                </div>
                
                <div class="pollutant-item">
                    <div class="pollutant-label">CO</div>
                    <div class="pollutant-value">${station.airquality?.co ?? 'N/A'}</div>
                    <div class="pollutant-unit">ppm</div>
                </div>
            </div>
            
            <div class="update-time">
                更新時間：${station.time || 'N/A'}
            </div>
        </div>
    `;
}

// 跳轉到縣市詳細頁面
function goToCityPage(county) {
    // 將縣市名稱作為 URL 參數傳遞給 city.html
    window.location.href = `/city?county=${encodeURIComponent(county)}`;
}

// 顯示載入中狀態
function showLoading() {
    const container = document.querySelector('.air_quality_main_data');
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>載入中，請稍候...</p>
        </div>
    `;
}

// 載入所有縣市資料
async function loadAllCountiesData() {
    showLoading();
    
    const container = document.querySelector('.air_quality_main_data');
    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = '各縣市空氣品質';
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'county-cards-grid';
    
    // 並行請求所有縣市的資料
    const promises = counties.map(county => fetchCountyAirQuality(county));
    const results = await Promise.all(promises);
    
    // 過濾掉無效資料並渲染
    const validResults = results.filter(result => result !== null);
    
    if (validResults.length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <p>⚠️ 目前無法載入空氣品質資料，請稍後再試</p>
            </div>
        `;
        return;
    }
    
    // 將所有縣市卡片渲染到頁面
    validResults.forEach(countyData => {
        const cardHTML = createCountyCard(countyData);
        cardsContainer.innerHTML += cardHTML;
    });
    
    container.innerHTML = '';
    container.appendChild(title);
    container.appendChild(cardsContainer);
}

// 更新統計數字
async function updateStatistics() {
    try {
        const response = await fetch('/api/airquality');
        const data = await response.json();
        
        if (!data.error && data.length > 0) {
            // 更新監測站點數量
            const checkSpotsDiv = document.querySelector('.check_spots div:first-child');
            if (checkSpotsDiv) {
                checkSpotsDiv.textContent = data.length;
            }
        }
    } catch (error) {
        console.error('更新統計數字時發生錯誤:', error);
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 載入所有縣市資料
    loadAllCountiesData();
    
    // 更新統計數字
    updateStatistics();
    
    // 每 10 分鐘自動更新一次資料
    setInterval(() => {
        loadAllCountiesData();
        updateStatistics();
    }, 600000);
});