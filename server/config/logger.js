const winston = require('winston');
const axios = require('axios');
const Transport = require('winston-transport');
require('winston-daily-rotate-file');

// 自定義 Discord Webhook 傳輸器
class DiscordWebhook extends Transport {
  constructor(opts) {
    super(opts);
    this.webhookUrl = opts.webhookUrl;
    this.level = opts.level || 'warn'; // 設置默認級別為 'warn'
    this.isTestEnv = process.env.NODE_ENV === 'test'; // 檢查是否為測試環境
  }

  async log(info, callback) {
    if (this.isTestEnv) { // 如果是測試環境，則不發送 webhook
      console.log(`log is not sent to Discord (test environment): ${info.level} - ${info.message}`);
      return callback();
    }

    if (this.silent || !this.levels[info.level] || this.levels[info.level] < this.levels[this.level]) {
      console.log(`log is not sent to Discord：${info.level} - ${info.message}`); // 添加調試信息
      return callback();
    }

    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, timestamp } = info;
    const color = level === 'error' ? 16711680 : level === 'warn' ? 16776960 : 65280;

    try {
      await axios.post(this.webhookUrl, {
        embeds: [{
          title: `[${level.toUpperCase()}]`,
          description: message,
          color: color,
          timestamp: new Date(timestamp).toISOString()
        }]
      });
      console.log(`log is sent to Discord：${level} - ${message}`); // 添加調試信息
    } catch (error) {
      console.error('Error sending log to Discord:', error);
    }

    callback();
  }
}

const logger = winston.createLogger({
    level: 'info',
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ level, message, timestamp, context }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}${context ? ' - Context: ' + JSON.stringify(context) : ''}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.printf(({ level, message, timestamp, context }) => {
                    return `${timestamp} [${level}] ${message}${context ? ' - Context: ' + JSON.stringify(context) : ''}`;
                })
            )
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/notion-clone-log-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        }),
        // 添加 Discord Webhook 傳輸器
        new DiscordWebhook({
            webhookUrl: 'https://discord.com/api/webhooks/1254287295490818089/OD-JWBFNle1RUE9HoccgSZyaCIqwZty8GLeDM_tMunYqmfXJwj2fO5ujib6JgSrG4MQ2',
            level: 'warn' // 設置為 'warn'，這樣只有 warn 和更高級別的日誌會被發送到 Discord
        })
    ]
});

module.exports = logger;