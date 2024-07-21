import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 10 },  // 在 30 秒內逐漸增加到 10 個虛擬使用者
        { duration: '1m', target: 20 },   // 在 1 分鐘內逐漸增加到 20 個虛擬使用者
        { duration: '30s', target: 30 },  // 在 30 秒內逐漸增加到 30 個虛擬使用者
        { duration: '30s', target: 40 },  // 在 30 秒內逐漸增加到 40 個虛擬使用者
        { duration: '30s', target: 50 },  // 在 30 秒內逐漸增加到 50 個虛擬使用者
        { duration: '1m', target: 0 },    // 在 1 分鐘內逐漸減少到 0 個虛擬使用者
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 以內完成
    },
};

export default function () {
    http.get('http://app:3000');  // 把 localhost 改成 app 好讓 k6 在 docker 中運行測試
    sleep(1);
}