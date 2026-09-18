// 1. Selectores
const form = document.querySelector('#coin-form');
const coin = document.querySelector('#coin');
const crypto = document.querySelector('#crypto');
const amount = document.querySelector('#amount');
const coinInfo = document.querySelector('#coin-info');

// 2. Event Listener
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const coinSelected = coin.value;
    const cryptoSelected = crypto.value;
    const amountValue = amount.value;

    // Validar campos obligatorios
    if (coinSelected === '' || cryptoSelected === '') {
        coinInfo.innerHTML = `<p class="error">Por favor, selecciona ambas monedas.</p>`;
        return;
    }

    // Mostrar loader / mensaje de carga
    coinInfo.innerHTML = `<p class="loading">Consultando cotización...</p>`;

    try {
        const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${cryptoSelected}&tsyms=${coinSelected}`;
        const response = await fetch(url);
        const data = await response.json();

        const displayData = data.DISPLAY[cryptoSelected][coinSelected];
        const rawData = data.RAW[cryptoSelected][coinSelected];

        const price = displayData.PRICE;
        const priceHigh = displayData.HIGH24HOUR;
        const priceLow = displayData.LOW24HOUR;
        const variation = displayData.CHANGEPCT24HOUR;

        // HTML base con la información técnica
        let htmlContent = `
            <p class="info">El precio es: <span class="price">${price}</span></p>
            <p class="info">El precio más alto es: <span class="price">${priceHigh}</span></p>
            <p class="info">El precio más bajo es: <span class="price">${priceLow}</span></p>
            <p class="info">Variación 24H: <span class="price">${variation}%</span></p>
        `;

        // Si se ingresó un monto, calcular cuántas criptomonedas puede comprar
        if (amountValue !== '' && Number(amountValue) > 0) {
            const amountCrypto = (Number(amountValue) / rawData.PRICE).toFixed(6);
            htmlContent += `
                <p class="info highlight">Puedes comprar: <span class="price">${amountCrypto} ${cryptoSelected}</span></p>
            `;
        }

        coinInfo.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error al obtener la cotización:', error);
        coinInfo.innerHTML = `<p class="error">Ocurrió un error al consultar la cotización. Inténtalo de nuevo.</p>`;
    }
});