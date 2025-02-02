getCurrency = () => {
  // Получаем выбранную дату
  const date = document.getElementById('dateCurrency').value;

  if (!date) {
    alert('Пожалуйста, выберите дату!');
    return;
  }

  // Форматируем дату в нужный формат (YYYY-MM-DD)
  const formattedDate = new Date(date).toISOString().split('T')[0]; // Преобразование даты в строку

  // URL для API, где запросим курс доллара к белорусскому рублю на выбранную дату
  const url = `https://api.nbrb.by/exrates/rates/431?ondate=${formattedDate}&periodicity=0`;

  // Отправляем запрос nbrb
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.Cur_OfficialRate) {
        document.getElementById(
          'rate'
        ).textContent = `Курс доллара к белорусскому рублю на ${formattedDate}: ${data.Cur_OfficialRate}`;
      } else {
        document.getElementById(
          'rate'
        ).textContent = `Курс на эту дату не найден.`;
      }
    })
    .catch((error) => {
      document.getElementById(
        'rate'
      ).textContent = `Ошибка при получении данных: ${error}`;
    });
};
