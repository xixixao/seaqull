const KEY = "V1";

let lastValue = null;

export function writeOnExit() {
  const unloadListener = () => {
    if (lastValue != null) {
      write(lastValue);
    }
  };
  window.addEventListener("beforeunload", unloadListener);
  return () => {
    window.removeEventListener("beforeunload", unloadListener);
  };
}

export function writeEventually(string) {
  writeDebounced(string);
  lastValue = string;
}

export function read() {
  return window.localStorage.getItem(KEY);
}

const writeDebounced = debounce(write, 1000);

function write(string) {
  window.localStorage.setItem(KEY, string);
}

function debounce(debounced, delay) {
  let timeout = null;
  let shouldRun = false;
  return function () {
    let context = this;
    let args = arguments;
    const later = function () {
      timeout = null;
      if (shouldRun) {
        shouldRun = false;
        debounced.apply(context, args);
      }
    };
    const callNow = timeout == null;
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
    if (callNow) {
      debounced.apply(context, args);
    } else {
      shouldRun = true;
    }
  };
}
