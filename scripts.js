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
        // Binance utiliza USDT en lugar de USD para la mayoría de pares
        const fiatSymbol = coinSelected === 'USD' ? 'USDT' : coinSelected;
        const symbol = `${cryptoSelected}${fiatSymbol}`;

        // 1. Petición de precio actual y datos de 24 horas a Binance
        const bitcoinPrice = await (await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)).json();
        const bitcoinHour = await (await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)).json();

        // Validar si Binance devolvió un error (ej. par no existente)
        if (bitcoinPrice.code || bitcoinHour.code) {
            coinInfo.innerHTML = `<p class="error">El par ${cryptoSelected}/${coinSelected} no está disponible en Binance.</p>`;
            return;
        }

        // 2. Extracción y formateo de variables
        const currentPriceNum = parseFloat(bitcoinPrice.price);
        const highPriceNum = parseFloat(bitcoinHour.highPrice);
        const lowPriceNum = parseFloat(bitcoinHour.lowPrice);
        const variationNum = parseFloat(bitcoinHour.priceChangePercent);

        // Formatear como moneda local
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: coinSelected
        });

        const price = formatter.format(currentPriceNum);
        const priceHigh = formatter.format(highPriceNum);
        const priceLow = formatter.format(lowPriceNum);
        const variation = variationNum.toFixed(2);

        // 3. HTML base con la información técnica
        let htmlContent = `
            <p class="info">El precio es: <span class="price">${price}</span></p>
            <p class="info">El precio más alto es: <span class="price">${priceHigh}</span></p>
            <p class="info">El precio más bajo es: <span class="price">${priceLow}</span></p>
            <p class="info">Variación 24H: <span class="price">${variation}%</span></p>
        `;

        // 4. Si se ingresó un monto, calcular cuántas criptomonedas puede comprar
        if (amountValue !== '' && Number(amountValue) > 0) {
            const amountCrypto = (Number(amountValue) / currentPriceNum).toFixed(6);
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