document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('xmlInput');
  input.addEventListener('change', extractFileFromXml);
});

// attach xml-file
async function extractFileFromXml() {
  console.log('Файл выбран, обрабатываю...');

  const input = document.getElementById('xmlInput');
  const resultDiv = document.getElementById('resultXml');
  resultDiv.innerHTML = '';

  const files = input.files;
  if (!files.length) {
    resultDiv.textContent = 'Файл не выбран';
    return;
  }

  for (const file of files) {
    const xmlText = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const regNumber = xmlDoc.getElementsByTagName('RegNumber')[0]?.textContent;
    const sender = xmlDoc.getElementsByTagName('Sender')[0];
    const name = sender?.getElementsByTagName('Name')[0]?.textContent;

    const block = document.createElement('div');
    block.innerHTML = `<p class="xml-output">
      ${regNumber || 'RegNumber не найден'} <br>
      ${name || 'Sender Name не найден'} <br>
      <img src="download.png" alt="скачать" class="icon-btn" title="скачать">
      <img src="zoom.png" alt="просмотр" class="icon-btn" title="просмотр">
    </p>`;
    resultDiv.appendChild(block);

    const downloadBtn = block.querySelector('img[alt="скачать"]');
    const viewBtn = block.querySelector('img[alt="просмотр"]');

    // zip download
    downloadBtn.addEventListener('click', async () => {
      const documents = xmlDoc.getElementsByTagName('Document');
      const JSZip = window.JSZip;
      const zip = new JSZip();

      for (const doc of documents) {
        const zipTag = doc.getElementsByTagName('ZIP')[0];
        const nameTag = doc.getElementsByTagName('Name')[0];
        if (!zipTag || !nameTag) continue;

        const base64Data = zipTag.textContent.trim();

        try {
          // base64 decoding
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }

          // creating single ZIP
          const innerZip = await JSZip.loadAsync(bytes);
          for (const [innerName, innerFile] of Object.entries(innerZip.files)) {
            if (!innerFile.dir && innerName.toLowerCase().endsWith('.pdf')) {
              const pdfBlob = await innerFile.async('blob');
              zip.file(innerName, pdfBlob); // добавляем PDF в общий ZIP
            }
          }
        } catch (err) {
          console.error('Ошибка при извлечении файла:', err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Forming the ZIP name from RegNumber with "/" replaced
      let zipFileName = (regNumber || 'documents').replace(/\//g, '-') + '.zip';

      await saveZipCrossBrowser(zipBlob, zipFileName);
    });
  }
}
async function saveZipCrossBrowser(blob, fileName) {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'ZIP Files',
            accept: { 'application/zip': ['.zip'] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      console.warn('Сохранение отменено пользователем');
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
