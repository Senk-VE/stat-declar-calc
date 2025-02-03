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
  const url = `https://api.nbrb.by/exrates/rates/${currencyIds[currency]}?ondate=${formattedDate}&periodicity=0`;

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
  // Регулярное выражение поддерживает и точку, и запятую как десятичный разделитель
  let regex = /^(0|[1-9]\d*)([.,]?\d{0,2})?$/;

  if (!regex.test(value)) {
    event.target.value = value.slice(0, -1); // Оставляем только корректные символы
  }
});

addButton.addEventListener('click', () => {
  // Заменяем запятую на точку для корректного преобразования в число
  let amount = amountInput.value.replace(',', '.');

  // Преобразуем в число
  amount = parseFloat(amount);

  const currencyValue = currencySelect.value;
  const currencyText =
    currencySelect.options[currencySelect.selectedIndex].textContent.split(
      ' '
    )[0]; // Получаем текст до скобок

  console.log('Введенная сумма:', amount);
  console.log('Выбранная валюта:', currencyText);

  if (Number.isNaN(amount) || amount <= 0) {
    alert('Пожалуйста, введите корректную сумму!');
    return;
  }

  // Добавляем новый результат в массив
  results.push(`${amount} ${currencyText}`);

  // Обновляем строку с результатами
  const resultText = `Сумма: ${results.join('<br>')}`;

  console.log('Результат:', resultText);

  if (!resultContainer) {
    console.error('Контейнер для результата не найден!');
    return;
  }

  // Отображаем строку с результатами
  resultContainer.innerHTML = resultText;

  // Очищаем поле суммы, но оставляем выбранную валюту
  amountInput.value = '';
});

// Обработчик для кнопки "Очистить"
clearButton.addEventListener('click', () => {
  // Очищаем массив результатов
  results = [];

  // Очищаем текст в контейнере
  resultContainer.innerHTML = ''; // Очищаем все ранее отображенные результаты

  console.log('Результаты очищены');
});

doneButton.addEventListener('click', async () => {
  const date = dateInputConverter.value;
  if (!date) {
    alert('Пожалуйста, выберите дату!');
    return;
  }

  let totalBYN = 0;
  for (const entry of results) {
    const [amount, currency] = entry.split(' ');
    const exchangeRate = await fetchExchangeRate(currency, date);
    if (exchangeRate !== null) {
      totalBYN += parseFloat(amount) * exchangeRate;
    }
  }

  // Получаем курс EUR по выбранной дате
  const eurRate = await fetchEURRate(date);
  if (eurRate === null) {
    alert('Не удалось получить курс EUR для конвертации!');
    return;
  }

  // Конвертируем сумму в EUR
  const totalEUR = totalBYN / eurRate;

  // Отображаем результат только в EUR
  resultContainer.innerHTML += `
    <p>Итого в EUR: ${totalEUR.toFixed(2)} EUR</p>
  `;
});
