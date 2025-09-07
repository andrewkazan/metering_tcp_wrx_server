import { uspdManager } from './uspd-manager.js';
import * as U from './utils.js';
import * as C from './config.js';

export const httpService = async (req, res) => {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => (body += chunk.toString()));

    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        const uspd = uspdManager.getUSPD(request.IMEI);

        if (!uspd || !request?.command) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'IMEI or command are not found', time: new Date().toISOString() }));
          return;
        }

        const data = await U.sendCommandToUSPD({ uspd, command: request.command });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: data.toString('hex').toUpperCase() }));
      } catch (err) {
        const errorText = err.message || 'Internal server error';
        console.error('Error:', err);
        res.writeHead(500);
        res.write(JSON.stringify({ error: errorText, time: new Date().toISOString() }));
      } finally {
        res.end();
      }
    });
  } else if (req.method === 'GET') {
    const formatUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.url === '/uspd/list') {
      console.log(new Date(), 'Call list url');
      res.write(JSON.stringify(uspdManager.getAllUSPD()));
      res.end();
      return;
    }

    if (req.url === '/uspd/test') {
      console.log(new Date(), 'Call test url');
      res.write(JSON.stringify({ message: 'Wrx service OK' }));
      res.end();
      return;
    }

    if (req.url.startsWith('/uspd/complexRequest')) {
      console.log(new Date(), 'Call complex request');

      try {
        const imei = formatUrl.searchParams.get('imei');
        const uspd = uspdManager.getUSPD(imei);

        if (!uspd || !imei) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'IMEI or uspd are not found', time: new Date().toISOString() }));
          return;
        }

        const result = { ...C.resultDefault };
        const entries = Object.entries(C.complexCommands);

        for (const [index, [key, value]] of entries.entries()) {
          console.log(new Date(), `Complex request for "${key}" | imei: ${imei}`);

          try {
            const response = await U.sendCommandToUSPD({ uspd, command: value });

            if (response) {
              if (response.hasOwnProperty('error') && response.error) {
                console.log(new Date(), `Complex request for "${key}": Fail | imei: ${imei} | response: ${response}`);
                result[key].error = response.error;
              } else {
                const formatData = response.toString('hex').toUpperCase();
                console.log(new Date(), `Complex request for "${key}": Ok | imei: ${imei} | response: ${formatData}`);
                result[key].data = formatData;
              }
            }
          } catch (e) {
            console.log(new Date(), `Complex request for "${key}": Fail | imei: ${imei} | error: ${e}`);
            result[key].error = e.message || String(e);
          }

          if (index < entries.length - 1) {
            await U.awaiter(C.ONE_MINUTE);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: result }));
      } catch (err) {
        console.error('Error:', err);
        res.writeHead(500);
        res.write(JSON.stringify({ error: err, time: new Date().toISOString() }));
      } finally {
        res.end();
      }
    }
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
};
