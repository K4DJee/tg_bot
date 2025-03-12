const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { GetFileUrl, getPdf, randomMessage } = require('./getHtml'); // Импорт функций

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
        interval: 1000, // получение сообщения через 1 секунду
        autoStart: true
    }
});

const creatorId = 1367602882;
const botUsername = '@shedule_k4J_bot';
let timerId = null; // Глобальная переменная для хранения ID таймера
let isSubscriptionActive = false; // Флаг активности подписки

// Bot commands
const cmd_start = "/start";
const cmd_help = "/help";
const cmd_shedule = "/shedule";
const cmd_menu = "/menu";
const cmd_link = "/link";
const cmd_messages = '/jokes';
const cmd_subShedule = '/subshedule';
const cmds = [
    cmd_start, // 0
    cmd_menu, // 1
    cmd_help, // 2
    cmd_shedule, // 3
    cmd_link, // 4
    cmd_messages, // 5
    cmd_subShedule // 6
];

const commands_menu = [
    { command: "start", description: "Запуск бота" },
    { command: "help", description: "Список команд" },
    { command: "shedule", description: "Расписание" },
    { command: "menu", description: "Меню" },
    { command: "jokes", description: "Анекдоты" },
    { command: "subshedule", description: "Подписка на рассылку расписания" }
];

bot.setMyCommands(commands_menu);

let previousLink = ''; // Прошлая ссылка

bot.on('text', async msg => {
    try {
        const text = msg.text.trim();

        if (text === cmds[0]) {
            await bot.sendMessage(msg.chat.id, `Привет ${msg.chat.first_name}! Этот бот представляет собой рассылку расписаний`);
        } else if (text === cmds[2]) {
            await bot.sendMessage(msg.chat.id, `Список команд:
                ${cmd_start} - Перезапуск бота
                ${cmd_help} - Список команд
                ${cmd_shedule} - Расписание
            `);
        }
         else if (text === cmds[3] || text === `${cmds[3]}${botUsername}` || text === 'Расписание') {
            try {
                console.log('Отправка PDF файла!!!');
                const downloadLink = await GetFileUrl();
                const pdfData = await getPdf(downloadLink);
                await bot.sendDocument(msg.chat.id, pdfData, 
                    {source: pdfData},
                    {filename: 'Расписание.pdf'},
                    {contentType: 'application/pdf'},
                    {caption: 'PDF-файл'}
                );
            } catch (error) {
                await bot.sendMessage(msg.chat.id, "Ошибка при получении данных");
                console.log(error.message);
            }
        } else if (text === cmds[1] || text === `${cmds[1]}${botUsername}`) {
            await bot.sendMessage(msg.chat.id, `Меню`, {
                reply_markup: {
                    keyboard: [
                        ["Расписание", "Создатель"],
                        ["Подписка", "Анекдоты"],
                        ["Отмена подписки", "Закрыть меню"]
                    ],
                    resize_keyboard: true
                }
            });
        } else if (text === "Создатель" || text === `Создатель${botUsername}`) {
            const creatorInfo = await bot.getChat(creatorId);
            await bot.sendMessage(msg.chat.id, `Создатель этого бота: @${creatorInfo.username}`);
        } 
        else if (text === "Анекдоты" || text === `${cmds[5]}${botUsername}` || text === cmds[5]) {
            try {
                await bot.sendMessage(msg.chat.id, randomMessage());
            } catch (error) {
                console.log(error.message);
            }
        } 
        else if (text === "Подписка" || text === cmds[6] || text === `${cmds[6]}${botUsername}`) {
            const groupChatId = msg.chat.id;
            console.log(groupChatId);

            if (isSubscriptionActive) {
                await bot.sendMessage(msg.chat.id, 'Рассылка уже активна.');
                return;
            }

            isSubscriptionActive = true; // Устанавливаем флаг активности
            await bot.sendMessage(msg.chat.id, 'Подписка на рассылку расписания была успешно оформлена!');
            checkLinkPeriodically(groupChatId); // Запускаем рассылку
        }
         else if (text === "Отмена подписки") {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
                isSubscriptionActive = false; // Сбрасываем флаг активности
                await bot.sendMessage(msg.chat.id, 'Рассылка расписания отменена');
            } else {
                await bot.sendMessage(msg.chat.id, 'Подписка на рассылку расписания не была активна');
            }
        }
         else if (text === "Закрыть меню") {
            await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
                reply_markup: {
                    remove_keyboard: true
                }
            });
        }
         else if (text === "/link" || text === `/link${botUsername}`) {
            try {
                console.log('Отправка PDF файла!!!');
                const downloadLink = await GetFileUrl();
                const pdfData = await getPdf(downloadLink);
                await bot.sendDocument(msg.chat.id, pdfData, 
                    {source: pdfData},
                    {filename: 'Расписание.pdf'},
                    {contentType: 'application/pdf'},
                    {caption: 'PDF-файл'}
                );
            } catch (error) {
                await bot.sendMessage(msg.chat.id, "Ошибка при получении данных");
                console.log(error.message);
            }
        }
         else {
            console.log(msg);
            await bot.sendMessage(msg.chat.id, msg.text);
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, 'Bot error');
    }
});

// Функция для проверки ссылки каждые 10 минут
async function checkLinkPeriodically(groupChatId) {
    if (isSubscriptionActive) {
        console.log("Функция checkLinkPeriodically запущена!!!");
        timerId = setInterval(async () => {
            try {
                console.log('Запуск проверки');
                const currentLink = await GetFileUrl();
                if (currentLink && currentLink !== previousLink) {
                    previousLink = currentLink;
                    const pdfData = await getPdf(currentLink);

                    await bot.sendDocument(groupChatId, pdfData, 
                        {source: pdfData},
                        {filename: 'Расписание.pdf'},
                        {contentType: 'application/pdf'},
                        {caption: 'PDF-файл'}
                    );
                } else {
                    console.log('Ссылки схожи');
                }
            } catch (error) {
                console.error('Ошибка при проверке ссылки:', error.message);
            }
        }, 10 * 6 * 100); // 10 минут в миллисекундах
    } else {
        console.log("Рассылка не активна.");
    }
}

// Обработка ошибок
bot.on("polling_error", err => console.log(err.message));