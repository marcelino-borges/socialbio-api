const ERROR_EMOJI = "⛔";
const WARNING_EMOJI = "⚠️";
const INFO_EMOJI = "▶️";
const SUCCESS_EMOJI = "✅";

const log = (...msgs: any) => {
  msgs.forEach((msg: any) => {
    const lines = String(msg).split("\n");

    if (lines?.length > 0) lines.forEach((line) => console.log(">> ", line));
    else console.log(">> ", msg);
  });
  console.log("");
};

const info = (...msgs: any) => {
  console.log("");
  console.groupCollapsed(
    "\x1b[36m%s\x1b[0m",
    `${INFO_EMOJI}  INFORMATION LOGS`
  );
  log(...msgs);
  console.groupEnd();
};

const warn = (...msgs: any) => {
  console.log("");
  console.groupCollapsed("\x1b[33m%s\x1b[0m", `${WARNING_EMOJI} WARNING LOGS`);
  log(...msgs);
  console.groupEnd();
};

const error = (...msgs: any) => {
  console.log("");
  console.groupCollapsed("\x1b[31m%s\x1b[0m", `${ERROR_EMOJI} ERROR LOGS`);
  log(...msgs);
  console.groupEnd();
};

const success = (...msgs: any) => {
  console.log("");
  console.groupCollapsed("\x1b[32m%s\x1b[0m", `${SUCCESS_EMOJI} SUCCESS LOGS`);
  log(...msgs);
  console.groupEnd();
};

export default {
  info,
  warn,
  error,
  success,
};
