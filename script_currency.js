let results = []; // Массив для хранения результатов
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currencySelect');
const resultContainer = document.getElementById('resultContainer');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const dateInputConverter = document.getElementById('dateInputConverter');
const doneButton = document.getElementById('doneButton');

const currencyIds = {
  USD: 431,
  EUR: 451,
  RUR: 456,
  BYN: 1, // Не требует API
};

async function fetchExchangeRate(currency, date) {
  if (currency === 'BYN') return 1; // BYN не требует конвертации

  const formattedDate = new Date(date).toISOString().split('T')[0];

  let currencyId = currencyIds[currency];

  // Устанавливаем правильный Cur_ID в зависимости от валюты и даты
  if (currency === 'USD') {
    if (new Date(formattedDate) < new Date('2021-07-09')) {
      currencyId = 145; // Для периода до 2021-07-09
    } else {
      currencyId = 431; // Для периода с 2021-07-09
    }
  } else if (currency === 'EUR') {
    if (new Date(formattedDate) < new Date('2016-07-01')) {
      currencyId = 19; // Для периода до 2016-07-01
    } else if (new Date(formattedDate) < new Date('2021-07-09')) {
      currencyId = 292; // Для периода с 2016-07-01 до 2021-07-09
    } else {
      currencyId = 451; // Для периода с 2021-07-09
    }
  } else if (currency === 'RUR') {
    if (new Date(formattedDate) < new Date('2016-07-01')) {
      currencyId = 190; // Для периода до 2016-07-01
    } else if (new Date(formattedDate) < new Date('2021-07-09')) {
      currencyId = 298; // Для периода с 2016-07-01 до 2021-07-09
    } else {
      currencyId = 456; // Для периода с 2021-07-09
    }
  }

  const url = `https://api.nbrb.by/exrates/rates/${currencyId}?ondate=${formattedDate}&periodicity=0`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ошибка загрузки курса для ${currency}`);
    const data = await response.json();
    return currency === 'RUR'
      ? data.Cur_OfficialRate / 100
      : data.Cur_OfficialRate;
  } catch (error) {
    console.error(error);
    alert(`Не удалось получить курс для ${currency}`);
    return null;
  }
}

async function fetchEURRate(date) {
  return await fetchExchangeRate('EUR', date); // Получаем курс EUR
}

amountInput.addEventListener('input', function (event) {
  let value = event.target.value;

  // Заменяем запятую на точку только при вводе
  value = value.replace(',', '.');

  // Проверка на числовое значение
  if (!/^\d*(\.\d{0,2})?$/.test(value)) {
    alert(
      'Введите корректное число с не более чем двумя знаками после запятой!'
    );
    value = value.slice(0, -1); // Удаляем последний символ, если он некорректен
  }

  event.target.value = value;
});

addButton.addEventListener('click', () => {
  let amounts = amountInput.value.split(','); // Разбиваем на отдельные суммы, если несколько чисел
  let allValid = true;

  // Проверка, если поле пустое
  if (amountInput.value.trim() === '') {
    alert('Поле не может быть пустым!');
    return; // Если поле пустое, прекращаем выполнение функции
  }

  amounts.forEach((amount) => {
    amount = amount.replace(',', '.'); // Заменяем запятую на точку

    // Проверка на корректность формата
    const decimalPart = amount.split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      allValid = false;
      alert('Каждое число должно иметь не более двух знаков после запятой!');
    }

    // Проверка на NaN
    if (isNaN(parseFloat(amount))) {
      allValid = false;
      alert('Введите корректное число!');
    }
  });

  // Если все числа корректны, добавляем их в список
  if (allValid) {
    amounts.forEach((amount) => {
      const currencyText =
        currencySelect.options[currencySelect.selectedIndex].textContent.split(
          ' '
        )[0];
      results.push(`${amount} ${currencyText}`);
    });

    resultContainer.textContent = `Сумма: ${results.join(', ')}`;
    amountInput.value = ''; // Очищаем поле
  }
});

clearButton.addEventListener('click', () => {
  results = [];
  resultContainer.innerHTML = '';
  console.log('Результаты очищены');
});

doneButton.addEventListener('click', async () => {
  const date = dateInputConverter.value;
  if (!date) {
    alert('Пожалуйста, выберите дату!');
    return;
  }

  if (new Date(date) < new Date('2016-07-01')) {
    alert(
      'Расчетные данные могут быть некорректными, ввиду деноминации белорусского рубля с 01.07.2016'
    );
  }

  let totalBYN = 0;
  let totalEUR = 0;
  let totalUSD = 0;

  // Конвертируем каждую сумму в BYN, округляем и затем пересчитываем в другие валюты
  for (const entry of results) {
    const [amount, currency] = entry.split(' ');

    // Получаем курс для каждой валюты
    const exchangeRate = await fetchExchangeRate(currency, date);
    if (exchangeRate !== null) {
      // Конвертируем сумму в BYN
      let amountInBYN = parseFloat(amount) * exchangeRate;
      amountInBYN = Math.round(amountInBYN * 100) / 100; // Округляем до 2 знаков

      // Добавляем в общую сумму в BYN
      totalBYN += amountInBYN;

      // Теперь переводим в EUR и USD
      const eurRate = await fetchEURRate(date);
      if (eurRate !== null) {
        totalEUR += amountInBYN / eurRate;
        totalEUR = Math.round(totalEUR * 100) / 100; // Округляем до 2 знаков
      }

      const usdRate = await fetchExchangeRate('USD', date);
      if (usdRate !== null) {
        totalUSD += amountInBYN / usdRate;
        totalUSD = Math.round(totalUSD * 100) / 100; // Округляем до 2 знаков
      }
    }
  }

  // Выводим результаты
  let totalEURResult = document.querySelector('.total-eur');
  let totalBYNResult = document.querySelector('.total-byn');
  let totalUSDResult = document.querySelector('.total-usd'); // Для USD

  if (totalEURResult) {
    totalEURResult.textContent = `Итого: ${totalEUR} EUR`;
  } else {
    resultContainer.innerHTML += `<p class="total-eur">Итого: ${totalEUR} EUR</p>`;
  }
  // Добавляем результат для USD
  if (totalUSDResult) {
    totalUSDResult.textContent = `Итого: ${totalUSD} USD`;
  } else {
    resultContainer.innerHTML += `<p class="total-usd">Итого: ${totalUSD} USD</p>`;
  }
  if (totalBYNResult) {
    totalBYNResult.textContent = `Итого: ${totalBYN} BYN`;
  } else {
    resultContainer.innerHTML += `<p class="total-byn">Итого: ${totalBYN} BYN</p>`;
  }
});
