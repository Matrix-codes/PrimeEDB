/**
 * PrimeADB Fastboot Service (Main Process)
 * Wraps Fastboot command execution via child_process.
 */

const { exec, spawn } = require('child_process');
const logger = require('./logger.service');
const settingsService = require('./settings.service');

function getFastbootPath() {
  return settingsService.getSettings().fastbootPath || 'fastboot';
}

function execFastboot(args) {
  return new Promise((resolve) => {
    const fb = getFastbootPath();
    const cmd = `"${fb}" ${args}`;
    logger.debug(`Fastboot exec: ${cmd}`);

    exec(cmd, { timeout: 60000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      const output = (stdout + stderr).trim();
      if (err && !output) {
        resolve({ success: false, output: '', error: err.message });
      } else {
        resolve({ success: true, output });
      }
    });
  });
}

function spawnFastboot(args, onData, onClose) {
  const fb = getFastbootPath();
  const child = spawn(fb, args.split(' '));
  child.stdout.on('data', d => onData(d.toString()));
  child.stderr.on('data', d => onData(d.toString()));
  child.on('close', code => onClose && onClose(code));
  child.on('error', err => {
    logger.error('Fastboot spawn error', err.message);
    onData(`Error: ${err.message}`);
  });
  return child;
}

/** Get list of fastboot devices */
async function getDevices() {
  const result = await execFastboot('devices');
  if (!result.success) return { success: false, devices: [], error: result.error };
  const lines = result.output.split('\n').filter(l => l.includes('fastboot'));
  const devices = lines.map(l => {
    const parts = l.trim().split(/\s+/);
    return { serial: parts[0], state: parts[1] || 'fastboot' };
  });
  return { success: true, devices };
}

/** Get all device variables */
async function getVarAll(serial) {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}getvar all`);
}

/** Get a specific variable */
async function getVar(serial, variable) {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}getvar ${variable}`);
}

/** Flash a partition with an image file */
async function flash(serial, partition, imagePath) {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}flash ${partition} "${imagePath}"`);
}

/** Reboot from fastboot */
async function reboot(serial, mode = '') {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}reboot${mode ? ` ${mode}` : ''}`);
}

/** Unlock bootloader */
async function unlockBootloader(serial) {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}flashing unlock`);
}

/** Lock bootloader */
async function lockBootloader(serial) {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}flashing lock`);
}

/** Execute any raw fastboot command */
async function execCommand(serial, command) {
  const serialFlag = serial ? `-s ${serial} ` : '';
  return execFastboot(`${serialFlag}${command}`);
}

module.exports = {
  getDevices,
  getVarAll,
  getVar,
  flash,
  reboot,
  unlockBootloader,
  lockBootloader,
  execCommand,
  spawnFastboot,
};
