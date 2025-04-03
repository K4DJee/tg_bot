const axios = require('axios');
const puppeteer = require('puppeteer');
const { PassThrough } = require('stream');

async function GetFileUrl() {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Для работы в Docker/Railway
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto('https://bak93.ru/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.WebElementsDocumentDownload__link.js_WebElementsDocumentDownload__link', { timeout: 20000 });

    const downloadLink = await page.evaluate(() => {
      const link = document.querySelector('.WebElementsDocumentDownload__link.js_WebElementsDocumentDownload__link');
      return link ? link.href : null;
    });

    await page.close();
    await browser.close();
    return downloadLink;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getPdf(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf',
        'Referer': 'https://bak93.ru/'
      },
      responseType: 'stream',
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    if (!response.headers['content-type']?.includes('application/pdf')) {
      throw new Error(`Некорректный тип файла: ${response.headers['content-type']}`);
    }

    const stream = new PassThrough();
    return response.data.pipe(stream);
  } catch (error) {
    console.error('Ошибка:', error.response?.status, error.message);
    throw error;
  }
}

// Функция для генерации случайного анекдота
function randomMessage() {
    const jokes = [
        "Почему программисты всегда предпочитают iPhone? Потому что на Android нет Ctrl+Z.",
        "Как программист поздравляет с Новым годом? Happy New Year++!",
        "JavaScript — это язык, который ты можешь освоить за неделю, но будешь изучать всю жизнь.",
        `Идёт экскурсия по аду. Заходят в следующую комнату. Там сидят люди в котлах, вода замёрзла, почти уже лед, огонь вроде бы горит, но вяло-вяло. И все смотрят на большой экран, где застывший кадр из какого-то боевика.
        - А это у нас товарищи, которые замедляли youtube. Они приговорены всю оставшуюся вечность смотреть свои любимые фильмы и сериалы из замедленного VKvideo.`,

        `- У меня знакомый был, встречался с мусульманкой. Секс у них был только в пасмурные дни. Она говорила: "Солнышко за облако зашло - Аллах не видит".
        - А я-то думаю - почему в Питере так резко выросло количество мусульман... Ибаццо можно почти круглый год!`,

        `На уроке английского повторяли слова, одно из них было Меrrу-gо-rоund (карусель). Какой-то умник перевёл как "Мэри пошла по кругу". Учителя откачивали...`,

        `- В последнее время, российский кинематограф активно окучивает тему сказок. Я написал сценарий фильма, в котором лешие, кикиморы, ведьмы и всякая нечисть во главе с Кощеем Бессмертным, попадают в современную Москву и идут в Думу.
        - Ааа, так вы документалист...`,

        `Сидят такие депутаты в думе. Скучно.
        - Что, может зарплату себе повысим?
        - А давайте!
        - Голосуем?
        - Единогласно.
        - Погодите! Погодите! А как же народ? Надо же и для народа что-то сделать!
        - Хм. Ну, давайте штрафы повысим.`,

        `В сложное время живем. Состоятельным людям, чтобы перевести деньги за рубеж, приходится выдавать это за обман телефонными мошенниками.`,

        `Красивая - это не тогда, когда с центнером макияжа, после пластического хирурга и в брендовых шмотках. Не трогай - осыпется или помнёшь. Красивая - это когда еще заспанная, без ретуши, в обычных трусиках или без, просто потягивается, а ты смотришь и балдеешь...`,

        `Парень, работающий в ИТ, рассказал, что он никогда не просит клиента по телефону проверить, подключен ли кабель, а просит вытащить его, продуть и вставить обратно. Таким образом, у клиента есть шанс сохранить лицо, если кабель не подключен.`,

        `xxx: Если линейный размер пельменя уменьшить в два раза, то теста нужно в четыре раза меньше, а мяса - в восемь! Экономическую выгоду производителей предлагаю посчитать самим.
        yyy: А если элементарную математику не вспомните, то вам помощь "Двойной криволинейный интеграл по поверхности = Тройному по объему, ограниченному поверхностью".
        zzz: Перевожу на русский: мелкие пельмешки - наебалово по фаршу.`,

        `Пожарная охрана Лос-Анджелеса с удивлением узнала, что участие в гей-парадах является не единственной ее обязанностью.`,

        `Я правильно понимаю, что теперь количество полов в США будет устанавливаться президентом и может меняться раз в четыре года?`,

        `На переговорах в Эр-Рияде произошёл конфликт — российская и американская делегации при определении сфер влияния попытались всучить друг другу Прибалтику.`,

        `Депутат потребовал расследовать убийство Лермонтова. А также возбудить уголовные дела против Батыя и Наполеона. Это все, что вы должны знать о правовом уровне и психическом здоровье наших депутатов.`,

        `А чё это именно Америка купит Гренландию. Может за неё кто нть больше заплатит. Ну Китай там, или Россия, или Бразилия... Надо её на аукцион выставить. Аукцион ООН`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
}

function randomUser(userId){
  const messages = [
    `Ты чё мышь @${userId}!`,
    `Ты че мразь @${userId}`
  ]
  return messages[Math.floor(Math.random()* messages.length)];
}

function randomGif(){
  const gifs = [
    'https://media1.tenor.com/m/ZK1ZegeT9gYAAAAd/dick-penis.gif',
    'https://media1.tenor.com/m/8GJDRZhDmLIAAAAC/thi-monket-monket.gif',
    'https://media1.tenor.com/m/XE2__E8QZdYAAAAd/monkey-monkey-eating.gif',
    'https://media1.tenor.com/m/4oVXUeN_X7UAAAAC/%D0%B8%D0%B2%D0%B0%D0%BD-%D0%B7%D0%BE%D0%BB%D0%BE.gif',
    
];
return gifs[Math.floor(Math.random() * gifs.length)];
}
// Экспорт всех функций
module.exports = { GetFileUrl, getPdf, randomMessage, randomUser, randomGif };