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

const weekends = [
  'Saturday',
  'Sunday',
  '2025-12-26',
  '2025-12-25',
  '2025-11-07',
  '2025-07-04',
  '2025-07-03',
  '2025-05-09',
  '2025-05-01',
  '2025-04-29',
  '2025-04-28',
  '2025-01-07',
  '2025-01-06',
  '2025-01-02',
  '2025-01-01',
  '2024-12-25',
  '2024-11-08',
  '2024-11-07',
  '2024-07-03',
  '2024-05-14',
  '2024-05-13',
  '2024-05-09',
  '2024-05-01',
  '2024-03-08',
  '2024-01-02',
  '2024-01-01',
];

const shiftedWorkdays = [
  '2025-12-20', // Рабочий день за 26.12.2025
  '2025-07-12', // Рабочий день за 04.07.2025
  '2025-04-26', // Рабочий день за 28.04.2025
  '2025-01-11', // Рабочий день с 06.01.2025
  '2024-11-16', // Рабочий день с пятницы 8 ноября
  '2024-05-18', // Рабочий день с понедельника 13 мая
];

const isWeekend = (date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isoDate = date.toISOString().split('T')[0];

  // День считается выходным, если это суббота, воскресенье или праздник (но не перенесённый рабочий день)
  return (
    (dayOfWeek === 0 || dayOfWeek === 6 || weekends.includes(isoDate)) &&
    !shiftedWorkdays.includes(isoDate) // Исключение для перенесённых рабочих дней
  );
};

const isShiftedWorkday = (date) => {
  const isoDate = date.toISOString().split('T')[0];
  return shiftedWorkdays.includes(isoDate);
};

const getDeadline = (startDate) => {
  let date = new Date(startDate);
  let workdayCount = 0;

  // Ищем 7-й рабочий день
  while (workdayCount < 7) {
    date.setDate(date.getDate() + 1); // Переход на следующий день
    if (!isWeekend(date)) {
      workdayCount++; // Увеличиваем счётчик рабочих дней
    }
  }

  return date;
};

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

    // Находим крайний срок
    const deadline = getDeadline(date);
    const deadlineMonthAbbr = monthAbbreviations[deadline.getMonth()];
    const deadlineFormatted = `${deadline.getDate()} ${deadlineMonthAbbr} ${deadline.getFullYear()}`;

    // Добавляем "крайний срок"
    result.innerHTML = `Выбранная дата: ${date.getDate()} ${monthAbbr} ${date.getFullYear()}<br>`;
    result.innerHTML += `Срок подачи: ${deadlineFormatted}`;
  } else {
    result.textContent = 'Дата не выбрана';
  }
};
