// 台灣所有縣市列表
const counties = [
    '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣',
    '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市',
    '嘉義縣', '臺南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣',
    '臺東縣', '澎湖縣', '金門縣', '連江縣'
];

// 安全取值
function safeGet(obj, path, defaultValue = 'N/A') {
    try {
        let keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return defaultValue;
            }
        }
        return result !== null && result !== undefined && result !== '' ? result : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}
// 針對帶點的屬性的安全取值
function safeGetPollutant(obj, airqualityKey, defaultValue = 'N/A') {
    try {
        if (obj && obj.airquality && airqualityKey in obj.airquality) {
            const value = obj.airquality[airqualityKey];
            return value !== null && value !== undefined && value !== '' ? value : defaultValue;
        }
        return defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

// AQI 狀態判斷
function getAQIStatus(aqi) {
    let numAqi = parseInt(aqi) || 0;
    if (numAqi <= 50) return { status: '良好', class: 'good' };
    if (numAqi <= 100) return { status: '普通', class: 'moderate' };
    if (numAqi <= 150) return { status: '對敏感族群不健康', class: 'sensitive' };
    if (numAqi <= 200) return { status: '對所有族群不健康', class: 'unhealthy' };
    if (numAqi <= 300) return { status: '非常不健康', class: 'very-unhealthy' };
    return { status: '危害', class: 'hazardous' };
}

// get單一縣市的空氣品質資料
async function fetchCountyAirQuality(county) {
    try {
        const response = await fetch(`/api/airquality?county=${encodeURIComponent(county)}`);
        
        if (!response.ok) {
            console.error(`${county} - HTTP 錯誤: ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error(`${county} - API 錯誤:`, data.message);
            return null;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
            console.warn(`${county} - 沒有資料`);
            return null;
        }
        
        return {
            county: county,
            station: data[0]
        };
        
    } catch (error) {
        console.error(`${county} - 發生錯誤:`, error);
        return null;
    }
}

// create縣市卡片 HTML
function createCountyCard(countyData) {
    try {
        if (!countyData || !countyData.station) return '';
        
        let station = countyData.station;
        let city = safeGet(station, 'city', countyData.county);
        let location = safeGet(station, 'location', '未知測站');
        let aqi = safeGet(station, 'airquality.AQI', '0');
        let status = safeGet(station, 'airquality.status', '未知');
        let pm25=safeGetPollutant(station, 'pm2.5');
        let pm10 = safeGet(station, 'airquality.pm10');
        let o3 = safeGet(station, 'airquality.o3');
        let co = safeGet(station, 'airquality.co');
        let time = safeGet(station, 'time', '未知時間');
        
        let aqiInfo = getAQIStatus(aqi);
        
        return `
            <div class="county-card ${aqiInfo.class}" onclick="goToCityPage('${city}')">
                <div class="county-header">
                    <div class="county-badge">一般站</div>
                    <h3 class="county-name">${city}</h3>
                    <p class="station-name">${location}</p>
                </div>
                
                <div class="aqi-display">
                    <div class="aqi-value">${aqi}</div>
                    <div class="aqi-status">${status}</div>
                </div>
                
                <div class="pollutant-grid">
                    <div class="pollutant-item">
                        <div class="pollutant-label">PM2.5</div>
                        <div class="pollutant-value">${pm25}</div>
                        <div class="pollutant-unit">μg/m³</div>
                    </div>
                    
                    <div class="pollutant-item">
                        <div class="pollutant-label">PM10</div>
                        <div class="pollutant-value">${pm10}</div>
                        <div class="pollutant-unit">μg/m³</div>
                    </div>
                    
                    <div class="pollutant-item">
                        <div class="pollutant-label">O3</div>
                        <div class="pollutant-value">${o3}</div>
                        <div class="pollutant-unit">ppb</div>
                    </div>
                    
                    <div class="pollutant-item">
                        <div class="pollutant-label">CO</div>
                        <div class="pollutant-value">${co}</div>
                        <div class="pollutant-unit">ppm</div>
                    </div>
                </div>
                
                <div class="update-time">
                    更新時間：${time}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('建立卡片時發生錯誤:', error);
        return '';
    }
}

// 跳轉到city.html
function goToCityPage(county) {
    window.location.href = `/city?county=${encodeURIComponent(county)}`;
}

// 顯示載入中狀態
function showLoading() {
    let container = document.querySelector('.air_quality_main_data');
    if (container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>載入中，請稍候...</p>
            </div>
        `;
    }
}

// 載入所有縣市資料
async function loadAllCountiesData() {
    console.log('開始載入所有縣市資料...');
    showLoading();
    
    let container = document.querySelector('.air_quality_main_data');
    if (!container) {
        console.error('找不到容器元素');
        return;
    }
    
    try {

        let promises = counties.map(county => fetchCountyAirQuality(county));
        let results = await Promise.all(promises);
        let validResults = results.filter(result => result !== null);
        
        console.log(`成功取得 ${validResults.length}/${counties.length} 個縣市的資料`);
        
        if (validResults.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <p>⚠️ 目前無法載入空氣品質資料，請稍後再試</p>
                </div>
            `;
            return;
        }
        
        let title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = '各縣市空氣品質';
        
        // 建立卡片容器
        let cardsContainer = document.createElement('div');
        cardsContainer.className = 'county-cards-grid';
        
        // 將所有縣市卡片渲染到頁面
        validResults.forEach(countyData => {
            let cardHTML = createCountyCard(countyData);
            if (cardHTML) {
                cardsContainer.innerHTML += cardHTML;
            }
        });
        
        container.innerHTML = '';
        container.appendChild(title);
        container.appendChild(cardsContainer);
        
        console.log('所有縣市卡片建立完成！');
        
    } catch (error) {
        console.error('載入資料時發生錯誤:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>載入資料時發生錯誤</p>
            </div>
        `;
    }
}

// 更新統計數字
async function updateStatistics() {
    try {
        let response = await fetch('/api/airquality');
        
        if (!response.ok) return;
        
        let data = await response.json();
        
        if (!data.error && Array.isArray(data) && data.length > 0) {
            let checkSpotsDiv = document.querySelector('.check_spots div:first-child');
            if (checkSpotsDiv) {
                checkSpotsDiv.textContent = data.length;
            }
        }
    } catch (error) {
        console.warn('更新統計數字失敗:', error);
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    console.log('頁面載入完成，開始初始化...');
    
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