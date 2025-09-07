import * as C from './config.js';

function timeoutPromise(ms) {
  let timerId;

  const promiseId = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`Time limit exceeded (${ms}ms)`)), ms);
  });

  const cancelPromise = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return { promiseId, cancelPromise };
}

export function sendCommandToUSPD({ uspd, command, timeoutMs = C.SEND_METERING_DATA_TIMEOUT } = {}) {
  const { promiseId, cancelPromise } = timeoutPromise(timeoutMs);

  const commandBuffer = Buffer.from(command, 'hex');
  uspd.conn.write(commandBuffer);
  uspd.awaitingResponse = true;

  console.log(new Date(), `Send data to uspd ${uspd.IMEI}:`, command);

  return new Promise((resolve, reject) => {
    const onData = (buffer) => {
      cleanup();
      resolve(buffer);
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      cancelPromise();
      uspd.conn.removeListener('data', onData);
      uspd.conn.removeListener('error', onError);
      uspd.awaitingResponse = false;
      uspd.Time = new Date();
    };

    uspd.conn.once('data', onData);
    uspd.conn.once('error', onError);

    promiseId.catch(onError);
  });
}

export const awaiter = (time = 2000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
