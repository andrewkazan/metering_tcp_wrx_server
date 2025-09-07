import net from 'net';
import http from 'http';
import * as C from './config.js';
import { httpService } from './http-service.js';
import { tpcService } from './tcp-service.js';
import { uspdManager } from './uspd-manager.js';

const tcpServer = net.createServer(tpcService);

tcpServer.listen(process.env.port_uspd || C.TCP_PORT, () => {
  console.log(new Date(), '--- TCP Server started ---');
});

const httpServer = http.createServer(httpService);

httpServer.listen(C.HTTP_PORT, () => {
  console.log(new Date(), '--- HTTP Server started ---');
});

// Периодически проверяем соединения и удаляем неактивные устройства
setInterval(() => {
  uspdManager.checkConnections();
}, C.ONE_MINUTE);
