import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 500 },   // 在 10 秒內逐漸增加到 500 個虛擬使用者
        { duration: '20s', target: 1000 },  // 在 20 秒內逐漸增加到 1000 個虛擬使用者
        { duration: '20s', target: 1500 },  // 在 20 秒內逐漸增加到 1500 個虛擬使用者
        { duration: '20s', target: 2000 },  // 在 20 秒內逐漸增加到 2000 個虛擬使用者
        { duration: '20s', target: 2500 },  // 在 20 秒內逐漸增加到 2500 個虛擬使用者
        { duration: '45s', target: 0 },     // 在 45 秒內逐漸減少到 0 個虛擬使用者
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 以內完成
    },
};

export default function () {
    http.get('http://localhost:3000');
    sleep(1);
}