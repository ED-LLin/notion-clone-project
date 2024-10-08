import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 40 },   // 在 1 分鐘內逐漸增加到 40 個虛擬使用者
        { duration: '1m', target: 80 },   // 在 1 分鐘內逐漸增加到 80 個虛擬使用者
        { duration: '1m', target: 120 },  // 在 1 分鐘內逐漸增加到 120 個虛擬使用者
        { duration: '1m', target: 160 },  // 在 1 分鐘內逐漸增加到 160 個虛擬使用者
        { duration: '1m', target: 200 },  // 在 1 分鐘內逐漸增加到 200 個虛擬使用者
        { duration: '5m', target: 200 }, // 保持 200 個虛擬使用者 10 分鐘
        { duration: '3m', target: 0 },    // 在 5 分鐘內逐漸減少到 0 個虛擬使用者
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 以內完成
    },
};

export default function () {
    http.get('http://app:3000');  // 把 localhost 改成 app 好讓 k6 在 docker 中運行測試
    sleep(1);
}