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
  let regex = /^(0|[1-9]\d*)([.,]?\d{0,2})?$/;
  if (!regex.test(value)) {
    event.target.value = value.slice(0, -1);
  }
});

addButton.addEventListener('click', () => {
  let amount = amountInput.value.replace(',', '.');
  amount = parseFloat(amount);

  const decimalPart = amountInput.value.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    const confirmAction = confirm(
      'Вы уверены? Введенная сумма имеет больше двух знаков после запятой.'
    );
    if (!confirmAction) return;
  }

  const currencyText =
    currencySelect.options[currencySelect.selectedIndex].textContent.split(
      ' '
    )[0];

  if (Number.isNaN(amount) || amount <= 0) {
    alert('Пожалуйста, введите корректную сумму!');
    return;
  }

  results.push(`${amount} ${currencyText}`);
  resultContainer.textContent = `Сумма: ${results.join(', ')}`; // Обновляем все суммы в одной строке
  amountInput.value = '';
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
  for (const entry of results) {
    const [amount, currency] = entry.split(' ');
    const exchangeRate = await fetchExchangeRate(currency, date);
    if (exchangeRate !== null) {
      totalBYN += parseFloat(amount) * exchangeRate;
    }
  }

  const eurRate = await fetchEURRate(date);
  if (eurRate === null) {
    alert('Не удалось получить курс EUR для конвертации!');
    return;
  }

  const totalEUR = totalBYN / eurRate;

  // Ищем элемент, который уже отображает результат "Итого в EUR"
  let totalEURResult = document.querySelector('.total-eur');
  let totalBYNResult = document.querySelector('.total-byn');

  if (totalEURResult) {
    totalEURResult.textContent = `Итого: ${totalEUR.toFixed(2)} EUR`;
  } else {
    resultContainer.innerHTML += `<p class="total-eur">Итого: ${totalEUR.toFixed(
      2
    )} EUR</p>`;
  }

  if (totalBYNResult) {
    totalBYNResult.textContent = `Итого: ${totalBYN.toFixed(2)} BYN`;
  } else {
    resultContainer.innerHTML += `<p class="total-byn">Итого: ${totalBYN.toFixed(
      2
    )} BYN</p>`;
  }
});
