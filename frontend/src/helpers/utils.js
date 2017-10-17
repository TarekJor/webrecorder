import config from 'config';


export function addTrailingSlash(url) {
  if (url.match(/^https?\:\/\/[\w-.]+$/)) {
    url += '/';
  }
  return url;
}

export function capitalize(str) {
  if (!str) {
    return str;
  }

  return str.length ? str[0].toUpperCase() + str.slice(1) : '';
}

export function fixMalformedUrls(url) {
  if (!url.match(/^https?:\/\//)) {
    const malformed = url.match(/^([https]+)?[:/]{1,3}/i);
    url = `http://${url.substr(malformed ? malformed[0].length : 0)}`;
  }
  return url;
}

export function isMS() {
  if (/(MSIE|Edge|rv:11)/i.test(navigator.userAgent)) {
    return true;
  }

  return false;
}

export function isSafari() {
  return navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1;
}

export function passwordPassRegex(password) {
  if(!password) return false;

  const rgx = password.match(config.passwordRegex);
  return rgx && rgx[0] === password;
}

export function getRemoteBrowser(tsFragment) {
  if (tsFragment.indexOf('$br') !== -1) {
    return tsFragment.split('$br:')[1];
  }
  return null;
}

export function remoteBrowserMod(rb, ts, sep) {
  let base = ts || '';
  if (rb) {
    base += `$br:${rb}`;
  }
  if (base && sep) {
    base += sep;
  }
  return base;
}

/**
 * Remove trailing slash
 * @param  {string} val url to modify
 * @return {string}     url without trailing slash
 */
export function rts(val) {
  return val.replace(/\/$/, '');
}

export function setTitle(msg, url, title) {
  if (!title) {
    title = url;
  }

  document.title = `${title} (${msg})`;
}

/**
 * Remove http/https from the beginning of a url
 * @param  {string} val url to modify
 * @return {string}     url without protocol
 */
export function stripProtocol(url) {
  return url.replace(/^https?:\/\//i, '');
}

export function truncate(str, length) {
  if (!str) {
    return str;
  }

  return str.length > length ? `${str.substr(0, length).trim()}...` : str;
}

export function promiseDelay(t) {
  return new Promise(resolve => setTimeout(resolve, t));
}

export function deleteStorage(key, device = window.localStorage) {
  try {
    return device.removeItem(`${config.storageKey}${key}`);
  } catch (e) {
    console.log(`Failed deleting ${key} in ${device}`);
  }
  return null;
}

export function getStorage(key, device = window.localStorage) {
  try {
    return device.getItem(`${config.storageKey}${key}`);
  } catch (e) {
    console.log(`Failed getting ${key} in ${device}`);
  }
  return null;
}

export function setStorage(key, value, device = window.localStorage) {
  try {
    device.setItem(`${config.storageKey}${key}`, value);
  } catch (e) {
    console.log(`Failed setting ${key}=${value} in ${device}`);
  }
}
