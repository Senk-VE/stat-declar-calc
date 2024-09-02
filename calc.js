const monthAbbreviations = [
  'Янв', // Январь
  'Фев', // Февраль
  'Мар', // Март
  'Апр', // Апрель
  'Май', // Май
  'Июн', // Июнь
  'Июл', // Июль
  'Авг', // Август
  'Сен', // Сентябрь
  'Окт', // Октябрь
  'Ноя', // Ноябрь
  'Дек', // Декабрь
];

const displayDate = () => {
  const dateInput = document.getElementById('dateInput').value;
  const result = document.getElementById('result');

  if (dateInput) {
    // Создаем объект Date из выбранной даты
    const date = new Date(dateInput);
    // Получаем месяц (0 - январь, 1 - февраль, и т.д.)
    const monthIndex = date.getMonth();
    // Получаем сокращенное название месяца
    const monthAbbr = monthAbbreviations[monthIndex];
    // Форматируем результат
    result.textContent = `Выбранная дата: ${date.getDate()} ${monthAbbr} ${date.getFullYear()}`;
  } else {
    result.textContent = 'Дата не выбрана';
  }
};
