import { uspdManager } from './uspd-manager.js';

export const tpcService = (socket) => {
  console.log(new Date(), '--- TCP connect ---');

  // CONNECT_DATA_START в битовом представлении
  const firstMessageToSend = Buffer.from([
    192, 0, 6, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 231, 72, 194,
  ]);

  socket.write(firstMessageToSend);

  socket.on('data', (data) => {
    const hexMessage = data.toString('hex').toUpperCase();
    console.log(new Date(), 'Received data:', hexMessage);

    let source = hexMessage;

    if (source.startsWith('C0') && source.endsWith('C2')) {
      const payload = source.slice(2, -6);

      let crcCheck = uspdManager.getCRC(Buffer.from(payload, 'hex'));
      // Инвертируем порядок байт CRC
      crcCheck = uspdManager.reverseCRC(crcCheck);

      if (source.slice(-6, -2) === crcCheck) {
        // if crcCheck is ok renew connection attempts;
        uspdManager.renewAttempts();

        const imei = Buffer.from(payload.slice(10, 40), 'hex').toString('utf8');
        console.log(new Date(), `Device connected IMEI: ${imei}`);

        if (!uspdManager.getUSPD(imei)) {
          uspdManager.addUSPD(imei, {
            IMEI: imei,
            conn: socket,
            Time: new Date(),
            awaitingResponse: false,
          });
        } else {
          const currentUSPD = uspdManager.getUSPD(imei);
          currentUSPD.conn = socket;
          currentUSPD.Time = new Date();
          // Если был не завершенный запрос, устройство на него не ответило, но пытается подключиться заново,
          // значит что-то пошло не так. Очищаем ожидание ответа
          currentUSPD.awaitingResponse = false;
        }

        console.log(new Date(), `Updated UspdManager`);
      } else {
        console.log(new Date(), 'CRC check failed');

        // try to renew connection with right CRC;
        if (uspdManager.attemptsForNewConnection) {
          uspdManager.decrementAttempts();
          // to close connection for new connection
          socket.end();
        }
      }

      // CONNECT_DATA_END в битовом представлении
      const secondMessageToSend = Buffer.from([
        192, 0, 6, 1, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 37, 194,
      ]);

      socket.write(secondMessageToSend);
    } else {
      console.log(new Date(), 'Received data to socket', source);
    }
  });

  socket.on('end', () => {
    console.log(new Date(), 'Connection ended by the client');
  });

  socket.on('close', (hadError) => {
    console.log(new Date(), 'Connection closed, hadError:', hadError);
  });

  socket.on('error', (err) => {
    console.error(new Date(), 'Connection error:', err);
  });

  socket.on('timeout', () => {
    console.log(new Date(), 'Socket timeout');
    socket.end();
  });
};
