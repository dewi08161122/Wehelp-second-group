
// 設定首頁
const homePage = document.getElementById("homePage");
if (homePage){
    homePage.addEventListener("click", function() {
        window.location.href = "/";
    });
}

// 取得時間
async function getTime(time) {
    const get_time = document.querySelector(".get-time");
    if (get_time){
        get_time.textContent = String(time);
    }
}

const locationData = document.querySelector(".location-data");
getCityName();

// 取得city的名稱
async function getCityName() {
    const urlParams = new URLSearchParams(window.location.search);
    const cityName = urlParams.get("county");
    if (cityName !== undefined && cityName !== ""){
        getCityLocationInfo(cityName);
    }
}


async function getCityLocationInfo(name) {
    if (locationData){
        try{
            const url = `/api/airquality?county=${name}`;
            const response = await fetch(url, {method: "GET"});

            const data = await response.json();

            if (!response.ok || data.error !== undefined){
                const dataContainer = document.createElement("div");
                dataContainer.classList.add("data-container-nodata");
                dataContainer.textContent = "抱歉發生錯誤，請看其他縣市的資料，謝謝。";

                locationData.appendChild(dataContainer);
            }else{
                if (data.length !== 0){
                    getTime(data[0]["time"]);
                    createLocationObject(data);
                }else{
                    const dataContainer = document.createElement("div");
                    dataContainer.classList.add("data-container-nodata");
                    dataContainer.textContent = "抱歉，無相關資料做提供。";

                    locationData.appendChild(dataContainer);
                }
                
            }
        }catch{
            const dataContainer = document.createElement("div");
            dataContainer.classList.add("data-container-nodata");
            dataContainer.textContent = "抱歉發生錯誤，請看其他縣市的資料，謝謝。";

            locationData.appendChild(dataContainer);
        }
    }
};

async function createLocationObject(data) { 
    try{    
        for(let k=0; k<data.length; k++){
            const dataContainer = document.createElement("div");
            dataContainer.classList.add("data-container");
            if (locationData){
                locationData.appendChild(dataContainer);
            };

            const location = data[k]["location"];
            const airQuality = data[k]["airquality"];
            blockOne(location, airQuality, dataContainer);
            blockTwo(airQuality, dataContainer);
        }
        
    }catch{
        const dataContainer = document.createElement("div");
        dataContainer.classList.add("data-container-nodata");
        dataContainer.textContent = "抱歉發生錯誤，請看其他縣市的資料，謝謝。";

        locationData.appendChild(dataContainer);
    }
}

