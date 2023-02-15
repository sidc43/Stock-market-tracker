const seachInput = document.querySelector("#companyname");
const table = document.querySelector("#searchRes");
const stockListTable = document.querySelector("#stockList");
const showstlbl = document.getElementById("show");
const baseURL = "https://www.serversfalcon.com/api/stocksv2";
let clientStocks = JSON.parse(localStorage.getItem('Stocks')) || [];

async function Search() {
    const companyName = seachInput.value;
    table.innerHTML = null;
    stockListTable.innerHTML = null;

    if (showstlbl.innerText == "HIDE MY STOCKS") {
        showstlbl.innerText = "VIEW MY STOCKS";
    }


    if (companyName != "") {
        const res = await fetch(`${baseURL}/name/${companyName}`);
        const data = await res.json();
        const { quotes } = data;

        if (quotes.length < 1) 
            table.innerHTML = "No results found";
        
        table.classList.add('stockTable');

        for (let i = 0; i < quotes.length; i++) {
            let row = table.insertRow(-1);
            let c1 = row.insertCell(0);
            c1.innerHTML = `${i + 1} - ${quotes[i]?.shortname} (${quotes[i]?.symbol})`;
            c1.id = quotes[i].symbol;
            c1.onclick = () => {
                UpdateStorage(c1.id, quotes[i].shortname, clientStocks, 'symbol');

                const notif = document.getElementById('notifText');
                notif.innerHTML = `${c1.id} has been added to your list!`;

                const modal = document.querySelector('#notif');
                const close = document.getElementById('closeNotif');
                modal.show();
                close.addEventListener('click', (e) => {
                    modal.hide();
                });
            }
        }
    } 
}

async function ShowStocks() {
    stockListTable.innerHTML = null;
    table.innerHTML = null;
    let x = JSON.parse(localStorage.getItem('Stocks'));
    stockListTable.classList.add('stockTable');

    for (let i = 0; i < x.length; i++) {

        let row = stockListTable.insertRow(-1);
        let c1 = row.insertCell(0);
        c1.id = x[i].symbol;

        let res, data, price, eps, dividendYield, changepercent, change, PERatio;

        if (showstlbl.innerText == "VIEW MY STOCKS") {
            res = await fetch(`${baseURL}/quote/${c1.id}`);
            data = await res.json();
            console.log(data);
            ({ price, eps, dividendYield, changepercent, change, PERatio } = data);
        }

        if (change > 0 && changepercent > 0)
            c1.innerHTML = `<b>${x[i].symbol}</b> &nbsp;&nbsp;&nbsp;&nbsp; $${price.toFixed(2)} &nbsp;&nbsp;&nbsp; <span style="color: green">+${change.toFixed(2)} (+${changepercent.toFixed(2)}%)</span>`;
        else if (change < 0 && changepercent < 0)
            c1.innerHTML = `<b>${x[i].symbol}</b> &nbsp;&nbsp;&nbsp;&nbsp; $${price.toFixed(2)} &nbsp;&nbsp;&nbsp; <span style="color: red">${change.toFixed(2)} (${changepercent.toFixed(2)}%)</span>`;

        c1.onclick = async () => {

            // #region varialbes
            const modal = document.querySelector('#stockInfo');
            const close = document.querySelector('#close');
            const remove = document.querySelector('#remove');

            const title = document.querySelector("#tickerTitle");
            const p = document.querySelector("#price");
            const pe = document.querySelector("#peRatio");
            const dps = document.querySelector("#divpershare");
            const dy = document.querySelector("#divyield");
            const e = document.querySelector("#eps");
            // #endregion

            title.innerHTML = `&nbsp;&nbsp;${x[i].fullname}`;
            p.innerHTML = `&nbsp;&nbsp;$${price}`;
            pe.innerHTML = `&nbsp;&nbsp;${PERatio}`;
            dy.innerHTML = `&nbsp;&nbsp;${dividendYield}`;
            e.innerHTML = `&nbsp;&nbsp;${eps}`;
            

            modal.show();
            close.addEventListener('click', (e) => {
                modal.hide();
            });

            // TODO: Implement removing specific stock from portfolio
            // remove.onclick = () => {
            //     let index;
            //     for (let j = 0; j < x.length; j++) {
            //         if (c1.id == x[j].symbol) {
            //             index = clientStocks.indexOf(clientStocks[j]);
            //         }
            //     }
            // }
        }
    }

    

    // #region Toggle stocks
    if (showstlbl.innerText == "VIEW MY STOCKS") {
        showstlbl.innerText = "HIDE MY STOCKS";
    } else if (showstlbl.innerText == "HIDE MY STOCKS") {
        showstlbl.innerText = "VIEW MY STOCKS";
        stockListTable.innerHTML = null;
    }
    // #endregion
}

// TODO: Clean up removing, make sure it is completely deleted off local storage without having to reload application
function ClearStocks() {
    localStorage.removeItem('Stocks');
    stockListTable.innerHTML = null;
    showstlbl.innerText = "VIEW MY STOCKS";
}

function UpdateStorage(id, stockName, initArray, key) {
    AddToList(id, stockName);
    const u = GetUniqueArray(initArray, key);
    localStorage.setItem('Stocks', JSON.stringify(u));
}

function AddToList(ticker, companyName) {
    const obj = {
        symbol: ticker,
        fullname: companyName
    };
    clientStocks[clientStocks.length] = obj;
}

function GetUniqueArray(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()];
}

