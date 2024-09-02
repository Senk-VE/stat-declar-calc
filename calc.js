const displayDate = () => {
  const dateInput = document.getElementById('dateInput').value;
  const result = document.getElementById('result');

  if (dateInput) {
    result.textContent = `Выбранная дата: ${dateInput}`;
  } else {
    result.textContent = 'Дата не выбрана';
  }
};
