const TelegramApi = require('node-telegram-bot-api');
const { remote } = require('webdriverio');

const TOKEN = '6443447196:AAH0WiaXdqeGZOqr_p8MfOPuVHkUJP4dI34';

const bot = new TelegramApi(TOKEN, {polling: true})

const BMWx32k19 = 'https://m.mobile.de/consumer/api/search/srp/similar-ads?similarAdsLink=%2Fsimilar%2F%3Fp%3D32749%26c%3DOffRoad%26ms%3D3500%253B48%26id%2521%3D381098466%26vc%3DCar%26sid%3D821022&pageUrl=https%3A%2F%2Fsuchen.mobile.de%2Ffahrzeuge%2Fsearch.html%3Fdam%3D0%26fr%3D2019%253A2020%26isSearchRequest%3Dtrue%26ms%3D3500%253B48%253B%253B%26od%3Ddown%26p%3D%253A35000%26ref%3DsrpHead%26s%3DCar%26sb%3Ddoc%26vc%3DCar%26refId%3D102c4b11-2abf-82ec-c20b-5ad35cf10816';

let newSearch = false;

let autos;
let Autos = [];
let urlSearch = 'https://suchen.mobile.de/fahrzeuge/search.html?dam=0&fr=2019%3A2021&isSearchRequest=true&ms=3500%3B48%3B%3B&od=down&p=%3A30000&ref=srpHead&refId=f00a0c69-6778-80f8-c952-eb659658fca9&s=Car&sb=doc&vc=Car';

const start = () => {

    // urlSearch = BMWx32k19;

    bot.setMyCommands([
        {command: '/start', description: "Начало"},
        {command: '/info', description: "Информация"},
        {command: '/autos', description: "Авто"},
        {command: '/lastautos', description: "Последняя машина"},
        {command: '/newsearch', description: "Новый поиск"},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;



        if (text === '/start') {
            return  bot.sendMessage(chatId, `Добро пожаловать ${msg.from.first_name}`);
        }
        if (text === '/info') {
            return  bot.sendMessage(chatId, "Это бот поможет вам отслеживать появление новых машин на сайте \n mobile.de");
        }
        if (text === '/autos') {
            let selenium = async  () => {
                const browser = await remote({
                    capabilities: {
                        browserName: 'chrome',
                    },
                });

                // await browser.url('https://www.example.com');
                await browser.url(urlSearch);// Create a new div element
                let execute =  await browser.execute(() => {
                    // const newDiv = document.createElement('div');
                    // newDiv.textContent = 'This is a new div!';
                    // document.body.appendChild(newDiv);

                    let list = [];

                    // document.body.querySelectorAll('article > div').forEach(function(item) {
                    //     if(item.id !== 'saveSearchBarContainer') {
                    //         if (!!item.querySelector(':scope > div > a')) {
                    //             list.push(item.querySelector(':scope > div > a')?.getAttribute('href'));
                    //         }
                    //         else {
                    //             if(!!item.querySelector(':scope > a'))
                    //                 list.push(item.querySelector(':scope > a')?.getAttribute('href'));
                    //         }
                    //     }
                    //
                    // });

                    // [...document.getElementsByClassName('rqEvz FWtU1 YIC4W')]
                    //     .forEach(function(item, index) {
                    //         list.push({
                    //             id: index,
                    //             link: `https://suchen.mobile.de` +  item?.getAttribute('href')
                    //         })
                    //     });


                    [...document.getElementsByClassName('rqEvz FWtU1 YIC4W')]
                        .forEach(function(item, index) {
                            list.push({
                                id: index,
                                link: `https://suchen.mobile.de` +  item?.getAttribute('href'),
                                name: item.querySelector('.QeGRL')?.innerText,
                                data: item.querySelector('.fqe3L')?.innerText,
                                price: item.querySelector('.fpviJ')?.innerText,
                            })
                        });


                    return  list;
                });

                // console.log(execute)

                // execute.length=5;
                Autos.length= 0;

                Autos = [...execute]

                // execute.forEach(one => {
                //     if(one != null)
                //         Autos.push('https://suchen.mobile.de' + one)
                // })

                // Wait for a moment to see the created div (you might need to adjust the timing)
                await browser.pause(3000);

                // Close the browser
                await browser.deleteSession();

                return execute
            };

            selenium()
                .then( async autos => {
                await bot.sendMessage(chatId, `Поиск окончен. Мы нашлм  ${autos.length} машинок `)
            });

            // await bot.sendMessage(chatId, "start...");
            // return  fetch(urlSearch).then(response => response.json())
            //     .then((date) => {
            //         autos = date;
            //         // console.log(autos)
            //         bot.sendMessage(chatId, "avto " + date?.items?.length)
            //     })
            return bot.sendMessage(chatId, "Начало поиска ... ожидайте пожалуйста ...")
        }
        if(text === '/lastautos'){

            let first = Autos.shift();

            Autos.length=10;

            // Function to send messages asynchronously
            const sendMessageAsync = async (chatId, messages) => {
                for (let message of messages) {
                    await bot.sendMessage(chatId, `Авто №${message?.id}, ${message?.price} \n${message?.name} \n Появилось: ${message?.data? message?.data?.slice(-16): ''} \n ${message?.link} `);
                }
            };

// Use this function to send messages
            await sendMessageAsync(chatId, Autos);

            // Autos.forEach( auto =>{
            //     sendMessageAsync('YOUR_CHAT_ID', messages);
            //      // bot.sendMessage(chatId, `Лот ${auto.id}` + "\n" + auto.link);
            // })

            // autos?.items.forEach(oneAuto =>  {
            //      bot.sendMessage(chatId, "Последняя машина ...  " + `Цена ${oneAuto.price.gross}` +
            //         "\n" + "https://suchen.mobile.de/fahrzeuge/details.html?id=" + oneAuto.id)
            // })

            return  bot.sendMessage(chatId, "Последние 10 машин! ")

            // await bot.sendMessage(chatId, "Последняя машина ...  " + `Цена ${autos?.items[0].price.gross}` +
            //     "\n" + "https://suchen.mobile.de/fahrzeuge/details.html?id=" + autos?.items[0].id)
        }

        if(text.includes('/newsearch')){

            newSearch = true;

            return bot.sendMessage(chatId, "Для установки нового поиска, нужно на сайте mobile.de произвести поиск по нужной Вам машине " +
                "(если хотите отслеживать новые машины то нужно выбрать сортировку по дате 'Inserate (neueste zuerst)') \n и в следующем сообщении отправить ссылку мне");
        }

        if(text.includes('https://suchen.mobile.de/fahrzeuge/search.html')){

            if(newSearch)
                urlSearch=text;
            return bot.sendMessage(chatId, "Сылка на новый поиск установлена !!");
        }
        newSearch = false;

        return bot.sendMessage(chatId, "Я твоя не понимать(( " + text)
    })
}
start();