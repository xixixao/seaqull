const CANCEL = { __isCanceled: true };

export function cancelable(promise) {
  let hasCanceled = false;
  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => (hasCanceled ? reject(CANCEL) : resolve(val)),
      (error) => (hasCanceled ? reject(CANCEL) : reject(error))
    );
  }).catch((reason) => {
    if (reason !== CANCEL) {
      throw reason;
    }
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}

export function delay(duration_milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, duration_milliseconds);
  });
}
