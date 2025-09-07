import * as C from './config.js';

class USPDManager {
  constructor() {
    this.uspdRegistry = new Map();
    this.attemptsForNewConnection = 3;
  }

  getCRCTable() {
    const table = new Uint16Array(256);

    for (let i = 0; i < 256; i++) {
      let c = i << 8;

      for (let j = 0; j < 8; j++) {
        c = c & 0x8000 ? (c << 1) ^ 0x1021 : c << 1;
      }

      table[i] = c & 0xffff;
    }

    return table;
  }

  // CRC (циклический избыточный код) — это метод проверки данных, используемый для обнаружения ошибок в цифровых данных.
  getCRC(buffer) {
    // Получаем таблицу CRC (результат функции `getCRCTable`), которая используется в процессе расчета.
    // 16-битное значение используется для CRC, потому что оно обеспечивает хороший баланс между обнаружением ошибок и эффективностью вычислений,
    // обеспечивая высокую вероятность обнаружения ошибок в данных при относительно небольшой вычислительной сложности.
    const crcTable = this.getCRCTable();
    /*
          `0xffff` (65535 в десятичной системе). Это стартовое значение для CRC. `0xffff` — это 16 бит.
          Начальное значение `crc` задается как `0xffff` для обеспечения совместимости с определенным стандартом алгоритма CRC-16,
          который требует начальной инициализации полиномом 0xFFFF.
          Это позволяет более эффективно обнаруживать ошибки в данных и обеспечивает согласованность результатов вычисления CRC в различных системах и реализациях.
        */
    let crc = 0xffff;

    // Проходим по каждому байту в переданном буфере.
    for (const byte of buffer) {
      /*
              Для каждого байта происходит обновление значения `crc`:
              - Делается побитовый сдвиг `crc` влево на 8 бит (`crc << 8`).
              - Применяется XOR (исключающее ИЛИ) с соответствующим элементом из `crcTable`, который определяется как `crcTable[(crc >> 8) ^ byte]`.
              - Операция AND (`& 0xffff`) применяется для сохранения результата в границах 16 бит.
            */

      crc = ((crc << 8) ^ crcTable[(crc >> 8) ^ byte]) & 0xffff;
    }

    /*
          - Преобразует итоговое значение CRC в строку шестнадцатеричного формата.
          - Используется `.toUpperCase()`, чтобы сформировать строку в верхнем регистре.
          - `.padStart(4, '0')` добавляет нули слева, чтобы получить строку длиной четыре символа.
        * */
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  reverseCRC(crc) {
    // Разбиваем строку CRC на две части и меняем их местами
    return crc.slice(2, 4) + crc.slice(0, 2);
  }

  addUSPD(key, uspdObj) {
    this.uspdRegistry.set(String(key), uspdObj);
  }

  getUSPD(key) {
    return this.uspdRegistry.get(key);
  }

  getAllUSPD() {
    return Array.from(this.uspdRegistry.values());
  }

  deleteUSPD(key) {
    return this.uspdRegistry.delete(key);
  }

  checkConnections() {
    const currentTime = new Date();

    for (const [key, uspd] of this.uspdRegistry) {
      if (currentTime - uspd.Time > C.FIVE_MINUTES) {
        console.log(new Date(), `Deleting inactive device IMEI: ${key}`);
        this.deleteUSPD(key);
      }
    }
  }

  thisUSPDinProgress(imei) {
    const uspdToArray = Array.from(this.uspdRegistry.values());

    if (Array.isArray(uspdToArray)) {
      return uspdToArray.find((uspd) => uspd.IMEI === imei && uspd.awaitingResponse);
    }

    return false;
  }

  decrementAttempts() {
    this.attemptsForNewConnection--;
  }

  renewAttempts() {
    this.attemptsForNewConnection = 3;
  }
}

export const uspdManager = new USPDManager();
