import http from 'k6/http'; // 從 k6 模組中導入 http 函數，用於發送 HTTP 請求。
import { sleep } from 'k6'; // 從 k6 模組中導入 sleep 函數，用於模擬虛擬使用者的等待時間。

export let options = { // 定義 k6 測試的配置選項。
    stages: [ // 定義測試的階段，每個階段有不同的持續時間和目標虛擬使用者數量。
        { duration: '30s', target: 20 }, // 在 30 秒內逐漸增加到 20 個虛擬使用者。
        { duration: '1m', target: 20 },  // 保持 20 個虛擬使用者運行 1 分鐘。
        { duration: '30s', target: 0 },  // 在 30 秒內逐漸減少到 0 個虛擬使用者。
    ],
};

export default function () { // 定義虛擬使用者在測試期間執行的主要函數。
    http.get('http://localhost:3000'); // 發送一個 GET 請求到指定的 URL。
    sleep(1); // 讓虛擬使用者等待 1 秒，模擬真實使用者的行為。
}