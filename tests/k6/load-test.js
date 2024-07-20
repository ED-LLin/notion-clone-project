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
    http.get('http://app:3000');  // 把 localhost 改成 app 好讓 k6  在 docker 中運行測試
    sleep(1);
}