async function blockOne(location, airQuality, dataContainer) {
    // 第一區塊
    const dataBlockOne = document.createElement("div");
    dataBlockOne.classList.add("data-blockOne");
    // 文字部分
    const blockOneText = document.createElement("div");
    blockOneText.classList.add("blockOne-text");
    // location名稱
    const textLocationTitle = document.createElement("div");
    textLocationTitle.classList.add("text-location-title");
    const textNameStr = document.createElement("div");
    textNameStr.textContent = String(location);
    textLocationTitle.appendChild(textNameStr);
    // 其他location的資訊
    const textLocationAnother = document.createElement("div");
    textLocationAnother.classList.add("text-location-another");
    // 空氣狀態與粒子
    const anotherStatus = document.createElement("div");
    anotherStatus.classList.add("another-status");
    anotherStatus.textContent = String(airQuality["status"]);
    textLocationAnother.appendChild(anotherStatus);
    // 將文字部分組合
    blockOneText.appendChild(textLocationTitle);
    blockOneText.appendChild(textLocationAnother);

    // 圖的部分
    const blockOneChart = document.createElement("div");
    blockOneChart.classList.add("blockOne-chart");
    // SVG圖
    const svgNS = "http://www.w3.org/2000/svg";
    const chartCircle = document.createElementNS(svgNS, "svg");
    chartCircle.setAttribute("viewBox", "25 0 70 70");
    chartCircle.classList.add("chart-circular");
    // SVG圖形
    const circlePathOne = document.createElementNS(svgNS, "path");
    circlePathOne.classList.add("chart-track");
    circlePathOne.setAttribute("d", "M10 60 a 10 10 0 0 1 0 0 a 50 50 0 0 1 100 0");
    const circlePathTwo = document.createElementNS(svgNS, "path");
    circlePathTwo.classList.add("chart-slideRail");
    circlePathTwo.setAttribute("d", "M10 60 a 10 10 0 0 1 0 0 a 50 50 0 0 1 100 0");
    circlePathTwo.setAttribute("pathLength", "500");
    aqiColor(parseInt(airQuality["AQI"]), circlePathTwo);
    // const scope = ;
    circlePathTwo.style.strokeDasharray=`${String(airQuality["AQI"])}, 500`;
    chartCircle.appendChild(circlePathOne);
    chartCircle.appendChild(circlePathTwo);
    // 圖的文字
    const chartText = document.createElement("div");
    chartText.classList.add("chart-text");
    // 空氣品質文字
    const aqiText = document.createElement("div");
    aqiText.textContent = "AQI";
    const aqiValue = document.createElement("div");
    aqiValue.classList.add("chart-text-big");
    aqiValue.textContent = String(airQuality["AQI"]);
    chartText.appendChild(aqiText);
    chartText.appendChild(aqiValue);
    // 將SVG與AQI文字組合
    blockOneChart.appendChild(chartCircle);
    blockOneChart.appendChild(chartText);

    dataBlockOne.appendChild(blockOneText);
    dataBlockOne.appendChild(blockOneChart);

    dataContainer.appendChild(dataBlockOne);
}

// 選取AQI的顏色
function aqiColor(value, obj) {
    if (value >= 0 && value <= 50){
        obj.style.stroke = "#00d084";
    }else if (value >= 51 && value <= 100){
        obj.style.stroke = "#ffd93d";
    }else if (value >= 101 && value <= 150){
        obj.style.stroke = "#ff8c42";
    }else if (value >= 151 && value <= 200){
        obj.style.stroke = "#ff4757";
    }else if (value >= 201 && value <= 300){
        obj.style.stroke = "#a55eea";
    }else if (value >= 301 && value <= 500){
        obj.style.stroke = "#8b0000";
    }else{
        obj.style.stroke = "#000";
    }
}

