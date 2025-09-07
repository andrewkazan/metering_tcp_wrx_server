export const HTTP_PORT = 4000;
export const TCP_PORT = 4001;
export const FIVE_MINUTES = 5 * 60 * 1000;
export const ONE_MINUTE = 60000;
export const SEND_METERING_DATA_TIMEOUT = 2 * 60 * 1000;

export const CONNECT_DATA_START =
  '\xC0\x00\x06\x00\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xE7\x48\xC2';
export const CONNECT_DATA_END =
  '\xC0\x00\x06\x01\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x3F\x25\xC2';

export const mercury206Commands = {
  tariffValue: '02A784FA273C27',
  dateTime: '02A784FA21BC25',
  limitPower: '02A784FA22FC24',
  limitEnergy: '02A784FA233DE4',
  winterSummerFlag: '02A784FA247C26',
  correctionByButtons: '02A784FA25BDE6',
  powerReading: '02A784FA26FDE7',
  valueOfEnergy: '02A784FA273C27',
  byteVersionByteSubversion: '02A784FA287C23',
  batteryVoltage: '02A784FA29BDE3',
  displayIndication: '02A784FA2AFDE2',
  lastShutdown: '02A784FA2B3C22',
  lastActivation: '02A784FA2C7DE0',
  impulseOutputReading: '02A784FA2DBC20',
  tariffSchedule: '02A784FA31BDE9',
  powerNetParameters: '02A784FA633C14',
  officialInformation: '02A784FA65BC16',
  manufactureDate: '02A784FA66FC17',
};

export const complexCommands = {
  dateTime: mercury206Commands.dateTime,
  limitPower: mercury206Commands.limitPower,
  limitEnergy: mercury206Commands.limitEnergy,
  powerReading: mercury206Commands.powerReading,
  valueOfEnergy: mercury206Commands.valueOfEnergy,
  batteryVoltage: mercury206Commands.batteryVoltage,
  powerNetParameters: mercury206Commands.powerNetParameters,
};

export const resultDefault = {
  dateTime: { data: null, error: null },
  limitPower: { data: null, error: null },
  limitEnergy: { data: null, error: null },
  powerReading: { data: null, error: null },
  valueOfEnergy: { data: null, error: null },
  batteryVoltage: { data: null, error: null },
  powerNetParameters: { data: null, error: null },
};
