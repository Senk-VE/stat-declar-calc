let results = []; // Массив для хранения результатов

document.getElementById('amount').addEventListener('input', function (event) {
  let value = event.target.value;
  let regex = /^(0|[1-9]\d*)(\.\d{0,2})?$/;

  if (!regex.test(value)) {
    event.target.value = value.slice(0, -1); // Оставляем только корректные символы
  }
});

document.getElementById('addButton').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('amount').value); // Преобразуем в число
  const currency = document.getElementById('currencySelect').value;

  console.log('Введенная сумма:', amount);
  console.log('Выбранная валюта:', currency);

  if (!amount || amount <= 0) {
    alert('Пожалуйста, введите корректную сумму!');
    return;
  }

  // Добавляем новый результат в массив
  results.push(`${amount} ${currency}`);

  // Обновляем строку с результатами
  const resultText = `Сумма: ${results.join(', ')}`;

  console.log('Результат:', resultText);

  const resultContainer = document.getElementById('resultContainer');

  if (!resultContainer) {
    console.error('Контейнер для результата не найден!');
    return;
  }

  // Отображаем строку с результатами
  resultContainer.textContent = resultText;

  // Очищаем поля
  document.getElementById('amount').value = '';
  document.getElementById('currencySelect').value = 'USD';
});

// Обработчик для кнопки "Очистить"
document.getElementById('clearButton').addEventListener('click', () => {
  // Очищаем массив результатов
  results = [];

  // Очищаем текст в контейнере
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.textContent = ''; // Очищаем все ранее отображенные результаты

  console.log('Результаты очищены');
});