async function blockTwo(airQuality, dataContainer) {
    const titleArr = ["PM2.5", "PM10", "O3", "CO", "SO", "NO2"];

    // 第二區塊
    const dataBlockTwo = document.createElement("div");
    dataBlockTwo.classList.add("data-blockTwo");

    // title
    for(let i = 0; i < titleArr.length; i++){
        const blockTwoDetail = document.createElement("div");
        blockTwoDetail.classList.add("blockTwo-detail");
        const detailContainer = document.createElement("div");
        detailContainer.classList.add("detail-container");

        const detailTitle = document.createElement("div");
        detailTitle.classList.add("detail-title");
        const detailContent = document.createElement("div");
        detailContent.classList.add("detail-content");
        if (i === 0){
            const bigTitle = document.createTextNode("PM");
            const subTag = document.createElement("sub");
            subTag.appendChild(document.createTextNode("2.5(μg/m"));
            const supTag = document.createElement("sup");
            supTag.textContent="3";
            subTag.appendChild(supTag);
            subTag.appendChild(document.createTextNode(")"));
            detailTitle.appendChild(bigTitle);
            detailTitle.appendChild(subTag);
        }

        if (i === 1){
            const bigTitle = document.createTextNode("PM");
            const subTag = document.createElement("sub");
            subTag.appendChild(document.createTextNode("10(μg/m"));
            const supTag = document.createElement("sup");
            supTag.textContent="3";
            subTag.appendChild(supTag);
            subTag.appendChild(document.createTextNode(")"));
            detailTitle.appendChild(bigTitle);
            detailTitle.appendChild(subTag);
        }

        if (i === 2){
            const bigTitle = document.createTextNode("O");
            const subTag = document.createElement("sub");
            subTag.textContent="3(ppb)";

            detailTitle.appendChild(bigTitle);
            detailTitle.appendChild(subTag);
        }

        if (i === 3){
            const bigTitle = document.createTextNode("CO");
            const subTag = document.createElement("sub");
            subTag.textContent="(ppm)";

            detailTitle.appendChild(bigTitle);
            detailTitle.appendChild(subTag);
        }

        if (i === 4){
            const bigTitle = document.createTextNode("SO");
            const subTag = document.createElement("sub");
            subTag.textContent="2(ppb)";

            detailTitle.appendChild(bigTitle);
            detailTitle.appendChild(subTag);
        }

        if (i === 5){
            const bigTitle = document.createTextNode("NO");
            const subTag = document.createElement("sub");
            subTag.textContent="2(ppb)";

            detailTitle.appendChild(bigTitle);
            detailTitle.appendChild(subTag);
        }

        if (i === 0 || i ===1){
            //數值
            const contentValueAvg = document.createElement("div");
            contentValueAvg.classList.add("content-value");
            if (i === 0){
                contentValueAvg.textContent=String(airQuality["pm2.5_avg"]);
            }else{
                contentValueAvg.textContent=String(airQuality["pm10_avg"]);
            }
            const contentValue = document.createElement("div");
            contentValue.classList.add("content-value");
            if (i === 0){
                contentValue.textContent=String(airQuality["pm2.5"]);
            }else{
                contentValue.textContent=String(airQuality["pm10"]);
            }
            
            // 文字
            const contentMeanAvg = document.createElement("div");
            contentMeanAvg.classList.add("content-mean");
            contentMeanAvg.textContent="移動平均";
            const contentMean = document.createElement("div");
            contentMean.classList.add("content-mean");
            contentMean.textContent= "小時濃度";
            detailContent.appendChild(contentValueAvg);
            detailContent.appendChild(contentValue);
            detailContent.appendChild(contentMeanAvg);
            detailContent.appendChild(contentMean);
        }

        if (i === 2 || i ===3){
            //數值
            const contentValueAvg = document.createElement("div");
            contentValueAvg.classList.add("content-value");
            if (i === 2){
                contentValueAvg.textContent=String(airQuality["o3_8hr"]);
            }else{
                contentValueAvg.textContent=String(airQuality["co_8hr"]);
            }
            const contentValue = document.createElement("div");
            contentValue.classList.add("content-value");
            if (i === 2){
                contentValue.textContent=String(airQuality["o3"]);
            }else{
                contentValue.textContent=String(airQuality["co"]);
            }

            // 文字
            const contentMeanAvg = document.createElement("div");
            contentMeanAvg.classList.add("content-mean");
            contentMeanAvg.textContent="8hr移動平均";
            const contentMean = document.createElement("div");
            contentMean.classList.add("content-mean");
            contentMean.textContent= "小時濃度";
            detailContent.appendChild(contentValueAvg);
            detailContent.appendChild(contentValue);
            detailContent.appendChild(contentMeanAvg);
            detailContent.appendChild(contentMean);
        }

        if (i === 4 || i === 5){
            detailContent.classList.add("only-value");
            //數值
            const contentValue = document.createElement("div");
            contentValue.classList.add("content-value");
            if (i === 4){
                contentValue.textContent=String(airQuality["so2"]);
            }else{
                contentValue.textContent=String(airQuality["no2"]);
            }

            // 文字
            const contentMean = document.createElement("div");
            contentMean.classList.add("content-mean");
            contentMean.textContent= "小時濃度";
            detailContent.appendChild(contentValue);
            detailContent.appendChild(contentMean);
        }

        detailContainer.appendChild(detailTitle);
        detailContainer.appendChild(detailContent);

        blockTwoDetail.appendChild(detailContainer);
        dataBlockTwo.appendChild(blockTwoDetail);
    };

    dataContainer.appendChild(dataBlockTwo);
}
