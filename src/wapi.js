function promisify(wx) {
  let wxapi = { ...wx };
  for (let attr in wxapi) {
    if (!wxapi.hasOwnProperty(attr) || typeof wxapi[attr] !== 'function') continue;
    if (/sync$/i.test(attr)) continue;
    wxapi[attr + 'Async'] = function asyncFunction(argv = {}) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-useless-call
        wxapi[attr].call(wxapi, {
          ...argv,
          ...{ success: res => resolve(res), fail: err => reject(err) }
        });
      });
    };
  }
  return wxapi;
}

export default promisify(typeof wx === 'object' ? wx : {});
