/**
 * OntoWave v1.0.23 avec markdown-it
 * Lightweight documentation framework avec parser Markdown complet
 * License: CC-BY-NC-SA-4.0
 * https://ontowave.org
 */

(function(window) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: CODE MARKDOWN-IT + PLUGINS
  // ═══════════════════════════════════════════════════════════════
  
  'use strict';

  function _mergeNamespaces(n, m) {
    m.forEach(function (e) {
      e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
        if (k !== 'default' && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    });
    return Object.freeze(n);
  }

  /* eslint-disable no-bitwise */

  const decodeCache = {};

  function getDecodeCache (exclude) {
    let cache = decodeCache[exclude];
    if (cache) { return cache }

    cache = decodeCache[exclude] = [];

    for (let i = 0; i < 128; i++) {
      const ch = String.fromCharCode(i);
      cache.push(ch);
    }

    for (let i = 0; i < exclude.length; i++) {
      const ch = exclude.charCodeAt(i);
      cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
    }

    return cache
  }

  // Decode percent-encoded string.
  //
  function decode$1 (string, exclude) {
    if (typeof exclude !== 'string') {
      exclude = decode$1.defaultChars;
    }

    const cache = getDecodeCache(exclude);

    return string.replace(/(%[a-f0-9]{2})+/gi, function (seq) {
      let result = '';

      for (let i = 0, l = seq.length; i < l; i += 3) {
        const b1 = parseInt(seq.slice(i + 1, i + 3), 16);

        if (b1 < 0x80) {
          result += cache[b1];
          continue
        }

        if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
          // 110xxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);

          if ((b2 & 0xC0) === 0x80) {
            const chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

            if (chr < 0x80) {
              result += '\ufffd\ufffd';
            } else {
              result += String.fromCharCode(chr);
            }

            i += 3;
            continue
          }
        }

        if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
          // 1110xxxx 10xxxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          const b3 = parseInt(seq.slice(i + 7, i + 9), 16);

          if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
            const chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

            if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
              result += '\ufffd\ufffd\ufffd';
            } else {
              result += String.fromCharCode(chr);
            }

            i += 6;
            continue
          }
        }

        if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
          // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
          const b4 = parseInt(seq.slice(i + 10, i + 12), 16);

          if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
            let chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

            if (chr < 0x10000 || chr > 0x10FFFF) {
              result += '\ufffd\ufffd\ufffd\ufffd';
            } else {
              chr -= 0x10000;
              result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
            }

            i += 9;
            continue
          }
        }

        result += '\ufffd';
      }

      return result
    })
  }

  decode$1.defaultChars = ';/?:@&=+$,#';
  decode$1.componentChars = '';

  const encodeCache = {};

  // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  //
  function getEncodeCache (exclude) {
    let cache = encodeCache[exclude];
    if (cache) { return cache }

    cache = encodeCache[exclude] = [];

    for (let i = 0; i < 128; i++) {
      const ch = String.fromCharCode(i);

      if (/^[0-9a-z]$/i.test(ch)) {
        // always allow unencoded alphanumeric characters
        cache.push(ch);
      } else {
        cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
      }
    }

    for (let i = 0; i < exclude.length; i++) {
      cache[exclude.charCodeAt(i)] = exclude[i];
    }

    return cache
  }

  // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  //
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  //
  function encode$1 (string, exclude, keepEscaped) {
    if (typeof exclude !== 'string') {
      // encode(string, keepEscaped)
      keepEscaped = exclude;
      exclude = encode$1.defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
      keepEscaped = true;
    }

    const cache = getEncodeCache(exclude);
    let result = '';

    for (let i = 0, l = string.length; i < l; i++) {
      const code = string.charCodeAt(i);

      if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
          result += string.slice(i, i + 3);
          i += 2;
          continue
        }
      }

      if (code < 128) {
        result += cache[code];
        continue
      }

      if (code >= 0xD800 && code <= 0xDFFF) {
        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
          const nextCode = string.charCodeAt(i + 1);
          if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
            result += encodeURIComponent(string[i] + string[i + 1]);
            i++;
            continue
          }
        }
        result += '%EF%BF%BD';
        continue
      }

      result += encodeURIComponent(string[i]);
    }

    return result
  }

  encode$1.defaultChars = ";/?:@&=+$,-_.!~*'()#";
  encode$1.componentChars = "-_.!~*'()";

  function format (url) {
    let result = '';

    result += url.protocol || '';
    result += url.slashes ? '//' : '';
    result += url.auth ? url.auth + '@' : '';

    if (url.hostname && url.hostname.indexOf(':') !== -1) {
      // ipv6 address
      result += '[' + url.hostname + ']';
    } else {
      result += url.hostname || '';
    }

    result += url.port ? ':' + url.port : '';
    result += url.pathname || '';
    result += url.search || '';
    result += url.hash || '';

    return result
  }

  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  //
  // Changes from joyent/node:
  //
  // 1. No leading slash in paths,
  //    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
  //
  // 2. Backslashes are not replaced with slashes,
  //    so `http:\\example.org\` is treated like a relative path
  //
  // 3. Trailing colon is treated like a part of the path,
  //    i.e. in `http://example.org:foo` pathname is `:foo`
  //
  // 4. Nothing is URL-encoded in the resulting object,
  //    (in joyent/node some chars in auth and paths are encoded)
  //
  // 5. `url.parse()` does not have `parseQueryString` argument
  //
  // 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
  //    which can be constructed using other parts of the url.
  //

  function Url () {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.pathname = null;
  }

  // Reference: RFC 3986, RFC 1808, RFC 2396

  // define these here so at least they only have to be
  // compiled once on the first module load.
  const protocolPattern = /^([a-z0-9.+-]+:)/i;
  const portPattern = /:[0-9]*$/;

  // Special case for a simple path URL
  /* eslint-disable-next-line no-useless-escape */
  const simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;

  // RFC 2396: characters reserved for delimiting URLs.
  // We actually just auto-escape these.
  const delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];

  // RFC 2396: characters not allowed for various reasons.
  const unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);

  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
  const autoEscape = ['\''].concat(unwise);
  // Characters that are never ever allowed in a hostname.
  // Note that any invalid chars are also handled, but these
  // are the ones that are *expected* to be seen, so we fast-path
  // them.
  const nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
  const hostEndingChars = ['/', '?', '#'];
  const hostnameMaxLen = 255;
  const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
  const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
  // protocols that can allow "unsafe" and "unwise" chars.
  // protocols that never have a hostname.
  const hostlessProtocol = {
    javascript: true,
    'javascript:': true
  };
  // protocols that always contain a // bit.
  const slashedProtocol = {
    http: true,
    https: true,
    ftp: true,
    gopher: true,
    file: true,
    'http:': true,
    'https:': true,
    'ftp:': true,
    'gopher:': true,
    'file:': true
  };

  function urlParse (url, slashesDenoteHost) {
    if (url && url instanceof Url) return url

    const u = new Url();
    u.parse(url, slashesDenoteHost);
    return u
  }

  Url.prototype.parse = function (url, slashesDenoteHost) {
    let lowerProto, hec, slashes;
    let rest = url;

    // trim before proceeding.
    // This is to support parse stuff like "  http://foo.com  \n"
    rest = rest.trim();

    if (!slashesDenoteHost && url.split('#').length === 1) {
      // Try fast path regexp
      const simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        this.pathname = simplePath[1];
        if (simplePath[2]) {
          this.search = simplePath[2];
        }
        return this
      }
    }

    let proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      lowerProto = proto.toLowerCase();
      this.protocol = proto;
      rest = rest.substr(proto.length);
    }

    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    /* eslint-disable-next-line no-useless-escape */
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[proto] &&
        (slashes || (proto && !slashedProtocol[proto]))) {
      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      //
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the last @ sign, unless some host-ending character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      //
      // ex:
      // http://a@b@c/ => user:a@b host:c
      // http://a@b?@c => user:a host:c path:/?@c

      // v0.12 TODO(isaacs): This is not quite how Chrome does things.
      // Review our test case against browsers more comprehensively.

      // find the first instance of any hostEndingChars
      let hostEnd = -1;
      for (let i = 0; i < hostEndingChars.length; i++) {
        hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }

      // at this point, either we have an explicit point where the
      // auth portion cannot go past, or the last @ char is the decider.
      let auth, atSign;
      if (hostEnd === -1) {
        // atSign can be anywhere.
        atSign = rest.lastIndexOf('@');
      } else {
        // atSign must be in auth portion.
        // http://a@b/c@d => host:b auth:a path:/c@d
        atSign = rest.lastIndexOf('@', hostEnd);
      }

      // Now we have a portion which is definitely the auth.
      // Pull that off.
      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = auth;
      }

      // the host is the remaining to the left of the first non-host char
      hostEnd = -1;
      for (let i = 0; i < nonHostChars.length; i++) {
        hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }
      // if we still have not hit it, then the entire thing is a host.
      if (hostEnd === -1) {
        hostEnd = rest.length;
      }

      if (rest[hostEnd - 1] === ':') { hostEnd--; }
      const host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);

      // pull out port.
      this.parseHost(host);

      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      this.hostname = this.hostname || '';

      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
      const ipv6Hostname = this.hostname[0] === '[' &&
          this.hostname[this.hostname.length - 1] === ']';

      // validate a little.
      if (!ipv6Hostname) {
        const hostparts = this.hostname.split(/\./);
        for (let i = 0, l = hostparts.length; i < l; i++) {
          const part = hostparts[i];
          if (!part) { continue }
          if (!part.match(hostnamePartPattern)) {
            let newpart = '';
            for (let j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += 'x';
              } else {
                newpart += part[j];
              }
            }
            // we test again with ASCII char only
            if (!newpart.match(hostnamePartPattern)) {
              const validParts = hostparts.slice(0, i);
              const notHost = hostparts.slice(i + 1);
              const bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = notHost.join('.') + rest;
              }
              this.hostname = validParts.join('.');
              break
            }
          }
        }
      }

      if (this.hostname.length > hostnameMaxLen) {
        this.hostname = '';
      }

      // strip [ and ] from the hostname
      // the host field still retains them, though
      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      }
    }

    // chop off from the tail first.
    const hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string.
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    const qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      rest = rest.slice(0, qm);
    }
    if (rest) { this.pathname = rest; }
    if (slashedProtocol[lowerProto] &&
        this.hostname && !this.pathname) {
      this.pathname = '';
    }

    return this
  };

  Url.prototype.parseHost = function (host) {
    let port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) { this.hostname = host; }
  };

  var mdurl = /*#__PURE__*/Object.freeze({
    __proto__: null,
    decode: decode$1,
    encode: encode$1,
    format: format,
    parse: urlParse
  });

  var Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;

  var Cc = /[\0-\x1F\x7F-\x9F]/;

  var regex$1 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;

  var P = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;

  var regex = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;

  var Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

  var ucmicro = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Any: Any,
    Cc: Cc,
    Cf: regex$1,
    P: P,
    S: regex,
    Z: Z
  });

  // Generated using scripts/write-decode-map.ts
  var htmlDecodeTree = new Uint16Array(
  // prettier-ignore
  "\u1d41<\xd5\u0131\u028a\u049d\u057b\u05d0\u0675\u06de\u07a2\u07d6\u080f\u0a4a\u0a91\u0da1\u0e6d\u0f09\u0f26\u10ca\u1228\u12e1\u1415\u149d\u14c3\u14df\u1525\0\0\0\0\0\0\u156b\u16cd\u198d\u1c12\u1ddd\u1f7e\u2060\u21b0\u228d\u23c0\u23fb\u2442\u2824\u2912\u2d08\u2e48\u2fce\u3016\u32ba\u3639\u37ac\u38fe\u3a28\u3a71\u3ae0\u3b2e\u0800EMabcfglmnoprstu\\bfms\x7f\x84\x8b\x90\x95\x98\xa6\xb3\xb9\xc8\xcflig\u803b\xc6\u40c6P\u803b&\u4026cute\u803b\xc1\u40c1reve;\u4102\u0100iyx}rc\u803b\xc2\u40c2;\u4410r;\uc000\ud835\udd04rave\u803b\xc0\u40c0pha;\u4391acr;\u4100d;\u6a53\u0100gp\x9d\xa1on;\u4104f;\uc000\ud835\udd38plyFunction;\u6061ing\u803b\xc5\u40c5\u0100cs\xbe\xc3r;\uc000\ud835\udc9cign;\u6254ilde\u803b\xc3\u40c3ml\u803b\xc4\u40c4\u0400aceforsu\xe5\xfb\xfe\u0117\u011c\u0122\u0127\u012a\u0100cr\xea\xf2kslash;\u6216\u0176\xf6\xf8;\u6ae7ed;\u6306y;\u4411\u0180crt\u0105\u010b\u0114ause;\u6235noullis;\u612ca;\u4392r;\uc000\ud835\udd05pf;\uc000\ud835\udd39eve;\u42d8c\xf2\u0113mpeq;\u624e\u0700HOacdefhilorsu\u014d\u0151\u0156\u0180\u019e\u01a2\u01b5\u01b7\u01ba\u01dc\u0215\u0273\u0278\u027ecy;\u4427PY\u803b\xa9\u40a9\u0180cpy\u015d\u0162\u017aute;\u4106\u0100;i\u0167\u0168\u62d2talDifferentialD;\u6145leys;\u612d\u0200aeio\u0189\u018e\u0194\u0198ron;\u410cdil\u803b\xc7\u40c7rc;\u4108nint;\u6230ot;\u410a\u0100dn\u01a7\u01adilla;\u40b8terDot;\u40b7\xf2\u017fi;\u43a7rcle\u0200DMPT\u01c7\u01cb\u01d1\u01d6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01e2\u01f8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020foubleQuote;\u601duote;\u6019\u0200lnpu\u021e\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6a74\u0180git\u022f\u0236\u023aruent;\u6261nt;\u622fourIntegral;\u622e\u0100fr\u024c\u024e;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6a2fcr;\uc000\ud835\udc9ep\u0100;C\u0284\u0285\u62d3ap;\u624d\u0580DJSZacefios\u02a0\u02ac\u02b0\u02b4\u02b8\u02cb\u02d7\u02e1\u02e6\u0333\u048d\u0100;o\u0179\u02a5trahd;\u6911cy;\u4402cy;\u4405cy;\u440f\u0180grs\u02bf\u02c4\u02c7ger;\u6021r;\u61a1hv;\u6ae4\u0100ay\u02d0\u02d5ron;\u410e;\u4414l\u0100;t\u02dd\u02de\u6207a;\u4394r;\uc000\ud835\udd07\u0100af\u02eb\u0327\u0100cm\u02f0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031ccute;\u40b4o\u0174\u030b\u030d;\u42d9bleAcute;\u42ddrave;\u4060ilde;\u42dcond;\u62c4ferentialD;\u6146\u0470\u033d\0\0\0\u0342\u0354\0\u0405f;\uc000\ud835\udd3b\u0180;DE\u0348\u0349\u034d\u40a8ot;\u60dcqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03cf\u03e2\u03f8ontourIntegra\xec\u0239o\u0274\u0379\0\0\u037b\xbb\u0349nArrow;\u61d3\u0100eo\u0387\u03a4ft\u0180ART\u0390\u0396\u03a1rrow;\u61d0ightArrow;\u61d4e\xe5\u02cang\u0100LR\u03ab\u03c4eft\u0100AR\u03b3\u03b9rrow;\u67f8ightArrow;\u67faightArrow;\u67f9ight\u0100AT\u03d8\u03derrow;\u61d2ee;\u62a8p\u0241\u03e9\0\0\u03efrrow;\u61d1ownArrow;\u61d5erticalBar;\u6225n\u0300ABLRTa\u0412\u042a\u0430\u045e\u047f\u037crrow\u0180;BU\u041d\u041e\u0422\u6193ar;\u6913pArrow;\u61f5reve;\u4311eft\u02d2\u043a\0\u0446\0\u0450ightVector;\u6950eeVector;\u695eector\u0100;B\u0459\u045a\u61bdar;\u6956ight\u01d4\u0467\0\u0471eeVector;\u695fector\u0100;B\u047a\u047b\u61c1ar;\u6957ee\u0100;A\u0486\u0487\u62a4rrow;\u61a7\u0100ct\u0492\u0497r;\uc000\ud835\udc9frok;\u4110\u0800NTacdfglmopqstux\u04bd\u04c0\u04c4\u04cb\u04de\u04e2\u04e7\u04ee\u04f5\u0521\u052f\u0536\u0552\u055d\u0560\u0565G;\u414aH\u803b\xd0\u40d0cute\u803b\xc9\u40c9\u0180aiy\u04d2\u04d7\u04dcron;\u411arc\u803b\xca\u40ca;\u442dot;\u4116r;\uc000\ud835\udd08rave\u803b\xc8\u40c8ement;\u6208\u0100ap\u04fa\u04fecr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65fberySmallSquare;\u65ab\u0100gp\u0526\u052aon;\u4118f;\uc000\ud835\udd3csilon;\u4395u\u0100ai\u053c\u0549l\u0100;T\u0542\u0543\u6a75ilde;\u6242librium;\u61cc\u0100ci\u0557\u055ar;\u6130m;\u6a73a;\u4397ml\u803b\xcb\u40cb\u0100ip\u056a\u056fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058d\u05b2\u05ccy;\u4424r;\uc000\ud835\udd09lled\u0253\u0597\0\0\u05a3mallSquare;\u65fcerySmallSquare;\u65aa\u0370\u05ba\0\u05bf\0\0\u05c4f;\uc000\ud835\udd3dAll;\u6200riertrf;\u6131c\xf2\u05cb\u0600JTabcdfgorst\u05e8\u05ec\u05ef\u05fa\u0600\u0612\u0616\u061b\u061d\u0623\u066c\u0672cy;\u4403\u803b>\u403emma\u0100;d\u05f7\u05f8\u4393;\u43dcreve;\u411e\u0180eiy\u0607\u060c\u0610dil;\u4122rc;\u411c;\u4413ot;\u4120r;\uc000\ud835\udd0a;\u62d9pf;\uc000\ud835\udd3eeater\u0300EFGLST\u0635\u0644\u064e\u0656\u065b\u0666qual\u0100;L\u063e\u063f\u6265ess;\u62dbullEqual;\u6267reater;\u6aa2ess;\u6277lantEqual;\u6a7eilde;\u6273cr;\uc000\ud835\udca2;\u626b\u0400Aacfiosu\u0685\u068b\u0696\u069b\u069e\u06aa\u06be\u06caRDcy;\u442a\u0100ct\u0690\u0694ek;\u42c7;\u405eirc;\u4124r;\u610clbertSpace;\u610b\u01f0\u06af\0\u06b2f;\u610dizontalLine;\u6500\u0100ct\u06c3\u06c5\xf2\u06a9rok;\u4126mp\u0144\u06d0\u06d8ownHum\xf0\u012fqual;\u624f\u0700EJOacdfgmnostu\u06fa\u06fe\u0703\u0707\u070e\u071a\u071e\u0721\u0728\u0744\u0778\u078b\u078f\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803b\xcd\u40cd\u0100iy\u0713\u0718rc\u803b\xce\u40ce;\u4418ot;\u4130r;\u6111rave\u803b\xcc\u40cc\u0180;ap\u0720\u072f\u073f\u0100cg\u0734\u0737r;\u412ainaryI;\u6148lie\xf3\u03dd\u01f4\u0749\0\u0762\u0100;e\u074d\u074e\u622c\u0100gr\u0753\u0758ral;\u622bsection;\u62c2isible\u0100CT\u076c\u0772omma;\u6063imes;\u6062\u0180gpt\u077f\u0783\u0788on;\u412ef;\uc000\ud835\udd40a;\u4399cr;\u6110ilde;\u4128\u01eb\u079a\0\u079ecy;\u4406l\u803b\xcf\u40cf\u0280cfosu\u07ac\u07b7\u07bc\u07c2\u07d0\u0100iy\u07b1\u07b5rc;\u4134;\u4419r;\uc000\ud835\udd0dpf;\uc000\ud835\udd41\u01e3\u07c7\0\u07ccr;\uc000\ud835\udca5rcy;\u4408kcy;\u4404\u0380HJacfos\u07e4\u07e8\u07ec\u07f1\u07fd\u0802\u0808cy;\u4425cy;\u440cppa;\u439a\u0100ey\u07f6\u07fbdil;\u4136;\u441ar;\uc000\ud835\udd0epf;\uc000\ud835\udd42cr;\uc000\ud835\udca6\u0580JTaceflmost\u0825\u0829\u082c\u0850\u0863\u09b3\u09b8\u09c7\u09cd\u0a37\u0a47cy;\u4409\u803b<\u403c\u0280cmnpr\u0837\u083c\u0841\u0844\u084dute;\u4139bda;\u439bg;\u67ealacetrf;\u6112r;\u619e\u0180aey\u0857\u085c\u0861ron;\u413ddil;\u413b;\u441b\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087e\u08a9\u08b1\u08e0\u08e6\u08fc\u092f\u095b\u0390\u096a\u0100nr\u0883\u088fgleBracket;\u67e8row\u0180;BR\u0899\u089a\u089e\u6190ar;\u61e4ightArrow;\u61c6eiling;\u6308o\u01f5\u08b7\0\u08c3bleBracket;\u67e6n\u01d4\u08c8\0\u08d2eeVector;\u6961ector\u0100;B\u08db\u08dc\u61c3ar;\u6959loor;\u630aight\u0100AV\u08ef\u08f5rrow;\u6194ector;\u694e\u0100er\u0901\u0917e\u0180;AV\u0909\u090a\u0910\u62a3rrow;\u61a4ector;\u695aiangle\u0180;BE\u0924\u0925\u0929\u62b2ar;\u69cfqual;\u62b4p\u0180DTV\u0937\u0942\u094cownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61bfar;\u6958ector\u0100;B\u0965\u0966\u61bcar;\u6952ight\xe1\u039cs\u0300EFGLST\u097e\u098b\u0995\u099d\u09a2\u09adqualGreater;\u62daullEqual;\u6266reater;\u6276ess;\u6aa1lantEqual;\u6a7dilde;\u6272r;\uc000\ud835\udd0f\u0100;e\u09bd\u09be\u62d8ftarrow;\u61daidot;\u413f\u0180npw\u09d4\u0a16\u0a1bg\u0200LRlr\u09de\u09f7\u0a02\u0a10eft\u0100AR\u09e6\u09ecrrow;\u67f5ightArrow;\u67f7ightArrow;\u67f6eft\u0100ar\u03b3\u0a0aight\xe1\u03bfight\xe1\u03caf;\uc000\ud835\udd43er\u0100LR\u0a22\u0a2ceftArrow;\u6199ightArrow;\u6198\u0180cht\u0a3e\u0a40\u0a42\xf2\u084c;\u61b0rok;\u4141;\u626a\u0400acefiosu\u0a5a\u0a5d\u0a60\u0a77\u0a7c\u0a85\u0a8b\u0a8ep;\u6905y;\u441c\u0100dl\u0a65\u0a6fiumSpace;\u605flintrf;\u6133r;\uc000\ud835\udd10nusPlus;\u6213pf;\uc000\ud835\udd44c\xf2\u0a76;\u439c\u0480Jacefostu\u0aa3\u0aa7\u0aad\u0ac0\u0b14\u0b19\u0d91\u0d97\u0d9ecy;\u440acute;\u4143\u0180aey\u0ab4\u0ab9\u0aberon;\u4147dil;\u4145;\u441d\u0180gsw\u0ac7\u0af0\u0b0eative\u0180MTV\u0ad3\u0adf\u0ae8ediumSpace;\u600bhi\u0100cn\u0ae6\u0ad8\xeb\u0ad9eryThi\xee\u0ad9ted\u0100GL\u0af8\u0b06reaterGreate\xf2\u0673essLes\xf3\u0a48Line;\u400ar;\uc000\ud835\udd11\u0200Bnpt\u0b22\u0b28\u0b37\u0b3areak;\u6060BreakingSpace;\u40a0f;\u6115\u0680;CDEGHLNPRSTV\u0b55\u0b56\u0b6a\u0b7c\u0ba1\u0beb\u0c04\u0c5e\u0c84\u0ca6\u0cd8\u0d61\u0d85\u6aec\u0100ou\u0b5b\u0b64ngruent;\u6262pCap;\u626doubleVerticalBar;\u6226\u0180lqx\u0b83\u0b8a\u0b9bement;\u6209ual\u0100;T\u0b92\u0b93\u6260ilde;\uc000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0bb6\u0bb7\u0bbd\u0bc9\u0bd3\u0bd8\u0be5\u626fqual;\u6271ullEqual;\uc000\u2267\u0338reater;\uc000\u226b\u0338ess;\u6279lantEqual;\uc000\u2a7e\u0338ilde;\u6275ump\u0144\u0bf2\u0bfdownHump;\uc000\u224e\u0338qual;\uc000\u224f\u0338e\u0100fs\u0c0a\u0c27tTriangle\u0180;BE\u0c1a\u0c1b\u0c21\u62eaar;\uc000\u29cf\u0338qual;\u62ecs\u0300;EGLST\u0c35\u0c36\u0c3c\u0c44\u0c4b\u0c58\u626equal;\u6270reater;\u6278ess;\uc000\u226a\u0338lantEqual;\uc000\u2a7d\u0338ilde;\u6274ested\u0100GL\u0c68\u0c79reaterGreater;\uc000\u2aa2\u0338essLess;\uc000\u2aa1\u0338recedes\u0180;ES\u0c92\u0c93\u0c9b\u6280qual;\uc000\u2aaf\u0338lantEqual;\u62e0\u0100ei\u0cab\u0cb9verseElement;\u620cghtTriangle\u0180;BE\u0ccb\u0ccc\u0cd2\u62ebar;\uc000\u29d0\u0338qual;\u62ed\u0100qu\u0cdd\u0d0cuareSu\u0100bp\u0ce8\u0cf9set\u0100;E\u0cf0\u0cf3\uc000\u228f\u0338qual;\u62e2erset\u0100;E\u0d03\u0d06\uc000\u2290\u0338qual;\u62e3\u0180bcp\u0d13\u0d24\u0d4eset\u0100;E\u0d1b\u0d1e\uc000\u2282\u20d2qual;\u6288ceeds\u0200;EST\u0d32\u0d33\u0d3b\u0d46\u6281qual;\uc000\u2ab0\u0338lantEqual;\u62e1ilde;\uc000\u227f\u0338erset\u0100;E\u0d58\u0d5b\uc000\u2283\u20d2qual;\u6289ilde\u0200;EFT\u0d6e\u0d6f\u0d75\u0d7f\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uc000\ud835\udca9ilde\u803b\xd1\u40d1;\u439d\u0700Eacdfgmoprstuv\u0dbd\u0dc2\u0dc9\u0dd5\u0ddb\u0de0\u0de7\u0dfc\u0e02\u0e20\u0e22\u0e32\u0e3f\u0e44lig;\u4152cute\u803b\xd3\u40d3\u0100iy\u0dce\u0dd3rc\u803b\xd4\u40d4;\u441eblac;\u4150r;\uc000\ud835\udd12rave\u803b\xd2\u40d2\u0180aei\u0dee\u0df2\u0df6cr;\u414cga;\u43a9cron;\u439fpf;\uc000\ud835\udd46enCurly\u0100DQ\u0e0e\u0e1aoubleQuote;\u601cuote;\u6018;\u6a54\u0100cl\u0e27\u0e2cr;\uc000\ud835\udcaaash\u803b\xd8\u40d8i\u016c\u0e37\u0e3cde\u803b\xd5\u40d5es;\u6a37ml\u803b\xd6\u40d6er\u0100BP\u0e4b\u0e60\u0100ar\u0e50\u0e53r;\u603eac\u0100ek\u0e5a\u0e5c;\u63deet;\u63b4arenthesis;\u63dc\u0480acfhilors\u0e7f\u0e87\u0e8a\u0e8f\u0e92\u0e94\u0e9d\u0eb0\u0efcrtialD;\u6202y;\u441fr;\uc000\ud835\udd13i;\u43a6;\u43a0usMinus;\u40b1\u0100ip\u0ea2\u0eadncareplan\xe5\u069df;\u6119\u0200;eio\u0eb9\u0eba\u0ee0\u0ee4\u6abbcedes\u0200;EST\u0ec8\u0ec9\u0ecf\u0eda\u627aqual;\u6aaflantEqual;\u627cilde;\u627eme;\u6033\u0100dp\u0ee9\u0eeeuct;\u620fortion\u0100;a\u0225\u0ef9l;\u621d\u0100ci\u0f01\u0f06r;\uc000\ud835\udcab;\u43a8\u0200Ufos\u0f11\u0f16\u0f1b\u0f1fOT\u803b\"\u4022r;\uc000\ud835\udd14pf;\u611acr;\uc000\ud835\udcac\u0600BEacefhiorsu\u0f3e\u0f43\u0f47\u0f60\u0f73\u0fa7\u0faa\u0fad\u1096\u10a9\u10b4\u10bearr;\u6910G\u803b\xae\u40ae\u0180cnr\u0f4e\u0f53\u0f56ute;\u4154g;\u67ebr\u0100;t\u0f5c\u0f5d\u61a0l;\u6916\u0180aey\u0f67\u0f6c\u0f71ron;\u4158dil;\u4156;\u4420\u0100;v\u0f78\u0f79\u611cerse\u0100EU\u0f82\u0f99\u0100lq\u0f87\u0f8eement;\u620builibrium;\u61cbpEquilibrium;\u696fr\xbb\u0f79o;\u43a1ght\u0400ACDFTUVa\u0fc1\u0feb\u0ff3\u1022\u1028\u105b\u1087\u03d8\u0100nr\u0fc6\u0fd2gleBracket;\u67e9row\u0180;BL\u0fdc\u0fdd\u0fe1\u6192ar;\u61e5eftArrow;\u61c4eiling;\u6309o\u01f5\u0ff9\0\u1005bleBracket;\u67e7n\u01d4\u100a\0\u1014eeVector;\u695dector\u0100;B\u101d\u101e\u61c2ar;\u6955loor;\u630b\u0100er\u102d\u1043e\u0180;AV\u1035\u1036\u103c\u62a2rrow;\u61a6ector;\u695biangle\u0180;BE\u1050\u1051\u1055\u62b3ar;\u69d0qual;\u62b5p\u0180DTV\u1063\u106e\u1078ownVector;\u694feeVector;\u695cector\u0100;B\u1082\u1083\u61bear;\u6954ector\u0100;B\u1091\u1092\u61c0ar;\u6953\u0100pu\u109b\u109ef;\u611dndImplies;\u6970ightarrow;\u61db\u0100ch\u10b9\u10bcr;\u611b;\u61b1leDelayed;\u69f4\u0680HOacfhimoqstu\u10e4\u10f1\u10f7\u10fd\u1119\u111e\u1151\u1156\u1161\u1167\u11b5\u11bb\u11bf\u0100Cc\u10e9\u10eeHcy;\u4429y;\u4428FTcy;\u442ccute;\u415a\u0280;aeiy\u1108\u1109\u110e\u1113\u1117\u6abcron;\u4160dil;\u415erc;\u415c;\u4421r;\uc000\ud835\udd16ort\u0200DLRU\u112a\u1134\u113e\u1149ownArrow\xbb\u041eeftArrow\xbb\u089aightArrow\xbb\u0fddpArrow;\u6191gma;\u43a3allCircle;\u6218pf;\uc000\ud835\udd4a\u0272\u116d\0\0\u1170t;\u621aare\u0200;ISU\u117b\u117c\u1189\u11af\u65a1ntersection;\u6293u\u0100bp\u118f\u119eset\u0100;E\u1197\u1198\u628fqual;\u6291erset\u0100;E\u11a8\u11a9\u6290qual;\u6292nion;\u6294cr;\uc000\ud835\udcaear;\u62c6\u0200bcmp\u11c8\u11db\u1209\u120b\u0100;s\u11cd\u11ce\u62d0et\u0100;E\u11cd\u11d5qual;\u6286\u0100ch\u11e0\u1205eeds\u0200;EST\u11ed\u11ee\u11f4\u11ff\u627bqual;\u6ab0lantEqual;\u627dilde;\u627fTh\xe1\u0f8c;\u6211\u0180;es\u1212\u1213\u1223\u62d1rset\u0100;E\u121c\u121d\u6283qual;\u6287et\xbb\u1213\u0580HRSacfhiors\u123e\u1244\u1249\u1255\u125e\u1271\u1276\u129f\u12c2\u12c8\u12d1ORN\u803b\xde\u40deADE;\u6122\u0100Hc\u124e\u1252cy;\u440by;\u4426\u0100bu\u125a\u125c;\u4009;\u43a4\u0180aey\u1265\u126a\u126fron;\u4164dil;\u4162;\u4422r;\uc000\ud835\udd17\u0100ei\u127b\u1289\u01f2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128e\u1298kSpace;\uc000\u205f\u200aSpace;\u6009lde\u0200;EFT\u12ab\u12ac\u12b2\u12bc\u623cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uc000\ud835\udd4bipleDot;\u60db\u0100ct\u12d6\u12dbr;\uc000\ud835\udcafrok;\u4166\u0ae1\u12f7\u130e\u131a\u1326\0\u132c\u1331\0\0\0\0\0\u1338\u133d\u1377\u1385\0\u13ff\u1404\u140a\u1410\u0100cr\u12fb\u1301ute\u803b\xda\u40dar\u0100;o\u1307\u1308\u619fcir;\u6949r\u01e3\u1313\0\u1316y;\u440eve;\u416c\u0100iy\u131e\u1323rc\u803b\xdb\u40db;\u4423blac;\u4170r;\uc000\ud835\udd18rave\u803b\xd9\u40d9acr;\u416a\u0100di\u1341\u1369er\u0100BP\u1348\u135d\u0100ar\u134d\u1350r;\u405fac\u0100ek\u1357\u1359;\u63dfet;\u63b5arenthesis;\u63ddon\u0100;P\u1370\u1371\u62c3lus;\u628e\u0100gp\u137b\u137fon;\u4172f;\uc000\ud835\udd4c\u0400ADETadps\u1395\u13ae\u13b8\u13c4\u03e8\u13d2\u13d7\u13f3rrow\u0180;BD\u1150\u13a0\u13a4ar;\u6912ownArrow;\u61c5ownArrow;\u6195quilibrium;\u696eee\u0100;A\u13cb\u13cc\u62a5rrow;\u61a5own\xe1\u03f3er\u0100LR\u13de\u13e8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13f9\u13fa\u43d2on;\u43a5ing;\u416ecr;\uc000\ud835\udcb0ilde;\u4168ml\u803b\xdc\u40dc\u0480Dbcdefosv\u1427\u142c\u1430\u1433\u143e\u1485\u148a\u1490\u1496ash;\u62abar;\u6aeby;\u4412ash\u0100;l\u143b\u143c\u62a9;\u6ae6\u0100er\u1443\u1445;\u62c1\u0180bty\u144c\u1450\u147aar;\u6016\u0100;i\u144f\u1455cal\u0200BLST\u1461\u1465\u146a\u1474ar;\u6223ine;\u407ceparator;\u6758ilde;\u6240ThinSpace;\u600ar;\uc000\ud835\udd19pf;\uc000\ud835\udd4dcr;\uc000\ud835\udcb1dash;\u62aa\u0280cefos\u14a7\u14ac\u14b1\u14b6\u14bcirc;\u4174dge;\u62c0r;\uc000\ud835\udd1apf;\uc000\ud835\udd4ecr;\uc000\ud835\udcb2\u0200fios\u14cb\u14d0\u14d2\u14d8r;\uc000\ud835\udd1b;\u439epf;\uc000\ud835\udd4fcr;\uc000\ud835\udcb3\u0480AIUacfosu\u14f1\u14f5\u14f9\u14fd\u1504\u150f\u1514\u151a\u1520cy;\u442fcy;\u4407cy;\u442ecute\u803b\xdd\u40dd\u0100iy\u1509\u150drc;\u4176;\u442br;\uc000\ud835\udd1cpf;\uc000\ud835\udd50cr;\uc000\ud835\udcb4ml;\u4178\u0400Hacdefos\u1535\u1539\u153f\u154b\u154f\u155d\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417d;\u4417ot;\u417b\u01f2\u1554\0\u155boWidt\xe8\u0ad9a;\u4396r;\u6128pf;\u6124cr;\uc000\ud835\udcb5\u0be1\u1583\u158a\u1590\0\u15b0\u15b6\u15bf\0\0\0\0\u15c6\u15db\u15eb\u165f\u166d\0\u1695\u169b\u16b2\u16b9\0\u16becute\u803b\xe1\u40e1reve;\u4103\u0300;Ediuy\u159c\u159d\u15a1\u15a3\u15a8\u15ad\u623e;\uc000\u223e\u0333;\u623frc\u803b\xe2\u40e2te\u80bb\xb4\u0306;\u4430lig\u803b\xe6\u40e6\u0100;r\xb2\u15ba;\uc000\ud835\udd1erave\u803b\xe0\u40e0\u0100ep\u15ca\u15d6\u0100fp\u15cf\u15d4sym;\u6135\xe8\u15d3ha;\u43b1\u0100ap\u15dfc\u0100cl\u15e4\u15e7r;\u4101g;\u6a3f\u0264\u15f0\0\0\u160a\u0280;adsv\u15fa\u15fb\u15ff\u1601\u1607\u6227nd;\u6a55;\u6a5clope;\u6a58;\u6a5a\u0380;elmrsz\u1618\u1619\u161b\u161e\u163f\u164f\u1659\u6220;\u69a4e\xbb\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163a\u163c\u163e;\u69a8;\u69a9;\u69aa;\u69ab;\u69ac;\u69ad;\u69ae;\u69aft\u0100;v\u1645\u1646\u621fb\u0100;d\u164c\u164d\u62be;\u699d\u0100pt\u1654\u1657h;\u6222\xbb\xb9arr;\u637c\u0100gp\u1663\u1667on;\u4105f;\uc000\ud835\udd52\u0380;Eaeiop\u12c1\u167b\u167d\u1682\u1684\u1687\u168a;\u6a70cir;\u6a6f;\u624ad;\u624bs;\u4027rox\u0100;e\u12c1\u1692\xf1\u1683ing\u803b\xe5\u40e5\u0180cty\u16a1\u16a6\u16a8r;\uc000\ud835\udcb6;\u402amp\u0100;e\u12c1\u16af\xf1\u0288ilde\u803b\xe3\u40e3ml\u803b\xe4\u40e4\u0100ci\u16c2\u16c8onin\xf4\u0272nt;\u6a11\u0800Nabcdefiklnoprsu\u16ed\u16f1\u1730\u173c\u1743\u1748\u1778\u177d\u17e0\u17e6\u1839\u1850\u170d\u193d\u1948\u1970ot;\u6aed\u0100cr\u16f6\u171ek\u0200ceps\u1700\u1705\u170d\u1713ong;\u624cpsilon;\u43f6rime;\u6035im\u0100;e\u171a\u171b\u623dq;\u62cd\u0176\u1722\u1726ee;\u62bded\u0100;g\u172c\u172d\u6305e\xbb\u172drk\u0100;t\u135c\u1737brk;\u63b6\u0100oy\u1701\u1741;\u4431quo;\u601e\u0280cmprt\u1753\u175b\u1761\u1764\u1768aus\u0100;e\u010a\u0109ptyv;\u69b0s\xe9\u170cno\xf5\u0113\u0180ahw\u176f\u1771\u1773;\u43b2;\u6136een;\u626cr;\uc000\ud835\udd1fg\u0380costuvw\u178d\u179d\u17b3\u17c1\u17d5\u17db\u17de\u0180aiu\u1794\u1796\u179a\xf0\u0760rc;\u65efp\xbb\u1371\u0180dpt\u17a4\u17a8\u17adot;\u6a00lus;\u6a01imes;\u6a02\u0271\u17b9\0\0\u17becup;\u6a06ar;\u6605riangle\u0100du\u17cd\u17d2own;\u65bdp;\u65b3plus;\u6a04e\xe5\u1444\xe5\u14adarow;\u690d\u0180ako\u17ed\u1826\u1835\u0100cn\u17f2\u1823k\u0180lst\u17fa\u05ab\u1802ozenge;\u69ebriangle\u0200;dlr\u1812\u1813\u1818\u181d\u65b4own;\u65beeft;\u65c2ight;\u65b8k;\u6423\u01b1\u182b\0\u1833\u01b2\u182f\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183e\u184d\u0100;q\u1843\u1846\uc000=\u20e5uiv;\uc000\u2261\u20e5t;\u6310\u0200ptwx\u1859\u185e\u1867\u186cf;\uc000\ud835\udd53\u0100;t\u13cb\u1863om\xbb\u13cctie;\u62c8\u0600DHUVbdhmptuv\u1885\u1896\u18aa\u18bb\u18d7\u18db\u18ec\u18ff\u1905\u190a\u1910\u1921\u0200LRlr\u188e\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18a1\u18a2\u18a4\u18a6\u18a8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18b3\u18b5\u18b7\u18b9;\u655d;\u655a;\u655c;\u6559\u0380;HLRhlr\u18ca\u18cb\u18cd\u18cf\u18d1\u18d3\u18d5\u6551;\u656c;\u6563;\u6560;\u656b;\u6562;\u655fox;\u69c9\u0200LRlr\u18e4\u18e6\u18e8\u18ea;\u6555;\u6552;\u6510;\u650c\u0280;DUdu\u06bd\u18f7\u18f9\u18fb\u18fd;\u6565;\u6568;\u652c;\u6534inus;\u629flus;\u629eimes;\u62a0\u0200LRlr\u1919\u191b\u191d\u191f;\u655b;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193b\u6502;\u656a;\u6561;\u655e;\u653c;\u6524;\u651c\u0100ev\u0123\u1942bar\u803b\xa6\u40a6\u0200ceio\u1951\u1956\u195a\u1960r;\uc000\ud835\udcb7mi;\u604fm\u0100;e\u171a\u171cl\u0180;bh\u1968\u1969\u196b\u405c;\u69c5sub;\u67c8\u016c\u1974\u197el\u0100;e\u1979\u197a\u6022t\xbb\u197ap\u0180;Ee\u012f\u1985\u1987;\u6aae\u0100;q\u06dc\u06db\u0ce1\u19a7\0\u19e8\u1a11\u1a15\u1a32\0\u1a37\u1a50\0\0\u1ab4\0\0\u1ac1\0\0\u1b21\u1b2e\u1b4d\u1b52\0\u1bfd\0\u1c0c\u0180cpr\u19ad\u19b2\u19ddute;\u4107\u0300;abcds\u19bf\u19c0\u19c4\u19ca\u19d5\u19d9\u6229nd;\u6a44rcup;\u6a49\u0100au\u19cf\u19d2p;\u6a4bp;\u6a47ot;\u6a40;\uc000\u2229\ufe00\u0100eo\u19e2\u19e5t;\u6041\xee\u0693\u0200aeiu\u19f0\u19fb\u1a01\u1a05\u01f0\u19f5\0\u19f8s;\u6a4don;\u410ddil\u803b\xe7\u40e7rc;\u4109ps\u0100;s\u1a0c\u1a0d\u6a4cm;\u6a50ot;\u410b\u0180dmn\u1a1b\u1a20\u1a26il\u80bb\xb8\u01adptyv;\u69b2t\u8100\xa2;e\u1a2d\u1a2e\u40a2r\xe4\u01b2r;\uc000\ud835\udd20\u0180cei\u1a3d\u1a40\u1a4dy;\u4447ck\u0100;m\u1a47\u1a48\u6713ark\xbb\u1a48;\u43c7r\u0380;Ecefms\u1a5f\u1a60\u1a62\u1a6b\u1aa4\u1aaa\u1aae\u65cb;\u69c3\u0180;el\u1a69\u1a6a\u1a6d\u42c6q;\u6257e\u0261\u1a74\0\0\u1a88rrow\u0100lr\u1a7c\u1a81eft;\u61baight;\u61bb\u0280RSacd\u1a92\u1a94\u1a96\u1a9a\u1a9f\xbb\u0f47;\u64c8st;\u629birc;\u629aash;\u629dnint;\u6a10id;\u6aefcir;\u69c2ubs\u0100;u\u1abb\u1abc\u6663it\xbb\u1abc\u02ec\u1ac7\u1ad4\u1afa\0\u1b0aon\u0100;e\u1acd\u1ace\u403a\u0100;q\xc7\xc6\u026d\u1ad9\0\0\u1ae2a\u0100;t\u1ade\u1adf\u402c;\u4040\u0180;fl\u1ae8\u1ae9\u1aeb\u6201\xee\u1160e\u0100mx\u1af1\u1af6ent\xbb\u1ae9e\xf3\u024d\u01e7\u1afe\0\u1b07\u0100;d\u12bb\u1b02ot;\u6a6dn\xf4\u0246\u0180fry\u1b10\u1b14\u1b17;\uc000\ud835\udd54o\xe4\u0254\u8100\xa9;s\u0155\u1b1dr;\u6117\u0100ao\u1b25\u1b29rr;\u61b5ss;\u6717\u0100cu\u1b32\u1b37r;\uc000\ud835\udcb8\u0100bp\u1b3c\u1b44\u0100;e\u1b41\u1b42\u6acf;\u6ad1\u0100;e\u1b49\u1b4a\u6ad0;\u6ad2dot;\u62ef\u0380delprvw\u1b60\u1b6c\u1b77\u1b82\u1bac\u1bd4\u1bf9arr\u0100lr\u1b68\u1b6a;\u6938;\u6935\u0270\u1b72\0\0\u1b75r;\u62dec;\u62dfarr\u0100;p\u1b7f\u1b80\u61b6;\u693d\u0300;bcdos\u1b8f\u1b90\u1b96\u1ba1\u1ba5\u1ba8\u622arcap;\u6a48\u0100au\u1b9b\u1b9ep;\u6a46p;\u6a4aot;\u628dr;\u6a45;\uc000\u222a\ufe00\u0200alrv\u1bb5\u1bbf\u1bde\u1be3rr\u0100;m\u1bbc\u1bbd\u61b7;\u693cy\u0180evw\u1bc7\u1bd4\u1bd8q\u0270\u1bce\0\0\u1bd2re\xe3\u1b73u\xe3\u1b75ee;\u62ceedge;\u62cfen\u803b\xa4\u40a4earrow\u0100lr\u1bee\u1bf3eft\xbb\u1b80ight\xbb\u1bbde\xe4\u1bdd\u0100ci\u1c01\u1c07onin\xf4\u01f7nt;\u6231lcty;\u632d\u0980AHabcdefhijlorstuwz\u1c38\u1c3b\u1c3f\u1c5d\u1c69\u1c75\u1c8a\u1c9e\u1cac\u1cb7\u1cfb\u1cff\u1d0d\u1d7b\u1d91\u1dab\u1dbb\u1dc6\u1dcdr\xf2\u0381ar;\u6965\u0200glrs\u1c48\u1c4d\u1c52\u1c54ger;\u6020eth;\u6138\xf2\u1133h\u0100;v\u1c5a\u1c5b\u6010\xbb\u090a\u016b\u1c61\u1c67arow;\u690fa\xe3\u0315\u0100ay\u1c6e\u1c73ron;\u410f;\u4434\u0180;ao\u0332\u1c7c\u1c84\u0100gr\u02bf\u1c81r;\u61catseq;\u6a77\u0180glm\u1c91\u1c94\u1c98\u803b\xb0\u40b0ta;\u43b4ptyv;\u69b1\u0100ir\u1ca3\u1ca8sht;\u697f;\uc000\ud835\udd21ar\u0100lr\u1cb3\u1cb5\xbb\u08dc\xbb\u101e\u0280aegsv\u1cc2\u0378\u1cd6\u1cdc\u1ce0m\u0180;os\u0326\u1cca\u1cd4nd\u0100;s\u0326\u1cd1uit;\u6666amma;\u43ddin;\u62f2\u0180;io\u1ce7\u1ce8\u1cf8\u40f7de\u8100\xf7;o\u1ce7\u1cf0ntimes;\u62c7n\xf8\u1cf7cy;\u4452c\u026f\u1d06\0\0\u1d0arn;\u631eop;\u630d\u0280lptuw\u1d18\u1d1d\u1d22\u1d49\u1d55lar;\u4024f;\uc000\ud835\udd55\u0280;emps\u030b\u1d2d\u1d37\u1d3d\u1d42q\u0100;d\u0352\u1d33ot;\u6251inus;\u6238lus;\u6214quare;\u62a1blebarwedg\xe5\xfan\u0180adh\u112e\u1d5d\u1d67ownarrow\xf3\u1c83arpoon\u0100lr\u1d72\u1d76ef\xf4\u1cb4igh\xf4\u1cb6\u0162\u1d7f\u1d85karo\xf7\u0f42\u026f\u1d8a\0\0\u1d8ern;\u631fop;\u630c\u0180cot\u1d98\u1da3\u1da6\u0100ry\u1d9d\u1da1;\uc000\ud835\udcb9;\u4455l;\u69f6rok;\u4111\u0100dr\u1db0\u1db4ot;\u62f1i\u0100;f\u1dba\u1816\u65bf\u0100ah\u1dc0\u1dc3r\xf2\u0429a\xf2\u0fa6angle;\u69a6\u0100ci\u1dd2\u1dd5y;\u445fgrarr;\u67ff\u0900Dacdefglmnopqrstux\u1e01\u1e09\u1e19\u1e38\u0578\u1e3c\u1e49\u1e61\u1e7e\u1ea5\u1eaf\u1ebd\u1ee1\u1f2a\u1f37\u1f44\u1f4e\u1f5a\u0100Do\u1e06\u1d34o\xf4\u1c89\u0100cs\u1e0e\u1e14ute\u803b\xe9\u40e9ter;\u6a6e\u0200aioy\u1e22\u1e27\u1e31\u1e36ron;\u411br\u0100;c\u1e2d\u1e2e\u6256\u803b\xea\u40ealon;\u6255;\u444dot;\u4117\u0100Dr\u1e41\u1e45ot;\u6252;\uc000\ud835\udd22\u0180;rs\u1e50\u1e51\u1e57\u6a9aave\u803b\xe8\u40e8\u0100;d\u1e5c\u1e5d\u6a96ot;\u6a98\u0200;ils\u1e6a\u1e6b\u1e72\u1e74\u6a99nters;\u63e7;\u6113\u0100;d\u1e79\u1e7a\u6a95ot;\u6a97\u0180aps\u1e85\u1e89\u1e97cr;\u4113ty\u0180;sv\u1e92\u1e93\u1e95\u6205et\xbb\u1e93p\u01001;\u1e9d\u1ea4\u0133\u1ea1\u1ea3;\u6004;\u6005\u6003\u0100gs\u1eaa\u1eac;\u414bp;\u6002\u0100gp\u1eb4\u1eb8on;\u4119f;\uc000\ud835\udd56\u0180als\u1ec4\u1ece\u1ed2r\u0100;s\u1eca\u1ecb\u62d5l;\u69e3us;\u6a71i\u0180;lv\u1eda\u1edb\u1edf\u43b5on\xbb\u1edb;\u43f5\u0200csuv\u1eea\u1ef3\u1f0b\u1f23\u0100io\u1eef\u1e31rc\xbb\u1e2e\u0269\u1ef9\0\0\u1efb\xed\u0548ant\u0100gl\u1f02\u1f06tr\xbb\u1e5dess\xbb\u1e7a\u0180aei\u1f12\u1f16\u1f1als;\u403dst;\u625fv\u0100;D\u0235\u1f20D;\u6a78parsl;\u69e5\u0100Da\u1f2f\u1f33ot;\u6253rr;\u6971\u0180cdi\u1f3e\u1f41\u1ef8r;\u612fo\xf4\u0352\u0100ah\u1f49\u1f4b;\u43b7\u803b\xf0\u40f0\u0100mr\u1f53\u1f57l\u803b\xeb\u40ebo;\u60ac\u0180cip\u1f61\u1f64\u1f67l;\u4021s\xf4\u056e\u0100eo\u1f6c\u1f74ctatio\xee\u0559nential\xe5\u0579\u09e1\u1f92\0\u1f9e\0\u1fa1\u1fa7\0\0\u1fc6\u1fcc\0\u1fd3\0\u1fe6\u1fea\u2000\0\u2008\u205allingdotse\xf1\u1e44y;\u4444male;\u6640\u0180ilr\u1fad\u1fb3\u1fc1lig;\u8000\ufb03\u0269\u1fb9\0\0\u1fbdg;\u8000\ufb00ig;\u8000\ufb04;\uc000\ud835\udd23lig;\u8000\ufb01lig;\uc000fj\u0180alt\u1fd9\u1fdc\u1fe1t;\u666dig;\u8000\ufb02ns;\u65b1of;\u4192\u01f0\u1fee\0\u1ff3f;\uc000\ud835\udd57\u0100ak\u05bf\u1ff7\u0100;v\u1ffc\u1ffd\u62d4;\u6ad9artint;\u6a0d\u0100ao\u200c\u2055\u0100cs\u2011\u2052\u03b1\u201a\u2030\u2038\u2045\u2048\0\u2050\u03b2\u2022\u2025\u2027\u202a\u202c\0\u202e\u803b\xbd\u40bd;\u6153\u803b\xbc\u40bc;\u6155;\u6159;\u615b\u01b3\u2034\0\u2036;\u6154;\u6156\u02b4\u203e\u2041\0\0\u2043\u803b\xbe\u40be;\u6157;\u615c5;\u6158\u01b6\u204c\0\u204e;\u615a;\u615d8;\u615el;\u6044wn;\u6322cr;\uc000\ud835\udcbb\u0880Eabcdefgijlnorstv\u2082\u2089\u209f\u20a5\u20b0\u20b4\u20f0\u20f5\u20fa\u20ff\u2103\u2112\u2138\u0317\u213e\u2152\u219e\u0100;l\u064d\u2087;\u6a8c\u0180cmp\u2090\u2095\u209dute;\u41f5ma\u0100;d\u209c\u1cda\u43b3;\u6a86reve;\u411f\u0100iy\u20aa\u20aerc;\u411d;\u4433ot;\u4121\u0200;lqs\u063e\u0642\u20bd\u20c9\u0180;qs\u063e\u064c\u20c4lan\xf4\u0665\u0200;cdl\u0665\u20d2\u20d5\u20e5c;\u6aa9ot\u0100;o\u20dc\u20dd\u6a80\u0100;l\u20e2\u20e3\u6a82;\u6a84\u0100;e\u20ea\u20ed\uc000\u22db\ufe00s;\u6a94r;\uc000\ud835\udd24\u0100;g\u0673\u061bmel;\u6137cy;\u4453\u0200;Eaj\u065a\u210c\u210e\u2110;\u6a92;\u6aa5;\u6aa4\u0200Eaes\u211b\u211d\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6a8arox\xbb\u2124\u0100;q\u212e\u212f\u6a88\u0100;q\u212e\u211bim;\u62e7pf;\uc000\ud835\udd58\u0100ci\u2143\u2146r;\u610am\u0180;el\u066b\u214e\u2150;\u6a8e;\u6a90\u8300>;cdlqr\u05ee\u2160\u216a\u216e\u2173\u2179\u0100ci\u2165\u2167;\u6aa7r;\u6a7aot;\u62d7Par;\u6995uest;\u6a7c\u0280adels\u2184\u216a\u2190\u0656\u219b\u01f0\u2189\0\u218epro\xf8\u209er;\u6978q\u0100lq\u063f\u2196les\xf3\u2088i\xed\u066b\u0100en\u21a3\u21adrtneqq;\uc000\u2269\ufe00\xc5\u21aa\u0500Aabcefkosy\u21c4\u21c7\u21f1\u21f5\u21fa\u2218\u221d\u222f\u2268\u227dr\xf2\u03a0\u0200ilmr\u21d0\u21d4\u21d7\u21dbrs\xf0\u1484f\xbb\u2024il\xf4\u06a9\u0100dr\u21e0\u21e4cy;\u444a\u0180;cw\u08f4\u21eb\u21efir;\u6948;\u61adar;\u610firc;\u4125\u0180alr\u2201\u220e\u2213rts\u0100;u\u2209\u220a\u6665it\xbb\u220alip;\u6026con;\u62b9r;\uc000\ud835\udd25s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223a\u223e\u2243\u225e\u2263rr;\u61fftht;\u623bk\u0100lr\u2249\u2253eftarrow;\u61a9ightarrow;\u61aaf;\uc000\ud835\udd59bar;\u6015\u0180clt\u226f\u2274\u2278r;\uc000\ud835\udcbdas\xe8\u21f4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xbb\u1c5b\u0ae1\u22a3\0\u22aa\0\u22b8\u22c5\u22ce\0\u22d5\u22f3\0\0\u22f8\u2322\u2367\u2362\u237f\0\u2386\u23aa\u23b4cute\u803b\xed\u40ed\u0180;iy\u0771\u22b0\u22b5rc\u803b\xee\u40ee;\u4438\u0100cx\u22bc\u22bfy;\u4435cl\u803b\xa1\u40a1\u0100fr\u039f\u22c9;\uc000\ud835\udd26rave\u803b\xec\u40ec\u0200;ino\u073e\u22dd\u22e9\u22ee\u0100in\u22e2\u22e6nt;\u6a0ct;\u622dfin;\u69dcta;\u6129lig;\u4133\u0180aop\u22fe\u231a\u231d\u0180cgt\u2305\u2308\u2317r;\u412b\u0180elp\u071f\u230f\u2313in\xe5\u078ear\xf4\u0720h;\u4131f;\u62b7ed;\u41b5\u0280;cfot\u04f4\u232c\u2331\u233d\u2341are;\u6105in\u0100;t\u2338\u2339\u621eie;\u69dddo\xf4\u2319\u0280;celp\u0757\u234c\u2350\u235b\u2361al;\u62ba\u0100gr\u2355\u2359er\xf3\u1563\xe3\u234darhk;\u6a17rod;\u6a3c\u0200cgpt\u236f\u2372\u2376\u237by;\u4451on;\u412ff;\uc000\ud835\udd5aa;\u43b9uest\u803b\xbf\u40bf\u0100ci\u238a\u238fr;\uc000\ud835\udcben\u0280;Edsv\u04f4\u239b\u239d\u23a1\u04f3;\u62f9ot;\u62f5\u0100;v\u23a6\u23a7\u62f4;\u62f3\u0100;i\u0777\u23aelde;\u4129\u01eb\u23b8\0\u23bccy;\u4456l\u803b\xef\u40ef\u0300cfmosu\u23cc\u23d7\u23dc\u23e1\u23e7\u23f5\u0100iy\u23d1\u23d5rc;\u4135;\u4439r;\uc000\ud835\udd27ath;\u4237pf;\uc000\ud835\udd5b\u01e3\u23ec\0\u23f1r;\uc000\ud835\udcbfrcy;\u4458kcy;\u4454\u0400acfghjos\u240b\u2416\u2422\u2427\u242d\u2431\u2435\u243bppa\u0100;v\u2413\u2414\u43ba;\u43f0\u0100ey\u241b\u2420dil;\u4137;\u443ar;\uc000\ud835\udd28reen;\u4138cy;\u4445cy;\u445cpf;\uc000\ud835\udd5ccr;\uc000\ud835\udcc0\u0b80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248d\u2491\u250e\u253d\u255a\u2580\u264e\u265e\u2665\u2679\u267d\u269a\u26b2\u26d8\u275d\u2768\u278b\u27c0\u2801\u2812\u0180art\u2477\u247a\u247cr\xf2\u09c6\xf2\u0395ail;\u691barr;\u690e\u0100;g\u0994\u248b;\u6a8bar;\u6962\u0963\u24a5\0\u24aa\0\u24b1\0\0\0\0\0\u24b5\u24ba\0\u24c6\u24c8\u24cd\0\u24f9ute;\u413amptyv;\u69b4ra\xee\u084cbda;\u43bbg\u0180;dl\u088e\u24c1\u24c3;\u6991\xe5\u088e;\u6a85uo\u803b\xab\u40abr\u0400;bfhlpst\u0899\u24de\u24e6\u24e9\u24eb\u24ee\u24f1\u24f5\u0100;f\u089d\u24e3s;\u691fs;\u691d\xeb\u2252p;\u61abl;\u6939im;\u6973l;\u61a2\u0180;ae\u24ff\u2500\u2504\u6aabil;\u6919\u0100;s\u2509\u250a\u6aad;\uc000\u2aad\ufe00\u0180abr\u2515\u2519\u251drr;\u690crk;\u6772\u0100ak\u2522\u252cc\u0100ek\u2528\u252a;\u407b;\u405b\u0100es\u2531\u2533;\u698bl\u0100du\u2539\u253b;\u698f;\u698d\u0200aeuy\u2546\u254b\u2556\u2558ron;\u413e\u0100di\u2550\u2554il;\u413c\xec\u08b0\xe2\u2529;\u443b\u0200cqrs\u2563\u2566\u256d\u257da;\u6936uo\u0100;r\u0e19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694bh;\u61b2\u0280;fgqs\u258b\u258c\u0989\u25f3\u25ff\u6264t\u0280ahlrt\u2598\u25a4\u25b7\u25c2\u25e8rrow\u0100;t\u0899\u25a1a\xe9\u24f6arpoon\u0100du\u25af\u25b4own\xbb\u045ap\xbb\u0966eftarrows;\u61c7ight\u0180ahs\u25cd\u25d6\u25derrow\u0100;s\u08f4\u08a7arpoon\xf3\u0f98quigarro\xf7\u21f0hreetimes;\u62cb\u0180;qs\u258b\u0993\u25falan\xf4\u09ac\u0280;cdgs\u09ac\u260a\u260d\u261d\u2628c;\u6aa8ot\u0100;o\u2614\u2615\u6a7f\u0100;r\u261a\u261b\u6a81;\u6a83\u0100;e\u2622\u2625\uc000\u22da\ufe00s;\u6a93\u0280adegs\u2633\u2639\u263d\u2649\u264bppro\xf8\u24c6ot;\u62d6q\u0100gq\u2643\u2645\xf4\u0989gt\xf2\u248c\xf4\u099bi\xed\u09b2\u0180ilr\u2655\u08e1\u265asht;\u697c;\uc000\ud835\udd29\u0100;E\u099c\u2663;\u6a91\u0161\u2669\u2676r\u0100du\u25b2\u266e\u0100;l\u0965\u2673;\u696alk;\u6584cy;\u4459\u0280;acht\u0a48\u2688\u268b\u2691\u2696r\xf2\u25c1orne\xf2\u1d08ard;\u696bri;\u65fa\u0100io\u269f\u26a4dot;\u4140ust\u0100;a\u26ac\u26ad\u63b0che\xbb\u26ad\u0200Eaes\u26bb\u26bd\u26c9\u26d4;\u6268p\u0100;p\u26c3\u26c4\u6a89rox\xbb\u26c4\u0100;q\u26ce\u26cf\u6a87\u0100;q\u26ce\u26bbim;\u62e6\u0400abnoptwz\u26e9\u26f4\u26f7\u271a\u272f\u2741\u2747\u2750\u0100nr\u26ee\u26f1g;\u67ecr;\u61fdr\xeb\u08c1g\u0180lmr\u26ff\u270d\u2714eft\u0100ar\u09e6\u2707ight\xe1\u09f2apsto;\u67fcight\xe1\u09fdparrow\u0100lr\u2725\u2729ef\xf4\u24edight;\u61ac\u0180afl\u2736\u2739\u273dr;\u6985;\uc000\ud835\udd5dus;\u6a2dimes;\u6a34\u0161\u274b\u274fst;\u6217\xe1\u134e\u0180;ef\u2757\u2758\u1800\u65cange\xbb\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277c\u2785\u2787r\xf2\u08a8orne\xf2\u1d8car\u0100;d\u0f98\u2783;\u696d;\u600eri;\u62bf\u0300achiqt\u2798\u279d\u0a40\u27a2\u27ae\u27bbquo;\u6039r;\uc000\ud835\udcc1m\u0180;eg\u09b2\u27aa\u27ac;\u6a8d;\u6a8f\u0100bu\u252a\u27b3o\u0100;r\u0e1f\u27b9;\u601arok;\u4142\u8400<;cdhilqr\u082b\u27d2\u2639\u27dc\u27e0\u27e5\u27ea\u27f0\u0100ci\u27d7\u27d9;\u6aa6r;\u6a79re\xe5\u25f2mes;\u62c9arr;\u6976uest;\u6a7b\u0100Pi\u27f5\u27f9ar;\u6996\u0180;ef\u2800\u092d\u181b\u65c3r\u0100du\u2807\u280dshar;\u694ahar;\u6966\u0100en\u2817\u2821rtneqq;\uc000\u2268\ufe00\xc5\u281e\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288e\u2893\u28a0\u28a5\u28a8\u28da\u28e2\u28e4\u0a83\u28f3\u2902Dot;\u623a\u0200clpr\u284e\u2852\u2863\u287dr\u803b\xaf\u40af\u0100et\u2857\u2859;\u6642\u0100;e\u285e\u285f\u6720se\xbb\u285f\u0100;s\u103b\u2868to\u0200;dlu\u103b\u2873\u2877\u287bow\xee\u048cef\xf4\u090f\xf0\u13d1ker;\u65ae\u0100oy\u2887\u288cmma;\u6a29;\u443cash;\u6014asuredangle\xbb\u1626r;\uc000\ud835\udd2ao;\u6127\u0180cdn\u28af\u28b4\u28c9ro\u803b\xb5\u40b5\u0200;acd\u1464\u28bd\u28c0\u28c4s\xf4\u16a7ir;\u6af0ot\u80bb\xb7\u01b5us\u0180;bd\u28d2\u1903\u28d3\u6212\u0100;u\u1d3c\u28d8;\u6a2a\u0163\u28de\u28e1p;\u6adb\xf2\u2212\xf0\u0a81\u0100dp\u28e9\u28eeels;\u62a7f;\uc000\ud835\udd5e\u0100ct\u28f8\u28fdr;\uc000\ud835\udcc2pos\xbb\u159d\u0180;lm\u2909\u290a\u290d\u43bctimap;\u62b8\u0c00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297e\u2989\u2998\u29da\u29e9\u2a15\u2a1a\u2a58\u2a5d\u2a83\u2a95\u2aa4\u2aa8\u2b04\u2b07\u2b44\u2b7f\u2bae\u2c34\u2c67\u2c7c\u2ce9\u0100gt\u2947\u294b;\uc000\u22d9\u0338\u0100;v\u2950\u0bcf\uc000\u226b\u20d2\u0180elt\u295a\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61cdightarrow;\u61ce;\uc000\u22d8\u0338\u0100;v\u297b\u0c47\uc000\u226a\u20d2ightarrow;\u61cf\u0100Dd\u298e\u2993ash;\u62afash;\u62ae\u0280bcnpt\u29a3\u29a7\u29ac\u29b1\u29ccla\xbb\u02deute;\u4144g;\uc000\u2220\u20d2\u0280;Eiop\u0d84\u29bc\u29c0\u29c5\u29c8;\uc000\u2a70\u0338d;\uc000\u224b\u0338s;\u4149ro\xf8\u0d84ur\u0100;a\u29d3\u29d4\u666el\u0100;s\u29d3\u0b38\u01f3\u29df\0\u29e3p\u80bb\xa0\u0b37mp\u0100;e\u0bf9\u0c00\u0280aeouy\u29f4\u29fe\u2a03\u2a10\u2a13\u01f0\u29f9\0\u29fb;\u6a43on;\u4148dil;\u4146ng\u0100;d\u0d7e\u2a0aot;\uc000\u2a6d\u0338p;\u6a42;\u443dash;\u6013\u0380;Aadqsx\u0b92\u2a29\u2a2d\u2a3b\u2a41\u2a45\u2a50rr;\u61d7r\u0100hr\u2a33\u2a36k;\u6924\u0100;o\u13f2\u13f0ot;\uc000\u2250\u0338ui\xf6\u0b63\u0100ei\u2a4a\u2a4ear;\u6928\xed\u0b98ist\u0100;s\u0ba0\u0b9fr;\uc000\ud835\udd2b\u0200Eest\u0bc5\u2a66\u2a79\u2a7c\u0180;qs\u0bbc\u2a6d\u0be1\u0180;qs\u0bbc\u0bc5\u2a74lan\xf4\u0be2i\xed\u0bea\u0100;r\u0bb6\u2a81\xbb\u0bb7\u0180Aap\u2a8a\u2a8d\u2a91r\xf2\u2971rr;\u61aear;\u6af2\u0180;sv\u0f8d\u2a9c\u0f8c\u0100;d\u2aa1\u2aa2\u62fc;\u62facy;\u445a\u0380AEadest\u2ab7\u2aba\u2abe\u2ac2\u2ac5\u2af6\u2af9r\xf2\u2966;\uc000\u2266\u0338rr;\u619ar;\u6025\u0200;fqs\u0c3b\u2ace\u2ae3\u2aeft\u0100ar\u2ad4\u2ad9rro\xf7\u2ac1ightarro\xf7\u2a90\u0180;qs\u0c3b\u2aba\u2aealan\xf4\u0c55\u0100;s\u0c55\u2af4\xbb\u0c36i\xed\u0c5d\u0100;r\u0c35\u2afei\u0100;e\u0c1a\u0c25i\xe4\u0d90\u0100pt\u2b0c\u2b11f;\uc000\ud835\udd5f\u8180\xac;in\u2b19\u2b1a\u2b36\u40acn\u0200;Edv\u0b89\u2b24\u2b28\u2b2e;\uc000\u22f9\u0338ot;\uc000\u22f5\u0338\u01e1\u0b89\u2b33\u2b35;\u62f7;\u62f6i\u0100;v\u0cb8\u2b3c\u01e1\u0cb8\u2b41\u2b43;\u62fe;\u62fd\u0180aor\u2b4b\u2b63\u2b69r\u0200;ast\u0b7b\u2b55\u2b5a\u2b5flle\xec\u0b7bl;\uc000\u2afd\u20e5;\uc000\u2202\u0338lint;\u6a14\u0180;ce\u0c92\u2b70\u2b73u\xe5\u0ca5\u0100;c\u0c98\u2b78\u0100;e\u0c92\u2b7d\xf1\u0c98\u0200Aait\u2b88\u2b8b\u2b9d\u2ba7r\xf2\u2988rr\u0180;cw\u2b94\u2b95\u2b99\u619b;\uc000\u2933\u0338;\uc000\u219d\u0338ghtarrow\xbb\u2b95ri\u0100;e\u0ccb\u0cd6\u0380chimpqu\u2bbd\u2bcd\u2bd9\u2b04\u0b78\u2be4\u2bef\u0200;cer\u0d32\u2bc6\u0d37\u2bc9u\xe5\u0d45;\uc000\ud835\udcc3ort\u026d\u2b05\0\0\u2bd6ar\xe1\u2b56m\u0100;e\u0d6e\u2bdf\u0100;q\u0d74\u0d73su\u0100bp\u2beb\u2bed\xe5\u0cf8\xe5\u0d0b\u0180bcp\u2bf6\u2c11\u2c19\u0200;Ees\u2bff\u2c00\u0d22\u2c04\u6284;\uc000\u2ac5\u0338et\u0100;e\u0d1b\u2c0bq\u0100;q\u0d23\u2c00c\u0100;e\u0d32\u2c17\xf1\u0d38\u0200;Ees\u2c22\u2c23\u0d5f\u2c27\u6285;\uc000\u2ac6\u0338et\u0100;e\u0d58\u2c2eq\u0100;q\u0d60\u2c23\u0200gilr\u2c3d\u2c3f\u2c45\u2c47\xec\u0bd7lde\u803b\xf1\u40f1\xe7\u0c43iangle\u0100lr\u2c52\u2c5ceft\u0100;e\u0c1a\u2c5a\xf1\u0c26ight\u0100;e\u0ccb\u2c65\xf1\u0cd7\u0100;m\u2c6c\u2c6d\u43bd\u0180;es\u2c74\u2c75\u2c79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2c8f\u2c94\u2c99\u2c9e\u2ca3\u2cb0\u2cb6\u2cd3\u2ce3ash;\u62adarr;\u6904p;\uc000\u224d\u20d2ash;\u62ac\u0100et\u2ca8\u2cac;\uc000\u2265\u20d2;\uc000>\u20d2nfin;\u69de\u0180Aet\u2cbd\u2cc1\u2cc5rr;\u6902;\uc000\u2264\u20d2\u0100;r\u2cca\u2ccd\uc000<\u20d2ie;\uc000\u22b4\u20d2\u0100At\u2cd8\u2cdcrr;\u6903rie;\uc000\u22b5\u20d2im;\uc000\u223c\u20d2\u0180Aan\u2cf0\u2cf4\u2d02rr;\u61d6r\u0100hr\u2cfa\u2cfdk;\u6923\u0100;o\u13e7\u13e5ear;\u6927\u1253\u1a95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2d2d\0\u2d38\u2d48\u2d60\u2d65\u2d72\u2d84\u1b07\0\0\u2d8d\u2dab\0\u2dc8\u2dce\0\u2ddc\u2e19\u2e2b\u2e3e\u2e43\u0100cs\u2d31\u1a97ute\u803b\xf3\u40f3\u0100iy\u2d3c\u2d45r\u0100;c\u1a9e\u2d42\u803b\xf4\u40f4;\u443e\u0280abios\u1aa0\u2d52\u2d57\u01c8\u2d5alac;\u4151v;\u6a38old;\u69bclig;\u4153\u0100cr\u2d69\u2d6dir;\u69bf;\uc000\ud835\udd2c\u036f\u2d79\0\0\u2d7c\0\u2d82n;\u42dbave\u803b\xf2\u40f2;\u69c1\u0100bm\u2d88\u0df4ar;\u69b5\u0200acit\u2d95\u2d98\u2da5\u2da8r\xf2\u1a80\u0100ir\u2d9d\u2da0r;\u69beoss;\u69bbn\xe5\u0e52;\u69c0\u0180aei\u2db1\u2db5\u2db9cr;\u414dga;\u43c9\u0180cdn\u2dc0\u2dc5\u01cdron;\u43bf;\u69b6pf;\uc000\ud835\udd60\u0180ael\u2dd4\u2dd7\u01d2r;\u69b7rp;\u69b9\u0380;adiosv\u2dea\u2deb\u2dee\u2e08\u2e0d\u2e10\u2e16\u6228r\xf2\u1a86\u0200;efm\u2df7\u2df8\u2e02\u2e05\u6a5dr\u0100;o\u2dfe\u2dff\u6134f\xbb\u2dff\u803b\xaa\u40aa\u803b\xba\u40bagof;\u62b6r;\u6a56lope;\u6a57;\u6a5b\u0180clo\u2e1f\u2e21\u2e27\xf2\u2e01ash\u803b\xf8\u40f8l;\u6298i\u016c\u2e2f\u2e34de\u803b\xf5\u40f5es\u0100;a\u01db\u2e3as;\u6a36ml\u803b\xf6\u40f6bar;\u633d\u0ae1\u2e5e\0\u2e7d\0\u2e80\u2e9d\0\u2ea2\u2eb9\0\0\u2ecb\u0e9c\0\u2f13\0\0\u2f2b\u2fbc\0\u2fc8r\u0200;ast\u0403\u2e67\u2e72\u0e85\u8100\xb6;l\u2e6d\u2e6e\u40b6le\xec\u0403\u0269\u2e78\0\0\u2e7bm;\u6af3;\u6afdy;\u443fr\u0280cimpt\u2e8b\u2e8f\u2e93\u1865\u2e97nt;\u4025od;\u402eil;\u6030enk;\u6031r;\uc000\ud835\udd2d\u0180imo\u2ea8\u2eb0\u2eb4\u0100;v\u2ead\u2eae\u43c6;\u43d5ma\xf4\u0a76ne;\u660e\u0180;tv\u2ebf\u2ec0\u2ec8\u43c0chfork\xbb\u1ffd;\u43d6\u0100au\u2ecf\u2edfn\u0100ck\u2ed5\u2eddk\u0100;h\u21f4\u2edb;\u610e\xf6\u21f4s\u0480;abcdemst\u2ef3\u2ef4\u1908\u2ef9\u2efd\u2f04\u2f06\u2f0a\u2f0e\u402bcir;\u6a23ir;\u6a22\u0100ou\u1d40\u2f02;\u6a25;\u6a72n\u80bb\xb1\u0e9dim;\u6a26wo;\u6a27\u0180ipu\u2f19\u2f20\u2f25ntint;\u6a15f;\uc000\ud835\udd61nd\u803b\xa3\u40a3\u0500;Eaceinosu\u0ec8\u2f3f\u2f41\u2f44\u2f47\u2f81\u2f89\u2f92\u2f7e\u2fb6;\u6ab3p;\u6ab7u\xe5\u0ed9\u0100;c\u0ece\u2f4c\u0300;acens\u0ec8\u2f59\u2f5f\u2f66\u2f68\u2f7eppro\xf8\u2f43urlye\xf1\u0ed9\xf1\u0ece\u0180aes\u2f6f\u2f76\u2f7approx;\u6ab9qq;\u6ab5im;\u62e8i\xed\u0edfme\u0100;s\u2f88\u0eae\u6032\u0180Eas\u2f78\u2f90\u2f7a\xf0\u2f75\u0180dfp\u0eec\u2f99\u2faf\u0180als\u2fa0\u2fa5\u2faalar;\u632eine;\u6312urf;\u6313\u0100;t\u0efb\u2fb4\xef\u0efbrel;\u62b0\u0100ci\u2fc0\u2fc5r;\uc000\ud835\udcc5;\u43c8ncsp;\u6008\u0300fiopsu\u2fda\u22e2\u2fdf\u2fe5\u2feb\u2ff1r;\uc000\ud835\udd2epf;\uc000\ud835\udd62rime;\u6057cr;\uc000\ud835\udcc6\u0180aeo\u2ff8\u3009\u3013t\u0100ei\u2ffe\u3005rnion\xf3\u06b0nt;\u6a16st\u0100;e\u3010\u3011\u403f\xf1\u1f19\xf4\u0f14\u0a80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30e0\u310e\u312b\u3147\u3162\u3172\u318e\u3206\u3215\u3224\u3229\u3258\u326e\u3272\u3290\u32b0\u32b7\u0180art\u3047\u304a\u304cr\xf2\u10b3\xf2\u03ddail;\u691car\xf2\u1c65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307f\u308f\u3094\u30cc\u0100eu\u306d\u3071;\uc000\u223d\u0331te;\u4155i\xe3\u116emptyv;\u69b3g\u0200;del\u0fd1\u3089\u308b\u308d;\u6992;\u69a5\xe5\u0fd1uo\u803b\xbb\u40bbr\u0580;abcfhlpstw\u0fdc\u30ac\u30af\u30b7\u30b9\u30bc\u30be\u30c0\u30c3\u30c7\u30cap;\u6975\u0100;f\u0fe0\u30b4s;\u6920;\u6933s;\u691e\xeb\u225d\xf0\u272el;\u6945im;\u6974l;\u61a3;\u619d\u0100ai\u30d1\u30d5il;\u691ao\u0100;n\u30db\u30dc\u6236al\xf3\u0f1e\u0180abr\u30e7\u30ea\u30eer\xf2\u17e5rk;\u6773\u0100ak\u30f3\u30fdc\u0100ek\u30f9\u30fb;\u407d;\u405d\u0100es\u3102\u3104;\u698cl\u0100du\u310a\u310c;\u698e;\u6990\u0200aeuy\u3117\u311c\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xec\u0ff2\xe2\u30fa;\u4440\u0200clqs\u3134\u3137\u313d\u3144a;\u6937dhar;\u6969uo\u0100;r\u020e\u020dh;\u61b3\u0180acg\u314e\u315f\u0f44l\u0200;ips\u0f78\u3158\u315b\u109cn\xe5\u10bbar\xf4\u0fa9t;\u65ad\u0180ilr\u3169\u1023\u316esht;\u697d;\uc000\ud835\udd2f\u0100ao\u3177\u3186r\u0100du\u317d\u317f\xbb\u047b\u0100;l\u1091\u3184;\u696c\u0100;v\u318b\u318c\u43c1;\u43f1\u0180gns\u3195\u31f9\u31fcht\u0300ahlrst\u31a4\u31b0\u31c2\u31d8\u31e4\u31eerrow\u0100;t\u0fdc\u31ada\xe9\u30c8arpoon\u0100du\u31bb\u31bfow\xee\u317ep\xbb\u1092eft\u0100ah\u31ca\u31d0rrow\xf3\u0feaarpoon\xf3\u0551ightarrows;\u61c9quigarro\xf7\u30cbhreetimes;\u62ccg;\u42daingdotse\xf1\u1f32\u0180ahm\u320d\u3210\u3213r\xf2\u0feaa\xf2\u0551;\u600foust\u0100;a\u321e\u321f\u63b1che\xbb\u321fmid;\u6aee\u0200abpt\u3232\u323d\u3240\u3252\u0100nr\u3237\u323ag;\u67edr;\u61fer\xeb\u1003\u0180afl\u3247\u324a\u324er;\u6986;\uc000\ud835\udd63us;\u6a2eimes;\u6a35\u0100ap\u325d\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6a12ar\xf2\u31e3\u0200achq\u327b\u3280\u10bc\u3285quo;\u603ar;\uc000\ud835\udcc7\u0100bu\u30fb\u328ao\u0100;r\u0214\u0213\u0180hir\u3297\u329b\u32a0re\xe5\u31f8mes;\u62cai\u0200;efl\u32aa\u1059\u1821\u32ab\u65b9tri;\u69celuhar;\u6968;\u611e\u0d61\u32d5\u32db\u32df\u332c\u3338\u3371\0\u337a\u33a4\0\0\u33ec\u33f0\0\u3428\u3448\u345a\u34ad\u34b1\u34ca\u34f1\0\u3616\0\0\u3633cute;\u415bqu\xef\u27ba\u0500;Eaceinpsy\u11ed\u32f3\u32f5\u32ff\u3302\u330b\u330f\u331f\u3326\u3329;\u6ab4\u01f0\u32fa\0\u32fc;\u6ab8on;\u4161u\xe5\u11fe\u0100;d\u11f3\u3307il;\u415frc;\u415d\u0180Eas\u3316\u3318\u331b;\u6ab6p;\u6abaim;\u62e9olint;\u6a13i\xed\u1204;\u4441ot\u0180;be\u3334\u1d47\u3335\u62c5;\u6a66\u0380Aacmstx\u3346\u334a\u3357\u335b\u335e\u3363\u336drr;\u61d8r\u0100hr\u3350\u3352\xeb\u2228\u0100;o\u0a36\u0a34t\u803b\xa7\u40a7i;\u403bwar;\u6929m\u0100in\u3369\xf0nu\xf3\xf1t;\u6736r\u0100;o\u3376\u2055\uc000\ud835\udd30\u0200acoy\u3382\u3386\u3391\u33a0rp;\u666f\u0100hy\u338b\u338fcy;\u4449;\u4448rt\u026d\u3399\0\0\u339ci\xe4\u1464ara\xec\u2e6f\u803b\xad\u40ad\u0100gm\u33a8\u33b4ma\u0180;fv\u33b1\u33b2\u33b2\u43c3;\u43c2\u0400;deglnpr\u12ab\u33c5\u33c9\u33ce\u33d6\u33de\u33e1\u33e6ot;\u6a6a\u0100;q\u12b1\u12b0\u0100;E\u33d3\u33d4\u6a9e;\u6aa0\u0100;E\u33db\u33dc\u6a9d;\u6a9fe;\u6246lus;\u6a24arr;\u6972ar\xf2\u113d\u0200aeit\u33f8\u3408\u340f\u3417\u0100ls\u33fd\u3404lsetm\xe9\u336ahp;\u6a33parsl;\u69e4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341c\u341d\u6aaa\u0100;s\u3422\u3423\u6aac;\uc000\u2aac\ufe00\u0180flp\u342e\u3433\u3442tcy;\u444c\u0100;b\u3438\u3439\u402f\u0100;a\u343e\u343f\u69c4r;\u633ff;\uc000\ud835\udd64a\u0100dr\u344d\u0402es\u0100;u\u3454\u3455\u6660it\xbb\u3455\u0180csu\u3460\u3479\u349f\u0100au\u3465\u346fp\u0100;s\u1188\u346b;\uc000\u2293\ufe00p\u0100;s\u11b4\u3475;\uc000\u2294\ufe00u\u0100bp\u347f\u348f\u0180;es\u1197\u119c\u3486et\u0100;e\u1197\u348d\xf1\u119d\u0180;es\u11a8\u11ad\u3496et\u0100;e\u11a8\u349d\xf1\u11ae\u0180;af\u117b\u34a6\u05b0r\u0165\u34ab\u05b1\xbb\u117car\xf2\u1148\u0200cemt\u34b9\u34be\u34c2\u34c5r;\uc000\ud835\udcc8tm\xee\xf1i\xec\u3415ar\xe6\u11be\u0100ar\u34ce\u34d5r\u0100;f\u34d4\u17bf\u6606\u0100an\u34da\u34edight\u0100ep\u34e3\u34eapsilo\xee\u1ee0h\xe9\u2eafs\xbb\u2852\u0280bcmnp\u34fb\u355e\u1209\u358b\u358e\u0480;Edemnprs\u350e\u350f\u3511\u3515\u351e\u3523\u352c\u3531\u3536\u6282;\u6ac5ot;\u6abd\u0100;d\u11da\u351aot;\u6ac3ult;\u6ac1\u0100Ee\u3528\u352a;\u6acb;\u628alus;\u6abfarr;\u6979\u0180eiu\u353d\u3552\u3555t\u0180;en\u350e\u3545\u354bq\u0100;q\u11da\u350feq\u0100;q\u352b\u3528m;\u6ac7\u0100bp\u355a\u355c;\u6ad5;\u6ad3c\u0300;acens\u11ed\u356c\u3572\u3579\u357b\u3326ppro\xf8\u32faurlye\xf1\u11fe\xf1\u11f3\u0180aes\u3582\u3588\u331bppro\xf8\u331aq\xf1\u3317g;\u666a\u0680123;Edehlmnps\u35a9\u35ac\u35af\u121c\u35b2\u35b4\u35c0\u35c9\u35d5\u35da\u35df\u35e8\u35ed\u803b\xb9\u40b9\u803b\xb2\u40b2\u803b\xb3\u40b3;\u6ac6\u0100os\u35b9\u35bct;\u6abeub;\u6ad8\u0100;d\u1222\u35c5ot;\u6ac4s\u0100ou\u35cf\u35d2l;\u67c9b;\u6ad7arr;\u697bult;\u6ac2\u0100Ee\u35e4\u35e6;\u6acc;\u628blus;\u6ac0\u0180eiu\u35f4\u3609\u360ct\u0180;en\u121c\u35fc\u3602q\u0100;q\u1222\u35b2eq\u0100;q\u35e7\u35e4m;\u6ac8\u0100bp\u3611\u3613;\u6ad4;\u6ad6\u0180Aan\u361c\u3620\u362drr;\u61d9r\u0100hr\u3626\u3628\xeb\u222e\u0100;o\u0a2b\u0a29war;\u692alig\u803b\xdf\u40df\u0be1\u3651\u365d\u3660\u12ce\u3673\u3679\0\u367e\u36c2\0\0\0\0\0\u36db\u3703\0\u3709\u376c\0\0\0\u3787\u0272\u3656\0\0\u365bget;\u6316;\u43c4r\xeb\u0e5f\u0180aey\u3666\u366b\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uc000\ud835\udd31\u0200eiko\u3686\u369d\u36b5\u36bc\u01f2\u368b\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369b\u43b8ym;\u43d1\u0100cn\u36a2\u36b2k\u0100as\u36a8\u36aeppro\xf8\u12c1im\xbb\u12acs\xf0\u129e\u0100as\u36ba\u36ae\xf0\u12c1rn\u803b\xfe\u40fe\u01ec\u031f\u36c6\u22e7es\u8180\xd7;bd\u36cf\u36d0\u36d8\u40d7\u0100;a\u190f\u36d5r;\u6a31;\u6a30\u0180eps\u36e1\u36e3\u3700\xe1\u2a4d\u0200;bcf\u0486\u36ec\u36f0\u36f4ot;\u6336ir;\u6af1\u0100;o\u36f9\u36fc\uc000\ud835\udd65rk;\u6ada\xe1\u3362rime;\u6034\u0180aip\u370f\u3712\u3764d\xe5\u1248\u0380adempst\u3721\u374d\u3740\u3751\u3757\u375c\u375fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65b5own\xbb\u1dbbeft\u0100;e\u2800\u373e\xf1\u092e;\u625cight\u0100;e\u32aa\u374b\xf1\u105aot;\u65ecinus;\u6a3alus;\u6a39b;\u69cdime;\u6a3bezium;\u63e2\u0180cht\u3772\u377d\u3781\u0100ry\u3777\u377b;\uc000\ud835\udcc9;\u4446cy;\u445brok;\u4167\u0100io\u378b\u378ex\xf4\u1777head\u0100lr\u3797\u37a0eftarro\xf7\u084fightarrow\xbb\u0f5d\u0900AHabcdfghlmoprstuw\u37d0\u37d3\u37d7\u37e4\u37f0\u37fc\u380e\u381c\u3823\u3834\u3851\u385d\u386b\u38a9\u38cc\u38d2\u38ea\u38f6r\xf2\u03edar;\u6963\u0100cr\u37dc\u37e2ute\u803b\xfa\u40fa\xf2\u1150r\u01e3\u37ea\0\u37edy;\u445eve;\u416d\u0100iy\u37f5\u37farc\u803b\xfb\u40fb;\u4443\u0180abh\u3803\u3806\u380br\xf2\u13adlac;\u4171a\xf2\u13c3\u0100ir\u3813\u3818sht;\u697e;\uc000\ud835\udd32rave\u803b\xf9\u40f9\u0161\u3827\u3831r\u0100lr\u382c\u382e\xbb\u0957\xbb\u1083lk;\u6580\u0100ct\u3839\u384d\u026f\u383f\0\0\u384arn\u0100;e\u3845\u3846\u631cr\xbb\u3846op;\u630fri;\u65f8\u0100al\u3856\u385acr;\u416b\u80bb\xa8\u0349\u0100gp\u3862\u3866on;\u4173f;\uc000\ud835\udd66\u0300adhlsu\u114b\u3878\u387d\u1372\u3891\u38a0own\xe1\u13b3arpoon\u0100lr\u3888\u388cef\xf4\u382digh\xf4\u382fi\u0180;hl\u3899\u389a\u389c\u43c5\xbb\u13faon\xbb\u389aparrows;\u61c8\u0180cit\u38b0\u38c4\u38c8\u026f\u38b6\0\0\u38c1rn\u0100;e\u38bc\u38bd\u631dr\xbb\u38bdop;\u630eng;\u416fri;\u65f9cr;\uc000\ud835\udcca\u0180dir\u38d9\u38dd\u38e2ot;\u62f0lde;\u4169i\u0100;f\u3730\u38e8\xbb\u1813\u0100am\u38ef\u38f2r\xf2\u38a8l\u803b\xfc\u40fcangle;\u69a7\u0780ABDacdeflnoprsz\u391c\u391f\u3929\u392d\u39b5\u39b8\u39bd\u39df\u39e4\u39e8\u39f3\u39f9\u39fd\u3a01\u3a20r\xf2\u03f7ar\u0100;v\u3926\u3927\u6ae8;\u6ae9as\xe8\u03e1\u0100nr\u3932\u3937grt;\u699c\u0380eknprst\u34e3\u3946\u394b\u3952\u395d\u3964\u3996app\xe1\u2415othin\xe7\u1e96\u0180hir\u34eb\u2ec8\u3959op\xf4\u2fb5\u0100;h\u13b7\u3962\xef\u318d\u0100iu\u3969\u396dgm\xe1\u33b3\u0100bp\u3972\u3984setneq\u0100;q\u397d\u3980\uc000\u228a\ufe00;\uc000\u2acb\ufe00setneq\u0100;q\u398f\u3992\uc000\u228b\ufe00;\uc000\u2acc\ufe00\u0100hr\u399b\u399fet\xe1\u369ciangle\u0100lr\u39aa\u39afeft\xbb\u0925ight\xbb\u1051y;\u4432ash\xbb\u1036\u0180elr\u39c4\u39d2\u39d7\u0180;be\u2dea\u39cb\u39cfar;\u62bbq;\u625alip;\u62ee\u0100bt\u39dc\u1468a\xf2\u1469r;\uc000\ud835\udd33tr\xe9\u39aesu\u0100bp\u39ef\u39f1\xbb\u0d1c\xbb\u0d59pf;\uc000\ud835\udd67ro\xf0\u0efbtr\xe9\u39b4\u0100cu\u3a06\u3a0br;\uc000\ud835\udccb\u0100bp\u3a10\u3a18n\u0100Ee\u3980\u3a16\xbb\u397en\u0100Ee\u3992\u3a1e\xbb\u3990igzag;\u699a\u0380cefoprs\u3a36\u3a3b\u3a56\u3a5b\u3a54\u3a61\u3a6airc;\u4175\u0100di\u3a40\u3a51\u0100bg\u3a45\u3a49ar;\u6a5fe\u0100;q\u15fa\u3a4f;\u6259erp;\u6118r;\uc000\ud835\udd34pf;\uc000\ud835\udd68\u0100;e\u1479\u3a66at\xe8\u1479cr;\uc000\ud835\udccc\u0ae3\u178e\u3a87\0\u3a8b\0\u3a90\u3a9b\0\0\u3a9d\u3aa8\u3aab\u3aaf\0\0\u3ac3\u3ace\0\u3ad8\u17dc\u17dftr\xe9\u17d1r;\uc000\ud835\udd35\u0100Aa\u3a94\u3a97r\xf2\u03c3r\xf2\u09f6;\u43be\u0100Aa\u3aa1\u3aa4r\xf2\u03b8r\xf2\u09eba\xf0\u2713is;\u62fb\u0180dpt\u17a4\u3ab5\u3abe\u0100fl\u3aba\u17a9;\uc000\ud835\udd69im\xe5\u17b2\u0100Aa\u3ac7\u3acar\xf2\u03cer\xf2\u0a01\u0100cq\u3ad2\u17b8r;\uc000\ud835\udccd\u0100pt\u17d6\u3adcr\xe9\u17d4\u0400acefiosu\u3af0\u3afd\u3b08\u3b0c\u3b11\u3b15\u3b1b\u3b21c\u0100uy\u3af6\u3afbte\u803b\xfd\u40fd;\u444f\u0100iy\u3b02\u3b06rc;\u4177;\u444bn\u803b\xa5\u40a5r;\uc000\ud835\udd36cy;\u4457pf;\uc000\ud835\udd6acr;\uc000\ud835\udcce\u0100cm\u3b26\u3b29y;\u444el\u803b\xff\u40ff\u0500acdefhiosw\u3b42\u3b48\u3b54\u3b58\u3b64\u3b69\u3b6d\u3b74\u3b7a\u3b80cute;\u417a\u0100ay\u3b4d\u3b52ron;\u417e;\u4437ot;\u417c\u0100et\u3b5d\u3b61tr\xe6\u155fa;\u43b6r;\uc000\ud835\udd37cy;\u4436grarr;\u61ddpf;\uc000\ud835\udd6bcr;\uc000\ud835\udccf\u0100jn\u3b85\u3b87;\u600dj;\u600c"
      .split("")
      .map((c) => c.charCodeAt(0)));

  // Generated using scripts/write-decode-map.ts
  var xmlDecodeTree = new Uint16Array(
  // prettier-ignore
  "\u0200aglq\t\x15\x18\x1b\u026d\x0f\0\0\x12p;\u4026os;\u4027t;\u403et;\u403cuot;\u4022"
      .split("")
      .map((c) => c.charCodeAt(0)));

  // Adapted from https://github.com/mathiasbynens/he/blob/36afe179392226cf1b6ccdb16ebbb7a5a844d93a/src/he.js#L106-L134
  var _a;
  const decodeMap = new Map([
      [0, 65533],
      // C1 Unicode control character reference replacements
      [128, 8364],
      [130, 8218],
      [131, 402],
      [132, 8222],
      [133, 8230],
      [134, 8224],
      [135, 8225],
      [136, 710],
      [137, 8240],
      [138, 352],
      [139, 8249],
      [140, 338],
      [142, 381],
      [145, 8216],
      [146, 8217],
      [147, 8220],
      [148, 8221],
      [149, 8226],
      [150, 8211],
      [151, 8212],
      [152, 732],
      [153, 8482],
      [154, 353],
      [155, 8250],
      [156, 339],
      [158, 382],
      [159, 376],
  ]);
  /**
   * Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
   */
  const fromCodePoint$1 = 
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function (codePoint) {
      let output = "";
      if (codePoint > 0xffff) {
          codePoint -= 0x10000;
          output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
          codePoint = 0xdc00 | (codePoint & 0x3ff);
      }
      output += String.fromCharCode(codePoint);
      return output;
  };
  /**
   * Replace the given code point with a replacement character if it is a
   * surrogate or is outside the valid range. Otherwise return the code
   * point unchanged.
   */
  function replaceCodePoint(codePoint) {
      var _a;
      if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
          return 0xfffd;
      }
      return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
  }

  var CharCodes;
  (function (CharCodes) {
      CharCodes[CharCodes["NUM"] = 35] = "NUM";
      CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
      CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
      CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
      CharCodes[CharCodes["NINE"] = 57] = "NINE";
      CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
      CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
      CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
      CharCodes[CharCodes["LOWER_Z"] = 122] = "LOWER_Z";
      CharCodes[CharCodes["UPPER_A"] = 65] = "UPPER_A";
      CharCodes[CharCodes["UPPER_F"] = 70] = "UPPER_F";
      CharCodes[CharCodes["UPPER_Z"] = 90] = "UPPER_Z";
  })(CharCodes || (CharCodes = {}));
  /** Bit that needs to be set to convert an upper case ASCII character to lower case */
  const TO_LOWER_BIT = 0b100000;
  var BinTrieFlags;
  (function (BinTrieFlags) {
      BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
      BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
      BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
  })(BinTrieFlags || (BinTrieFlags = {}));
  function isNumber(code) {
      return code >= CharCodes.ZERO && code <= CharCodes.NINE;
  }
  function isHexadecimalCharacter(code) {
      return ((code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F) ||
          (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F));
  }
  function isAsciiAlphaNumeric(code) {
      return ((code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||
          (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||
          isNumber(code));
  }
  /**
   * Checks if the given character is a valid end character for an entity in an attribute.
   *
   * Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
   * See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
   */
  function isEntityInAttributeInvalidEnd(code) {
      return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
  }
  var EntityDecoderState;
  (function (EntityDecoderState) {
      EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
      EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
      EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
      EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
      EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
  })(EntityDecoderState || (EntityDecoderState = {}));
  var DecodingMode;
  (function (DecodingMode) {
      /** Entities in text nodes that can end with any character. */
      DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
      /** Only allow entities terminated with a semicolon. */
      DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
      /** Entities in attributes have limitations on ending characters. */
      DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
  })(DecodingMode || (DecodingMode = {}));
  /**
   * Token decoder with support of writing partial entities.
   */
  class EntityDecoder {
      constructor(
      /** The tree used to decode entities. */
      decodeTree, 
      /**
       * The function that is called when a codepoint is decoded.
       *
       * For multi-byte named entities, this will be called multiple times,
       * with the second codepoint, and the same `consumed` value.
       *
       * @param codepoint The decoded codepoint.
       * @param consumed The number of bytes consumed by the decoder.
       */
      emitCodePoint, 
      /** An object that is used to produce errors. */
      errors) {
          this.decodeTree = decodeTree;
          this.emitCodePoint = emitCodePoint;
          this.errors = errors;
          /** The current state of the decoder. */
          this.state = EntityDecoderState.EntityStart;
          /** Characters that were consumed while parsing an entity. */
          this.consumed = 1;
          /**
           * The result of the entity.
           *
           * Either the result index of a numeric entity, or the codepoint of a
           * numeric entity.
           */
          this.result = 0;
          /** The current index in the decode tree. */
          this.treeIndex = 0;
          /** The number of characters that were consumed in excess. */
          this.excess = 1;
          /** The mode in which the decoder is operating. */
          this.decodeMode = DecodingMode.Strict;
      }
      /** Resets the instance to make it reusable. */
      startEntity(decodeMode) {
          this.decodeMode = decodeMode;
          this.state = EntityDecoderState.EntityStart;
          this.result = 0;
          this.treeIndex = 0;
          this.excess = 1;
          this.consumed = 1;
      }
      /**
       * Write an entity to the decoder. This can be called multiple times with partial entities.
       * If the entity is incomplete, the decoder will return -1.
       *
       * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
       * entity is incomplete, and resume when the next string is written.
       *
       * @param string The string containing the entity (or a continuation of the entity).
       * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      write(str, offset) {
          switch (this.state) {
              case EntityDecoderState.EntityStart: {
                  if (str.charCodeAt(offset) === CharCodes.NUM) {
                      this.state = EntityDecoderState.NumericStart;
                      this.consumed += 1;
                      return this.stateNumericStart(str, offset + 1);
                  }
                  this.state = EntityDecoderState.NamedEntity;
                  return this.stateNamedEntity(str, offset);
              }
              case EntityDecoderState.NumericStart: {
                  return this.stateNumericStart(str, offset);
              }
              case EntityDecoderState.NumericDecimal: {
                  return this.stateNumericDecimal(str, offset);
              }
              case EntityDecoderState.NumericHex: {
                  return this.stateNumericHex(str, offset);
              }
              case EntityDecoderState.NamedEntity: {
                  return this.stateNamedEntity(str, offset);
              }
          }
      }
      /**
       * Switches between the numeric decimal and hexadecimal states.
       *
       * Equivalent to the `Numeric character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericStart(str, offset) {
          if (offset >= str.length) {
              return -1;
          }
          if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
              this.state = EntityDecoderState.NumericHex;
              this.consumed += 1;
              return this.stateNumericHex(str, offset + 1);
          }
          this.state = EntityDecoderState.NumericDecimal;
          return this.stateNumericDecimal(str, offset);
      }
      addToNumericResult(str, start, end, base) {
          if (start !== end) {
              const digitCount = end - start;
              this.result =
                  this.result * Math.pow(base, digitCount) +
                      parseInt(str.substr(start, digitCount), base);
              this.consumed += digitCount;
          }
      }
      /**
       * Parses a hexadecimal numeric entity.
       *
       * Equivalent to the `Hexademical character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericHex(str, offset) {
          const startIdx = offset;
          while (offset < str.length) {
              const char = str.charCodeAt(offset);
              if (isNumber(char) || isHexadecimalCharacter(char)) {
                  offset += 1;
              }
              else {
                  this.addToNumericResult(str, startIdx, offset, 16);
                  return this.emitNumericEntity(char, 3);
              }
          }
          this.addToNumericResult(str, startIdx, offset, 16);
          return -1;
      }
      /**
       * Parses a decimal numeric entity.
       *
       * Equivalent to the `Decimal character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericDecimal(str, offset) {
          const startIdx = offset;
          while (offset < str.length) {
              const char = str.charCodeAt(offset);
              if (isNumber(char)) {
                  offset += 1;
              }
              else {
                  this.addToNumericResult(str, startIdx, offset, 10);
                  return this.emitNumericEntity(char, 2);
              }
          }
          this.addToNumericResult(str, startIdx, offset, 10);
          return -1;
      }
      /**
       * Validate and emit a numeric entity.
       *
       * Implements the logic from the `Hexademical character reference start
       * state` and `Numeric character reference end state` in the HTML spec.
       *
       * @param lastCp The last code point of the entity. Used to see if the
       *               entity was terminated with a semicolon.
       * @param expectedLength The minimum number of characters that should be
       *                       consumed. Used to validate that at least one digit
       *                       was consumed.
       * @returns The number of characters that were consumed.
       */
      emitNumericEntity(lastCp, expectedLength) {
          var _a;
          // Ensure we consumed at least one digit.
          if (this.consumed <= expectedLength) {
              (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
              return 0;
          }
          // Figure out if this is a legit end of the entity
          if (lastCp === CharCodes.SEMI) {
              this.consumed += 1;
          }
          else if (this.decodeMode === DecodingMode.Strict) {
              return 0;
          }
          this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
          if (this.errors) {
              if (lastCp !== CharCodes.SEMI) {
                  this.errors.missingSemicolonAfterCharacterReference();
              }
              this.errors.validateNumericCharacterReference(this.result);
          }
          return this.consumed;
      }
      /**
       * Parses a named entity.
       *
       * Equivalent to the `Named character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNamedEntity(str, offset) {
          const { decodeTree } = this;
          let current = decodeTree[this.treeIndex];
          // The mask is the number of bytes of the value, including the current byte.
          let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
          for (; offset < str.length; offset++, this.excess++) {
              const char = str.charCodeAt(offset);
              this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
              if (this.treeIndex < 0) {
                  return this.result === 0 ||
                      // If we are parsing an attribute
                      (this.decodeMode === DecodingMode.Attribute &&
                          // We shouldn't have consumed any characters after the entity,
                          (valueLength === 0 ||
                              // And there should be no invalid characters.
                              isEntityInAttributeInvalidEnd(char)))
                      ? 0
                      : this.emitNotTerminatedNamedEntity();
              }
              current = decodeTree[this.treeIndex];
              valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
              // If the branch is a value, store it and continue
              if (valueLength !== 0) {
                  // If the entity is terminated by a semicolon, we are done.
                  if (char === CharCodes.SEMI) {
                      return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
                  }
                  // If we encounter a non-terminated (legacy) entity while parsing strictly, then ignore it.
                  if (this.decodeMode !== DecodingMode.Strict) {
                      this.result = this.treeIndex;
                      this.consumed += this.excess;
                      this.excess = 0;
                  }
              }
          }
          return -1;
      }
      /**
       * Emit a named entity that was not terminated with a semicolon.
       *
       * @returns The number of characters consumed.
       */
      emitNotTerminatedNamedEntity() {
          var _a;
          const { result, decodeTree } = this;
          const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
          this.emitNamedEntityData(result, valueLength, this.consumed);
          (_a = this.errors) === null || _a === void 0 ? void 0 : _a.missingSemicolonAfterCharacterReference();
          return this.consumed;
      }
      /**
       * Emit a named entity.
       *
       * @param result The index of the entity in the decode tree.
       * @param valueLength The number of bytes in the entity.
       * @param consumed The number of characters consumed.
       *
       * @returns The number of characters consumed.
       */
      emitNamedEntityData(result, valueLength, consumed) {
          const { decodeTree } = this;
          this.emitCodePoint(valueLength === 1
              ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH
              : decodeTree[result + 1], consumed);
          if (valueLength === 3) {
              // For multi-byte values, we need to emit the second byte.
              this.emitCodePoint(decodeTree[result + 2], consumed);
          }
          return consumed;
      }
      /**
       * Signal to the parser that the end of the input was reached.
       *
       * Remaining data will be emitted and relevant errors will be produced.
       *
       * @returns The number of characters consumed.
       */
      end() {
          var _a;
          switch (this.state) {
              case EntityDecoderState.NamedEntity: {
                  // Emit a named entity if we have one.
                  return this.result !== 0 &&
                      (this.decodeMode !== DecodingMode.Attribute ||
                          this.result === this.treeIndex)
                      ? this.emitNotTerminatedNamedEntity()
                      : 0;
              }
              // Otherwise, emit a numeric entity if we have one.
              case EntityDecoderState.NumericDecimal: {
                  return this.emitNumericEntity(0, 2);
              }
              case EntityDecoderState.NumericHex: {
                  return this.emitNumericEntity(0, 3);
              }
              case EntityDecoderState.NumericStart: {
                  (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
                  return 0;
              }
              case EntityDecoderState.EntityStart: {
                  // Return 0 if we have no entity.
                  return 0;
              }
          }
      }
  }
  /**
   * Creates a function that decodes entities in a string.
   *
   * @param decodeTree The decode tree.
   * @returns A function that decodes entities in a string.
   */
  function getDecoder(decodeTree) {
      let ret = "";
      const decoder = new EntityDecoder(decodeTree, (str) => (ret += fromCodePoint$1(str)));
      return function decodeWithTrie(str, decodeMode) {
          let lastIndex = 0;
          let offset = 0;
          while ((offset = str.indexOf("&", offset)) >= 0) {
              ret += str.slice(lastIndex, offset);
              decoder.startEntity(decodeMode);
              const len = decoder.write(str, 
              // Skip the "&"
              offset + 1);
              if (len < 0) {
                  lastIndex = offset + decoder.end();
                  break;
              }
              lastIndex = offset + len;
              // If `len` is 0, skip the current `&` and continue.
              offset = len === 0 ? lastIndex + 1 : lastIndex;
          }
          const result = ret + str.slice(lastIndex);
          // Make sure we don't keep a reference to the final string.
          ret = "";
          return result;
      };
  }
  /**
   * Determines the branch of the current node that is taken given the current
   * character. This function is used to traverse the trie.
   *
   * @param decodeTree The trie.
   * @param current The current node.
   * @param nodeIdx The index right after the current node and its value.
   * @param char The current character.
   * @returns The index of the next node, or -1 if no branch is taken.
   */
  function determineBranch(decodeTree, current, nodeIdx, char) {
      const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
      const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
      // Case 1: Single branch encoded in jump offset
      if (branchCount === 0) {
          return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
      }
      // Case 2: Multiple branches encoded in jump table
      if (jumpOffset) {
          const value = char - jumpOffset;
          return value < 0 || value >= branchCount
              ? -1
              : decodeTree[nodeIdx + value] - 1;
      }
      // Case 3: Multiple branches encoded in dictionary
      // Binary search for the character.
      let lo = nodeIdx;
      let hi = lo + branchCount - 1;
      while (lo <= hi) {
          const mid = (lo + hi) >>> 1;
          const midVal = decodeTree[mid];
          if (midVal < char) {
              lo = mid + 1;
          }
          else if (midVal > char) {
              hi = mid - 1;
          }
          else {
              return decodeTree[mid + branchCount];
          }
      }
      return -1;
  }
  const htmlDecoder = getDecoder(htmlDecodeTree);
  getDecoder(xmlDecodeTree);
  /**
   * Decodes an HTML string.
   *
   * @param str The string to decode.
   * @param mode The decoding mode.
   * @returns The decoded string.
   */
  function decodeHTML(str, mode = DecodingMode.Legacy) {
      return htmlDecoder(str, mode);
  }

  // Utilities
  //


  function _class$1 (obj) { return Object.prototype.toString.call(obj) }

  function isString$1 (obj) { return _class$1(obj) === '[object String]' }

  const _hasOwnProperty = Object.prototype.hasOwnProperty;

  function has (object, key) {
    return _hasOwnProperty.call(object, key)
  }

  // Merge objects
  //
  function assign$1 (obj /* from1, from2, from3, ... */) {
    const sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(function (source) {
      if (!source) { return }

      if (typeof source !== 'object') {
        throw new TypeError(source + 'must be object')
      }

      Object.keys(source).forEach(function (key) {
        obj[key] = source[key];
      });
    });

    return obj
  }

  // Remove element from array and put another array at those position.
  // Useful for some operations with tokens
  function arrayReplaceAt (src, pos, newElements) {
    return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1))
  }

  function isValidEntityCode (c) {
    /* eslint no-bitwise:0 */
    // broken sequence
    if (c >= 0xD800 && c <= 0xDFFF) { return false }
    // never used
    if (c >= 0xFDD0 && c <= 0xFDEF) { return false }
    if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false }
    // control codes
    if (c >= 0x00 && c <= 0x08) { return false }
    if (c === 0x0B) { return false }
    if (c >= 0x0E && c <= 0x1F) { return false }
    if (c >= 0x7F && c <= 0x9F) { return false }
    // out of range
    if (c > 0x10FFFF) { return false }
    return true
  }

  function fromCodePoint (c) {
    /* eslint no-bitwise:0 */
    if (c > 0xffff) {
      c -= 0x10000;
      const surrogate1 = 0xd800 + (c >> 10);
      const surrogate2 = 0xdc00 + (c & 0x3ff);

      return String.fromCharCode(surrogate1, surrogate2)
    }
    return String.fromCharCode(c)
  }

  const UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
  const ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
  const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

  const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;

  function replaceEntityPattern (match, name) {
    if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
      const code = name[1].toLowerCase() === 'x'
        ? parseInt(name.slice(2), 16)
        : parseInt(name.slice(1), 10);

      if (isValidEntityCode(code)) {
        return fromCodePoint(code)
      }

      return match
    }

    const decoded = decodeHTML(match);
    if (decoded !== match) {
      return decoded
    }

    return match
  }

  /* function replaceEntities(str) {
    if (str.indexOf('&') < 0) { return str; }

    return str.replace(ENTITY_RE, replaceEntityPattern);
  } */

  function unescapeMd (str) {
    if (str.indexOf('\\') < 0) { return str }
    return str.replace(UNESCAPE_MD_RE, '$1')
  }

  function unescapeAll (str) {
    if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str }

    return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
      if (escaped) { return escaped }
      return replaceEntityPattern(match, entity)
    })
  }

  const HTML_ESCAPE_TEST_RE = /[&<>"]/;
  const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
  const HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };

  function replaceUnsafeChar (ch) {
    return HTML_REPLACEMENTS[ch]
  }

  function escapeHtml (str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
      return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
    }
    return str
  }

  const REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

  function escapeRE$1 (str) {
    return str.replace(REGEXP_ESCAPE_RE, '\\$&')
  }

  function isSpace (code) {
    switch (code) {
      case 0x09:
      case 0x20:
        return true
    }
    return false
  }

  // Zs (unicode class) || [\t\f\v\r\n]
  function isWhiteSpace (code) {
    if (code >= 0x2000 && code <= 0x200A) { return true }
    switch (code) {
      case 0x09: // \t
      case 0x0A: // \n
      case 0x0B: // \v
      case 0x0C: // \f
      case 0x0D: // \r
      case 0x20:
      case 0xA0:
      case 0x1680:
      case 0x202F:
      case 0x205F:
      case 0x3000:
        return true
    }
    return false
  }

  /* eslint-disable max-len */

  // Currently without astral characters support.
  function isPunctChar (ch) {
    return P.test(ch) || regex.test(ch)
  }

  // Markdown ASCII punctuation characters.
  //
  // !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
  // http://spec.commonmark.org/0.15/#ascii-punctuation-character
  //
  // Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
  //
  function isMdAsciiPunct (ch) {
    switch (ch) {
      case 0x21/* ! */:
      case 0x22/* " */:
      case 0x23/* # */:
      case 0x24/* $ */:
      case 0x25/* % */:
      case 0x26/* & */:
      case 0x27/* ' */:
      case 0x28/* ( */:
      case 0x29/* ) */:
      case 0x2A/* * */:
      case 0x2B/* + */:
      case 0x2C/* , */:
      case 0x2D/* - */:
      case 0x2E/* . */:
      case 0x2F/* / */:
      case 0x3A/* : */:
      case 0x3B/* ; */:
      case 0x3C/* < */:
      case 0x3D/* = */:
      case 0x3E/* > */:
      case 0x3F/* ? */:
      case 0x40/* @ */:
      case 0x5B/* [ */:
      case 0x5C/* \ */:
      case 0x5D/* ] */:
      case 0x5E/* ^ */:
      case 0x5F/* _ */:
      case 0x60/* ` */:
      case 0x7B/* { */:
      case 0x7C/* | */:
      case 0x7D/* } */:
      case 0x7E/* ~ */:
        return true
      default:
        return false
    }
  }

  // Hepler to unify [reference labels].
  //
  function normalizeReference (str) {
    // Trim and collapse whitespace
    //
    str = str.trim().replace(/\s+/g, ' ');

    // In node v10 'ẞ'.toLowerCase() === 'Ṿ', which is presumed to be a bug
    // fixed in v12 (couldn't find any details).
    //
    // So treat this one as a special case
    // (remove this when node v10 is no longer supported).
    //
    if ('ẞ'.toLowerCase() === 'Ṿ') {
      str = str.replace(/ẞ/g, 'ß');
    }

    // .toLowerCase().toUpperCase() should get rid of all differences
    // between letter variants.
    //
    // Simple .toLowerCase() doesn't normalize 125 code points correctly,
    // and .toUpperCase doesn't normalize 6 of them (list of exceptions:
    // İ, ϴ, ẞ, Ω, K, Å - those are already uppercased, but have differently
    // uppercased versions).
    //
    // Here's an example showing how it happens. Lets take greek letter omega:
    // uppercase U+0398 (Θ), U+03f4 (ϴ) and lowercase U+03b8 (θ), U+03d1 (ϑ)
    //
    // Unicode entries:
    // 0398;GREEK CAPITAL LETTER THETA;Lu;0;L;;;;;N;;;;03B8;
    // 03B8;GREEK SMALL LETTER THETA;Ll;0;L;;;;;N;;;0398;;0398
    // 03D1;GREEK THETA SYMBOL;Ll;0;L;<compat> 03B8;;;;N;GREEK SMALL LETTER SCRIPT THETA;;0398;;0398
    // 03F4;GREEK CAPITAL THETA SYMBOL;Lu;0;L;<compat> 0398;;;;N;;;;03B8;
    //
    // Case-insensitive comparison should treat all of them as equivalent.
    //
    // But .toLowerCase() doesn't change ϑ (it's already lowercase),
    // and .toUpperCase() doesn't change ϴ (already uppercase).
    //
    // Applying first lower then upper case normalizes any character:
    // '\u0398\u03f4\u03b8\u03d1'.toLowerCase().toUpperCase() === '\u0398\u0398\u0398\u0398'
    //
    // Note: this is equivalent to unicode case folding; unicode normalization
    // is a different step that is not required here.
    //
    // Final result should be uppercased, because it's later stored in an object
    // (this avoid a conflict with Object.prototype members,
    // most notably, `__proto__`)
    //
    return str.toLowerCase().toUpperCase()
  }

  // Re-export libraries commonly used in both markdown-it and its plugins,
  // so plugins won't have to depend on them explicitly, which reduces their
  // bundled size (e.g. a browser build).
  //
  const lib = { mdurl, ucmicro };

  var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    arrayReplaceAt: arrayReplaceAt,
    assign: assign$1,
    escapeHtml: escapeHtml,
    escapeRE: escapeRE$1,
    fromCodePoint: fromCodePoint,
    has: has,
    isMdAsciiPunct: isMdAsciiPunct,
    isPunctChar: isPunctChar,
    isSpace: isSpace,
    isString: isString$1,
    isValidEntityCode: isValidEntityCode,
    isWhiteSpace: isWhiteSpace,
    lib: lib,
    normalizeReference: normalizeReference,
    unescapeAll: unescapeAll,
    unescapeMd: unescapeMd
  });

  // Parse link label
  //
  // this function assumes that first character ("[") already matches;
  // returns the end of the label
  //

  function parseLinkLabel (state, start, disableNested) {
    let level, found, marker, prevPos;

    const max = state.posMax;
    const oldPos = state.pos;

    state.pos = start + 1;
    level = 1;

    while (state.pos < max) {
      marker = state.src.charCodeAt(state.pos);
      if (marker === 0x5D /* ] */) {
        level--;
        if (level === 0) {
          found = true;
          break
        }
      }

      prevPos = state.pos;
      state.md.inline.skipToken(state);
      if (marker === 0x5B /* [ */) {
        if (prevPos === state.pos - 1) {
          // increase level if we find text `[`, which is not a part of any token
          level++;
        } else if (disableNested) {
          state.pos = oldPos;
          return -1
        }
      }
    }

    let labelEnd = -1;

    if (found) {
      labelEnd = state.pos;
    }

    // restore old state
    state.pos = oldPos;

    return labelEnd
  }

  // Parse link destination
  //


  function parseLinkDestination (str, start, max) {
    let code;
    let pos = start;

    const result = {
      ok: false,
      pos: 0,
      str: ''
    };

    if (str.charCodeAt(pos) === 0x3C /* < */) {
      pos++;
      while (pos < max) {
        code = str.charCodeAt(pos);
        if (code === 0x0A /* \n */) { return result }
        if (code === 0x3C /* < */) { return result }
        if (code === 0x3E /* > */) {
          result.pos = pos + 1;
          result.str = unescapeAll(str.slice(start + 1, pos));
          result.ok = true;
          return result
        }
        if (code === 0x5C /* \ */ && pos + 1 < max) {
          pos += 2;
          continue
        }

        pos++;
      }

      // no closing '>'
      return result
    }

    // this should be ... } else { ... branch

    let level = 0;
    while (pos < max) {
      code = str.charCodeAt(pos);

      if (code === 0x20) { break }

      // ascii control characters
      if (code < 0x20 || code === 0x7F) { break }

      if (code === 0x5C /* \ */ && pos + 1 < max) {
        if (str.charCodeAt(pos + 1) === 0x20) { break }
        pos += 2;
        continue
      }

      if (code === 0x28 /* ( */) {
        level++;
        if (level > 32) { return result }
      }

      if (code === 0x29 /* ) */) {
        if (level === 0) { break }
        level--;
      }

      pos++;
    }

    if (start === pos) { return result }
    if (level !== 0) { return result }

    result.str = unescapeAll(str.slice(start, pos));
    result.pos = pos;
    result.ok = true;
    return result
  }

  // Parse link title
  //


  // Parse link title within `str` in [start, max] range,
  // or continue previous parsing if `prev_state` is defined (equal to result of last execution).
  //
  function parseLinkTitle (str, start, max, prev_state) {
    let code;
    let pos = start;

    const state = {
      // if `true`, this is a valid link title
      ok: false,
      // if `true`, this link can be continued on the next line
      can_continue: false,
      // if `ok`, it's the position of the first character after the closing marker
      pos: 0,
      // if `ok`, it's the unescaped title
      str: '',
      // expected closing marker character code
      marker: 0
    };

    if (prev_state) {
      // this is a continuation of a previous parseLinkTitle call on the next line,
      // used in reference links only
      state.str = prev_state.str;
      state.marker = prev_state.marker;
    } else {
      if (pos >= max) { return state }

      let marker = str.charCodeAt(pos);
      if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return state }

      start++;
      pos++;

      // if opening marker is "(", switch it to closing marker ")"
      if (marker === 0x28) { marker = 0x29; }

      state.marker = marker;
    }

    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === state.marker) {
        state.pos = pos + 1;
        state.str += unescapeAll(str.slice(start, pos));
        state.ok = true;
        return state
      } else if (code === 0x28 /* ( */ && state.marker === 0x29 /* ) */) {
        return state
      } else if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos++;
      }

      pos++;
    }

    // no closing marker found, but this link title may continue on the next line (for references)
    state.can_continue = true;
    state.str += unescapeAll(str.slice(start, pos));
    return state
  }

  // Just a shortcut for bulk export

  var helpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    parseLinkDestination: parseLinkDestination,
    parseLinkLabel: parseLinkLabel,
    parseLinkTitle: parseLinkTitle
  });

  /**
   * class Renderer
   *
   * Generates HTML from parsed token stream. Each instance has independent
   * copy of rules. Those can be rewritten with ease. Also, you can add new
   * rules if you create plugin and adds new token types.
   **/


  const default_rules = {};

  default_rules.code_inline = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];

    return  '<code' + slf.renderAttrs(token) + '>' +
            escapeHtml(token.content) +
            '</code>'
  };

  default_rules.code_block = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];

    return  '<pre' + slf.renderAttrs(token) + '><code>' +
            escapeHtml(tokens[idx].content) +
            '</code></pre>\n'
  };

  default_rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : '';
    let langName = '';
    let langAttrs = '';

    if (info) {
      const arr = info.split(/(\s+)/g);
      langName = arr[0];
      langAttrs = arr.slice(2).join('');
    }

    let highlighted;
    if (options.highlight) {
      highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
    } else {
      highlighted = escapeHtml(token.content);
    }

    if (highlighted.indexOf('<pre') === 0) {
      return highlighted + '\n'
    }

    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .deepClone() for token and simplify this part, but
    // now we prefer to keep things local.
    if (info) {
      const i = token.attrIndex('class');
      const tmpAttrs = token.attrs ? token.attrs.slice() : [];

      if (i < 0) {
        tmpAttrs.push(['class', options.langPrefix + langName]);
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice();
        tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
      }

      // Fake token just to render attributes
      const tmpToken = {
        attrs: tmpAttrs
      };

      return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`
    }

    return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`
  };

  default_rules.image = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];

    // "alt" attr MUST be set, even if empty. Because it's mandatory and
    // should be placed on proper position for tests.
    //
    // Replace content with actual value

    token.attrs[token.attrIndex('alt')][1] =
      slf.renderInlineAsText(token.children, options, env);

    return slf.renderToken(tokens, idx, options)
  };

  default_rules.hardbreak = function (tokens, idx, options /*, env */) {
    return options.xhtmlOut ? '<br />\n' : '<br>\n'
  };
  default_rules.softbreak = function (tokens, idx, options /*, env */) {
    return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n'
  };

  default_rules.text = function (tokens, idx /*, options, env */) {
    return escapeHtml(tokens[idx].content)
  };

  default_rules.html_block = function (tokens, idx /*, options, env */) {
    return tokens[idx].content
  };
  default_rules.html_inline = function (tokens, idx /*, options, env */) {
    return tokens[idx].content
  };

  /**
   * new Renderer()
   *
   * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
   **/
  function Renderer () {
    /**
     * Renderer#rules -> Object
     *
     * Contains render rules for tokens. Can be updated and extended.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.renderer.rules.strong_open  = function () { return '<b>'; };
     * md.renderer.rules.strong_close = function () { return '</b>'; };
     *
     * var result = md.renderInline(...);
     * ```
     *
     * Each rule is called as independent static function with fixed signature:
     *
     * ```javascript
     * function my_token_render(tokens, idx, options, env, renderer) {
     *   // ...
     *   return renderedHTML;
     * }
     * ```
     *
     * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs)
     * for more details and examples.
     **/
    this.rules = assign$1({}, default_rules);
  }

  /**
   * Renderer.renderAttrs(token) -> String
   *
   * Render token attributes to string.
   **/
  Renderer.prototype.renderAttrs = function renderAttrs (token) {
    let i, l, result;

    if (!token.attrs) { return '' }

    result = '';

    for (i = 0, l = token.attrs.length; i < l; i++) {
      result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
    }

    return result
  };

  /**
   * Renderer.renderToken(tokens, idx, options) -> String
   * - tokens (Array): list of tokens
   * - idx (Numbed): token index to render
   * - options (Object): params of parser instance
   *
   * Default token renderer. Can be overriden by custom function
   * in [[Renderer#rules]].
   **/
  Renderer.prototype.renderToken = function renderToken (tokens, idx, options) {
    const token = tokens[idx];
    let result = '';

    // Tight list paragraphs
    if (token.hidden) {
      return ''
    }

    // Insert a newline between hidden paragraph and subsequent opening
    // block-level tag.
    //
    // For example, here we should insert a newline before blockquote:
    //  - a
    //    >
    //
    if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
      result += '\n';
    }

    // Add token name, e.g. `<img`
    result += (token.nesting === -1 ? '</' : '<') + token.tag;

    // Encode attributes, e.g. `<img src="foo"`
    result += this.renderAttrs(token);

    // Add a slash for self-closing tags, e.g. `<img src="foo" /`
    if (token.nesting === 0 && options.xhtmlOut) {
      result += ' /';
    }

    // Check if we need to add a newline after this tag
    let needLf = false;
    if (token.block) {
      needLf = true;

      if (token.nesting === 1) {
        if (idx + 1 < tokens.length) {
          const nextToken = tokens[idx + 1];

          if (nextToken.type === 'inline' || nextToken.hidden) {
            // Block-level tag containing an inline tag.
            //
            needLf = false;
          } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
            // Opening tag + closing tag of the same type. E.g. `<li></li>`.
            //
            needLf = false;
          }
        }
      }
    }

    result += needLf ? '>\n' : '>';

    return result
  };

  /**
   * Renderer.renderInline(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to render
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * The same as [[Renderer.render]], but for single token of `inline` type.
   **/
  Renderer.prototype.renderInline = function (tokens, options, env) {
    let result = '';
    const rules = this.rules;

    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type;

      if (typeof rules[type] !== 'undefined') {
        result += rules[type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options);
      }
    }

    return result
  };

  /** internal
   * Renderer.renderInlineAsText(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to render
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * Special kludge for image `alt` attributes to conform CommonMark spec.
   * Don't try to use it! Spec requires to show `alt` content with stripped markup,
   * instead of simple escaping.
   **/
  Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
    let result = '';

    for (let i = 0, len = tokens.length; i < len; i++) {
      switch (tokens[i].type) {
        case 'text':
          result += tokens[i].content;
          break
        case 'image':
          result += this.renderInlineAsText(tokens[i].children, options, env);
          break
        case 'html_inline':
        case 'html_block':
          result += tokens[i].content;
          break
        case 'softbreak':
        case 'hardbreak':
          result += '\n';
          break
          // all other tokens are skipped
      }
    }

    return result
  };

  /**
   * Renderer.render(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to render
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * Takes token stream and generates HTML. Probably, you will never need to call
   * this method directly.
   **/
  Renderer.prototype.render = function (tokens, options, env) {
    let result = '';
    const rules = this.rules;

    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type;

      if (type === 'inline') {
        result += this.renderInline(tokens[i].children, options, env);
      } else if (typeof rules[type] !== 'undefined') {
        result += rules[type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options, env);
      }
    }

    return result
  };

  /**
   * class Ruler
   *
   * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
   * [[MarkdownIt#inline]] to manage sequences of functions (rules):
   *
   * - keep rules in defined order
   * - assign the name to each rule
   * - enable/disable rules
   * - add/replace rules
   * - allow assign rules to additional named chains (in the same)
   * - cacheing lists of active rules
   *
   * You will not need use this class directly until write plugins. For simple
   * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
   * [[MarkdownIt.use]].
   **/

  /**
   * new Ruler()
   **/
  function Ruler () {
    // List of added rules. Each element is:
    //
    // {
    //   name: XXX,
    //   enabled: Boolean,
    //   fn: Function(),
    //   alt: [ name2, name3 ]
    // }
    //
    this.__rules__ = [];

    // Cached rule chains.
    //
    // First level - chain name, '' for default.
    // Second level - diginal anchor for fast filtering by charcodes.
    //
    this.__cache__ = null;
  }

  // Helper methods, should not be used directly

  // Find rule index by name
  //
  Ruler.prototype.__find__ = function (name) {
    for (let i = 0; i < this.__rules__.length; i++) {
      if (this.__rules__[i].name === name) {
        return i
      }
    }
    return -1
  };

  // Build rules lookup cache
  //
  Ruler.prototype.__compile__ = function () {
    const self = this;
    const chains = [''];

    // collect unique names
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return }

      rule.alt.forEach(function (altName) {
        if (chains.indexOf(altName) < 0) {
          chains.push(altName);
        }
      });
    });

    self.__cache__ = {};

    chains.forEach(function (chain) {
      self.__cache__[chain] = [];
      self.__rules__.forEach(function (rule) {
        if (!rule.enabled) { return }

        if (chain && rule.alt.indexOf(chain) < 0) { return }

        self.__cache__[chain].push(rule.fn);
      });
    });
  };

  /**
   * Ruler.at(name, fn [, options])
   * - name (String): rule name to replace.
   * - fn (Function): new rule function.
   * - options (Object): new rule options (not mandatory).
   *
   * Replace rule by name with new function & options. Throws error if name not
   * found.
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * Replace existing typographer replacement rule with new one:
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.at('replacements', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.at = function (name, fn, options) {
    const index = this.__find__(name);
    const opt = options || {};

    if (index === -1) { throw new Error('Parser rule not found: ' + name) }

    this.__rules__[index].fn = fn;
    this.__rules__[index].alt = opt.alt || [];
    this.__cache__ = null;
  };

  /**
   * Ruler.before(beforeName, ruleName, fn [, options])
   * - beforeName (String): new rule will be added before this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain before one with given name. See also
   * [[Ruler.after]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
    const index = this.__find__(beforeName);
    const opt = options || {};

    if (index === -1) { throw new Error('Parser rule not found: ' + beforeName) }

    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: opt.alt || []
    });

    this.__cache__ = null;
  };

  /**
   * Ruler.after(afterName, ruleName, fn [, options])
   * - afterName (String): new rule will be added after this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain after one with given name. See also
   * [[Ruler.before]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.inline.ruler.after('text', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.after = function (afterName, ruleName, fn, options) {
    const index = this.__find__(afterName);
    const opt = options || {};

    if (index === -1) { throw new Error('Parser rule not found: ' + afterName) }

    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: opt.alt || []
    });

    this.__cache__ = null;
  };

  /**
   * Ruler.push(ruleName, fn [, options])
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Push new rule to the end of chain. See also
   * [[Ruler.before]], [[Ruler.after]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.push('my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.push = function (ruleName, fn, options) {
    const opt = options || {};

    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn,
      alt: opt.alt || []
    });

    this.__cache__ = null;
  };

  /**
   * Ruler.enable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to enable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.disable]], [[Ruler.enableOnly]].
   **/
  Ruler.prototype.enable = function (list, ignoreInvalid) {
    if (!Array.isArray(list)) { list = [list]; }

    const result = [];

    // Search by name and enable
    list.forEach(function (name) {
      const idx = this.__find__(name);

      if (idx < 0) {
        if (ignoreInvalid) { return }
        throw new Error('Rules manager: invalid rule name ' + name)
      }
      this.__rules__[idx].enabled = true;
      result.push(name);
    }, this);

    this.__cache__ = null;
    return result
  };

  /**
   * Ruler.enableOnly(list [, ignoreInvalid])
   * - list (String|Array): list of rule names to enable (whitelist).
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names, and disable everything else. If any rule name
   * not found - throw Error. Errors can be disabled by second param.
   *
   * See also [[Ruler.disable]], [[Ruler.enable]].
   **/
  Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
    if (!Array.isArray(list)) { list = [list]; }

    this.__rules__.forEach(function (rule) { rule.enabled = false; });

    this.enable(list, ignoreInvalid);
  };

  /**
   * Ruler.disable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Disable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.enable]], [[Ruler.enableOnly]].
   **/
  Ruler.prototype.disable = function (list, ignoreInvalid) {
    if (!Array.isArray(list)) { list = [list]; }

    const result = [];

    // Search by name and disable
    list.forEach(function (name) {
      const idx = this.__find__(name);

      if (idx < 0) {
        if (ignoreInvalid) { return }
        throw new Error('Rules manager: invalid rule name ' + name)
      }
      this.__rules__[idx].enabled = false;
      result.push(name);
    }, this);

    this.__cache__ = null;
    return result
  };

  /**
   * Ruler.getRules(chainName) -> Array
   *
   * Return array of active functions (rules) for given chain name. It analyzes
   * rules configuration, compiles caches if not exists and returns result.
   *
   * Default chain name is `''` (empty string). It can't be skipped. That's
   * done intentionally, to keep signature monomorphic for high speed.
   **/
  Ruler.prototype.getRules = function (chainName) {
    if (this.__cache__ === null) {
      this.__compile__();
    }

    // Chain can be empty, if rules disabled. But we still have to return Array.
    return this.__cache__[chainName] || []
  };

  // Token class

  /**
   * class Token
   **/

  /**
   * new Token(type, tag, nesting)
   *
   * Create new token and fill passed properties.
   **/
  function Token (type, tag, nesting) {
    /**
     * Token#type -> String
     *
     * Type of the token (string, e.g. "paragraph_open")
     **/
    this.type     = type;

    /**
     * Token#tag -> String
     *
     * html tag name, e.g. "p"
     **/
    this.tag      = tag;

    /**
     * Token#attrs -> Array
     *
     * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
     **/
    this.attrs    = null;

    /**
     * Token#map -> Array
     *
     * Source map info. Format: `[ line_begin, line_end ]`
     **/
    this.map      = null;

    /**
     * Token#nesting -> Number
     *
     * Level change (number in {-1, 0, 1} set), where:
     *
     * -  `1` means the tag is opening
     * -  `0` means the tag is self-closing
     * - `-1` means the tag is closing
     **/
    this.nesting  = nesting;

    /**
     * Token#level -> Number
     *
     * nesting level, the same as `state.level`
     **/
    this.level    = 0;

    /**
     * Token#children -> Array
     *
     * An array of child nodes (inline and img tokens)
     **/
    this.children = null;

    /**
     * Token#content -> String
     *
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     **/
    this.content  = '';

    /**
     * Token#markup -> String
     *
     * '*' or '_' for emphasis, fence string for fence, etc.
     **/
    this.markup   = '';

    /**
     * Token#info -> String
     *
     * Additional information:
     *
     * - Info string for "fence" tokens
     * - The value "auto" for autolink "link_open" and "link_close" tokens
     * - The string value of the item marker for ordered-list "list_item_open" tokens
     **/
    this.info     = '';

    /**
     * Token#meta -> Object
     *
     * A place for plugins to store an arbitrary data
     **/
    this.meta     = null;

    /**
     * Token#block -> Boolean
     *
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks
     **/
    this.block    = false;

    /**
     * Token#hidden -> Boolean
     *
     * If it's true, ignore this element when rendering. Used for tight lists
     * to hide paragraphs.
     **/
    this.hidden   = false;
  }

  /**
   * Token.attrIndex(name) -> Number
   *
   * Search attribute index by name.
   **/
  Token.prototype.attrIndex = function attrIndex (name) {
    if (!this.attrs) { return -1 }

    const attrs = this.attrs;

    for (let i = 0, len = attrs.length; i < len; i++) {
      if (attrs[i][0] === name) { return i }
    }
    return -1
  };

  /**
   * Token.attrPush(attrData)
   *
   * Add `[ name, value ]` attribute to list. Init attrs if necessary
   **/
  Token.prototype.attrPush = function attrPush (attrData) {
    if (this.attrs) {
      this.attrs.push(attrData);
    } else {
      this.attrs = [attrData];
    }
  };

  /**
   * Token.attrSet(name, value)
   *
   * Set `name` attribute to `value`. Override old value if exists.
   **/
  Token.prototype.attrSet = function attrSet (name, value) {
    const idx = this.attrIndex(name);
    const attrData = [name, value];

    if (idx < 0) {
      this.attrPush(attrData);
    } else {
      this.attrs[idx] = attrData;
    }
  };

  /**
   * Token.attrGet(name)
   *
   * Get the value of attribute `name`, or null if it does not exist.
   **/
  Token.prototype.attrGet = function attrGet (name) {
    const idx = this.attrIndex(name);
    let value = null;
    if (idx >= 0) {
      value = this.attrs[idx][1];
    }
    return value
  };

  /**
   * Token.attrJoin(name, value)
   *
   * Join value to existing attribute via space. Or create new attribute if not
   * exists. Useful to operate with token classes.
   **/
  Token.prototype.attrJoin = function attrJoin (name, value) {
    const idx = this.attrIndex(name);

    if (idx < 0) {
      this.attrPush([name, value]);
    } else {
      this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
    }
  };

  // Core state object
  //


  function StateCore (src, md, env) {
    this.src = src;
    this.env = env;
    this.tokens = [];
    this.inlineMode = false;
    this.md = md; // link to parser instance
  }

  // re-export Token class to use in core rules
  StateCore.prototype.Token = Token;

  // Normalize input string

  // https://spec.commonmark.org/0.29/#line-ending
  const NEWLINES_RE  = /\r\n?|\n/g;
  const NULL_RE      = /\0/g;

  function normalize (state) {
    let str;

    // Normalize newlines
    str = state.src.replace(NEWLINES_RE, '\n');

    // Replace NULL characters
    str = str.replace(NULL_RE, '\uFFFD');

    state.src = str;
  }

  function block (state) {
    let token;

    if (state.inlineMode) {
      token          = new state.Token('inline', '', 0);
      token.content  = state.src;
      token.map      = [0, 1];
      token.children = [];
      state.tokens.push(token);
    } else {
      state.md.block.parse(state.src, state.md, state.env, state.tokens);
    }
  }

  function inline (state) {
    const tokens = state.tokens;

    // Parse inlines
    for (let i = 0, l = tokens.length; i < l; i++) {
      const tok = tokens[i];
      if (tok.type === 'inline') {
        state.md.inline.parse(tok.content, state.md, state.env, tok.children);
      }
    }
  }

  // Replace link-like texts with link nodes.
  //
  // Currently restricted by `md.validateLink()` to http/https/ftp
  //


  function isLinkOpen$1 (str) {
    return /^<a[>\s]/i.test(str)
  }
  function isLinkClose$1 (str) {
    return /^<\/a\s*>/i.test(str)
  }

  function linkify$1 (state) {
    const blockTokens = state.tokens;

    if (!state.md.options.linkify) { return }

    for (let j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline' ||
          !state.md.linkify.pretest(blockTokens[j].content)) {
        continue
      }

      let tokens = blockTokens[j].children;

      let htmlLinkLevel = 0;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (let i = tokens.length - 1; i >= 0; i--) {
        const currentToken = tokens[i];

        // Skip content of markdown links
        if (currentToken.type === 'link_close') {
          i--;
          while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
            i--;
          }
          continue
        }

        // Skip content of html tag links
        if (currentToken.type === 'html_inline') {
          if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) {
            htmlLinkLevel--;
          }
          if (isLinkClose$1(currentToken.content)) {
            htmlLinkLevel++;
          }
        }
        if (htmlLinkLevel > 0) { continue }

        if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {
          const text = currentToken.content;
          let links = state.md.linkify.match(text);

          // Now split string to nodes
          const nodes = [];
          let level = currentToken.level;
          let lastPos = 0;

          // forbid escape sequence at the start of the string,
          // this avoids http\://example.com/ from being linkified as
          // http:<a href="//example.com/">//example.com/</a>
          if (links.length > 0 &&
              links[0].index === 0 &&
              i > 0 &&
              tokens[i - 1].type === 'text_special') {
            links = links.slice(1);
          }

          for (let ln = 0; ln < links.length; ln++) {
            const url = links[ln].url;
            const fullUrl = state.md.normalizeLink(url);
            if (!state.md.validateLink(fullUrl)) { continue }

            let urlText = links[ln].text;

            // Linkifier might send raw hostnames like "example.com", where url
            // starts with domain name. So we prepend http:// in those cases,
            // and remove it afterwards.
            //
            if (!links[ln].schema) {
              urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
            } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
              urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
            } else {
              urlText = state.md.normalizeLinkText(urlText);
            }

            const pos = links[ln].index;

            if (pos > lastPos) {
              const token   = new state.Token('text', '', 0);
              token.content = text.slice(lastPos, pos);
              token.level   = level;
              nodes.push(token);
            }

            const token_o   = new state.Token('link_open', 'a', 1);
            token_o.attrs   = [['href', fullUrl]];
            token_o.level   = level++;
            token_o.markup  = 'linkify';
            token_o.info    = 'auto';
            nodes.push(token_o);

            const token_t   = new state.Token('text', '', 0);
            token_t.content = urlText;
            token_t.level   = level;
            nodes.push(token_t);

            const token_c   = new state.Token('link_close', 'a', -1);
            token_c.level   = --level;
            token_c.markup  = 'linkify';
            token_c.info    = 'auto';
            nodes.push(token_c);

            lastPos = links[ln].lastIndex;
          }
          if (lastPos < text.length) {
            const token   = new state.Token('text', '', 0);
            token.content = text.slice(lastPos);
            token.level   = level;
            nodes.push(token);
          }

          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
        }
      }
    }
  }

  // Simple typographic replacements
  //
  // (c) (C) → ©
  // (tm) (TM) → ™
  // (r) (R) → ®
  // +- → ±
  // ... → … (also ?.... → ?.., !.... → !..)
  // ???????? → ???, !!!!! → !!!, `,,` → `,`
  // -- → &ndash;, --- → &mdash;
  //

  // TODO:
  // - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
  // - multiplications 2 x 4 -> 2 × 4

  const RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

  // Workaround for phantomjs - need regex without /g flag,
  // or root check will fail every second time
  const SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;

  const SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
  const SCOPED_ABBR = {
    c: '©',
    r: '®',
    tm: '™'
  };

  function replaceFn (match, name) {
    return SCOPED_ABBR[name.toLowerCase()]
  }

  function replace_scoped (inlineTokens) {
    let inside_autolink = 0;

    for (let i = inlineTokens.length - 1; i >= 0; i--) {
      const token = inlineTokens[i];

      if (token.type === 'text' && !inside_autolink) {
        token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
      }

      if (token.type === 'link_open' && token.info === 'auto') {
        inside_autolink--;
      }

      if (token.type === 'link_close' && token.info === 'auto') {
        inside_autolink++;
      }
    }
  }

  function replace_rare (inlineTokens) {
    let inside_autolink = 0;

    for (let i = inlineTokens.length - 1; i >= 0; i--) {
      const token = inlineTokens[i];

      if (token.type === 'text' && !inside_autolink) {
        if (RARE_RE.test(token.content)) {
          token.content = token.content
            .replace(/\+-/g, '±')
            // .., ..., ....... -> …
            // but ?..... & !..... -> ?.. & !..
            .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
            .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
            // em-dash
            .replace(/(^|[^-])---(?=[^-]|$)/mg, '$1\u2014')
            // en-dash
            .replace(/(^|\s)--(?=\s|$)/mg, '$1\u2013')
            .replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, '$1\u2013');
        }
      }

      if (token.type === 'link_open' && token.info === 'auto') {
        inside_autolink--;
      }

      if (token.type === 'link_close' && token.info === 'auto') {
        inside_autolink++;
      }
    }
  }

  function replace (state) {
    let blkIdx;

    if (!state.md.options.typographer) { return }

    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== 'inline') { continue }

      if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
        replace_scoped(state.tokens[blkIdx].children);
      }

      if (RARE_RE.test(state.tokens[blkIdx].content)) {
        replace_rare(state.tokens[blkIdx].children);
      }
    }
  }

  // Convert straight quotation marks to typographic ones
  //


  const QUOTE_TEST_RE = /['"]/;
  const QUOTE_RE = /['"]/g;
  const APOSTROPHE = '\u2019'; /* ’ */

  function replaceAt (str, index, ch) {
    return str.slice(0, index) + ch + str.slice(index + 1)
  }

  function process_inlines (tokens, state) {
    let j;

    const stack = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      const thisLevel = tokens[i].level;

      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) { break }
      }
      stack.length = j + 1;

      if (token.type !== 'text') { continue }

      let text = token.content;
      let pos = 0;
      let max = text.length;

      /* eslint no-labels:0,block-scoped-var:0 */
      OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        const t = QUOTE_RE.exec(text);
        if (!t) { break }

        let canOpen = true;
        let canClose = true;
        pos = t.index + 1;
        const isSingle = (t[0] === "'");

        // Find previous character,
        // default to space if it's the beginning of the line
        //
        let lastChar = 0x20;

        if (t.index - 1 >= 0) {
          lastChar = text.charCodeAt(t.index - 1);
        } else {
          for (j = i - 1; j >= 0; j--) {
            if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break // lastChar defaults to 0x20
            if (!tokens[j].content) continue // should skip all tokens except 'text', 'html_inline' or 'code_inline'

            lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
            break
          }
        }

        // Find next character,
        // default to space if it's the end of the line
        //
        let nextChar = 0x20;

        if (pos < max) {
          nextChar = text.charCodeAt(pos);
        } else {
          for (j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break // nextChar defaults to 0x20
            if (!tokens[j].content) continue // should skip all tokens except 'text', 'html_inline' or 'code_inline'

            nextChar = tokens[j].content.charCodeAt(0);
            break
          }
        }

        const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
        const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

        const isLastWhiteSpace = isWhiteSpace(lastChar);
        const isNextWhiteSpace = isWhiteSpace(nextChar);

        if (isNextWhiteSpace) {
          canOpen = false;
        } else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) {
            canOpen = false;
          }
        }

        if (isLastWhiteSpace) {
          canClose = false;
        } else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) {
            canClose = false;
          }
        }

        if (nextChar === 0x22 /* " */ && t[0] === '"') {
          if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
            // special case: 1"" - count first quote as an inch
            canClose = canOpen = false;
          }
        }

        if (canOpen && canClose) {
          // Replace quotes in the middle of punctuation sequence, but not
          // in the middle of the words, i.e.:
          //
          // 1. foo " bar " baz - not replaced
          // 2. foo-"-bar-"-baz - replaced
          // 3. foo"bar"baz     - not replaced
          //
          canOpen = isLastPunctChar;
          canClose = isNextPunctChar;
        }

        if (!canOpen && !canClose) {
          // middle of word
          if (isSingle) {
            token.content = replaceAt(token.content, t.index, APOSTROPHE);
          }
          continue
        }

        if (canClose) {
          // this could be a closing quote, rewind the stack to get a match
          for (j = stack.length - 1; j >= 0; j--) {
            let item = stack[j];
            if (stack[j].level < thisLevel) { break }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];

              let openQuote;
              let closeQuote;
              if (isSingle) {
                openQuote = state.md.options.quotes[2];
                closeQuote = state.md.options.quotes[3];
              } else {
                openQuote = state.md.options.quotes[0];
                closeQuote = state.md.options.quotes[1];
              }

              // replace token.content *before* tokens[item.token].content,
              // because, if they are pointing at the same token, replaceAt
              // could mess up indices when quote length != 1
              token.content = replaceAt(token.content, t.index, closeQuote);
              tokens[item.token].content = replaceAt(
                tokens[item.token].content, item.pos, openQuote);

              pos += closeQuote.length - 1;
              if (item.token === i) { pos += openQuote.length - 1; }

              text = token.content;
              max = text.length;

              stack.length = j;
              continue OUTER
            }
          }
        }

        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
      }
    }
  }

  function smartquotes (state) {
    /* eslint max-depth:0 */
    if (!state.md.options.typographer) { return }

    for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== 'inline' ||
          !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
        continue
      }

      process_inlines(state.tokens[blkIdx].children, state);
    }
  }

  // Join raw text tokens with the rest of the text
  //
  // This is set as a separate rule to provide an opportunity for plugins
  // to run text replacements after text join, but before escape join.
  //
  // For example, `\:)` shouldn't be replaced with an emoji.
  //

  function text_join (state) {
    let curr, last;
    const blockTokens = state.tokens;
    const l = blockTokens.length;

    for (let j = 0; j < l; j++) {
      if (blockTokens[j].type !== 'inline') continue

      const tokens = blockTokens[j].children;
      const max = tokens.length;

      for (curr = 0; curr < max; curr++) {
        if (tokens[curr].type === 'text_special') {
          tokens[curr].type = 'text';
        }
      }

      for (curr = last = 0; curr < max; curr++) {
        if (tokens[curr].type === 'text' &&
            curr + 1 < max &&
            tokens[curr + 1].type === 'text') {
          // collapse two adjacent text nodes
          tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
        } else {
          if (curr !== last) { tokens[last] = tokens[curr]; }

          last++;
        }
      }

      if (curr !== last) {
        tokens.length = last;
      }
    }
  }

  /** internal
   * class Core
   *
   * Top-level rules executor. Glues block/inline parsers and does intermediate
   * transformations.
   **/


  const _rules$2 = [
    ['normalize',      normalize],
    ['block',          block],
    ['inline',         inline],
    ['linkify',        linkify$1],
    ['replacements',   replace],
    ['smartquotes',    smartquotes],
    // `text_join` finds `text_special` tokens (for escape sequences)
    // and joins them with the rest of the text
    ['text_join',      text_join]
  ];

  /**
   * new Core()
   **/
  function Core () {
    /**
     * Core#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of core rules.
     **/
    this.ruler = new Ruler();

    for (let i = 0; i < _rules$2.length; i++) {
      this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
    }
  }

  /**
   * Core.process(state)
   *
   * Executes core chain rules.
   **/
  Core.prototype.process = function (state) {
    const rules = this.ruler.getRules('');

    for (let i = 0, l = rules.length; i < l; i++) {
      rules[i](state);
    }
  };

  Core.prototype.State = StateCore;

  // Parser state class


  function StateBlock (src, md, env, tokens) {
    this.src = src;

    // link to parser instance
    this.md     = md;

    this.env = env;

    //
    // Internal state vartiables
    //

    this.tokens = tokens;

    this.bMarks = [];  // line begin offsets for fast jumps
    this.eMarks = [];  // line end offsets for fast jumps
    this.tShift = [];  // offsets of the first non-space characters (tabs not expanded)
    this.sCount = [];  // indents for each line (tabs expanded)

    // An amount of virtual spaces (tabs expanded) between beginning
    // of each line (bMarks) and real beginning of that line.
    //
    // It exists only as a hack because blockquotes override bMarks
    // losing information in the process.
    //
    // It's used only when expanding tabs, you can think about it as
    // an initial tab length, e.g. bsCount=21 applied to string `\t123`
    // means first tab should be expanded to 4-21%4 === 3 spaces.
    //
    this.bsCount = [];

    // block parser variables

    // required block content indent (for example, if we are
    // inside a list, it would be positioned after list marker)
    this.blkIndent  = 0;
    this.line       = 0; // line index in src
    this.lineMax    = 0; // lines count
    this.tight      = false;  // loose/tight mode for lists
    this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)
    this.listIndent = -1; // indent of the current list block (-1 if there isn't any)

    // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
    // used in lists to determine if they interrupt a paragraph
    this.parentType = 'root';

    this.level = 0;

    // Create caches
    // Generate markers.
    const s = this.src;

    for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
      const ch = s.charCodeAt(pos);

      if (!indent_found) {
        if (isSpace(ch)) {
          indent++;

          if (ch === 0x09) {
            offset += 4 - offset % 4;
          } else {
            offset++;
          }
          continue
        } else {
          indent_found = true;
        }
      }

      if (ch === 0x0A || pos === len - 1) {
        if (ch !== 0x0A) { pos++; }
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);

        indent_found = false;
        indent = 0;
        offset = 0;
        start = pos + 1;
      }
    }

    // Push fake entry to simplify cache bounds checks
    this.bMarks.push(s.length);
    this.eMarks.push(s.length);
    this.tShift.push(0);
    this.sCount.push(0);
    this.bsCount.push(0);

    this.lineMax = this.bMarks.length - 1; // don't count last fake line
  }

  // Push new token to "stream".
  //
  StateBlock.prototype.push = function (type, tag, nesting) {
    const token = new Token(type, tag, nesting);
    token.block = true;

    if (nesting < 0) this.level--; // closing tag
    token.level = this.level;
    if (nesting > 0) this.level++; // opening tag

    this.tokens.push(token);
    return token
  };

  StateBlock.prototype.isEmpty = function isEmpty (line) {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line]
  };

  StateBlock.prototype.skipEmptyLines = function skipEmptyLines (from) {
    for (let max = this.lineMax; from < max; from++) {
      if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
        break
      }
    }
    return from
  };

  // Skip spaces from given position.
  StateBlock.prototype.skipSpaces = function skipSpaces (pos) {
    for (let max = this.src.length; pos < max; pos++) {
      const ch = this.src.charCodeAt(pos);
      if (!isSpace(ch)) { break }
    }
    return pos
  };

  // Skip spaces from given position in reverse.
  StateBlock.prototype.skipSpacesBack = function skipSpacesBack (pos, min) {
    if (pos <= min) { return pos }

    while (pos > min) {
      if (!isSpace(this.src.charCodeAt(--pos))) { return pos + 1 }
    }
    return pos
  };

  // Skip char codes from given position
  StateBlock.prototype.skipChars = function skipChars (pos, code) {
    for (let max = this.src.length; pos < max; pos++) {
      if (this.src.charCodeAt(pos) !== code) { break }
    }
    return pos
  };

  // Skip char codes reverse from given position - 1
  StateBlock.prototype.skipCharsBack = function skipCharsBack (pos, code, min) {
    if (pos <= min) { return pos }

    while (pos > min) {
      if (code !== this.src.charCodeAt(--pos)) { return pos + 1 }
    }
    return pos
  };

  // cut lines range from source.
  StateBlock.prototype.getLines = function getLines (begin, end, indent, keepLastLF) {
    if (begin >= end) {
      return ''
    }

    const queue = new Array(end - begin);

    for (let i = 0, line = begin; line < end; line++, i++) {
      let lineIndent = 0;
      const lineStart = this.bMarks[line];
      let first = lineStart;
      let last;

      if (line + 1 < end || keepLastLF) {
        // No need for bounds check because we have fake entry on tail.
        last = this.eMarks[line] + 1;
      } else {
        last = this.eMarks[line];
      }

      while (first < last && lineIndent < indent) {
        const ch = this.src.charCodeAt(first);

        if (isSpace(ch)) {
          if (ch === 0x09) {
            lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
          } else {
            lineIndent++;
          }
        } else if (first - lineStart < this.tShift[line]) {
          // patched tShift masked characters to look like spaces (blockquotes, list markers)
          lineIndent++;
        } else {
          break
        }

        first++;
      }

      if (lineIndent > indent) {
        // partially expanding tabs in code blocks, e.g '\t\tfoobar'
        // with indent=2 becomes '  \tfoobar'
        queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
      } else {
        queue[i] = this.src.slice(first, last);
      }
    }

    return queue.join('')
  };

  // re-export Token class to use in block rules
  StateBlock.prototype.Token = Token;

  // GFM table, https://github.github.com/gfm/#tables-extension-


  // Limit the amount of empty autocompleted cells in a table,
  // see https://github.com/markdown-it/markdown-it/issues/1000,
  //
  // Both pulldown-cmark and commonmark-hs limit the number of cells this way to ~200k.
  // We set it to 65k, which can expand user input by a factor of x370
  // (256x256 square is 1.8kB expanded into 650kB).
  const MAX_AUTOCOMPLETED_CELLS = 0x10000;

  function getLine (state, line) {
    const pos = state.bMarks[line] + state.tShift[line];
    const max = state.eMarks[line];

    return state.src.slice(pos, max)
  }

  function escapedSplit (str) {
    const result = [];
    const max = str.length;

    let pos = 0;
    let ch = str.charCodeAt(pos);
    let isEscaped = false;
    let lastPos = 0;
    let current = '';

    while (pos < max) {
      if (ch === 0x7c/* | */) {
        if (!isEscaped) {
          // pipe separating cells, '|'
          result.push(current + str.substring(lastPos, pos));
          current = '';
          lastPos = pos + 1;
        } else {
          // escaped pipe, '\|'
          current += str.substring(lastPos, pos - 1);
          lastPos = pos;
        }
      }

      isEscaped = (ch === 0x5c/* \ */);
      pos++;

      ch = str.charCodeAt(pos);
    }

    result.push(current + str.substring(lastPos));

    return result
  }

  function table (state, startLine, endLine, silent) {
    // should have at least two lines
    if (startLine + 2 > endLine) { return false }

    let nextLine = startLine + 1;

    if (state.sCount[nextLine] < state.blkIndent) { return false }

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[nextLine] - state.blkIndent >= 4) { return false }

    // first character of the second line should be '|', '-', ':',
    // and no other characters are allowed but spaces;
    // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp

    let pos = state.bMarks[nextLine] + state.tShift[nextLine];
    if (pos >= state.eMarks[nextLine]) { return false }

    const firstCh = state.src.charCodeAt(pos++);
    if (firstCh !== 0x7C/* | */ && firstCh !== 0x2D/* - */ && firstCh !== 0x3A/* : */) { return false }

    if (pos >= state.eMarks[nextLine]) { return false }

    const secondCh = state.src.charCodeAt(pos++);
    if (secondCh !== 0x7C/* | */ && secondCh !== 0x2D/* - */ && secondCh !== 0x3A/* : */ && !isSpace(secondCh)) {
      return false
    }

    // if first character is '-', then second character must not be a space
    // (due to parsing ambiguity with list)
    if (firstCh === 0x2D/* - */ && isSpace(secondCh)) { return false }

    while (pos < state.eMarks[nextLine]) {
      const ch = state.src.charCodeAt(pos);

      if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */ && !isSpace(ch)) { return false }

      pos++;
    }

    let lineText = getLine(state, startLine + 1);
    let columns = lineText.split('|');
    const aligns = [];
    for (let i = 0; i < columns.length; i++) {
      const t = columns[i].trim();
      if (!t) {
        // allow empty columns before and after table, but not in between columns;
        // e.g. allow ` |---| `, disallow ` ---||--- `
        if (i === 0 || i === columns.length - 1) {
          continue
        } else {
          return false
        }
      }

      if (!/^:?-+:?$/.test(t)) { return false }
      if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
        aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
      } else if (t.charCodeAt(0) === 0x3A/* : */) {
        aligns.push('left');
      } else {
        aligns.push('');
      }
    }

    lineText = getLine(state, startLine).trim();
    if (lineText.indexOf('|') === -1) { return false }
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === '') columns.shift();
    if (columns.length && columns[columns.length - 1] === '') columns.pop();

    // header row will define an amount of columns in the entire table,
    // and align row should be exactly the same (the rest of the rows can differ)
    const columnCount = columns.length;
    if (columnCount === 0 || columnCount !== aligns.length) { return false }

    if (silent) { return true }

    const oldParentType = state.parentType;
    state.parentType = 'table';

    // use 'blockquote' lists for termination because it's
    // the most similar to tables
    const terminatorRules = state.md.block.ruler.getRules('blockquote');

    const token_to = state.push('table_open', 'table', 1);
    const tableLines = [startLine, 0];
    token_to.map = tableLines;

    const token_tho = state.push('thead_open', 'thead', 1);
    token_tho.map = [startLine, startLine + 1];

    const token_htro = state.push('tr_open', 'tr', 1);
    token_htro.map = [startLine, startLine + 1];

    for (let i = 0; i < columns.length; i++) {
      const token_ho = state.push('th_open', 'th', 1);
      if (aligns[i]) {
        token_ho.attrs  = [['style', 'text-align:' + aligns[i]]];
      }

      const token_il = state.push('inline', '', 0);
      token_il.content  = columns[i].trim();
      token_il.children = [];

      state.push('th_close', 'th', -1);
    }

    state.push('tr_close', 'tr', -1);
    state.push('thead_close', 'thead', -1);

    let tbodyLines;
    let autocompletedCells = 0;

    for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) { break }

      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break
        }
      }

      if (terminate) { break }
      lineText = getLine(state, nextLine).trim();
      if (!lineText) { break }
      if (state.sCount[nextLine] - state.blkIndent >= 4) { break }
      columns = escapedSplit(lineText);
      if (columns.length && columns[0] === '') columns.shift();
      if (columns.length && columns[columns.length - 1] === '') columns.pop();

      // note: autocomplete count can be negative if user specifies more columns than header,
      // but that does not affect intended use (which is limiting expansion)
      autocompletedCells += columnCount - columns.length;
      if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) { break }

      if (nextLine === startLine + 2) {
        const token_tbo = state.push('tbody_open', 'tbody', 1);
        token_tbo.map = tbodyLines = [startLine + 2, 0];
      }

      const token_tro = state.push('tr_open', 'tr', 1);
      token_tro.map = [nextLine, nextLine + 1];

      for (let i = 0; i < columnCount; i++) {
        const token_tdo = state.push('td_open', 'td', 1);
        if (aligns[i]) {
          token_tdo.attrs  = [['style', 'text-align:' + aligns[i]]];
        }

        const token_il = state.push('inline', '', 0);
        token_il.content  = columns[i] ? columns[i].trim() : '';
        token_il.children = [];

        state.push('td_close', 'td', -1);
      }
      state.push('tr_close', 'tr', -1);
    }

    if (tbodyLines) {
      state.push('tbody_close', 'tbody', -1);
      tbodyLines[1] = nextLine;
    }

    state.push('table_close', 'table', -1);
    tableLines[1] = nextLine;

    state.parentType = oldParentType;
    state.line = nextLine;
    return true
  }

  // Code block (4 spaces padded)

  function code (state, startLine, endLine/*, silent */) {
    if (state.sCount[startLine] - state.blkIndent < 4) { return false }

    let nextLine = startLine + 1;
    let last = nextLine;

    while (nextLine < endLine) {
      if (state.isEmpty(nextLine)) {
        nextLine++;
        continue
      }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        nextLine++;
        last = nextLine;
        continue
      }
      break
    }

    state.line = last;

    const token   = state.push('code_block', 'code', 0);
    token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + '\n';
    token.map     = [startLine, state.line];

    return true
  }

  // fences (``` lang, ~~~ lang)

  function fence (state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    if (pos + 3 > max) { return false }

    const marker = state.src.charCodeAt(pos);

    if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
      return false
    }

    // scan marker length
    let mem = pos;
    pos = state.skipChars(pos, marker);

    let len = pos - mem;

    if (len < 3) { return false }

    const markup = state.src.slice(mem, pos);
    const params = state.src.slice(pos, max);

    if (marker === 0x60 /* ` */) {
      if (params.indexOf(String.fromCharCode(marker)) >= 0) {
        return false
      }
    }

    // Since start is found, we can report success here in validation mode
    if (silent) { return true }

    // search end of block
    let nextLine = startLine;
    let haveEndMarker = false;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break
      }

      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break
      }

      if (state.src.charCodeAt(pos) !== marker) { continue }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue
      }

      pos = state.skipChars(pos, marker);

      // closing code fence must be at least as long as the opening one
      if (pos - mem < len) { continue }

      // make sure tail has spaces only
      pos = state.skipSpaces(pos);

      if (pos < max) { continue }

      haveEndMarker = true;
      // found!
      break
    }

    // If a fence has heading spaces, they should be removed from its inner block
    len = state.sCount[startLine];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    const token   = state.push('fence', 'code', 0);
    token.info    = params;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup  = markup;
    token.map     = [startLine, state.line];

    return true
  }

  // Block quotes


  function blockquote (state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    const oldLineMax = state.lineMax;

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    // check the block quote marker
    if (state.src.charCodeAt(pos) !== 0x3E/* > */) { return false }

    // we know that it's going to be a valid blockquote,
    // so no point trying to find the end of it in silent mode
    if (silent) { return true }

    const oldBMarks  = [];
    const oldBSCount = [];
    const oldSCount  = [];
    const oldTShift  = [];

    const terminatorRules = state.md.block.ruler.getRules('blockquote');

    const oldParentType = state.parentType;
    state.parentType = 'blockquote';
    let lastLineEmpty = false;
    let nextLine;

    // Search the end of the block
    //
    // Block ends with either:
    //  1. an empty line outside:
    //     ```
    //     > test
    //
    //     ```
    //  2. an empty line inside:
    //     ```
    //     >
    //     test
    //     ```
    //  3. another tag:
    //     ```
    //     > test
    //      - - -
    //     ```
    for (nextLine = startLine; nextLine < endLine; nextLine++) {
      // check if it's outdented, i.e. it's inside list item and indented
      // less than said list item:
      //
      // ```
      // 1. anything
      //    > current blockquote
      // 2. checking this line
      // ```
      const isOutdented = state.sCount[nextLine] < state.blkIndent;

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos >= max) {
        // Case 1: line is not inside the blockquote, and this line is empty.
        break
      }

      if (state.src.charCodeAt(pos++) === 0x3E/* > */ && !isOutdented) {
        // This line is inside the blockquote.

        // set offset past spaces and ">"
        let initial = state.sCount[nextLine] + 1;
        let spaceAfterMarker;
        let adjustTab;

        // skip one optional space after '>'
        if (state.src.charCodeAt(pos) === 0x20 /* space */) {
          // ' >   test '
          //     ^ -- position start of line here:
          pos++;
          initial++;
          adjustTab = false;
          spaceAfterMarker = true;
        } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
          spaceAfterMarker = true;

          if ((state.bsCount[nextLine] + initial) % 4 === 3) {
            // '  >\t  test '
            //       ^ -- position start of line here (tab has width===1)
            pos++;
            initial++;
            adjustTab = false;
          } else {
            // ' >\t  test '
            //    ^ -- position start of line here + shift bsCount slightly
            //         to make extra space appear
            adjustTab = true;
          }
        } else {
          spaceAfterMarker = false;
        }

        let offset = initial;
        oldBMarks.push(state.bMarks[nextLine]);
        state.bMarks[nextLine] = pos;

        while (pos < max) {
          const ch = state.src.charCodeAt(pos);

          if (isSpace(ch)) {
            if (ch === 0x09) {
              offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
            } else {
              offset++;
            }
          } else {
            break
          }

          pos++;
        }

        lastLineEmpty = pos >= max;

        oldBSCount.push(state.bsCount[nextLine]);
        state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);

        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] = offset - initial;

        oldTShift.push(state.tShift[nextLine]);
        state.tShift[nextLine] = pos - state.bMarks[nextLine];
        continue
      }

      // Case 2: line is not inside the blockquote, and the last line was empty.
      if (lastLineEmpty) { break }

      // Case 3: another tag found.
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break
        }
      }

      if (terminate) {
        // Quirk to enforce "hard termination mode" for paragraphs;
        // normally if you call `tokenize(state, startLine, nextLine)`,
        // paragraphs will look below nextLine for paragraph continuation,
        // but if blockquote is terminated by another tag, they shouldn't
        state.lineMax = nextLine;

        if (state.blkIndent !== 0) {
          // state.blkIndent was non-zero, we now set it to zero,
          // so we need to re-calculate all offsets to appear as
          // if indent wasn't changed
          oldBMarks.push(state.bMarks[nextLine]);
          oldBSCount.push(state.bsCount[nextLine]);
          oldTShift.push(state.tShift[nextLine]);
          oldSCount.push(state.sCount[nextLine]);
          state.sCount[nextLine] -= state.blkIndent;
        }

        break
      }

      oldBMarks.push(state.bMarks[nextLine]);
      oldBSCount.push(state.bsCount[nextLine]);
      oldTShift.push(state.tShift[nextLine]);
      oldSCount.push(state.sCount[nextLine]);

      // A negative indentation means that this is a paragraph continuation
      //
      state.sCount[nextLine] = -1;
    }

    const oldIndent = state.blkIndent;
    state.blkIndent = 0;

    const token_o  = state.push('blockquote_open', 'blockquote', 1);
    token_o.markup = '>';
    const lines = [startLine, 0];
    token_o.map    = lines;

    state.md.block.tokenize(state, startLine, nextLine);

    const token_c  = state.push('blockquote_close', 'blockquote', -1);
    token_c.markup = '>';

    state.lineMax = oldLineMax;
    state.parentType = oldParentType;
    lines[1] = state.line;

    // Restore original tShift; this might not be necessary since the parser
    // has already been here, but just to make sure we can do that.
    for (let i = 0; i < oldTShift.length; i++) {
      state.bMarks[i + startLine] = oldBMarks[i];
      state.tShift[i + startLine] = oldTShift[i];
      state.sCount[i + startLine] = oldSCount[i];
      state.bsCount[i + startLine] = oldBSCount[i];
    }
    state.blkIndent = oldIndent;

    return true
  }

  // Horizontal rule


  function hr (state, startLine, endLine, silent) {
    const max = state.eMarks[startLine];
    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const marker = state.src.charCodeAt(pos++);

    // Check hr marker
    if (marker !== 0x2A/* * */ &&
        marker !== 0x2D/* - */ &&
        marker !== 0x5F/* _ */) {
      return false
    }

    // markers can be mixed with spaces, but there should be at least 3 of them

    let cnt = 1;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos++);
      if (ch !== marker && !isSpace(ch)) { return false }
      if (ch === marker) { cnt++; }
    }

    if (cnt < 3) { return false }

    if (silent) { return true }

    state.line = startLine + 1;

    const token  = state.push('hr', 'hr', 0);
    token.map    = [startLine, state.line];
    token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

    return true
  }

  // Lists


  // Search `[-+*][\n ]`, returns next pos after marker on success
  // or -1 on fail.
  function skipBulletListMarker (state, startLine) {
    const max = state.eMarks[startLine];
    let pos = state.bMarks[startLine] + state.tShift[startLine];

    const marker = state.src.charCodeAt(pos++);
    // Check bullet
    if (marker !== 0x2A/* * */ &&
        marker !== 0x2D/* - */ &&
        marker !== 0x2B/* + */) {
      return -1
    }

    if (pos < max) {
      const ch = state.src.charCodeAt(pos);

      if (!isSpace(ch)) {
        // " -test " - is not a list item
        return -1
      }
    }

    return pos
  }

  // Search `\d+[.)][\n ]`, returns next pos after marker on success
  // or -1 on fail.
  function skipOrderedListMarker (state, startLine) {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    let pos = start;

    // List marker should have at least 2 chars (digit + dot)
    if (pos + 1 >= max) { return -1 }

    let ch = state.src.charCodeAt(pos++);

    if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1 }

    for (;;) {
      // EOL -> fail
      if (pos >= max) { return -1 }

      ch = state.src.charCodeAt(pos++);

      if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {
        // List marker should have no more than 9 digits
        // (prevents integer overflow in browsers)
        if (pos - start >= 10) { return -1 }

        continue
      }

      // found valid marker
      if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
        break
      }

      return -1
    }

    if (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (!isSpace(ch)) {
        // " 1.test " - is not a list item
        return -1
      }
    }
    return pos
  }

  function markTightParagraphs (state, idx) {
    const level = state.level + 2;

    for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
      if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
        state.tokens[i + 2].hidden = true;
        state.tokens[i].hidden = true;
        i += 2;
      }
    }
  }

  function list (state, startLine, endLine, silent) {
    let max, pos, start, token;
    let nextLine = startLine;
    let tight = true;

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[nextLine] - state.blkIndent >= 4) { return false }

    // Special case:
    //  - item 1
    //   - item 2
    //    - item 3
    //     - item 4
    //      - this one is a paragraph continuation
    if (state.listIndent >= 0 &&
        state.sCount[nextLine] - state.listIndent >= 4 &&
        state.sCount[nextLine] < state.blkIndent) {
      return false
    }

    let isTerminatingParagraph = false;

    // limit conditions when list can interrupt
    // a paragraph (validation mode only)
    if (silent && state.parentType === 'paragraph') {
      // Next list item should still terminate previous list item;
      //
      // This code can fail if plugins use blkIndent as well as lists,
      // but I hope the spec gets fixed long before that happens.
      //
      if (state.sCount[nextLine] >= state.blkIndent) {
        isTerminatingParagraph = true;
      }
    }

    // Detect list type and position after marker
    let isOrdered;
    let markerValue;
    let posAfterMarker;
    if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
      isOrdered = true;
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      markerValue = Number(state.src.slice(start, posAfterMarker - 1));

      // If we're starting a new ordered list right after
      // a paragraph, it should start with 1.
      if (isTerminatingParagraph && markerValue !== 1) return false
    } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
      isOrdered = false;
    } else {
      return false
    }

    // If we're starting a new unordered list right after
    // a paragraph, first line should not be empty.
    if (isTerminatingParagraph) {
      if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false
    }

    // For validation mode we can terminate immediately
    if (silent) { return true }

    // We should terminate list on style change. Remember first one to compare.
    const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

    // Start list
    const listTokIdx = state.tokens.length;

    if (isOrdered) {
      token       = state.push('ordered_list_open', 'ol', 1);
      if (markerValue !== 1) {
        token.attrs = [['start', markerValue]];
      }
    } else {
      token       = state.push('bullet_list_open', 'ul', 1);
    }

    const listLines = [nextLine, 0];
    token.map    = listLines;
    token.markup = String.fromCharCode(markerCharCode);

    //
    // Iterate list items
    //

    let prevEmptyEnd = false;
    const terminatorRules = state.md.block.ruler.getRules('list');

    const oldParentType = state.parentType;
    state.parentType = 'list';

    while (nextLine < endLine) {
      pos = posAfterMarker;
      max = state.eMarks[nextLine];

      const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
      let offset = initial;

      while (pos < max) {
        const ch = state.src.charCodeAt(pos);

        if (ch === 0x09) {
          offset += 4 - (offset + state.bsCount[nextLine]) % 4;
        } else if (ch === 0x20) {
          offset++;
        } else {
          break
        }

        pos++;
      }

      const contentStart = pos;
      let indentAfterMarker;

      if (contentStart >= max) {
        // trimming space in "-    \n  3" case, indent is 1 here
        indentAfterMarker = 1;
      } else {
        indentAfterMarker = offset - initial;
      }

      // If we have more than 4 spaces, the indent is 1
      // (the rest is just indented code block)
      if (indentAfterMarker > 4) { indentAfterMarker = 1; }

      // "  -  test"
      //  ^^^^^ - calculating total length of this thing
      const indent = initial + indentAfterMarker;

      // Run subparser & write tokens
      token        = state.push('list_item_open', 'li', 1);
      token.markup = String.fromCharCode(markerCharCode);
      const itemLines = [nextLine, 0];
      token.map    = itemLines;
      if (isOrdered) {
        token.info = state.src.slice(start, posAfterMarker - 1);
      }

      // change current state, then restore it after parser subcall
      const oldTight = state.tight;
      const oldTShift = state.tShift[nextLine];
      const oldSCount = state.sCount[nextLine];

      //  - example list
      // ^ listIndent position will be here
      //   ^ blkIndent position will be here
      //
      const oldListIndent = state.listIndent;
      state.listIndent = state.blkIndent;
      state.blkIndent = indent;

      state.tight = true;
      state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
      state.sCount[nextLine] = offset;

      if (contentStart >= max && state.isEmpty(nextLine + 1)) {
        // workaround for this case
        // (list item is empty, list terminates before "foo"):
        // ~~~~~~~~
        //   -
        //
        //     foo
        // ~~~~~~~~
        state.line = Math.min(state.line + 2, endLine);
      } else {
        state.md.block.tokenize(state, nextLine, endLine, true);
      }

      // If any of list item is tight, mark list as tight
      if (!state.tight || prevEmptyEnd) {
        tight = false;
      }
      // Item become loose if finish with empty line,
      // but we should filter last element, because it means list finish
      prevEmptyEnd = (state.line - nextLine) > 1 && state.isEmpty(state.line - 1);

      state.blkIndent = state.listIndent;
      state.listIndent = oldListIndent;
      state.tShift[nextLine] = oldTShift;
      state.sCount[nextLine] = oldSCount;
      state.tight = oldTight;

      token        = state.push('list_item_close', 'li', -1);
      token.markup = String.fromCharCode(markerCharCode);

      nextLine = state.line;
      itemLines[1] = nextLine;

      if (nextLine >= endLine) { break }

      //
      // Try to check if list is terminated or continued.
      //
      if (state.sCount[nextLine] < state.blkIndent) { break }

      // if it's indented more than 3 spaces, it should be a code block
      if (state.sCount[nextLine] - state.blkIndent >= 4) { break }

      // fail if terminating block found
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break
        }
      }
      if (terminate) { break }

      // fail if list has another type
      if (isOrdered) {
        posAfterMarker = skipOrderedListMarker(state, nextLine);
        if (posAfterMarker < 0) { break }
        start = state.bMarks[nextLine] + state.tShift[nextLine];
      } else {
        posAfterMarker = skipBulletListMarker(state, nextLine);
        if (posAfterMarker < 0) { break }
      }

      if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break }
    }

    // Finalize list
    if (isOrdered) {
      token = state.push('ordered_list_close', 'ol', -1);
    } else {
      token = state.push('bullet_list_close', 'ul', -1);
    }
    token.markup = String.fromCharCode(markerCharCode);

    listLines[1] = nextLine;
    state.line = nextLine;

    state.parentType = oldParentType;

    // mark paragraphs tight if needed
    if (tight) {
      markTightParagraphs(state, listTokIdx);
    }

    return true
  }

  function reference (state, startLine, _endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    let nextLine = startLine + 1;

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false }

    function getNextLine (nextLine) {
      const endLine = state.lineMax;

      if (nextLine >= endLine || state.isEmpty(nextLine)) {
        // empty line or end of input
        return null
      }

      let isContinuation = false;

      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) { isContinuation = true; }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) { isContinuation = true; }

      if (!isContinuation) {
        const terminatorRules = state.md.block.ruler.getRules('reference');
        const oldParentType = state.parentType;
        state.parentType = 'reference';

        // Some tags can terminate paragraph without empty line.
        let terminate = false;
        for (let i = 0, l = terminatorRules.length; i < l; i++) {
          if (terminatorRules[i](state, nextLine, endLine, true)) {
            terminate = true;
            break
          }
        }

        state.parentType = oldParentType;
        if (terminate) {
          // terminated by another block
          return null
        }
      }

      const pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];

      // max + 1 explicitly includes the newline
      return state.src.slice(pos, max + 1)
    }

    let str = state.src.slice(pos, max + 1);

    max = str.length;
    let labelEnd = -1;

    for (pos = 1; pos < max; pos++) {
      const ch = str.charCodeAt(pos);
      if (ch === 0x5B /* [ */) {
        return false
      } else if (ch === 0x5D /* ] */) {
        labelEnd = pos;
        break
      } else if (ch === 0x0A /* \n */) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      } else if (ch === 0x5C /* \ */) {
        pos++;
        if (pos < max && str.charCodeAt(pos) === 0x0A) {
          const lineContent = getNextLine(nextLine);
          if (lineContent !== null) {
            str += lineContent;
            max = str.length;
            nextLine++;
          }
        }
      }
    }

    if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false }

    // [label]:   destination   'title'
    //         ^^^ skip optional whitespace here
    for (pos = labelEnd + 2; pos < max; pos++) {
      const ch = str.charCodeAt(pos);
      if (ch === 0x0A) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      } else if (isSpace(ch)) ; else {
        break
      }
    }

    // [label]:   destination   'title'
    //            ^^^^^^^^^^^ parse this
    const destRes = state.md.helpers.parseLinkDestination(str, pos, max);
    if (!destRes.ok) { return false }

    const href = state.md.normalizeLink(destRes.str);
    if (!state.md.validateLink(href)) { return false }

    pos = destRes.pos;

    // save cursor state, we could require to rollback later
    const destEndPos = pos;
    const destEndLineNo = nextLine;

    // [label]:   destination   'title'
    //                       ^^^ skipping those spaces
    const start = pos;
    for (; pos < max; pos++) {
      const ch = str.charCodeAt(pos);
      if (ch === 0x0A) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      } else if (isSpace(ch)) ; else {
        break
      }
    }

    // [label]:   destination   'title'
    //                          ^^^^^^^ parse this
    let titleRes = state.md.helpers.parseLinkTitle(str, pos, max);
    while (titleRes.can_continue) {
      const lineContent = getNextLine(nextLine);
      if (lineContent === null) break
      str += lineContent;
      pos = max;
      max = str.length;
      nextLine++;
      titleRes = state.md.helpers.parseLinkTitle(str, pos, max, titleRes);
    }
    let title;

    if (pos < max && start !== pos && titleRes.ok) {
      title = titleRes.str;
      pos = titleRes.pos;
    } else {
      title = '';
      pos = destEndPos;
      nextLine = destEndLineNo;
    }

    // skip trailing spaces until the rest of the line
    while (pos < max) {
      const ch = str.charCodeAt(pos);
      if (!isSpace(ch)) { break }
      pos++;
    }

    if (pos < max && str.charCodeAt(pos) !== 0x0A) {
      if (title) {
        // garbage at the end of the line after title,
        // but it could still be a valid reference if we roll back
        title = '';
        pos = destEndPos;
        nextLine = destEndLineNo;
        while (pos < max) {
          const ch = str.charCodeAt(pos);
          if (!isSpace(ch)) { break }
          pos++;
        }
      }
    }

    if (pos < max && str.charCodeAt(pos) !== 0x0A) {
      // garbage at the end of the line
      return false
    }

    const label = normalizeReference(str.slice(1, labelEnd));
    if (!label) {
      // CommonMark 0.20 disallows empty labels
      return false
    }

    // Reference can not terminate anything. This check is for safety only.
    /* istanbul ignore if */
    if (silent) { return true }

    if (typeof state.env.references === 'undefined') {
      state.env.references = {};
    }
    if (typeof state.env.references[label] === 'undefined') {
      state.env.references[label] = { title, href };
    }

    state.line = nextLine;
    return true
  }

  // List of valid html blocks names, according to commonmark spec
  // https://spec.commonmark.org/0.30/#html-blocks

  var block_names = [
    'address',
    'article',
    'aside',
    'base',
    'basefont',
    'blockquote',
    'body',
    'caption',
    'center',
    'col',
    'colgroup',
    'dd',
    'details',
    'dialog',
    'dir',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'frame',
    'frameset',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'html',
    'iframe',
    'legend',
    'li',
    'link',
    'main',
    'menu',
    'menuitem',
    'nav',
    'noframes',
    'ol',
    'optgroup',
    'option',
    'p',
    'param',
    'search',
    'section',
    'summary',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'title',
    'tr',
    'track',
    'ul'
  ];

  // Regexps to match html elements

  const attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

  const unquoted      = '[^"\'=<>`\\x00-\\x20]+';
  const single_quoted = "'[^']*'";
  const double_quoted = '"[^"]*"';

  const attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

  const attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

  const open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

  const close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
  const comment     = '<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->';
  const processing  = '<[?][\\s\\S]*?[?]>';
  const declaration = '<![A-Za-z][^>]*>';
  const cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

  const HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
                          '|' + processing + '|' + declaration + '|' + cdata + ')');
  const HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

  // HTML block


  // An array of opening and corresponding closing sequences for html tags,
  // last argument defines whether it can terminate a paragraph or not
  //
  const HTML_SEQUENCES = [
    [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true],
    [/^<!--/,        /-->/,   true],
    [/^<\?/,         /\?>/,   true],
    [/^<![A-Z]/,     />/,     true],
    [/^<!\[CDATA\[/, /\]\]>/, true],
    [new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true],
    [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'),  /^$/, false]
  ];

  function html_block (state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    if (!state.md.options.html) { return false }

    if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false }

    let lineText = state.src.slice(pos, max);

    let i = 0;
    for (; i < HTML_SEQUENCES.length; i++) {
      if (HTML_SEQUENCES[i][0].test(lineText)) { break }
    }
    if (i === HTML_SEQUENCES.length) { return false }

    if (silent) {
      // true if this sequence can be a terminator, false otherwise
      return HTML_SEQUENCES[i][2]
    }

    let nextLine = startLine + 1;

    // If we are here - we detected HTML block.
    // Let's roll down till block end.
    if (!HTML_SEQUENCES[i][1].test(lineText)) {
      for (; nextLine < endLine; nextLine++) {
        if (state.sCount[nextLine] < state.blkIndent) { break }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        lineText = state.src.slice(pos, max);

        if (HTML_SEQUENCES[i][1].test(lineText)) {
          if (lineText.length !== 0) { nextLine++; }
          break
        }
      }
    }

    state.line = nextLine;

    const token   = state.push('html_block', '', 0);
    token.map     = [startLine, nextLine];
    token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

    return true
  }

  // heading (#, ##, ...)


  function heading (state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    let ch  = state.src.charCodeAt(pos);

    if (ch !== 0x23/* # */ || pos >= max) { return false }

    // count heading level
    let level = 1;
    ch = state.src.charCodeAt(++pos);
    while (ch === 0x23/* # */ && pos < max && level <= 6) {
      level++;
      ch = state.src.charCodeAt(++pos);
    }

    if (level > 6 || (pos < max && !isSpace(ch))) { return false }

    if (silent) { return true }

    // Let's cut tails like '    ###  ' from the end of string

    max = state.skipSpacesBack(max, pos);
    const tmp = state.skipCharsBack(max, 0x23, pos); // #
    if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
      max = tmp;
    }

    state.line = startLine + 1;

    const token_o  = state.push('heading_open', 'h' + String(level), 1);
    token_o.markup = '########'.slice(0, level);
    token_o.map    = [startLine, state.line];

    const token_i    = state.push('inline', '', 0);
    token_i.content  = state.src.slice(pos, max).trim();
    token_i.map      = [startLine, state.line];
    token_i.children = [];

    const token_c  = state.push('heading_close', 'h' + String(level), -1);
    token_c.markup = '########'.slice(0, level);

    return true
  }

  // lheading (---, ===)

  function lheading (state, startLine, endLine/*, silent */) {
    const terminatorRules = state.md.block.ruler.getRules('paragraph');

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

    const oldParentType = state.parentType;
    state.parentType = 'paragraph'; // use paragraph to match terminatorRules

    // jump line-by-line until empty one or EOF
    let level = 0;
    let marker;
    let nextLine = startLine + 1;

    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) { continue }

      //
      // Check for underline in setext header
      //
      if (state.sCount[nextLine] >= state.blkIndent) {
        let pos = state.bMarks[nextLine] + state.tShift[nextLine];
        const max = state.eMarks[nextLine];

        if (pos < max) {
          marker = state.src.charCodeAt(pos);

          if (marker === 0x2D/* - */ || marker === 0x3D/* = */) {
            pos = state.skipChars(pos, marker);
            pos = state.skipSpaces(pos);

            if (pos >= max) {
              level = (marker === 0x3D/* = */ ? 1 : 2);
              break
            }
          }
        }
      }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) { continue }

      // Some tags can terminate paragraph without empty line.
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break
        }
      }
      if (terminate) { break }
    }

    if (!level) {
      // Didn't find valid underline
      return false
    }

    const content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

    state.line = nextLine + 1;

    const token_o    = state.push('heading_open', 'h' + String(level), 1);
    token_o.markup   = String.fromCharCode(marker);
    token_o.map      = [startLine, state.line];

    const token_i    = state.push('inline', '', 0);
    token_i.content  = content;
    token_i.map      = [startLine, state.line - 1];
    token_i.children = [];

    const token_c    = state.push('heading_close', 'h' + String(level), -1);
    token_c.markup   = String.fromCharCode(marker);

    state.parentType = oldParentType;

    return true
  }

  // Paragraph

  function paragraph (state, startLine, endLine) {
    const terminatorRules = state.md.block.ruler.getRules('paragraph');
    const oldParentType = state.parentType;
    let nextLine = startLine + 1;
    state.parentType = 'paragraph';

    // jump line-by-line until empty one or EOF
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) { continue }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) { continue }

      // Some tags can terminate paragraph without empty line.
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break
        }
      }
      if (terminate) { break }
    }

    const content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

    state.line = nextLine;

    const token_o    = state.push('paragraph_open', 'p', 1);
    token_o.map      = [startLine, state.line];

    const token_i    = state.push('inline', '', 0);
    token_i.content  = content;
    token_i.map      = [startLine, state.line];
    token_i.children = [];

    state.push('paragraph_close', 'p', -1);

    state.parentType = oldParentType;

    return true
  }

  /** internal
   * class ParserBlock
   *
   * Block-level tokenizer.
   **/


  const _rules$1 = [
    // First 2 params - rule name & source. Secondary array - list of rules,
    // which can be terminated by this one.
    ['table',      table,      ['paragraph', 'reference']],
    ['code',       code],
    ['fence',      fence,      ['paragraph', 'reference', 'blockquote', 'list']],
    ['blockquote', blockquote, ['paragraph', 'reference', 'blockquote', 'list']],
    ['hr',         hr,         ['paragraph', 'reference', 'blockquote', 'list']],
    ['list',       list,       ['paragraph', 'reference', 'blockquote']],
    ['reference',  reference],
    ['html_block', html_block, ['paragraph', 'reference', 'blockquote']],
    ['heading',    heading,    ['paragraph', 'reference', 'blockquote']],
    ['lheading',   lheading],
    ['paragraph',  paragraph]
  ];

  /**
   * new ParserBlock()
   **/
  function ParserBlock () {
    /**
     * ParserBlock#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of block rules.
     **/
    this.ruler = new Ruler();

    for (let i = 0; i < _rules$1.length; i++) {
      this.ruler.push(_rules$1[i][0], _rules$1[i][1], { alt: (_rules$1[i][2] || []).slice() });
    }
  }

  // Generate tokens for input range
  //
  ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
    const rules = this.ruler.getRules('');
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    let line = startLine;
    let hasEmptyLines = false;

    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) { break }

      // Termination condition for nested calls.
      // Nested calls currently used for blockquotes & lists
      if (state.sCount[line] < state.blkIndent) { break }

      // If nesting level exceeded - skip tail to the end. That's not ordinary
      // situation and we should not care about content.
      if (state.level >= maxNesting) {
        state.line = endLine;
        break
      }

      // Try all possible rules.
      // On success, rule should:
      //
      // - update `state.line`
      // - update `state.tokens`
      // - return true
      const prevLine = state.line;
      let ok = false;

      for (let i = 0; i < len; i++) {
        ok = rules[i](state, line, endLine, false);
        if (ok) {
          if (prevLine >= state.line) {
            throw new Error("block rule didn't increment state.line")
          }
          break
        }
      }

      // this can only happen if user disables paragraph rule
      if (!ok) throw new Error('none of the block rules matched')

      // set state.tight if we had an empty line before current tag
      // i.e. latest empty line should not count
      state.tight = !hasEmptyLines;

      // paragraph might "eat" one newline after it in nested lists
      if (state.isEmpty(state.line - 1)) {
        hasEmptyLines = true;
      }

      line = state.line;

      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  };

  /**
   * ParserBlock.parse(str, md, env, outTokens)
   *
   * Process input string and push block tokens into `outTokens`
   **/
  ParserBlock.prototype.parse = function (src, md, env, outTokens) {
    if (!src) { return }

    const state = new this.State(src, md, env, outTokens);

    this.tokenize(state, state.line, state.lineMax);
  };

  ParserBlock.prototype.State = StateBlock;

  // Inline parser state


  function StateInline (src, md, env, outTokens) {
    this.src = src;
    this.env = env;
    this.md = md;
    this.tokens = outTokens;
    this.tokens_meta = Array(outTokens.length);

    this.pos = 0;
    this.posMax = this.src.length;
    this.level = 0;
    this.pending = '';
    this.pendingLevel = 0;

    // Stores { start: end } pairs. Useful for backtrack
    // optimization of pairs parse (emphasis, strikes).
    this.cache = {};

    // List of emphasis-like delimiters for current tag
    this.delimiters = [];

    // Stack of delimiter lists for upper level tags
    this._prev_delimiters = [];

    // backtick length => last seen position
    this.backticks = {};
    this.backticksScanned = false;

    // Counter used to disable inline linkify-it execution
    // inside <a> and markdown links
    this.linkLevel = 0;
  }

  // Flush pending text
  //
  StateInline.prototype.pushPending = function () {
    const token = new Token('text', '', 0);
    token.content = this.pending;
    token.level = this.pendingLevel;
    this.tokens.push(token);
    this.pending = '';
    return token
  };

  // Push new token to "stream".
  // If pending text exists - flush it as text token
  //
  StateInline.prototype.push = function (type, tag, nesting) {
    if (this.pending) {
      this.pushPending();
    }

    const token = new Token(type, tag, nesting);
    let token_meta = null;

    if (nesting < 0) {
      // closing tag
      this.level--;
      this.delimiters = this._prev_delimiters.pop();
    }

    token.level = this.level;

    if (nesting > 0) {
      // opening tag
      this.level++;
      this._prev_delimiters.push(this.delimiters);
      this.delimiters = [];
      token_meta = { delimiters: this.delimiters };
    }

    this.pendingLevel = this.level;
    this.tokens.push(token);
    this.tokens_meta.push(token_meta);
    return token
  };

  // Scan a sequence of emphasis-like markers, and determine whether
  // it can start an emphasis sequence or end an emphasis sequence.
  //
  //  - start - position to scan from (it should point at a valid marker);
  //  - canSplitWord - determine if these markers can be found inside a word
  //
  StateInline.prototype.scanDelims = function (start, canSplitWord) {
    const max = this.posMax;
    const marker = this.src.charCodeAt(start);

    // treat beginning of the line as a whitespace
    const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

    let pos = start;
    while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }

    const count = pos - start;

    // treat end of the line as a whitespace
    const nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

    const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
    const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

    const isLastWhiteSpace = isWhiteSpace(lastChar);
    const isNextWhiteSpace = isWhiteSpace(nextChar);

    const left_flanking =
      !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
    const right_flanking =
      !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);

    const can_open  = left_flanking  && (canSplitWord || !right_flanking || isLastPunctChar);
    const can_close = right_flanking && (canSplitWord || !left_flanking  || isNextPunctChar);

    return { can_open, can_close, length: count }
  };

  // re-export Token class to use in block rules
  StateInline.prototype.Token = Token;

  // Skip text characters for text token, place those to pending buffer
  // and increment current pos

  // Rule to skip pure text
  // '{}$%@~+=:' reserved for extentions

  // !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

  // !!!! Don't confuse with "Markdown ASCII Punctuation" chars
  // http://spec.commonmark.org/0.15/#ascii-punctuation-character
  function isTerminatorChar (ch) {
    switch (ch) {
      case 0x0A/* \n */:
      case 0x21/* ! */:
      case 0x23/* # */:
      case 0x24/* $ */:
      case 0x25/* % */:
      case 0x26/* & */:
      case 0x2A/* * */:
      case 0x2B/* + */:
      case 0x2D/* - */:
      case 0x3A/* : */:
      case 0x3C/* < */:
      case 0x3D/* = */:
      case 0x3E/* > */:
      case 0x40/* @ */:
      case 0x5B/* [ */:
      case 0x5C/* \ */:
      case 0x5D/* ] */:
      case 0x5E/* ^ */:
      case 0x5F/* _ */:
      case 0x60/* ` */:
      case 0x7B/* { */:
      case 0x7D/* } */:
      case 0x7E/* ~ */:
        return true
      default:
        return false
    }
  }

  function text (state, silent) {
    let pos = state.pos;

    while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
      pos++;
    }

    if (pos === state.pos) { return false }

    if (!silent) { state.pending += state.src.slice(state.pos, pos); }

    state.pos = pos;

    return true
  }

  // Alternative implementation, for memory.
  //
  // It costs 10% of performance, but allows extend terminators list, if place it
  // to `ParserInline` property. Probably, will switch to it sometime, such
  // flexibility required.

  /*
  var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

  module.exports = function text(state, silent) {
    var pos = state.pos,
        idx = state.src.slice(pos).search(TERMINATOR_RE);

    // first char is terminator -> empty text
    if (idx === 0) { return false; }

    // no terminator -> text till end of string
    if (idx < 0) {
      if (!silent) { state.pending += state.src.slice(pos); }
      state.pos = state.src.length;
      return true;
    }

    if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

    state.pos += idx;

    return true;
  }; */

  // Process links like https://example.org/

  // RFC3986: scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  const SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;

  function linkify (state, silent) {
    if (!state.md.options.linkify) return false
    if (state.linkLevel > 0) return false

    const pos = state.pos;
    const max = state.posMax;

    if (pos + 3 > max) return false
    if (state.src.charCodeAt(pos) !== 0x3A/* : */) return false
    if (state.src.charCodeAt(pos + 1) !== 0x2F/* / */) return false
    if (state.src.charCodeAt(pos + 2) !== 0x2F/* / */) return false

    const match = state.pending.match(SCHEME_RE);
    if (!match) return false

    const proto = match[1];

    const link = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
    if (!link) return false

    let url = link.url;

    // invalid link, but still detected by linkify somehow;
    // need to check to prevent infinite loop below
    if (url.length <= proto.length) return false

    // disallow '*' at the end of the link (conflicts with emphasis)
    url = url.replace(/\*+$/, '');

    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) return false

    if (!silent) {
      state.pending = state.pending.slice(0, -proto.length);

      const token_o = state.push('link_open', 'a', 1);
      token_o.attrs = [['href', fullUrl]];
      token_o.markup = 'linkify';
      token_o.info = 'auto';

      const token_t = state.push('text', '', 0);
      token_t.content = state.md.normalizeLinkText(url);

      const token_c = state.push('link_close', 'a', -1);
      token_c.markup = 'linkify';
      token_c.info = 'auto';
    }

    state.pos += url.length - proto.length;
    return true
  }

  // Proceess '\n'


  function newline (state, silent) {
    let pos = state.pos;

    if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false }

    const pmax = state.pending.length - 1;
    const max = state.posMax;

    // '  \n' -> hardbreak
    // Lookup in pending chars is bad practice! Don't copy to other rules!
    // Pending string is stored in concat mode, indexed lookups will cause
    // convertion to flat mode.
    if (!silent) {
      if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
        if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
          // Find whitespaces tail of pending chars.
          let ws = pmax - 1;
          while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 0x20) ws--;

          state.pending = state.pending.slice(0, ws);
          state.push('hardbreak', 'br', 0);
        } else {
          state.pending = state.pending.slice(0, -1);
          state.push('softbreak', 'br', 0);
        }
      } else {
        state.push('softbreak', 'br', 0);
      }
    }

    pos++;

    // skip heading spaces for next line
    while (pos < max && isSpace(state.src.charCodeAt(pos))) { pos++; }

    state.pos = pos;
    return true
  }

  // Process escaped chars and hardbreaks


  const ESCAPED = [];

  for (let i = 0; i < 256; i++) { ESCAPED.push(0); }

  '\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
    .split('').forEach(function (ch) { ESCAPED[ch.charCodeAt(0)] = 1; });

  function escape (state, silent) {
    let pos = state.pos;
    const max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x5C/* \ */) return false
    pos++;

    // '\' at the end of the inline block
    if (pos >= max) return false

    let ch1 = state.src.charCodeAt(pos);

    if (ch1 === 0x0A) {
      if (!silent) {
        state.push('hardbreak', 'br', 0);
      }

      pos++;
      // skip leading whitespaces from next line
      while (pos < max) {
        ch1 = state.src.charCodeAt(pos);
        if (!isSpace(ch1)) break
        pos++;
      }

      state.pos = pos;
      return true
    }

    let escapedStr = state.src[pos];

    if (ch1 >= 0xD800 && ch1 <= 0xDBFF && pos + 1 < max) {
      const ch2 = state.src.charCodeAt(pos + 1);

      if (ch2 >= 0xDC00 && ch2 <= 0xDFFF) {
        escapedStr += state.src[pos + 1];
        pos++;
      }
    }

    const origStr = '\\' + escapedStr;

    if (!silent) {
      const token = state.push('text_special', '', 0);

      if (ch1 < 256 && ESCAPED[ch1] !== 0) {
        token.content = escapedStr;
      } else {
        token.content = origStr;
      }

      token.markup = origStr;
      token.info   = 'escape';
    }

    state.pos = pos + 1;
    return true
  }

  // Parse backticks

  function backtick (state, silent) {
    let pos = state.pos;
    const ch = state.src.charCodeAt(pos);

    if (ch !== 0x60/* ` */) { return false }

    const start = pos;
    pos++;
    const max = state.posMax;

    // scan marker length
    while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

    const marker = state.src.slice(start, pos);
    const openerLength = marker.length;

    if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
      if (!silent) state.pending += marker;
      state.pos += openerLength;
      return true
    }

    let matchEnd = pos;
    let matchStart;

    // Nothing found in the cache, scan until the end of the line (or until marker is found)
    while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
      matchEnd = matchStart + 1;

      // scan marker length
      while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

      const closerLength = matchEnd - matchStart;

      if (closerLength === openerLength) {
        // Found matching closer length.
        if (!silent) {
          const token = state.push('code_inline', 'code', 0);
          token.markup = marker;
          token.content = state.src.slice(pos, matchStart)
            .replace(/\n/g, ' ')
            .replace(/^ (.+) $/, '$1');
        }
        state.pos = matchEnd;
        return true
      }

      // Some different length found, put it in cache as upper limit of where closer can be found
      state.backticks[closerLength] = matchStart;
    }

    // Scanned through the end, didn't find anything
    state.backticksScanned = true;

    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true
  }

  // ~~strike through~~
  //

  // Insert each marker as a separate text token, and add it to delimiter list
  //
  function strikethrough_tokenize (state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (silent) { return false }

    if (marker !== 0x7E/* ~ */) { return false }

    const scanned = state.scanDelims(state.pos, true);
    let len = scanned.length;
    const ch = String.fromCharCode(marker);

    if (len < 2) { return false }

    let token;

    if (len % 2) {
      token         = state.push('text', '', 0);
      token.content = ch;
      len--;
    }

    for (let i = 0; i < len; i += 2) {
      token         = state.push('text', '', 0);
      token.content = ch + ch;

      state.delimiters.push({
        marker,
        length: 0,     // disable "rule of 3" length checks meant for emphasis
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true
  }

  function postProcess$1 (state, delimiters) {
    let token;
    const loneMarkers = [];
    const max = delimiters.length;

    for (let i = 0; i < max; i++) {
      const startDelim = delimiters[i];

      if (startDelim.marker !== 0x7E/* ~ */) {
        continue
      }

      if (startDelim.end === -1) {
        continue
      }

      const endDelim = delimiters[startDelim.end];

      token         = state.tokens[startDelim.token];
      token.type    = 's_open';
      token.tag     = 's';
      token.nesting = 1;
      token.markup  = '~~';
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = 's_close';
      token.tag     = 's';
      token.nesting = -1;
      token.markup  = '~~';
      token.content = '';

      if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === '~') {
        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    //
    while (loneMarkers.length) {
      const i = loneMarkers.pop();
      let j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === 's_close') {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  // Walk through delimiter list and replace text tokens with tags
  //
  function strikethrough_postProcess (state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;

    postProcess$1(state, state.delimiters);

    for (let curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        postProcess$1(state, tokens_meta[curr].delimiters);
      }
    }
  }

  var r_strikethrough = {
    tokenize: strikethrough_tokenize,
    postProcess: strikethrough_postProcess
  };

  // Process *this* and _that_
  //

  // Insert each marker as a separate text token, and add it to delimiter list
  //
  function emphasis_tokenize (state, silent) {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (silent) { return false }

    if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false }

    const scanned = state.scanDelims(state.pos, marker === 0x2A);

    for (let i = 0; i < scanned.length; i++) {
      const token = state.push('text', '', 0);
      token.content = String.fromCharCode(marker);

      state.delimiters.push({
        // Char code of the starting marker (number).
        //
        marker,

        // Total length of these series of delimiters.
        //
        length: scanned.length,

        // A position of the token this delimiter corresponds to.
        //
        token: state.tokens.length - 1,

        // If this delimiter is matched as a valid opener, `end` will be
        // equal to its position, otherwise it's `-1`.
        //
        end: -1,

        // Boolean flags that determine if this delimiter could open or close
        // an emphasis.
        //
        open: scanned.can_open,
        close: scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true
  }

  function postProcess (state, delimiters) {
    const max = delimiters.length;

    for (let i = max - 1; i >= 0; i--) {
      const startDelim = delimiters[i];

      if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
        continue
      }

      // Process only opening markers
      if (startDelim.end === -1) {
        continue
      }

      const endDelim = delimiters[startDelim.end];

      // If the previous delimiter has the same marker and is adjacent to this one,
      // merge those into one strong delimiter.
      //
      // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
      //
      const isStrong = i > 0 &&
                 delimiters[i - 1].end === startDelim.end + 1 &&
                 // check that first two markers match and adjacent
                 delimiters[i - 1].marker === startDelim.marker &&
                 delimiters[i - 1].token === startDelim.token - 1 &&
                 // check that last two markers are adjacent (we can safely assume they match)
                 delimiters[startDelim.end + 1].token === endDelim.token + 1;

      const ch = String.fromCharCode(startDelim.marker);

      const token_o   = state.tokens[startDelim.token];
      token_o.type    = isStrong ? 'strong_open' : 'em_open';
      token_o.tag     = isStrong ? 'strong' : 'em';
      token_o.nesting = 1;
      token_o.markup  = isStrong ? ch + ch : ch;
      token_o.content = '';

      const token_c   = state.tokens[endDelim.token];
      token_c.type    = isStrong ? 'strong_close' : 'em_close';
      token_c.tag     = isStrong ? 'strong' : 'em';
      token_c.nesting = -1;
      token_c.markup  = isStrong ? ch + ch : ch;
      token_c.content = '';

      if (isStrong) {
        state.tokens[delimiters[i - 1].token].content = '';
        state.tokens[delimiters[startDelim.end + 1].token].content = '';
        i--;
      }
    }
  }

  // Walk through delimiter list and replace text tokens with tags
  //
  function emphasis_post_process (state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;

    postProcess(state, state.delimiters);

    for (let curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        postProcess(state, tokens_meta[curr].delimiters);
      }
    }
  }

  var r_emphasis = {
    tokenize: emphasis_tokenize,
    postProcess: emphasis_post_process
  };

  // Process [link](<to> "stuff")


  function link (state, silent) {
    let code, label, res, ref;
    let href = '';
    let title = '';
    let start = state.pos;
    let parseReference = true;

    if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false }

    const oldPos = state.pos;
    const max = state.posMax;
    const labelStart = state.pos + 1;
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);

    // parser failed to find ']', so it's not a valid link
    if (labelEnd < 0) { return false }

    let pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
      //
      // Inline link
      //

      // might have found a valid shortcut link, disable reference parsing
      parseReference = false;

      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
      pos++;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break }
      }
      if (pos >= max) { return false }

      // [link](  <href>  "title"  )
      //          ^^^^^^ parsing link destination
      start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) {
          pos = res.pos;
        } else {
          href = '';
        }

        // [link](  <href>  "title"  )
        //                ^^ skipping these spaces
        start = pos;
        for (; pos < max; pos++) {
          code = state.src.charCodeAt(pos);
          if (!isSpace(code) && code !== 0x0A) { break }
        }

        // [link](  <href>  "title"  )
        //                  ^^^^^^^ parsing link title
        res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
        if (pos < max && start !== pos && res.ok) {
          title = res.str;
          pos = res.pos;

          // [link](  <href>  "title"  )
          //                         ^^ skipping these spaces
          for (; pos < max; pos++) {
            code = state.src.charCodeAt(pos);
            if (!isSpace(code) && code !== 0x0A) { break }
          }
        }
      }

      if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
        // parsing a valid shortcut link failed, fallback to reference
        parseReference = true;
      }
      pos++;
    }

    if (parseReference) {
      //
      // Link reference
      //
      if (typeof state.env.references === 'undefined') { return false }

      if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
          label = state.src.slice(start, pos++);
        } else {
          pos = labelEnd + 1;
        }
      } else {
        pos = labelEnd + 1;
      }

      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
      if (!label) { label = state.src.slice(labelStart, labelEnd); }

      ref = state.env.references[normalizeReference(label)];
      if (!ref) {
        state.pos = oldPos;
        return false
      }
      href = ref.href;
      title = ref.title;
    }

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      state.pos = labelStart;
      state.posMax = labelEnd;

      const token_o = state.push('link_open', 'a', 1);
      const attrs = [['href', href]];
      token_o.attrs  = attrs;
      if (title) {
        attrs.push(['title', title]);
      }

      state.linkLevel++;
      state.md.inline.tokenize(state);
      state.linkLevel--;

      state.push('link_close', 'a', -1);
    }

    state.pos = pos;
    state.posMax = max;
    return true
  }

  // Process ![image](<src> "title")


  function image (state, silent) {
    let code, content, label, pos, ref, res, title, start;
    let href = '';
    const oldPos = state.pos;
    const max = state.posMax;

    if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false }
    if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false }

    const labelStart = state.pos + 2;
    const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

    // parser failed to find ']', so it's not a valid link
    if (labelEnd < 0) { return false }

    pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
      //
      // Inline link
      //

      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
      pos++;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break }
      }
      if (pos >= max) { return false }

      // [link](  <href>  "title"  )
      //          ^^^^^^ parsing link destination
      start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) {
          pos = res.pos;
        } else {
          href = '';
        }
      }

      // [link](  <href>  "title"  )
      //                ^^ skipping these spaces
      start = pos;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break }
      }

      // [link](  <href>  "title"  )
      //                  ^^^^^^^ parsing link title
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;

        // [link](  <href>  "title"  )
        //                         ^^ skipping these spaces
        for (; pos < max; pos++) {
          code = state.src.charCodeAt(pos);
          if (!isSpace(code) && code !== 0x0A) { break }
        }
      } else {
        title = '';
      }

      if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
        state.pos = oldPos;
        return false
      }
      pos++;
    } else {
      //
      // Link reference
      //
      if (typeof state.env.references === 'undefined') { return false }

      if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
          label = state.src.slice(start, pos++);
        } else {
          pos = labelEnd + 1;
        }
      } else {
        pos = labelEnd + 1;
      }

      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
      if (!label) { label = state.src.slice(labelStart, labelEnd); }

      ref = state.env.references[normalizeReference(label)];
      if (!ref) {
        state.pos = oldPos;
        return false
      }
      href = ref.href;
      title = ref.title;
    }

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      content = state.src.slice(labelStart, labelEnd);

      const tokens = [];
      state.md.inline.parse(
        content,
        state.md,
        state.env,
        tokens
      );

      const token = state.push('image', 'img', 0);
      const attrs = [['src', href], ['alt', '']];
      token.attrs = attrs;
      token.children = tokens;
      token.content = content;

      if (title) {
        attrs.push(['title', title]);
      }
    }

    state.pos = pos;
    state.posMax = max;
    return true
  }

  // Process autolinks '<protocol:...>'

  /* eslint max-len:0 */
  const EMAIL_RE    = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
  /* eslint-disable-next-line no-control-regex */
  const AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;

  function autolink (state, silent) {
    let pos = state.pos;

    if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false }

    const start = state.pos;
    const max = state.posMax;

    for (;;) {
      if (++pos >= max) return false

      const ch = state.src.charCodeAt(pos);

      if (ch === 0x3C /* < */) return false
      if (ch === 0x3E /* > */) break
    }

    const url = state.src.slice(start + 1, pos);

    if (AUTOLINK_RE.test(url)) {
      const fullUrl = state.md.normalizeLink(url);
      if (!state.md.validateLink(fullUrl)) { return false }

      if (!silent) {
        const token_o   = state.push('link_open', 'a', 1);
        token_o.attrs   = [['href', fullUrl]];
        token_o.markup  = 'autolink';
        token_o.info    = 'auto';

        const token_t   = state.push('text', '', 0);
        token_t.content = state.md.normalizeLinkText(url);

        const token_c   = state.push('link_close', 'a', -1);
        token_c.markup  = 'autolink';
        token_c.info    = 'auto';
      }

      state.pos += url.length + 2;
      return true
    }

    if (EMAIL_RE.test(url)) {
      const fullUrl = state.md.normalizeLink('mailto:' + url);
      if (!state.md.validateLink(fullUrl)) { return false }

      if (!silent) {
        const token_o   = state.push('link_open', 'a', 1);
        token_o.attrs   = [['href', fullUrl]];
        token_o.markup  = 'autolink';
        token_o.info    = 'auto';

        const token_t   = state.push('text', '', 0);
        token_t.content = state.md.normalizeLinkText(url);

        const token_c   = state.push('link_close', 'a', -1);
        token_c.markup  = 'autolink';
        token_c.info    = 'auto';
      }

      state.pos += url.length + 2;
      return true
    }

    return false
  }

  // Process html tags


  function isLinkOpen (str) {
    return /^<a[>\s]/i.test(str)
  }
  function isLinkClose (str) {
    return /^<\/a\s*>/i.test(str)
  }

  function isLetter (ch) {
    /* eslint no-bitwise:0 */
    const lc = ch | 0x20; // to lower case
    return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */)
  }

  function html_inline (state, silent) {
    if (!state.md.options.html) { return false }

    // Check start
    const max = state.posMax;
    const pos = state.pos;
    if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
        pos + 2 >= max) {
      return false
    }

    // Quick fail on second char
    const ch = state.src.charCodeAt(pos + 1);
    if (ch !== 0x21/* ! */ &&
        ch !== 0x3F/* ? */ &&
        ch !== 0x2F/* / */ &&
        !isLetter(ch)) {
      return false
    }

    const match = state.src.slice(pos).match(HTML_TAG_RE);
    if (!match) { return false }

    if (!silent) {
      const token = state.push('html_inline', '', 0);
      token.content = match[0];

      if (isLinkOpen(token.content))  state.linkLevel++;
      if (isLinkClose(token.content)) state.linkLevel--;
    }
    state.pos += match[0].length;
    return true
  }

  // Process html entity - &#123;, &#xAF;, &quot;, ...


  const DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
  const NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;

  function entity (state, silent) {
    const pos = state.pos;
    const max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x26/* & */) return false

    if (pos + 1 >= max) return false

    const ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      const match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          const code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);

          const token   = state.push('text_special', '', 0);
          token.content = isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
          token.markup  = match[0];
          token.info    = 'entity';
        }
        state.pos += match[0].length;
        return true
      }
    } else {
      const match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        const decoded = decodeHTML(match[0]);
        if (decoded !== match[0]) {
          if (!silent) {
            const token   = state.push('text_special', '', 0);
            token.content = decoded;
            token.markup  = match[0];
            token.info    = 'entity';
          }
          state.pos += match[0].length;
          return true
        }
      }
    }

    return false
  }

  // For each opening emphasis-like marker find a matching closing one
  //

  function processDelimiters (delimiters) {
    const openersBottom = {};
    const max = delimiters.length;

    if (!max) return

    // headerIdx is the first delimiter of the current (where closer is) delimiter run
    let headerIdx = 0;
    let lastTokenIdx = -2; // needs any value lower than -1
    const jumps = [];

    for (let closerIdx = 0; closerIdx < max; closerIdx++) {
      const closer = delimiters[closerIdx];

      jumps.push(0);

      // markers belong to same delimiter run if:
      //  - they have adjacent tokens
      //  - AND markers are the same
      //
      if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) {
        headerIdx = closerIdx;
      }

      lastTokenIdx = closer.token;

      // Length is only used for emphasis-specific "rule of 3",
      // if it's not defined (in strikethrough or 3rd party plugins),
      // we can default it to 0 to disable those checks.
      //
      closer.length = closer.length || 0;

      if (!closer.close) continue

      // Previously calculated lower bounds (previous fails)
      // for each marker, each delimiter length modulo 3,
      // and for whether this closer can be an opener;
      // https://github.com/commonmark/cmark/commit/34250e12ccebdc6372b8b49c44fab57c72443460
      /* eslint-disable-next-line no-prototype-builtins */
      if (!openersBottom.hasOwnProperty(closer.marker)) {
        openersBottom[closer.marker] = [-1, -1, -1, -1, -1, -1];
      }

      const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length % 3)];

      let openerIdx = headerIdx - jumps[headerIdx] - 1;

      let newMinOpenerIdx = openerIdx;

      for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
        const opener = delimiters[openerIdx];

        if (opener.marker !== closer.marker) continue

        if (opener.open && opener.end < 0) {
          let isOddMatch = false;

          // from spec:
          //
          // If one of the delimiters can both open and close emphasis, then the
          // sum of the lengths of the delimiter runs containing the opening and
          // closing delimiters must not be a multiple of 3 unless both lengths
          // are multiples of 3.
          //
          if (opener.close || closer.open) {
            if ((opener.length + closer.length) % 3 === 0) {
              if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
                isOddMatch = true;
              }
            }
          }

          if (!isOddMatch) {
            // If previous delimiter cannot be an opener, we can safely skip
            // the entire sequence in future checks. This is required to make
            // sure algorithm has linear complexity (see *_*_*_*_*_... case).
            //
            const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open
              ? jumps[openerIdx - 1] + 1
              : 0;

            jumps[closerIdx] = closerIdx - openerIdx + lastJump;
            jumps[openerIdx] = lastJump;

            closer.open  = false;
            opener.end   = closerIdx;
            opener.close = false;
            newMinOpenerIdx = -1;
            // treat next token as start of run,
            // it optimizes skips in **<...>**a**<...>** pathological case
            lastTokenIdx = -2;
            break
          }
        }
      }

      if (newMinOpenerIdx !== -1) {
        // If match for this delimiter run failed, we want to set lower bound for
        // future lookups. This is required to make sure algorithm has linear
        // complexity.
        //
        // See details here:
        // https://github.com/commonmark/cmark/issues/178#issuecomment-270417442
        //
        openersBottom[closer.marker][(closer.open ? 3 : 0) + ((closer.length || 0) % 3)] = newMinOpenerIdx;
      }
    }
  }

  function link_pairs (state) {
    const tokens_meta = state.tokens_meta;
    const max = state.tokens_meta.length;

    processDelimiters(state.delimiters);

    for (let curr = 0; curr < max; curr++) {
      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
        processDelimiters(tokens_meta[curr].delimiters);
      }
    }
  }

  // Clean up tokens after emphasis and strikethrough postprocessing:
  // merge adjacent text nodes into one and re-calculate all token levels
  //
  // This is necessary because initially emphasis delimiter markers (*, _, ~)
  // are treated as their own separate text tokens. Then emphasis rule either
  // leaves them as text (needed to merge with adjacent text) or turns them
  // into opening/closing tags (which messes up levels inside).
  //

  function fragments_join (state) {
    let curr, last;
    let level = 0;
    const tokens = state.tokens;
    const max = state.tokens.length;

    for (curr = last = 0; curr < max; curr++) {
      // re-calculate levels after emphasis/strikethrough turns some text nodes
      // into opening/closing tags
      if (tokens[curr].nesting < 0) level--; // closing tag
      tokens[curr].level = level;
      if (tokens[curr].nesting > 0) level++; // opening tag

      if (tokens[curr].type === 'text' &&
          curr + 1 < max &&
          tokens[curr + 1].type === 'text') {
        // collapse two adjacent text nodes
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) { tokens[last] = tokens[curr]; }

        last++;
      }
    }

    if (curr !== last) {
      tokens.length = last;
    }
  }

  /** internal
   * class ParserInline
   *
   * Tokenizes paragraph content.
   **/


  // Parser rules

  const _rules = [
    ['text',            text],
    ['linkify',         linkify],
    ['newline',         newline],
    ['escape',          escape],
    ['backticks',       backtick],
    ['strikethrough',   r_strikethrough.tokenize],
    ['emphasis',        r_emphasis.tokenize],
    ['link',            link],
    ['image',           image],
    ['autolink',        autolink],
    ['html_inline',     html_inline],
    ['entity',          entity]
  ];

  // `rule2` ruleset was created specifically for emphasis/strikethrough
  // post-processing and may be changed in the future.
  //
  // Don't use this for anything except pairs (plugins working with `balance_pairs`).
  //
  const _rules2 = [
    ['balance_pairs',   link_pairs],
    ['strikethrough',   r_strikethrough.postProcess],
    ['emphasis',        r_emphasis.postProcess],
    // rules for pairs separate '**' into its own text tokens, which may be left unused,
    // rule below merges unused segments back with the rest of the text
    ['fragments_join',  fragments_join]
  ];

  /**
   * new ParserInline()
   **/
  function ParserInline () {
    /**
     * ParserInline#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of inline rules.
     **/
    this.ruler = new Ruler();

    for (let i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1]);
    }

    /**
     * ParserInline#ruler2 -> Ruler
     *
     * [[Ruler]] instance. Second ruler used for post-processing
     * (e.g. in emphasis-like rules).
     **/
    this.ruler2 = new Ruler();

    for (let i = 0; i < _rules2.length; i++) {
      this.ruler2.push(_rules2[i][0], _rules2[i][1]);
    }
  }

  // Skip single token by running all rules in validation mode;
  // returns `true` if any rule reported success
  //
  ParserInline.prototype.skipToken = function (state) {
    const pos = state.pos;
    const rules = this.ruler.getRules('');
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    const cache = state.cache;

    if (typeof cache[pos] !== 'undefined') {
      state.pos = cache[pos];
      return
    }

    let ok = false;

    if (state.level < maxNesting) {
      for (let i = 0; i < len; i++) {
        // Increment state.level and decrement it later to limit recursion.
        // It's harmless to do here, because no tokens are created. But ideally,
        // we'd need a separate private state variable for this purpose.
        //
        state.level++;
        ok = rules[i](state, true);
        state.level--;

        if (ok) {
          if (pos >= state.pos) { throw new Error("inline rule didn't increment state.pos") }
          break
        }
      }
    } else {
      // Too much nesting, just skip until the end of the paragraph.
      //
      // NOTE: this will cause links to behave incorrectly in the following case,
      //       when an amount of `[` is exactly equal to `maxNesting + 1`:
      //
      //       [[[[[[[[[[[[[[[[[[[[[foo]()
      //
      // TODO: remove this workaround when CM standard will allow nested links
      //       (we can replace it by preventing links from being parsed in
      //       validation mode)
      //
      state.pos = state.posMax;
    }

    if (!ok) { state.pos++; }
    cache[pos] = state.pos;
  };

  // Generate tokens for input range
  //
  ParserInline.prototype.tokenize = function (state) {
    const rules = this.ruler.getRules('');
    const len = rules.length;
    const end = state.posMax;
    const maxNesting = state.md.options.maxNesting;

    while (state.pos < end) {
      // Try all possible rules.
      // On success, rule should:
      //
      // - update `state.pos`
      // - update `state.tokens`
      // - return true
      const prevPos = state.pos;
      let ok = false;

      if (state.level < maxNesting) {
        for (let i = 0; i < len; i++) {
          ok = rules[i](state, false);
          if (ok) {
            if (prevPos >= state.pos) { throw new Error("inline rule didn't increment state.pos") }
            break
          }
        }
      }

      if (ok) {
        if (state.pos >= end) { break }
        continue
      }

      state.pending += state.src[state.pos++];
    }

    if (state.pending) {
      state.pushPending();
    }
  };

  /**
   * ParserInline.parse(str, md, env, outTokens)
   *
   * Process input string and push inline tokens into `outTokens`
   **/
  ParserInline.prototype.parse = function (str, md, env, outTokens) {
    const state = new this.State(str, md, env, outTokens);

    this.tokenize(state);

    const rules = this.ruler2.getRules('');
    const len = rules.length;

    for (let i = 0; i < len; i++) {
      rules[i](state);
    }
  };

  ParserInline.prototype.State = StateInline;

  function reFactory (opts) {
    const re = {};
    opts = opts || {};

    re.src_Any = Any.source;
    re.src_Cc = Cc.source;
    re.src_Z = Z.source;
    re.src_P = P.source;

    // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
    re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join('|');

    // \p{\Z\Cc} (white spaces + control)
    re.src_ZCc = [re.src_Z, re.src_Cc].join('|');

    // Experimental. List of chars, completely prohibited in links
    // because can separate it from other part of text
    const text_separators = '[><\uff5c]';

    // All possible word characters (everything without punctuation, spaces & controls)
    // Defined via punctuation & spaces to save space
    // Should be something like \p{\L\N\S\M} (\w but without `_`)
    re.src_pseudo_letter = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
    // The same as abothe but without [0-9]
    // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

    re.src_ip4 =

      '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

    // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
    re.src_auth = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

    re.src_port =

      '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

    re.src_host_terminator =

      '(?=$|' + text_separators + '|' + re.src_ZPCc + ')' +
      '(?!' + (opts['---'] ? '-(?!--)|' : '-|') + '_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

    re.src_path =

      '(?:' +
        '[/?#]' +
          '(?:' +
            '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-;]).|' +
            '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
            '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
            '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
            '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
            "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +

            // allow `I'm_king` if no pair found
            "\\'(?=" + re.src_pseudo_letter + '|[-])|' +

            // google has many dots in "google search" links (#66, #81).
            // github has ... in commit range links,
            // Restrict to
            // - english
            // - percent-encoded
            // - parts of file path
            // - params separator
            // until more examples found.
            '\\.{2,}[a-zA-Z0-9%/&]|' +

            '\\.(?!' + re.src_ZCc + '|[.]|$)|' +
            (opts['---']
              ? '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
              : '\\-+|'
            ) +
            // allow `,,,` in paths
            ',(?!' + re.src_ZCc + '|$)|' +

            // allow `;` if not followed by space-like char
            ';(?!' + re.src_ZCc + '|$)|' +

            // allow `!!!` in paths, but not at the end
            '\\!+(?!' + re.src_ZCc + '|[!]|$)|' +

            '\\?(?!' + re.src_ZCc + '|[?]|$)' +
          ')+' +
        '|\\/' +
      ')?';

    // Allow anything in markdown spec, forbid quote (") at the first position
    // because emails enclosed in quotes are far more common
    re.src_email_name =

      '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';

    re.src_xn =

      'xn--[a-z0-9\\-]{1,59}';

    // More to read about domain names
    // http://serverfault.com/questions/638260/

    re.src_domain_root =

      // Allow letters & digits (http://test1)
      '(?:' +
        re.src_xn +
        '|' +
        re.src_pseudo_letter + '{1,63}' +
      ')';

    re.src_domain =

      '(?:' +
        re.src_xn +
        '|' +
        '(?:' + re.src_pseudo_letter + ')' +
        '|' +
        '(?:' + re.src_pseudo_letter + '(?:-|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
      ')';

    re.src_host =

      '(?:' +
      // Don't need IP check, because digits are already allowed in normal domain names
      //   src_ip4 +
      // '|' +
        '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/* _root */ + ')' +
      ')';

    re.tpl_host_fuzzy =

      '(?:' +
        re.src_ip4 +
      '|' +
        '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
      ')';

    re.tpl_host_no_ip_fuzzy =

      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

    re.src_host_strict =

      re.src_host + re.src_host_terminator;

    re.tpl_host_fuzzy_strict =

      re.tpl_host_fuzzy + re.src_host_terminator;

    re.src_host_port_strict =

      re.src_host + re.src_port + re.src_host_terminator;

    re.tpl_host_port_fuzzy_strict =

      re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

    re.tpl_host_port_no_ip_fuzzy_strict =

      re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;

    //
    // Main rules
    //

    // Rude test fuzzy links by host, for quick deny
    re.tpl_host_fuzzy_test =

      'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

    re.tpl_email_fuzzy =

        '(^|' + text_separators + '|"|\\(|' + re.src_ZCc + ')' +
        '(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

    re.tpl_link_fuzzy =
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
        '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

    re.tpl_link_no_ip_fuzzy =
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
        '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

    return re
  }

  //
  // Helpers
  //

  // Merge objects
  //
  function assign (obj /* from1, from2, from3, ... */) {
    const sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(function (source) {
      if (!source) { return }

      Object.keys(source).forEach(function (key) {
        obj[key] = source[key];
      });
    });

    return obj
  }

  function _class (obj) { return Object.prototype.toString.call(obj) }
  function isString (obj) { return _class(obj) === '[object String]' }
  function isObject (obj) { return _class(obj) === '[object Object]' }
  function isRegExp (obj) { return _class(obj) === '[object RegExp]' }
  function isFunction (obj) { return _class(obj) === '[object Function]' }

  function escapeRE (str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') }

  //

  const defaultOptions = {
    fuzzyLink: true,
    fuzzyEmail: true,
    fuzzyIP: false
  };

  function isOptionsObj (obj) {
    return Object.keys(obj || {}).reduce(function (acc, k) {
      /* eslint-disable-next-line no-prototype-builtins */
      return acc || defaultOptions.hasOwnProperty(k)
    }, false)
  }

  const defaultSchemas = {
    'http:': {
      validate: function (text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.http) {
          // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.http = new RegExp(
            '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
          );
        }
        if (self.re.http.test(tail)) {
          return tail.match(self.re.http)[0].length
        }
        return 0
      }
    },
    'https:': 'http:',
    'ftp:': 'http:',
    '//': {
      validate: function (text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.no_http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.no_http = new RegExp(
            '^' +
            self.re.src_auth +
            // Don't allow single-level domains, because of false positives like '//test'
            // with code comments
            '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
            self.re.src_port +
            self.re.src_host_terminator +
            self.re.src_path,

            'i'
          );
        }

        if (self.re.no_http.test(tail)) {
          // should not be `://` & `///`, that protects from errors in protocol name
          if (pos >= 3 && text[pos - 3] === ':') { return 0 }
          if (pos >= 3 && text[pos - 3] === '/') { return 0 }
          return tail.match(self.re.no_http)[0].length
        }
        return 0
      }
    },
    'mailto:': {
      validate: function (text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.mailto) {
          self.re.mailto = new RegExp(
            '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
          );
        }
        if (self.re.mailto.test(tail)) {
          return tail.match(self.re.mailto)[0].length
        }
        return 0
      }
    }
  };

  // RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
  /* eslint-disable-next-line max-len */
  const tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

  // DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
  const tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

  function resetScanCache (self) {
    self.__index__ = -1;
    self.__text_cache__ = '';
  }

  function createValidator (re) {
    return function (text, pos) {
      const tail = text.slice(pos);

      if (re.test(tail)) {
        return tail.match(re)[0].length
      }
      return 0
    }
  }

  function createNormalizer () {
    return function (match, self) {
      self.normalize(match);
    }
  }

  // Schemas compiler. Build regexps.
  //
  function compile (self) {
    // Load & clone RE patterns.
    const re = self.re = reFactory(self.__opts__);

    // Define dynamic patterns
    const tlds = self.__tlds__.slice();

    self.onCompile();

    if (!self.__tlds_replaced__) {
      tlds.push(tlds_2ch_src_re);
    }
    tlds.push(re.src_xn);

    re.src_tlds = tlds.join('|');

    function untpl (tpl) { return tpl.replace('%TLDS%', re.src_tlds) }

    re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), 'i');
    re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), 'i');
    re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
    re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

    //
    // Compile each schema
    //

    const aliases = [];

    self.__compiled__ = {}; // Reset compiled data

    function schemaError (name, val) {
      throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val)
    }

    Object.keys(self.__schemas__).forEach(function (name) {
      const val = self.__schemas__[name];

      // skip disabled methods
      if (val === null) { return }

      const compiled = { validate: null, link: null };

      self.__compiled__[name] = compiled;

      if (isObject(val)) {
        if (isRegExp(val.validate)) {
          compiled.validate = createValidator(val.validate);
        } else if (isFunction(val.validate)) {
          compiled.validate = val.validate;
        } else {
          schemaError(name, val);
        }

        if (isFunction(val.normalize)) {
          compiled.normalize = val.normalize;
        } else if (!val.normalize) {
          compiled.normalize = createNormalizer();
        } else {
          schemaError(name, val);
        }

        return
      }

      if (isString(val)) {
        aliases.push(name);
        return
      }

      schemaError(name, val);
    });

    //
    // Compile postponed aliases
    //

    aliases.forEach(function (alias) {
      if (!self.__compiled__[self.__schemas__[alias]]) {
        // Silently fail on missed schemas to avoid errons on disable.
        // schemaError(alias, self.__schemas__[alias]);
        return
      }

      self.__compiled__[alias].validate =
        self.__compiled__[self.__schemas__[alias]].validate;
      self.__compiled__[alias].normalize =
        self.__compiled__[self.__schemas__[alias]].normalize;
    });

    //
    // Fake record for guessed links
    //
    self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

    //
    // Build schema condition
    //
    const slist = Object.keys(self.__compiled__)
      .filter(function (name) {
        // Filter disabled & fake schemas
        return name.length > 0 && self.__compiled__[name]
      })
      .map(escapeRE)
      .join('|');
    // (?!_) cause 1.5x slowdown
    self.re.schema_test = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
    self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');
    self.re.schema_at_start = RegExp('^' + self.re.schema_search.source, 'i');

    self.re.pretest = RegExp(
      '(' + self.re.schema_test.source + ')|(' + self.re.host_fuzzy_test.source + ')|@',
      'i'
    );

    //
    // Cleanup
    //

    resetScanCache(self);
  }

  /**
   * class Match
   *
   * Match result. Single element of array, returned by [[LinkifyIt#match]]
   **/
  function Match (self, shift) {
    const start = self.__index__;
    const end = self.__last_index__;
    const text = self.__text_cache__.slice(start, end);

    /**
     * Match#schema -> String
     *
     * Prefix (protocol) for matched string.
     **/
    this.schema = self.__schema__.toLowerCase();
    /**
     * Match#index -> Number
     *
     * First position of matched string.
     **/
    this.index = start + shift;
    /**
     * Match#lastIndex -> Number
     *
     * Next position after matched string.
     **/
    this.lastIndex = end + shift;
    /**
     * Match#raw -> String
     *
     * Matched string.
     **/
    this.raw = text;
    /**
     * Match#text -> String
     *
     * Notmalized text of matched string.
     **/
    this.text = text;
    /**
     * Match#url -> String
     *
     * Normalized url of matched string.
     **/
    this.url = text;
  }

  function createMatch (self, shift) {
    const match = new Match(self, shift);

    self.__compiled__[match.schema].normalize(match, self);

    return match
  }

  /**
   * class LinkifyIt
   **/

  /**
   * new LinkifyIt(schemas, options)
   * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Creates new linkifier instance with optional additional schemas.
   * Can be called without `new` keyword for convenience.
   *
   * By default understands:
   *
   * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
   * - "fuzzy" links and emails (example.com, foo@bar.com).
   *
   * `schemas` is an object, where each key/value describes protocol/rule:
   *
   * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
   *   for example). `linkify-it` makes shure that prefix is not preceeded with
   *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
   * - __value__ - rule to check tail after link prefix
   *   - _String_ - just alias to existing rule
   *   - _Object_
   *     - _validate_ - validator function (should return matched length on success),
   *       or `RegExp`.
   *     - _normalize_ - optional function to normalize text & url of matched result
   *       (for example, for @twitter mentions).
   *
   * `options`:
   *
   * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
   * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
   *   like version numbers. Default `false`.
   * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
   *
   **/
  function LinkifyIt (schemas, options) {
    if (!(this instanceof LinkifyIt)) {
      return new LinkifyIt(schemas, options)
    }

    if (!options) {
      if (isOptionsObj(schemas)) {
        options = schemas;
        schemas = {};
      }
    }

    this.__opts__ = assign({}, defaultOptions, options);

    // Cache last tested result. Used to skip repeating steps on next `match` call.
    this.__index__ = -1;
    this.__last_index__ = -1; // Next scan position
    this.__schema__ = '';
    this.__text_cache__ = '';

    this.__schemas__ = assign({}, defaultSchemas, schemas);
    this.__compiled__ = {};

    this.__tlds__ = tlds_default;
    this.__tlds_replaced__ = false;

    this.re = {};

    compile(this);
  }

  /** chainable
   * LinkifyIt#add(schema, definition)
   * - schema (String): rule name (fixed pattern prefix)
   * - definition (String|RegExp|Object): schema definition
   *
   * Add new rule definition. See constructor description for details.
   **/
  LinkifyIt.prototype.add = function add (schema, definition) {
    this.__schemas__[schema] = definition;
    compile(this);
    return this
  };

  /** chainable
   * LinkifyIt#set(options)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Set recognition options for links without schema.
   **/
  LinkifyIt.prototype.set = function set (options) {
    this.__opts__ = assign(this.__opts__, options);
    return this
  };

  /**
   * LinkifyIt#test(text) -> Boolean
   *
   * Searches linkifiable pattern and returns `true` on success or `false` on fail.
   **/
  LinkifyIt.prototype.test = function test (text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__ = -1;

    if (!text.length) { return false }

    let m, ml, me, len, shift, next, re, tld_pos, at_pos;

    // try to scan for link with schema - that's the most simple rule
    if (this.re.schema_test.test(text)) {
      re = this.re.schema_search;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        len = this.testSchemaAt(text, m[2], re.lastIndex);
        if (len) {
          this.__schema__ = m[2];
          this.__index__ = m.index + m[1].length;
          this.__last_index__ = m.index + m[0].length + len;
          break
        }
      }
    }

    if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
      // guess schemaless links
      tld_pos = text.search(this.re.host_fuzzy_test);
      if (tld_pos >= 0) {
        // if tld is located after found link - no need to check fuzzy pattern
        if (this.__index__ < 0 || tld_pos < this.__index__) {
          if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {
            shift = ml.index + ml[1].length;

            if (this.__index__ < 0 || shift < this.__index__) {
              this.__schema__ = '';
              this.__index__ = shift;
              this.__last_index__ = ml.index + ml[0].length;
            }
          }
        }
      }
    }

    if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
      // guess schemaless emails
      at_pos = text.indexOf('@');
      if (at_pos >= 0) {
        // We can't skip this check, because this cases are possible:
        // 192.168.1.1@gmail.com, my.in@example.com
        if ((me = text.match(this.re.email_fuzzy)) !== null) {
          shift = me.index + me[1].length;
          next = me.index + me[0].length;

          if (this.__index__ < 0 || shift < this.__index__ ||
              (shift === this.__index__ && next > this.__last_index__)) {
            this.__schema__ = 'mailto:';
            this.__index__ = shift;
            this.__last_index__ = next;
          }
        }
      }
    }

    return this.__index__ >= 0
  };

  /**
   * LinkifyIt#pretest(text) -> Boolean
   *
   * Very quick check, that can give false positives. Returns true if link MAY BE
   * can exists. Can be used for speed optimization, when you need to check that
   * link NOT exists.
   **/
  LinkifyIt.prototype.pretest = function pretest (text) {
    return this.re.pretest.test(text)
  };

  /**
   * LinkifyIt#testSchemaAt(text, name, position) -> Number
   * - text (String): text to scan
   * - name (String): rule (schema) name
   * - position (Number): text offset to check from
   *
   * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
   * at given position. Returns length of found pattern (0 on fail).
   **/
  LinkifyIt.prototype.testSchemaAt = function testSchemaAt (text, schema, pos) {
    // If not supported schema check requested - terminate
    if (!this.__compiled__[schema.toLowerCase()]) {
      return 0
    }
    return this.__compiled__[schema.toLowerCase()].validate(text, pos, this)
  };

  /**
   * LinkifyIt#match(text) -> Array|null
   *
   * Returns array of found link descriptions or `null` on fail. We strongly
   * recommend to use [[LinkifyIt#test]] first, for best speed.
   *
   * ##### Result match description
   *
   * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
   *   protocol-neutral  links.
   * - __index__ - offset of matched text
   * - __lastIndex__ - index of next char after mathch end
   * - __raw__ - matched text
   * - __text__ - normalized text
   * - __url__ - link, generated from matched text
   **/
  LinkifyIt.prototype.match = function match (text) {
    const result = [];
    let shift = 0;

    // Try to take previous element from cache, if .test() called before
    if (this.__index__ >= 0 && this.__text_cache__ === text) {
      result.push(createMatch(this, shift));
      shift = this.__last_index__;
    }

    // Cut head if cache was used
    let tail = shift ? text.slice(shift) : text;

    // Scan string until end reached
    while (this.test(tail)) {
      result.push(createMatch(this, shift));

      tail = tail.slice(this.__last_index__);
      shift += this.__last_index__;
    }

    if (result.length) {
      return result
    }

    return null
  };

  /**
   * LinkifyIt#matchAtStart(text) -> Match|null
   *
   * Returns fully-formed (not fuzzy) link if it starts at the beginning
   * of the string, and null otherwise.
   **/
  LinkifyIt.prototype.matchAtStart = function matchAtStart (text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__ = -1;

    if (!text.length) return null

    const m = this.re.schema_at_start.exec(text);
    if (!m) return null

    const len = this.testSchemaAt(text, m[2], m[0].length);
    if (!len) return null

    this.__schema__ = m[2];
    this.__index__ = m.index + m[1].length;
    this.__last_index__ = m.index + m[0].length + len;

    return createMatch(this, 0)
  };

  /** chainable
   * LinkifyIt#tlds(list [, keepOld]) -> this
   * - list (Array): list of tlds
   * - keepOld (Boolean): merge with current list if `true` (`false` by default)
   *
   * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
   * to avoid false positives. By default this algorythm used:
   *
   * - hostname with any 2-letter root zones are ok.
   * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
   *   are ok.
   * - encoded (`xn--...`) root zones are ok.
   *
   * If list is replaced, then exact match for 2-chars root zones will be checked.
   **/
  LinkifyIt.prototype.tlds = function tlds (list, keepOld) {
    list = Array.isArray(list) ? list : [list];

    if (!keepOld) {
      this.__tlds__ = list.slice();
      this.__tlds_replaced__ = true;
      compile(this);
      return this
    }

    this.__tlds__ = this.__tlds__.concat(list)
      .sort()
      .filter(function (el, idx, arr) {
        return el !== arr[idx - 1]
      })
      .reverse();

    compile(this);
    return this
  };

  /**
   * LinkifyIt#normalize(match)
   *
   * Default normalizer (if schema does not define it's own).
   **/
  LinkifyIt.prototype.normalize = function normalize (match) {
    // Do minimal possible changes by default. Need to collect feedback prior
    // to move forward https://github.com/markdown-it/linkify-it/issues/1

    if (!match.schema) { match.url = 'http://' + match.url; }

    if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
      match.url = 'mailto:' + match.url;
    }
  };

  /**
   * LinkifyIt#onCompile()
   *
   * Override to modify basic RegExp-s.
   **/
  LinkifyIt.prototype.onCompile = function onCompile () {
  };

  /** Highest positive signed 32-bit float value */
  const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

  /** Bootstring parameters */
  const base = 36;
  const tMin = 1;
  const tMax = 26;
  const skew = 38;
  const damp = 700;
  const initialBias = 72;
  const initialN = 128; // 0x80
  const delimiter = '-'; // '\x2D'

  /** Regular expressions */
  const regexPunycode = /^xn--/;
  const regexNonASCII = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
  const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

  /** Error messages */
  const errors = {
  	'overflow': 'Overflow: input needs wider integers to process',
  	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  	'invalid-input': 'Invalid input'
  };

  /** Convenience shortcuts */
  const baseMinusTMin = base - tMin;
  const floor = Math.floor;
  const stringFromCharCode = String.fromCharCode;

  /*--------------------------------------------------------------------------*/

  /**
   * A generic error utility function.
   * @private
   * @param {String} type The error type.
   * @returns {Error} Throws a `RangeError` with the applicable error message.
   */
  function error(type) {
  	throw new RangeError(errors[type]);
  }

  /**
   * A generic `Array#map` utility function.
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function that gets called for every array
   * item.
   * @returns {Array} A new array of values returned by the callback function.
   */
  function map(array, callback) {
  	const result = [];
  	let length = array.length;
  	while (length--) {
  		result[length] = callback(array[length]);
  	}
  	return result;
  }

  /**
   * A simple `Array#map`-like wrapper to work with domain name strings or email
   * addresses.
   * @private
   * @param {String} domain The domain name or email address.
   * @param {Function} callback The function that gets called for every
   * character.
   * @returns {String} A new string of characters returned by the callback
   * function.
   */
  function mapDomain(domain, callback) {
  	const parts = domain.split('@');
  	let result = '';
  	if (parts.length > 1) {
  		// In email addresses, only the domain name should be punycoded. Leave
  		// the local part (i.e. everything up to `@`) intact.
  		result = parts[0] + '@';
  		domain = parts[1];
  	}
  	// Avoid `split(regex)` for IE8 compatibility. See #17.
  	domain = domain.replace(regexSeparators, '\x2E');
  	const labels = domain.split('.');
  	const encoded = map(labels, callback).join('.');
  	return result + encoded;
  }

  /**
   * Creates an array containing the numeric code points of each Unicode
   * character in the string. While JavaScript uses UCS-2 internally,
   * this function will convert a pair of surrogate halves (each of which
   * UCS-2 exposes as separate characters) into a single code point,
   * matching UTF-16.
   * @see `punycode.ucs2.encode`
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode.ucs2
   * @name decode
   * @param {String} string The Unicode input string (UCS-2).
   * @returns {Array} The new array of code points.
   */
  function ucs2decode(string) {
  	const output = [];
  	let counter = 0;
  	const length = string.length;
  	while (counter < length) {
  		const value = string.charCodeAt(counter++);
  		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
  			// It's a high surrogate, and there is a next character.
  			const extra = string.charCodeAt(counter++);
  			if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
  				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
  			} else {
  				// It's an unmatched surrogate; only append this code unit, in case the
  				// next code unit is the high surrogate of a surrogate pair.
  				output.push(value);
  				counter--;
  			}
  		} else {
  			output.push(value);
  		}
  	}
  	return output;
  }

  /**
   * Creates a string based on an array of numeric code points.
   * @see `punycode.ucs2.decode`
   * @memberOf punycode.ucs2
   * @name encode
   * @param {Array} codePoints The array of numeric code points.
   * @returns {String} The new Unicode string (UCS-2).
   */
  const ucs2encode = codePoints => String.fromCodePoint(...codePoints);

  /**
   * Converts a basic code point into a digit/integer.
   * @see `digitToBasic()`
   * @private
   * @param {Number} codePoint The basic numeric code point value.
   * @returns {Number} The numeric value of a basic code point (for use in
   * representing integers) in the range `0` to `base - 1`, or `base` if
   * the code point does not represent a value.
   */
  const basicToDigit = function(codePoint) {
  	if (codePoint >= 0x30 && codePoint < 0x3A) {
  		return 26 + (codePoint - 0x30);
  	}
  	if (codePoint >= 0x41 && codePoint < 0x5B) {
  		return codePoint - 0x41;
  	}
  	if (codePoint >= 0x61 && codePoint < 0x7B) {
  		return codePoint - 0x61;
  	}
  	return base;
  };

  /**
   * Converts a digit/integer into a basic code point.
   * @see `basicToDigit()`
   * @private
   * @param {Number} digit The numeric value of a basic code point.
   * @returns {Number} The basic code point whose value (when used for
   * representing integers) is `digit`, which needs to be in the range
   * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
   * used; else, the lowercase form is used. The behavior is undefined
   * if `flag` is non-zero and `digit` has no uppercase form.
   */
  const digitToBasic = function(digit, flag) {
  	//  0..25 map to ASCII a..z or A..Z
  	// 26..35 map to ASCII 0..9
  	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  };

  /**
   * Bias adaptation function as per section 3.4 of RFC 3492.
   * https://tools.ietf.org/html/rfc3492#section-3.4
   * @private
   */
  const adapt = function(delta, numPoints, firstTime) {
  	let k = 0;
  	delta = firstTime ? floor(delta / damp) : delta >> 1;
  	delta += floor(delta / numPoints);
  	for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
  		delta = floor(delta / baseMinusTMin);
  	}
  	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
  };

  /**
   * Converts a Punycode string of ASCII-only symbols to a string of Unicode
   * symbols.
   * @memberOf punycode
   * @param {String} input The Punycode string of ASCII-only symbols.
   * @returns {String} The resulting string of Unicode symbols.
   */
  const decode = function(input) {
  	// Don't use UCS-2.
  	const output = [];
  	const inputLength = input.length;
  	let i = 0;
  	let n = initialN;
  	let bias = initialBias;

  	// Handle the basic code points: let `basic` be the number of input code
  	// points before the last delimiter, or `0` if there is none, then copy
  	// the first basic code points to the output.

  	let basic = input.lastIndexOf(delimiter);
  	if (basic < 0) {
  		basic = 0;
  	}

  	for (let j = 0; j < basic; ++j) {
  		// if it's not a basic code point
  		if (input.charCodeAt(j) >= 0x80) {
  			error('not-basic');
  		}
  		output.push(input.charCodeAt(j));
  	}

  	// Main decoding loop: start just after the last delimiter if any basic code
  	// points were copied; start at the beginning otherwise.

  	for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

  		// `index` is the index of the next character to be consumed.
  		// Decode a generalized variable-length integer into `delta`,
  		// which gets added to `i`. The overflow checking is easier
  		// if we increase `i` as we go, then subtract off its starting
  		// value at the end to obtain `delta`.
  		const oldi = i;
  		for (let w = 1, k = base; /* no condition */; k += base) {

  			if (index >= inputLength) {
  				error('invalid-input');
  			}

  			const digit = basicToDigit(input.charCodeAt(index++));

  			if (digit >= base) {
  				error('invalid-input');
  			}
  			if (digit > floor((maxInt - i) / w)) {
  				error('overflow');
  			}

  			i += digit * w;
  			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

  			if (digit < t) {
  				break;
  			}

  			const baseMinusT = base - t;
  			if (w > floor(maxInt / baseMinusT)) {
  				error('overflow');
  			}

  			w *= baseMinusT;

  		}

  		const out = output.length + 1;
  		bias = adapt(i - oldi, out, oldi == 0);

  		// `i` was supposed to wrap around from `out` to `0`,
  		// incrementing `n` each time, so we'll fix that now:
  		if (floor(i / out) > maxInt - n) {
  			error('overflow');
  		}

  		n += floor(i / out);
  		i %= out;

  		// Insert `n` at position `i` of the output.
  		output.splice(i++, 0, n);

  	}

  	return String.fromCodePoint(...output);
  };

  /**
   * Converts a string of Unicode symbols (e.g. a domain name label) to a
   * Punycode string of ASCII-only symbols.
   * @memberOf punycode
   * @param {String} input The string of Unicode symbols.
   * @returns {String} The resulting Punycode string of ASCII-only symbols.
   */
  const encode = function(input) {
  	const output = [];

  	// Convert the input in UCS-2 to an array of Unicode code points.
  	input = ucs2decode(input);

  	// Cache the length.
  	const inputLength = input.length;

  	// Initialize the state.
  	let n = initialN;
  	let delta = 0;
  	let bias = initialBias;

  	// Handle the basic code points.
  	for (const currentValue of input) {
  		if (currentValue < 0x80) {
  			output.push(stringFromCharCode(currentValue));
  		}
  	}

  	const basicLength = output.length;
  	let handledCPCount = basicLength;

  	// `handledCPCount` is the number of code points that have been handled;
  	// `basicLength` is the number of basic code points.

  	// Finish the basic string with a delimiter unless it's empty.
  	if (basicLength) {
  		output.push(delimiter);
  	}

  	// Main encoding loop:
  	while (handledCPCount < inputLength) {

  		// All non-basic code points < n have been handled already. Find the next
  		// larger one:
  		let m = maxInt;
  		for (const currentValue of input) {
  			if (currentValue >= n && currentValue < m) {
  				m = currentValue;
  			}
  		}

  		// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
  		// but guard against overflow.
  		const handledCPCountPlusOne = handledCPCount + 1;
  		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
  			error('overflow');
  		}

  		delta += (m - n) * handledCPCountPlusOne;
  		n = m;

  		for (const currentValue of input) {
  			if (currentValue < n && ++delta > maxInt) {
  				error('overflow');
  			}
  			if (currentValue === n) {
  				// Represent delta as a generalized variable-length integer.
  				let q = delta;
  				for (let k = base; /* no condition */; k += base) {
  					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
  					if (q < t) {
  						break;
  					}
  					const qMinusT = q - t;
  					const baseMinusT = base - t;
  					output.push(
  						stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
  					);
  					q = floor(qMinusT / baseMinusT);
  				}

  				output.push(stringFromCharCode(digitToBasic(q, 0)));
  				bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
  				delta = 0;
  				++handledCPCount;
  			}
  		}

  		++delta;
  		++n;

  	}
  	return output.join('');
  };

  /**
   * Converts a Punycode string representing a domain name or an email address
   * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
   * it doesn't matter if you call it on a string that has already been
   * converted to Unicode.
   * @memberOf punycode
   * @param {String} input The Punycoded domain name or email address to
   * convert to Unicode.
   * @returns {String} The Unicode representation of the given Punycode
   * string.
   */
  const toUnicode = function(input) {
  	return mapDomain(input, function(string) {
  		return regexPunycode.test(string)
  			? decode(string.slice(4).toLowerCase())
  			: string;
  	});
  };

  /**
   * Converts a Unicode string representing a domain name or an email address to
   * Punycode. Only the non-ASCII parts of the domain name will be converted,
   * i.e. it doesn't matter if you call it with a domain that's already in
   * ASCII.
   * @memberOf punycode
   * @param {String} input The domain name or email address to convert, as a
   * Unicode string.
   * @returns {String} The Punycode representation of the given domain name or
   * email address.
   */
  const toASCII = function(input) {
  	return mapDomain(input, function(string) {
  		return regexNonASCII.test(string)
  			? 'xn--' + encode(string)
  			: string;
  	});
  };

  /*--------------------------------------------------------------------------*/

  /** Define the public API */
  const punycode = {
  	/**
  	 * A string representing the current Punycode.js version number.
  	 * @memberOf punycode
  	 * @type String
  	 */
  	'version': '2.3.1',
  	/**
  	 * An object of methods to convert from JavaScript's internal character
  	 * representation (UCS-2) to Unicode code points, and back.
  	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
  	 * @memberOf punycode
  	 * @type Object
  	 */
  	'ucs2': {
  		'decode': ucs2decode,
  		'encode': ucs2encode
  	},
  	'decode': decode,
  	'encode': encode,
  	'toASCII': toASCII,
  	'toUnicode': toUnicode
  };

  // markdown-it default options

  var cfg_default = {
    options: {
      // Enable HTML tags in source
      html: false,

      // Use '/' to close single tags (<br />)
      xhtmlOut: false,

      // Convert '\n' in paragraphs into <br>
      breaks: false,

      // CSS language prefix for fenced blocks
      langPrefix: 'language-',

      // autoconvert URL-like texts to links
      linkify: false,

      // Enable some language-neutral replacements + quotes beautification
      typographer: false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,

      // Internal protection, recursion limit
      maxNesting: 100
    },

    components: {
      core: {},
      block: {},
      inline: {}
    }
  };

  // "Zero" preset, with nothing enabled. Useful for manual configuring of simple
  // modes. For example, to parse bold/italic only.

  var cfg_zero = {
    options: {
      // Enable HTML tags in source
      html: false,

      // Use '/' to close single tags (<br />)
      xhtmlOut: false,

      // Convert '\n' in paragraphs into <br>
      breaks: false,

      // CSS language prefix for fenced blocks
      langPrefix: 'language-',

      // autoconvert URL-like texts to links
      linkify: false,

      // Enable some language-neutral replacements + quotes beautification
      typographer: false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,

      // Internal protection, recursion limit
      maxNesting: 20
    },

    components: {

      core: {
        rules: [
          'normalize',
          'block',
          'inline',
          'text_join'
        ]
      },

      block: {
        rules: [
          'paragraph'
        ]
      },

      inline: {
        rules: [
          'text'
        ],
        rules2: [
          'balance_pairs',
          'fragments_join'
        ]
      }
    }
  };

  // Commonmark default options

  var cfg_commonmark = {
    options: {
      // Enable HTML tags in source
      html: true,

      // Use '/' to close single tags (<br />)
      xhtmlOut: true,

      // Convert '\n' in paragraphs into <br>
      breaks: false,

      // CSS language prefix for fenced blocks
      langPrefix: 'language-',

      // autoconvert URL-like texts to links
      linkify: false,

      // Enable some language-neutral replacements + quotes beautification
      typographer: false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,

      // Internal protection, recursion limit
      maxNesting: 20
    },

    components: {

      core: {
        rules: [
          'normalize',
          'block',
          'inline',
          'text_join'
        ]
      },

      block: {
        rules: [
          'blockquote',
          'code',
          'fence',
          'heading',
          'hr',
          'html_block',
          'lheading',
          'list',
          'reference',
          'paragraph'
        ]
      },

      inline: {
        rules: [
          'autolink',
          'backticks',
          'emphasis',
          'entity',
          'escape',
          'html_inline',
          'image',
          'link',
          'newline',
          'text'
        ],
        rules2: [
          'balance_pairs',
          'emphasis',
          'fragments_join'
        ]
      }
    }
  };

  // Main parser class


  const config = {
    default: cfg_default,
    zero: cfg_zero,
    commonmark: cfg_commonmark
  };

  //
  // This validator can prohibit more than really needed to prevent XSS. It's a
  // tradeoff to keep code simple and to be secure by default.
  //
  // If you need different setup - override validator method as you wish. Or
  // replace it with dummy function and use external sanitizer.
  //

  const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
  const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

  function validateLink (url) {
    // url should be normalized at this point, and existing entities are decoded
    const str = url.trim().toLowerCase();

    return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true
  }

  const RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:'];

  function normalizeLink (url) {
    const parsed = urlParse(url, true);

    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      //
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      //
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toASCII(parsed.hostname);
        } catch (er) { /**/ }
      }
    }

    return encode$1(format(parsed))
  }

  function normalizeLinkText (url) {
    const parsed = urlParse(url, true);

    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      //
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      //
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toUnicode(parsed.hostname);
        } catch (er) { /**/ }
      }
    }

    // add '%' to exclude list because of https://github.com/markdown-it/markdown-it/issues/720
    return decode$1(format(parsed), decode$1.defaultChars + '%')
  }

  /**
   * class MarkdownIt
   *
   * Main parser/renderer class.
   *
   * ##### Usage
   *
   * ```javascript
   * // node.js, "classic" way:
   * var MarkdownIt = require('markdown-it'),
   *     md = new MarkdownIt();
   * var result = md.render('# markdown-it rulezz!');
   *
   * // node.js, the same, but with sugar:
   * var md = require('markdown-it')();
   * var result = md.render('# markdown-it rulezz!');
   *
   * // browser without AMD, added to "window" on script load
   * // Note, there are no dash.
   * var md = window.markdownit();
   * var result = md.render('# markdown-it rulezz!');
   * ```
   *
   * Single line rendering, without paragraph wrap:
   *
   * ```javascript
   * var md = require('markdown-it')();
   * var result = md.renderInline('__markdown-it__ rulezz!');
   * ```
   **/

  /**
   * new MarkdownIt([presetName, options])
   * - presetName (String): optional, `commonmark` / `zero`
   * - options (Object)
   *
   * Creates parser instanse with given config. Can be called without `new`.
   *
   * ##### presetName
   *
   * MarkdownIt provides named presets as a convenience to quickly
   * enable/disable active syntax rules and options for common use cases.
   *
   * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.mjs) -
   *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
   * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.mjs) -
   *   similar to GFM, used when no preset name given. Enables all available rules,
   *   but still without html, typographer & autolinker.
   * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.mjs) -
   *   all rules disabled. Useful to quickly setup your config via `.enable()`.
   *   For example, when you need only `bold` and `italic` markup and nothing else.
   *
   * ##### options:
   *
   * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
   *   That's not safe! You may need external sanitizer to protect output from XSS.
   *   It's better to extend features via plugins, instead of enabling HTML.
   * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
   *   (`<br />`). This is needed only for full CommonMark compatibility. In real
   *   world you will need HTML output.
   * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
   * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
   *   Can be useful for external highlighters.
   * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
   * - __typographer__  - `false`. Set `true` to enable [some language-neutral
   *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs) +
   *   quotes beautification (smartquotes).
   * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
   *   pairs, when typographer enabled and smartquotes on. For example, you can
   *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
   *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
   * - __highlight__ - `null`. Highlighter function for fenced code blocks.
   *   Highlighter `function (str, lang)` should return escaped HTML. It can also
   *   return empty string if the source was not changed and should be escaped
   *   externaly. If result starts with <pre... internal wrapper is skipped.
   *
   * ##### Example
   *
   * ```javascript
   * // commonmark mode
   * var md = require('markdown-it')('commonmark');
   *
   * // default mode
   * var md = require('markdown-it')();
   *
   * // enable everything
   * var md = require('markdown-it')({
   *   html: true,
   *   linkify: true,
   *   typographer: true
   * });
   * ```
   *
   * ##### Syntax highlighting
   *
   * ```js
   * var hljs = require('highlight.js') // https://highlightjs.org/
   *
   * var md = require('markdown-it')({
   *   highlight: function (str, lang) {
   *     if (lang && hljs.getLanguage(lang)) {
   *       try {
   *         return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
   *       } catch (__) {}
   *     }
   *
   *     return ''; // use external default escaping
   *   }
   * });
   * ```
   *
   * Or with full wrapper override (if you need assign class to `<pre>` or `<code>`):
   *
   * ```javascript
   * var hljs = require('highlight.js') // https://highlightjs.org/
   *
   * // Actual default values
   * var md = require('markdown-it')({
   *   highlight: function (str, lang) {
   *     if (lang && hljs.getLanguage(lang)) {
   *       try {
   *         return '<pre><code class="hljs">' +
   *                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
   *                '</code></pre>';
   *       } catch (__) {}
   *     }
   *
   *     return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
   *   }
   * });
   * ```
   *
   **/
  function MarkdownIt (presetName, options) {
    if (!(this instanceof MarkdownIt)) {
      return new MarkdownIt(presetName, options)
    }

    if (!options) {
      if (!isString$1(presetName)) {
        options = presetName || {};
        presetName = 'default';
      }
    }

    /**
     * MarkdownIt#inline -> ParserInline
     *
     * Instance of [[ParserInline]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/
    this.inline = new ParserInline();

    /**
     * MarkdownIt#block -> ParserBlock
     *
     * Instance of [[ParserBlock]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/
    this.block = new ParserBlock();

    /**
     * MarkdownIt#core -> Core
     *
     * Instance of [[Core]] chain executor. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/
    this.core = new Core();

    /**
     * MarkdownIt#renderer -> Renderer
     *
     * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
     * rules for new token types, generated by plugins.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * function myToken(tokens, idx, options, env, self) {
     *   //...
     *   return result;
     * };
     *
     * md.renderer.rules['my_token'] = myToken
     * ```
     *
     * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs).
     **/
    this.renderer = new Renderer();

    /**
     * MarkdownIt#linkify -> LinkifyIt
     *
     * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
     * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.mjs)
     * rule.
     **/
    this.linkify = new LinkifyIt();

    /**
     * MarkdownIt#validateLink(url) -> Boolean
     *
     * Link validation function. CommonMark allows too much in links. By default
     * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
     * except some embedded image types.
     *
     * You can change this behaviour:
     *
     * ```javascript
     * var md = require('markdown-it')();
     * // enable everything
     * md.validateLink = function () { return true; }
     * ```
     **/
    this.validateLink = validateLink;

    /**
     * MarkdownIt#normalizeLink(url) -> String
     *
     * Function used to encode link url to a machine-readable format,
     * which includes url-encoding, punycode, etc.
     **/
    this.normalizeLink = normalizeLink;

    /**
     * MarkdownIt#normalizeLinkText(url) -> String
     *
     * Function used to decode link url to a human-readable format`
     **/
    this.normalizeLinkText = normalizeLinkText;

    // Expose utils & helpers for easy acces from plugins

    /**
     * MarkdownIt#utils -> utils
     *
     * Assorted utility functions, useful to write plugins. See details
     * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.mjs).
     **/
    this.utils = utils;

    /**
     * MarkdownIt#helpers -> helpers
     *
     * Link components parser functions, useful to write plugins. See details
     * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
     **/
    this.helpers = assign$1({}, helpers);

    this.options = {};
    this.configure(presetName);

    if (options) { this.set(options); }
  }

  /** chainable
   * MarkdownIt.set(options)
   *
   * Set parser options (in the same format as in constructor). Probably, you
   * will never need it, but you can change options after constructor call.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .set({ html: true, breaks: true })
   *             .set({ typographer, true });
   * ```
   *
   * __Note:__ To achieve the best possible performance, don't modify a
   * `markdown-it` instance options on the fly. If you need multiple configurations
   * it's best to create multiple instances and initialize each with separate
   * config.
   **/
  MarkdownIt.prototype.set = function (options) {
    assign$1(this.options, options);
    return this
  };

  /** chainable, internal
   * MarkdownIt.configure(presets)
   *
   * Batch load of all options and compenent settings. This is internal method,
   * and you probably will not need it. But if you will - see available presets
   * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
   *
   * We strongly recommend to use presets instead of direct config loads. That
   * will give better compatibility with next versions.
   **/
  MarkdownIt.prototype.configure = function (presets) {
    const self = this;

    if (isString$1(presets)) {
      const presetName = presets;
      presets = config[presetName];
      if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name') }
    }

    if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty') }

    if (presets.options) { self.set(presets.options); }

    if (presets.components) {
      Object.keys(presets.components).forEach(function (name) {
        if (presets.components[name].rules) {
          self[name].ruler.enableOnly(presets.components[name].rules);
        }
        if (presets.components[name].rules2) {
          self[name].ruler2.enableOnly(presets.components[name].rules2);
        }
      });
    }
    return this
  };

  /** chainable
   * MarkdownIt.enable(list, ignoreInvalid)
   * - list (String|Array): rule name or list of rule names to enable
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable list or rules. It will automatically find appropriate components,
   * containing rules with given names. If rule not found, and `ignoreInvalid`
   * not set - throws exception.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .enable(['sub', 'sup'])
   *             .disable('smartquotes');
   * ```
   **/
  MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
    let result = [];

    if (!Array.isArray(list)) { list = [list]; }

    ['core', 'block', 'inline'].forEach(function (chain) {
      result = result.concat(this[chain].ruler.enable(list, true));
    }, this);

    result = result.concat(this.inline.ruler2.enable(list, true));

    const missed = list.filter(function (name) { return result.indexOf(name) < 0 });

    if (missed.length && !ignoreInvalid) {
      throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed)
    }

    return this
  };

  /** chainable
   * MarkdownIt.disable(list, ignoreInvalid)
   * - list (String|Array): rule name or list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * The same as [[MarkdownIt.enable]], but turn specified rules off.
   **/
  MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
    let result = [];

    if (!Array.isArray(list)) { list = [list]; }

    ['core', 'block', 'inline'].forEach(function (chain) {
      result = result.concat(this[chain].ruler.disable(list, true));
    }, this);

    result = result.concat(this.inline.ruler2.disable(list, true));

    const missed = list.filter(function (name) { return result.indexOf(name) < 0 });

    if (missed.length && !ignoreInvalid) {
      throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed)
    }
    return this
  };

  /** chainable
   * MarkdownIt.use(plugin, params)
   *
   * Load specified plugin with given params into current parser instance.
   * It's just a sugar to call `plugin(md, params)` with curring.
   *
   * ##### Example
   *
   * ```javascript
   * var iterator = require('markdown-it-for-inline');
   * var md = require('markdown-it')()
   *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
   *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
   *             });
   * ```
   **/
  MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
    const args = [this].concat(Array.prototype.slice.call(arguments, 1));
    plugin.apply(plugin, args);
    return this
  };

  /** internal
   * MarkdownIt.parse(src, env) -> Array
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Parse input string and return list of block tokens (special token type
   * "inline" will contain list of inline tokens). You should not call this
   * method directly, until you write custom renderer (for example, to produce
   * AST).
   *
   * `env` is used to pass data between "distributed" rules and return additional
   * metadata like reference info, needed for the renderer. It also can be used to
   * inject data in specific cases. Usually, you will be ok to pass `{}`,
   * and then pass updated object to renderer.
   **/
  MarkdownIt.prototype.parse = function (src, env) {
    if (typeof src !== 'string') {
      throw new Error('Input data should be a String')
    }

    const state = new this.core.State(src, this, env);

    this.core.process(state);

    return state.tokens
  };

  /**
   * MarkdownIt.render(src [, env]) -> String
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Render markdown string into html. It does all magic for you :).
   *
   * `env` can be used to inject additional metadata (`{}` by default).
   * But you will not need it with high probability. See also comment
   * in [[MarkdownIt.parse]].
   **/
  MarkdownIt.prototype.render = function (src, env) {
    env = env || {};

    return this.renderer.render(this.parse(src, env), this.options, env)
  };

  /** internal
   * MarkdownIt.parseInline(src, env) -> Array
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
   * block tokens list with the single `inline` element, containing parsed inline
   * tokens in `children` property. Also updates `env` object.
   **/
  MarkdownIt.prototype.parseInline = function (src, env) {
    const state = new this.core.State(src, this, env);

    state.inlineMode = true;
    this.core.process(state);

    return state.tokens
  };

  /**
   * MarkdownIt.renderInline(src [, env]) -> String
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
   * will NOT be wrapped into `<p>` tags.
   **/
  MarkdownIt.prototype.renderInline = function (src, env) {
    env = env || {};

    return this.renderer.render(this.parseInline(src, env), this.options, env)
  };

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var markdownItFootnote$1;
  var hasRequiredMarkdownItFootnote;

  function requireMarkdownItFootnote () {
  	if (hasRequiredMarkdownItFootnote) return markdownItFootnote$1;
  	hasRequiredMarkdownItFootnote = 1;

  	////////////////////////////////////////////////////////////////////////////////
  	// Renderer partials

  	function render_footnote_anchor_name(tokens, idx, options, env/*, slf*/) {
  	  var n = Number(tokens[idx].meta.id + 1).toString();
  	  var prefix = '';

  	  if (typeof env.docId === 'string') {
  	    prefix = '-' + env.docId + '-';
  	  }

  	  return prefix + n;
  	}

  	function render_footnote_caption(tokens, idx/*, options, env, slf*/) {
  	  var n = Number(tokens[idx].meta.id + 1).toString();

  	  if (tokens[idx].meta.subId > 0) {
  	    n += ':' + tokens[idx].meta.subId;
  	  }

  	  return '[' + n + ']';
  	}

  	function render_footnote_ref(tokens, idx, options, env, slf) {
  	  var id      = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  	  var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
  	  var refid   = id;

  	  if (tokens[idx].meta.subId > 0) {
  	    refid += ':' + tokens[idx].meta.subId;
  	  }

  	  return '<sup class="footnote-ref"><a href="#fn' + id + '" id="fnref' + refid + '">' + caption + '</a></sup>';
  	}

  	function render_footnote_block_open(tokens, idx, options) {
  	  return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') +
  	         '<section class="footnotes">\n' +
  	         '<ol class="footnotes-list">\n';
  	}

  	function render_footnote_block_close() {
  	  return '</ol>\n</section>\n';
  	}

  	function render_footnote_open(tokens, idx, options, env, slf) {
  	  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  	  if (tokens[idx].meta.subId > 0) {
  	    id += ':' + tokens[idx].meta.subId;
  	  }

  	  return '<li id="fn' + id + '" class="footnote-item">';
  	}

  	function render_footnote_close() {
  	  return '</li>\n';
  	}

  	function render_footnote_anchor(tokens, idx, options, env, slf) {
  	  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  	  if (tokens[idx].meta.subId > 0) {
  	    id += ':' + tokens[idx].meta.subId;
  	  }

  	  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  	  return ' <a href="#fnref' + id + '" class="footnote-backref">\u21a9\uFE0E</a>';
  	}


  	markdownItFootnote$1 = function footnote_plugin(md) {
  	  var parseLinkLabel = md.helpers.parseLinkLabel,
  	      isSpace = md.utils.isSpace;

  	  md.renderer.rules.footnote_ref          = render_footnote_ref;
  	  md.renderer.rules.footnote_block_open   = render_footnote_block_open;
  	  md.renderer.rules.footnote_block_close  = render_footnote_block_close;
  	  md.renderer.rules.footnote_open         = render_footnote_open;
  	  md.renderer.rules.footnote_close        = render_footnote_close;
  	  md.renderer.rules.footnote_anchor       = render_footnote_anchor;

  	  // helpers (only used in other rules, no tokens are attached to those)
  	  md.renderer.rules.footnote_caption      = render_footnote_caption;
  	  md.renderer.rules.footnote_anchor_name  = render_footnote_anchor_name;

  	  // Process footnote block definition
  	  function footnote_def(state, startLine, endLine, silent) {
  	    var oldBMark, oldTShift, oldSCount, oldParentType, pos, label, token,
  	        initial, offset, ch, posAfterColon,
  	        start = state.bMarks[startLine] + state.tShift[startLine],
  	        max = state.eMarks[startLine];

  	    // line should be at least 5 chars - "[^x]:"
  	    if (start + 4 > max) { return false; }

  	    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
  	    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

  	    for (pos = start + 2; pos < max; pos++) {
  	      if (state.src.charCodeAt(pos) === 0x20) { return false; }
  	      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
  	        break;
  	      }
  	    }

  	    if (pos === start + 2) { return false; } // no empty footnote labels
  	    if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) { return false; }
  	    if (silent) { return true; }
  	    pos++;

  	    if (!state.env.footnotes) { state.env.footnotes = {}; }
  	    if (!state.env.footnotes.refs) { state.env.footnotes.refs = {}; }
  	    label = state.src.slice(start + 2, pos - 2);
  	    state.env.footnotes.refs[':' + label] = -1;

  	    token       = new state.Token('footnote_reference_open', '', 1);
  	    token.meta  = { label: label };
  	    token.level = state.level++;
  	    state.tokens.push(token);

  	    oldBMark = state.bMarks[startLine];
  	    oldTShift = state.tShift[startLine];
  	    oldSCount = state.sCount[startLine];
  	    oldParentType = state.parentType;

  	    posAfterColon = pos;
  	    initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

  	    while (pos < max) {
  	      ch = state.src.charCodeAt(pos);

  	      if (isSpace(ch)) {
  	        if (ch === 0x09) {
  	          offset += 4 - offset % 4;
  	        } else {
  	          offset++;
  	        }
  	      } else {
  	        break;
  	      }

  	      pos++;
  	    }

  	    state.tShift[startLine] = pos - posAfterColon;
  	    state.sCount[startLine] = offset - initial;

  	    state.bMarks[startLine] = posAfterColon;
  	    state.blkIndent += 4;
  	    state.parentType = 'footnote';

  	    if (state.sCount[startLine] < state.blkIndent) {
  	      state.sCount[startLine] += state.blkIndent;
  	    }

  	    state.md.block.tokenize(state, startLine, endLine, true);

  	    state.parentType = oldParentType;
  	    state.blkIndent -= 4;
  	    state.tShift[startLine] = oldTShift;
  	    state.sCount[startLine] = oldSCount;
  	    state.bMarks[startLine] = oldBMark;

  	    token       = new state.Token('footnote_reference_close', '', -1);
  	    token.level = --state.level;
  	    state.tokens.push(token);

  	    return true;
  	  }

  	  // Process inline footnotes (^[...])
  	  function footnote_inline(state, silent) {
  	    var labelStart,
  	        labelEnd,
  	        footnoteId,
  	        token,
  	        tokens,
  	        max = state.posMax,
  	        start = state.pos;

  	    if (start + 2 >= max) { return false; }
  	    if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
  	    if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }

  	    labelStart = start + 2;
  	    labelEnd = parseLinkLabel(state, start + 1);

  	    // parser failed to find ']', so it's not a valid note
  	    if (labelEnd < 0) { return false; }

  	    // We found the end of the link, and know for a fact it's a valid link;
  	    // so all that's left to do is to call tokenizer.
  	    //
  	    if (!silent) {
  	      if (!state.env.footnotes) { state.env.footnotes = {}; }
  	      if (!state.env.footnotes.list) { state.env.footnotes.list = []; }
  	      footnoteId = state.env.footnotes.list.length;

  	      state.md.inline.parse(
  	        state.src.slice(labelStart, labelEnd),
  	        state.md,
  	        state.env,
  	        tokens = []
  	      );

  	      token      = state.push('footnote_ref', '', 0);
  	      token.meta = { id: footnoteId };

  	      state.env.footnotes.list[footnoteId] = {
  	        content: state.src.slice(labelStart, labelEnd),
  	        tokens: tokens
  	      };
  	    }

  	    state.pos = labelEnd + 1;
  	    state.posMax = max;
  	    return true;
  	  }

  	  // Process footnote references ([^...])
  	  function footnote_ref(state, silent) {
  	    var label,
  	        pos,
  	        footnoteId,
  	        footnoteSubId,
  	        token,
  	        max = state.posMax,
  	        start = state.pos;

  	    // should be at least 4 chars - "[^x]"
  	    if (start + 3 > max) { return false; }

  	    if (!state.env.footnotes || !state.env.footnotes.refs) { return false; }
  	    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
  	    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

  	    for (pos = start + 2; pos < max; pos++) {
  	      if (state.src.charCodeAt(pos) === 0x20) { return false; }
  	      if (state.src.charCodeAt(pos) === 0x0A) { return false; }
  	      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
  	        break;
  	      }
  	    }

  	    if (pos === start + 2) { return false; } // no empty footnote labels
  	    if (pos >= max) { return false; }
  	    pos++;

  	    label = state.src.slice(start + 2, pos - 1);
  	    if (typeof state.env.footnotes.refs[':' + label] === 'undefined') { return false; }

  	    if (!silent) {
  	      if (!state.env.footnotes.list) { state.env.footnotes.list = []; }

  	      if (state.env.footnotes.refs[':' + label] < 0) {
  	        footnoteId = state.env.footnotes.list.length;
  	        state.env.footnotes.list[footnoteId] = { label: label, count: 0 };
  	        state.env.footnotes.refs[':' + label] = footnoteId;
  	      } else {
  	        footnoteId = state.env.footnotes.refs[':' + label];
  	      }

  	      footnoteSubId = state.env.footnotes.list[footnoteId].count;
  	      state.env.footnotes.list[footnoteId].count++;

  	      token      = state.push('footnote_ref', '', 0);
  	      token.meta = { id: footnoteId, subId: footnoteSubId, label: label };
  	    }

  	    state.pos = pos;
  	    state.posMax = max;
  	    return true;
  	  }

  	  // Glue footnote tokens to end of token stream
  	  function footnote_tail(state) {
  	    var i, l, j, t, lastParagraph, list, token, tokens, current, currentLabel,
  	        insideRef = false,
  	        refTokens = {};

  	    if (!state.env.footnotes) { return; }

  	    state.tokens = state.tokens.filter(function (tok) {
  	      if (tok.type === 'footnote_reference_open') {
  	        insideRef = true;
  	        current = [];
  	        currentLabel = tok.meta.label;
  	        return false;
  	      }
  	      if (tok.type === 'footnote_reference_close') {
  	        insideRef = false;
  	        // prepend ':' to avoid conflict with Object.prototype members
  	        refTokens[':' + currentLabel] = current;
  	        return false;
  	      }
  	      if (insideRef) { current.push(tok); }
  	      return !insideRef;
  	    });

  	    if (!state.env.footnotes.list) { return; }
  	    list = state.env.footnotes.list;

  	    token = new state.Token('footnote_block_open', '', 1);
  	    state.tokens.push(token);

  	    for (i = 0, l = list.length; i < l; i++) {
  	      token      = new state.Token('footnote_open', '', 1);
  	      token.meta = { id: i, label: list[i].label };
  	      state.tokens.push(token);

  	      if (list[i].tokens) {
  	        tokens = [];

  	        token          = new state.Token('paragraph_open', 'p', 1);
  	        token.block    = true;
  	        tokens.push(token);

  	        token          = new state.Token('inline', '', 0);
  	        token.children = list[i].tokens;
  	        token.content  = list[i].content;
  	        tokens.push(token);

  	        token          = new state.Token('paragraph_close', 'p', -1);
  	        token.block    = true;
  	        tokens.push(token);

  	      } else if (list[i].label) {
  	        tokens = refTokens[':' + list[i].label];
  	      }

  	      if (tokens) state.tokens = state.tokens.concat(tokens);
  	      if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
  	        lastParagraph = state.tokens.pop();
  	      } else {
  	        lastParagraph = null;
  	      }

  	      t = list[i].count > 0 ? list[i].count : 1;
  	      for (j = 0; j < t; j++) {
  	        token      = new state.Token('footnote_anchor', '', 0);
  	        token.meta = { id: i, subId: j, label: list[i].label };
  	        state.tokens.push(token);
  	      }

  	      if (lastParagraph) {
  	        state.tokens.push(lastParagraph);
  	      }

  	      token = new state.Token('footnote_close', '', -1);
  	      state.tokens.push(token);
  	    }

  	    token = new state.Token('footnote_block_close', '', -1);
  	    state.tokens.push(token);
  	  }

  	  md.block.ruler.before('reference', 'footnote_def', footnote_def, { alt: [ 'paragraph', 'reference' ] });
  	  md.inline.ruler.after('image', 'footnote_inline', footnote_inline);
  	  md.inline.ruler.after('footnote_inline', 'footnote_ref', footnote_ref);
  	  md.core.ruler.after('inline', 'footnote_tail', footnote_tail);
  	};
  	return markdownItFootnote$1;
  }

  var markdownItFootnoteExports = requireMarkdownItFootnote();
  var index$1 = /*@__PURE__*/getDefaultExportFromCjs(markdownItFootnoteExports);

  var markdownItFootnote = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    default: index$1
  }, [markdownItFootnoteExports]);

  function emoji_html (tokens, idx /*, options, env */) {
    return tokens[idx].content
  }

  // Emojies & shortcuts replacement logic.
  //
  // Note: In theory, it could be faster to parse :smile: in inline chain and
  // leave only shortcuts here. But, who care...
  //
  function create_rule (md, emojies, shortcuts, scanRE, replaceRE) {
    const arrayReplaceAt = md.utils.arrayReplaceAt;
    const ucm = md.utils.lib.ucmicro;
    const has = md.utils.has;
    const ZPCc = new RegExp([ucm.Z.source, ucm.P.source, ucm.Cc.source].join('|'));

    function splitTextToken (text, level, Token) {
      let last_pos = 0;
      const nodes = [];

      text.replace(replaceRE, function (match, offset, src) {
        let emoji_name;
        // Validate emoji name
        if (has(shortcuts, match)) {
          // replace shortcut with full name
          emoji_name = shortcuts[match];

          // Don't allow letters before any shortcut (as in no ":/" in http://)
          if (offset > 0 && !ZPCc.test(src[offset - 1])) return

          // Don't allow letters after any shortcut
          if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
            return
          }
        } else {
          emoji_name = match.slice(1, -1);
        }

        // Add new tokens to pending list
        if (offset > last_pos) {
          const token = new Token('text', '', 0);
          token.content = text.slice(last_pos, offset);
          nodes.push(token);
        }

        const token = new Token('emoji', '', 0);
        token.markup = emoji_name;
        token.content = emojies[emoji_name];
        nodes.push(token);

        last_pos = offset + match.length;
      });

      if (last_pos < text.length) {
        const token = new Token('text', '', 0);
        token.content = text.slice(last_pos);
        nodes.push(token);
      }

      return nodes
    }

    return function emoji_replace (state) {
      let token;
      const blockTokens = state.tokens;
      let autolinkLevel = 0;

      for (let j = 0, l = blockTokens.length; j < l; j++) {
        if (blockTokens[j].type !== 'inline') { continue }
        let tokens = blockTokens[j].children;

        // We scan from the end, to keep position when new tags added.
        // Use reversed logic in links start/end match
        for (let i = tokens.length - 1; i >= 0; i--) {
          token = tokens[i];

          if (token.type === 'link_open' || token.type === 'link_close') {
            if (token.info === 'auto') { autolinkLevel -= token.nesting; }
          }

          if (token.type === 'text' && autolinkLevel === 0 && scanRE.test(token.content)) {
            // replace current node
            blockTokens[j].children = tokens = arrayReplaceAt(
              tokens, i, splitTextToken(token.content, token.level, state.Token)
            );
          }
        }
      }
    }
  }

  // Convert input options to more useable format
  // and compile search regexp

  function quoteRE (str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&')
  }

  function normalize_opts (options) {
    let emojies = options.defs;

    // Filter emojies by whitelist, if needed
    if (options.enabled.length) {
      emojies = Object.keys(emojies).reduce((acc, key) => {
        if (options.enabled.indexOf(key) >= 0) acc[key] = emojies[key];
        return acc
      }, {});
    }

    // Flatten shortcuts to simple object: { alias: emoji_name }
    const shortcuts = Object.keys(options.shortcuts).reduce((acc, key) => {
      // Skip aliases for filtered emojies, to reduce regexp
      if (!emojies[key]) return acc

      if (Array.isArray(options.shortcuts[key])) {
        options.shortcuts[key].forEach(alias => { acc[alias] = key; });
        return acc
      }

      acc[options.shortcuts[key]] = key;
      return acc
    }, {});

    const keys = Object.keys(emojies);
    let names;

    // If no definitions are given, return empty regex to avoid replacements with 'undefined'.
    if (keys.length === 0) {
      names = '^$';
    } else {
      // Compile regexp
      names = keys
        .map(name => { return `:${name}:` })
        .concat(Object.keys(shortcuts))
        .sort()
        .reverse()
        .map(name => { return quoteRE(name) })
        .join('|');
    }
    const scanRE = RegExp(names);
    const replaceRE = RegExp(names, 'g');

    return {
      defs: emojies,
      shortcuts,
      scanRE,
      replaceRE
    }
  }

  function emoji_plugin$2 (md, options) {
    const defaults = {
      defs: {},
      shortcuts: {},
      enabled: []
    };

    const opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

    md.renderer.rules.emoji = emoji_html;

    md.core.ruler.after(
      'linkify',
      'emoji',
      create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
    );
  }

  // Generated, don't edit
  var emojies_defs$1 = {
    "grinning": "😀",
    "smiley": "😃",
    "smile": "😄",
    "grin": "😁",
    "laughing": "😆",
    "satisfied": "😆",
    "sweat_smile": "😅",
    "joy": "😂",
    "wink": "😉",
    "blush": "😊",
    "innocent": "😇",
    "heart_eyes": "😍",
    "kissing_heart": "😘",
    "kissing": "😗",
    "kissing_closed_eyes": "😚",
    "kissing_smiling_eyes": "😙",
    "yum": "😋",
    "stuck_out_tongue": "😛",
    "stuck_out_tongue_winking_eye": "😜",
    "stuck_out_tongue_closed_eyes": "😝",
    "neutral_face": "😐",
    "expressionless": "😑",
    "no_mouth": "😶",
    "smirk": "😏",
    "unamused": "😒",
    "relieved": "😌",
    "pensive": "😔",
    "sleepy": "😪",
    "sleeping": "😴",
    "mask": "😷",
    "dizzy_face": "😵",
    "sunglasses": "😎",
    "confused": "😕",
    "worried": "😟",
    "open_mouth": "😮",
    "hushed": "😯",
    "astonished": "😲",
    "flushed": "😳",
    "frowning": "😦",
    "anguished": "😧",
    "fearful": "😨",
    "cold_sweat": "😰",
    "disappointed_relieved": "😥",
    "cry": "😢",
    "sob": "😭",
    "scream": "😱",
    "confounded": "😖",
    "persevere": "😣",
    "disappointed": "😞",
    "sweat": "😓",
    "weary": "😩",
    "tired_face": "😫",
    "rage": "😡",
    "pout": "😡",
    "angry": "😠",
    "smiling_imp": "😈",
    "smiley_cat": "😺",
    "smile_cat": "😸",
    "joy_cat": "😹",
    "heart_eyes_cat": "😻",
    "smirk_cat": "😼",
    "kissing_cat": "😽",
    "scream_cat": "🙀",
    "crying_cat_face": "😿",
    "pouting_cat": "😾",
    "heart": "❤️",
    "hand": "✋",
    "raised_hand": "✋",
    "v": "✌️",
    "point_up": "☝️",
    "fist_raised": "✊",
    "fist": "✊",
    "monkey_face": "🐵",
    "cat": "🐱",
    "cow": "🐮",
    "mouse": "🐭",
    "coffee": "☕",
    "hotsprings": "♨️",
    "anchor": "⚓",
    "airplane": "✈️",
    "hourglass": "⌛",
    "watch": "⌚",
    "sunny": "☀️",
    "star": "⭐",
    "cloud": "☁️",
    "umbrella": "☔",
    "zap": "⚡",
    "snowflake": "❄️",
    "sparkles": "✨",
    "black_joker": "🃏",
    "mahjong": "🀄",
    "phone": "☎️",
    "telephone": "☎️",
    "envelope": "✉️",
    "pencil2": "✏️",
    "black_nib": "✒️",
    "scissors": "✂️",
    "wheelchair": "♿",
    "warning": "⚠️",
    "aries": "♈",
    "taurus": "♉",
    "gemini": "♊",
    "cancer": "♋",
    "leo": "♌",
    "virgo": "♍",
    "libra": "♎",
    "scorpius": "♏",
    "sagittarius": "♐",
    "capricorn": "♑",
    "aquarius": "♒",
    "pisces": "♓",
    "heavy_multiplication_x": "✖️",
    "heavy_plus_sign": "➕",
    "heavy_minus_sign": "➖",
    "heavy_division_sign": "➗",
    "bangbang": "‼️",
    "interrobang": "⁉️",
    "question": "❓",
    "grey_question": "❔",
    "grey_exclamation": "❕",
    "exclamation": "❗",
    "heavy_exclamation_mark": "❗",
    "wavy_dash": "〰️",
    "recycle": "♻️",
    "white_check_mark": "✅",
    "ballot_box_with_check": "☑️",
    "heavy_check_mark": "✔️",
    "x": "❌",
    "negative_squared_cross_mark": "❎",
    "curly_loop": "➰",
    "loop": "➿",
    "part_alternation_mark": "〽️",
    "eight_spoked_asterisk": "✳️",
    "eight_pointed_black_star": "✴️",
    "sparkle": "❇️",
    "copyright": "©️",
    "registered": "®️",
    "tm": "™️",
    "information_source": "ℹ️",
    "m": "Ⓜ️",
    "black_circle": "⚫",
    "white_circle": "⚪",
    "black_large_square": "⬛",
    "white_large_square": "⬜",
    "black_medium_square": "◼️",
    "white_medium_square": "◻️",
    "black_medium_small_square": "◾",
    "white_medium_small_square": "◽",
    "black_small_square": "▪️",
    "white_small_square": "▫️"
  };

  // Emoticons -> Emoji mapping.
  //
  // (!) Some patterns skipped, to avoid collisions
  // without increase matcher complicity. Than can change in future.
  //
  // Places to look for more emoticons info:
  //
  // - http://en.wikipedia.org/wiki/List_of_emoticons#Western
  // - https://github.com/wooorm/emoticon/blob/master/Support.md
  // - http://factoryjoe.com/projects/emoticons/
  //

  /* eslint-disable key-spacing */

  var emojies_shortcuts = {
    angry:            ['>:(', '>:-('],
    blush:            [':")', ':-")'],
    broken_heart:     ['</3', '<\\3'],
    // :\ and :-\ not used because of conflict with markdown escaping
    confused:         [':/', ':-/'], // twemoji shows question
    cry:              [":'(", ":'-(", ':,(', ':,-('],
    frowning:         [':(', ':-('],
    heart:            ['<3'],
    imp:              [']:(', ']:-('],
    innocent:         ['o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)'],
    joy:              [":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D'],
    kissing:          [':*', ':-*'],
    laughing:         ['x-)', 'X-)'],
    neutral_face:     [':|', ':-|'],
    open_mouth:       [':o', ':-o', ':O', ':-O'],
    rage:             [':@', ':-@'],
    smile:            [':D', ':-D'],
    smiley:           [':)', ':-)'],
    smiling_imp:      [']:)', ']:-)'],
    sob:              [":,'(", ":,'-(", ';(', ';-('],
    stuck_out_tongue: [':P', ':-P'],
    sunglasses:       ['8-)', 'B-)'],
    sweat:            [',:(', ',:-('],
    sweat_smile:      [',:)', ',:-)'],
    unamused:         [':s', ':-S', ':z', ':-Z', ':$', ':-$'],
    wink:             [';)', ';-)']
  };

  function emoji_plugin$1 (md, options) {
    const defaults = {
      defs: emojies_defs$1,
      shortcuts: emojies_shortcuts,
      enabled: []
    };

    const opts = md.utils.assign({}, defaults, options || {});

    emoji_plugin$2(md, opts);
  }

  // Generated, don't edit
  var emojies_defs = {
    "100": "💯",
    "1234": "🔢",
    "grinning": "😀",
    "smiley": "😃",
    "smile": "😄",
    "grin": "😁",
    "laughing": "😆",
    "satisfied": "😆",
    "sweat_smile": "😅",
    "rofl": "🤣",
    "joy": "😂",
    "slightly_smiling_face": "🙂",
    "upside_down_face": "🙃",
    "melting_face": "🫠",
    "wink": "😉",
    "blush": "😊",
    "innocent": "😇",
    "smiling_face_with_three_hearts": "🥰",
    "heart_eyes": "😍",
    "star_struck": "🤩",
    "kissing_heart": "😘",
    "kissing": "😗",
    "relaxed": "☺️",
    "kissing_closed_eyes": "😚",
    "kissing_smiling_eyes": "😙",
    "smiling_face_with_tear": "🥲",
    "yum": "😋",
    "stuck_out_tongue": "😛",
    "stuck_out_tongue_winking_eye": "😜",
    "zany_face": "🤪",
    "stuck_out_tongue_closed_eyes": "😝",
    "money_mouth_face": "🤑",
    "hugs": "🤗",
    "hand_over_mouth": "🤭",
    "face_with_open_eyes_and_hand_over_mouth": "🫢",
    "face_with_peeking_eye": "🫣",
    "shushing_face": "🤫",
    "thinking": "🤔",
    "saluting_face": "🫡",
    "zipper_mouth_face": "🤐",
    "raised_eyebrow": "🤨",
    "neutral_face": "😐",
    "expressionless": "😑",
    "no_mouth": "😶",
    "dotted_line_face": "🫥",
    "face_in_clouds": "😶‍🌫️",
    "smirk": "😏",
    "unamused": "😒",
    "roll_eyes": "🙄",
    "grimacing": "😬",
    "face_exhaling": "😮‍💨",
    "lying_face": "🤥",
    "shaking_face": "🫨",
    "relieved": "😌",
    "pensive": "😔",
    "sleepy": "😪",
    "drooling_face": "🤤",
    "sleeping": "😴",
    "mask": "😷",
    "face_with_thermometer": "🤒",
    "face_with_head_bandage": "🤕",
    "nauseated_face": "🤢",
    "vomiting_face": "🤮",
    "sneezing_face": "🤧",
    "hot_face": "🥵",
    "cold_face": "🥶",
    "woozy_face": "🥴",
    "dizzy_face": "😵",
    "face_with_spiral_eyes": "😵‍💫",
    "exploding_head": "🤯",
    "cowboy_hat_face": "🤠",
    "partying_face": "🥳",
    "disguised_face": "🥸",
    "sunglasses": "😎",
    "nerd_face": "🤓",
    "monocle_face": "🧐",
    "confused": "😕",
    "face_with_diagonal_mouth": "🫤",
    "worried": "😟",
    "slightly_frowning_face": "🙁",
    "frowning_face": "☹️",
    "open_mouth": "😮",
    "hushed": "😯",
    "astonished": "😲",
    "flushed": "😳",
    "pleading_face": "🥺",
    "face_holding_back_tears": "🥹",
    "frowning": "😦",
    "anguished": "😧",
    "fearful": "😨",
    "cold_sweat": "😰",
    "disappointed_relieved": "😥",
    "cry": "😢",
    "sob": "😭",
    "scream": "😱",
    "confounded": "😖",
    "persevere": "😣",
    "disappointed": "😞",
    "sweat": "😓",
    "weary": "😩",
    "tired_face": "😫",
    "yawning_face": "🥱",
    "triumph": "😤",
    "rage": "😡",
    "pout": "😡",
    "angry": "😠",
    "cursing_face": "🤬",
    "smiling_imp": "😈",
    "imp": "👿",
    "skull": "💀",
    "skull_and_crossbones": "☠️",
    "hankey": "💩",
    "poop": "💩",
    "shit": "💩",
    "clown_face": "🤡",
    "japanese_ogre": "👹",
    "japanese_goblin": "👺",
    "ghost": "👻",
    "alien": "👽",
    "space_invader": "👾",
    "robot": "🤖",
    "smiley_cat": "😺",
    "smile_cat": "😸",
    "joy_cat": "😹",
    "heart_eyes_cat": "😻",
    "smirk_cat": "😼",
    "kissing_cat": "😽",
    "scream_cat": "🙀",
    "crying_cat_face": "😿",
    "pouting_cat": "😾",
    "see_no_evil": "🙈",
    "hear_no_evil": "🙉",
    "speak_no_evil": "🙊",
    "love_letter": "💌",
    "cupid": "💘",
    "gift_heart": "💝",
    "sparkling_heart": "💖",
    "heartpulse": "💗",
    "heartbeat": "💓",
    "revolving_hearts": "💞",
    "two_hearts": "💕",
    "heart_decoration": "💟",
    "heavy_heart_exclamation": "❣️",
    "broken_heart": "💔",
    "heart_on_fire": "❤️‍🔥",
    "mending_heart": "❤️‍🩹",
    "heart": "❤️",
    "pink_heart": "🩷",
    "orange_heart": "🧡",
    "yellow_heart": "💛",
    "green_heart": "💚",
    "blue_heart": "💙",
    "light_blue_heart": "🩵",
    "purple_heart": "💜",
    "brown_heart": "🤎",
    "black_heart": "🖤",
    "grey_heart": "🩶",
    "white_heart": "🤍",
    "kiss": "💋",
    "anger": "💢",
    "boom": "💥",
    "collision": "💥",
    "dizzy": "💫",
    "sweat_drops": "💦",
    "dash": "💨",
    "hole": "🕳️",
    "speech_balloon": "💬",
    "eye_speech_bubble": "👁️‍🗨️",
    "left_speech_bubble": "🗨️",
    "right_anger_bubble": "🗯️",
    "thought_balloon": "💭",
    "zzz": "💤",
    "wave": "👋",
    "raised_back_of_hand": "🤚",
    "raised_hand_with_fingers_splayed": "🖐️",
    "hand": "✋",
    "raised_hand": "✋",
    "vulcan_salute": "🖖",
    "rightwards_hand": "🫱",
    "leftwards_hand": "🫲",
    "palm_down_hand": "🫳",
    "palm_up_hand": "🫴",
    "leftwards_pushing_hand": "🫷",
    "rightwards_pushing_hand": "🫸",
    "ok_hand": "👌",
    "pinched_fingers": "🤌",
    "pinching_hand": "🤏",
    "v": "✌️",
    "crossed_fingers": "🤞",
    "hand_with_index_finger_and_thumb_crossed": "🫰",
    "love_you_gesture": "🤟",
    "metal": "🤘",
    "call_me_hand": "🤙",
    "point_left": "👈",
    "point_right": "👉",
    "point_up_2": "👆",
    "middle_finger": "🖕",
    "fu": "🖕",
    "point_down": "👇",
    "point_up": "☝️",
    "index_pointing_at_the_viewer": "🫵",
    "+1": "👍",
    "thumbsup": "👍",
    "-1": "👎",
    "thumbsdown": "👎",
    "fist_raised": "✊",
    "fist": "✊",
    "fist_oncoming": "👊",
    "facepunch": "👊",
    "punch": "👊",
    "fist_left": "🤛",
    "fist_right": "🤜",
    "clap": "👏",
    "raised_hands": "🙌",
    "heart_hands": "🫶",
    "open_hands": "👐",
    "palms_up_together": "🤲",
    "handshake": "🤝",
    "pray": "🙏",
    "writing_hand": "✍️",
    "nail_care": "💅",
    "selfie": "🤳",
    "muscle": "💪",
    "mechanical_arm": "🦾",
    "mechanical_leg": "🦿",
    "leg": "🦵",
    "foot": "🦶",
    "ear": "👂",
    "ear_with_hearing_aid": "🦻",
    "nose": "👃",
    "brain": "🧠",
    "anatomical_heart": "🫀",
    "lungs": "🫁",
    "tooth": "🦷",
    "bone": "🦴",
    "eyes": "👀",
    "eye": "👁️",
    "tongue": "👅",
    "lips": "👄",
    "biting_lip": "🫦",
    "baby": "👶",
    "child": "🧒",
    "boy": "👦",
    "girl": "👧",
    "adult": "🧑",
    "blond_haired_person": "👱",
    "man": "👨",
    "bearded_person": "🧔",
    "man_beard": "🧔‍♂️",
    "woman_beard": "🧔‍♀️",
    "red_haired_man": "👨‍🦰",
    "curly_haired_man": "👨‍🦱",
    "white_haired_man": "👨‍🦳",
    "bald_man": "👨‍🦲",
    "woman": "👩",
    "red_haired_woman": "👩‍🦰",
    "person_red_hair": "🧑‍🦰",
    "curly_haired_woman": "👩‍🦱",
    "person_curly_hair": "🧑‍🦱",
    "white_haired_woman": "👩‍🦳",
    "person_white_hair": "🧑‍🦳",
    "bald_woman": "👩‍🦲",
    "person_bald": "🧑‍🦲",
    "blond_haired_woman": "👱‍♀️",
    "blonde_woman": "👱‍♀️",
    "blond_haired_man": "👱‍♂️",
    "older_adult": "🧓",
    "older_man": "👴",
    "older_woman": "👵",
    "frowning_person": "🙍",
    "frowning_man": "🙍‍♂️",
    "frowning_woman": "🙍‍♀️",
    "pouting_face": "🙎",
    "pouting_man": "🙎‍♂️",
    "pouting_woman": "🙎‍♀️",
    "no_good": "🙅",
    "no_good_man": "🙅‍♂️",
    "ng_man": "🙅‍♂️",
    "no_good_woman": "🙅‍♀️",
    "ng_woman": "🙅‍♀️",
    "ok_person": "🙆",
    "ok_man": "🙆‍♂️",
    "ok_woman": "🙆‍♀️",
    "tipping_hand_person": "💁",
    "information_desk_person": "💁",
    "tipping_hand_man": "💁‍♂️",
    "sassy_man": "💁‍♂️",
    "tipping_hand_woman": "💁‍♀️",
    "sassy_woman": "💁‍♀️",
    "raising_hand": "🙋",
    "raising_hand_man": "🙋‍♂️",
    "raising_hand_woman": "🙋‍♀️",
    "deaf_person": "🧏",
    "deaf_man": "🧏‍♂️",
    "deaf_woman": "🧏‍♀️",
    "bow": "🙇",
    "bowing_man": "🙇‍♂️",
    "bowing_woman": "🙇‍♀️",
    "facepalm": "🤦",
    "man_facepalming": "🤦‍♂️",
    "woman_facepalming": "🤦‍♀️",
    "shrug": "🤷",
    "man_shrugging": "🤷‍♂️",
    "woman_shrugging": "🤷‍♀️",
    "health_worker": "🧑‍⚕️",
    "man_health_worker": "👨‍⚕️",
    "woman_health_worker": "👩‍⚕️",
    "student": "🧑‍🎓",
    "man_student": "👨‍🎓",
    "woman_student": "👩‍🎓",
    "teacher": "🧑‍🏫",
    "man_teacher": "👨‍🏫",
    "woman_teacher": "👩‍🏫",
    "judge": "🧑‍⚖️",
    "man_judge": "👨‍⚖️",
    "woman_judge": "👩‍⚖️",
    "farmer": "🧑‍🌾",
    "man_farmer": "👨‍🌾",
    "woman_farmer": "👩‍🌾",
    "cook": "🧑‍🍳",
    "man_cook": "👨‍🍳",
    "woman_cook": "👩‍🍳",
    "mechanic": "🧑‍🔧",
    "man_mechanic": "👨‍🔧",
    "woman_mechanic": "👩‍🔧",
    "factory_worker": "🧑‍🏭",
    "man_factory_worker": "👨‍🏭",
    "woman_factory_worker": "👩‍🏭",
    "office_worker": "🧑‍💼",
    "man_office_worker": "👨‍💼",
    "woman_office_worker": "👩‍💼",
    "scientist": "🧑‍🔬",
    "man_scientist": "👨‍🔬",
    "woman_scientist": "👩‍🔬",
    "technologist": "🧑‍💻",
    "man_technologist": "👨‍💻",
    "woman_technologist": "👩‍💻",
    "singer": "🧑‍🎤",
    "man_singer": "👨‍🎤",
    "woman_singer": "👩‍🎤",
    "artist": "🧑‍🎨",
    "man_artist": "👨‍🎨",
    "woman_artist": "👩‍🎨",
    "pilot": "🧑‍✈️",
    "man_pilot": "👨‍✈️",
    "woman_pilot": "👩‍✈️",
    "astronaut": "🧑‍🚀",
    "man_astronaut": "👨‍🚀",
    "woman_astronaut": "👩‍🚀",
    "firefighter": "🧑‍🚒",
    "man_firefighter": "👨‍🚒",
    "woman_firefighter": "👩‍🚒",
    "police_officer": "👮",
    "cop": "👮",
    "policeman": "👮‍♂️",
    "policewoman": "👮‍♀️",
    "detective": "🕵️",
    "male_detective": "🕵️‍♂️",
    "female_detective": "🕵️‍♀️",
    "guard": "💂",
    "guardsman": "💂‍♂️",
    "guardswoman": "💂‍♀️",
    "ninja": "🥷",
    "construction_worker": "👷",
    "construction_worker_man": "👷‍♂️",
    "construction_worker_woman": "👷‍♀️",
    "person_with_crown": "🫅",
    "prince": "🤴",
    "princess": "👸",
    "person_with_turban": "👳",
    "man_with_turban": "👳‍♂️",
    "woman_with_turban": "👳‍♀️",
    "man_with_gua_pi_mao": "👲",
    "woman_with_headscarf": "🧕",
    "person_in_tuxedo": "🤵",
    "man_in_tuxedo": "🤵‍♂️",
    "woman_in_tuxedo": "🤵‍♀️",
    "person_with_veil": "👰",
    "man_with_veil": "👰‍♂️",
    "woman_with_veil": "👰‍♀️",
    "bride_with_veil": "👰‍♀️",
    "pregnant_woman": "🤰",
    "pregnant_man": "🫃",
    "pregnant_person": "🫄",
    "breast_feeding": "🤱",
    "woman_feeding_baby": "👩‍🍼",
    "man_feeding_baby": "👨‍🍼",
    "person_feeding_baby": "🧑‍🍼",
    "angel": "👼",
    "santa": "🎅",
    "mrs_claus": "🤶",
    "mx_claus": "🧑‍🎄",
    "superhero": "🦸",
    "superhero_man": "🦸‍♂️",
    "superhero_woman": "🦸‍♀️",
    "supervillain": "🦹",
    "supervillain_man": "🦹‍♂️",
    "supervillain_woman": "🦹‍♀️",
    "mage": "🧙",
    "mage_man": "🧙‍♂️",
    "mage_woman": "🧙‍♀️",
    "fairy": "🧚",
    "fairy_man": "🧚‍♂️",
    "fairy_woman": "🧚‍♀️",
    "vampire": "🧛",
    "vampire_man": "🧛‍♂️",
    "vampire_woman": "🧛‍♀️",
    "merperson": "🧜",
    "merman": "🧜‍♂️",
    "mermaid": "🧜‍♀️",
    "elf": "🧝",
    "elf_man": "🧝‍♂️",
    "elf_woman": "🧝‍♀️",
    "genie": "🧞",
    "genie_man": "🧞‍♂️",
    "genie_woman": "🧞‍♀️",
    "zombie": "🧟",
    "zombie_man": "🧟‍♂️",
    "zombie_woman": "🧟‍♀️",
    "troll": "🧌",
    "massage": "💆",
    "massage_man": "💆‍♂️",
    "massage_woman": "💆‍♀️",
    "haircut": "💇",
    "haircut_man": "💇‍♂️",
    "haircut_woman": "💇‍♀️",
    "walking": "🚶",
    "walking_man": "🚶‍♂️",
    "walking_woman": "🚶‍♀️",
    "standing_person": "🧍",
    "standing_man": "🧍‍♂️",
    "standing_woman": "🧍‍♀️",
    "kneeling_person": "🧎",
    "kneeling_man": "🧎‍♂️",
    "kneeling_woman": "🧎‍♀️",
    "person_with_probing_cane": "🧑‍🦯",
    "man_with_probing_cane": "👨‍🦯",
    "woman_with_probing_cane": "👩‍🦯",
    "person_in_motorized_wheelchair": "🧑‍🦼",
    "man_in_motorized_wheelchair": "👨‍🦼",
    "woman_in_motorized_wheelchair": "👩‍🦼",
    "person_in_manual_wheelchair": "🧑‍🦽",
    "man_in_manual_wheelchair": "👨‍🦽",
    "woman_in_manual_wheelchair": "👩‍🦽",
    "runner": "🏃",
    "running": "🏃",
    "running_man": "🏃‍♂️",
    "running_woman": "🏃‍♀️",
    "woman_dancing": "💃",
    "dancer": "💃",
    "man_dancing": "🕺",
    "business_suit_levitating": "🕴️",
    "dancers": "👯",
    "dancing_men": "👯‍♂️",
    "dancing_women": "👯‍♀️",
    "sauna_person": "🧖",
    "sauna_man": "🧖‍♂️",
    "sauna_woman": "🧖‍♀️",
    "climbing": "🧗",
    "climbing_man": "🧗‍♂️",
    "climbing_woman": "🧗‍♀️",
    "person_fencing": "🤺",
    "horse_racing": "🏇",
    "skier": "⛷️",
    "snowboarder": "🏂",
    "golfing": "🏌️",
    "golfing_man": "🏌️‍♂️",
    "golfing_woman": "🏌️‍♀️",
    "surfer": "🏄",
    "surfing_man": "🏄‍♂️",
    "surfing_woman": "🏄‍♀️",
    "rowboat": "🚣",
    "rowing_man": "🚣‍♂️",
    "rowing_woman": "🚣‍♀️",
    "swimmer": "🏊",
    "swimming_man": "🏊‍♂️",
    "swimming_woman": "🏊‍♀️",
    "bouncing_ball_person": "⛹️",
    "bouncing_ball_man": "⛹️‍♂️",
    "basketball_man": "⛹️‍♂️",
    "bouncing_ball_woman": "⛹️‍♀️",
    "basketball_woman": "⛹️‍♀️",
    "weight_lifting": "🏋️",
    "weight_lifting_man": "🏋️‍♂️",
    "weight_lifting_woman": "🏋️‍♀️",
    "bicyclist": "🚴",
    "biking_man": "🚴‍♂️",
    "biking_woman": "🚴‍♀️",
    "mountain_bicyclist": "🚵",
    "mountain_biking_man": "🚵‍♂️",
    "mountain_biking_woman": "🚵‍♀️",
    "cartwheeling": "🤸",
    "man_cartwheeling": "🤸‍♂️",
    "woman_cartwheeling": "🤸‍♀️",
    "wrestling": "🤼",
    "men_wrestling": "🤼‍♂️",
    "women_wrestling": "🤼‍♀️",
    "water_polo": "🤽",
    "man_playing_water_polo": "🤽‍♂️",
    "woman_playing_water_polo": "🤽‍♀️",
    "handball_person": "🤾",
    "man_playing_handball": "🤾‍♂️",
    "woman_playing_handball": "🤾‍♀️",
    "juggling_person": "🤹",
    "man_juggling": "🤹‍♂️",
    "woman_juggling": "🤹‍♀️",
    "lotus_position": "🧘",
    "lotus_position_man": "🧘‍♂️",
    "lotus_position_woman": "🧘‍♀️",
    "bath": "🛀",
    "sleeping_bed": "🛌",
    "people_holding_hands": "🧑‍🤝‍🧑",
    "two_women_holding_hands": "👭",
    "couple": "👫",
    "two_men_holding_hands": "👬",
    "couplekiss": "💏",
    "couplekiss_man_woman": "👩‍❤️‍💋‍👨",
    "couplekiss_man_man": "👨‍❤️‍💋‍👨",
    "couplekiss_woman_woman": "👩‍❤️‍💋‍👩",
    "couple_with_heart": "💑",
    "couple_with_heart_woman_man": "👩‍❤️‍👨",
    "couple_with_heart_man_man": "👨‍❤️‍👨",
    "couple_with_heart_woman_woman": "👩‍❤️‍👩",
    "family": "👪",
    "family_man_woman_boy": "👨‍👩‍👦",
    "family_man_woman_girl": "👨‍👩‍👧",
    "family_man_woman_girl_boy": "👨‍👩‍👧‍👦",
    "family_man_woman_boy_boy": "👨‍👩‍👦‍👦",
    "family_man_woman_girl_girl": "👨‍👩‍👧‍👧",
    "family_man_man_boy": "👨‍👨‍👦",
    "family_man_man_girl": "👨‍👨‍👧",
    "family_man_man_girl_boy": "👨‍👨‍👧‍👦",
    "family_man_man_boy_boy": "👨‍👨‍👦‍👦",
    "family_man_man_girl_girl": "👨‍👨‍👧‍👧",
    "family_woman_woman_boy": "👩‍👩‍👦",
    "family_woman_woman_girl": "👩‍👩‍👧",
    "family_woman_woman_girl_boy": "👩‍👩‍👧‍👦",
    "family_woman_woman_boy_boy": "👩‍👩‍👦‍👦",
    "family_woman_woman_girl_girl": "👩‍👩‍👧‍👧",
    "family_man_boy": "👨‍👦",
    "family_man_boy_boy": "👨‍👦‍👦",
    "family_man_girl": "👨‍👧",
    "family_man_girl_boy": "👨‍👧‍👦",
    "family_man_girl_girl": "👨‍👧‍👧",
    "family_woman_boy": "👩‍👦",
    "family_woman_boy_boy": "👩‍👦‍👦",
    "family_woman_girl": "👩‍👧",
    "family_woman_girl_boy": "👩‍👧‍👦",
    "family_woman_girl_girl": "👩‍👧‍👧",
    "speaking_head": "🗣️",
    "bust_in_silhouette": "👤",
    "busts_in_silhouette": "👥",
    "people_hugging": "🫂",
    "footprints": "👣",
    "monkey_face": "🐵",
    "monkey": "🐒",
    "gorilla": "🦍",
    "orangutan": "🦧",
    "dog": "🐶",
    "dog2": "🐕",
    "guide_dog": "🦮",
    "service_dog": "🐕‍🦺",
    "poodle": "🐩",
    "wolf": "🐺",
    "fox_face": "🦊",
    "raccoon": "🦝",
    "cat": "🐱",
    "cat2": "🐈",
    "black_cat": "🐈‍⬛",
    "lion": "🦁",
    "tiger": "🐯",
    "tiger2": "🐅",
    "leopard": "🐆",
    "horse": "🐴",
    "moose": "🫎",
    "donkey": "🫏",
    "racehorse": "🐎",
    "unicorn": "🦄",
    "zebra": "🦓",
    "deer": "🦌",
    "bison": "🦬",
    "cow": "🐮",
    "ox": "🐂",
    "water_buffalo": "🐃",
    "cow2": "🐄",
    "pig": "🐷",
    "pig2": "🐖",
    "boar": "🐗",
    "pig_nose": "🐽",
    "ram": "🐏",
    "sheep": "🐑",
    "goat": "🐐",
    "dromedary_camel": "🐪",
    "camel": "🐫",
    "llama": "🦙",
    "giraffe": "🦒",
    "elephant": "🐘",
    "mammoth": "🦣",
    "rhinoceros": "🦏",
    "hippopotamus": "🦛",
    "mouse": "🐭",
    "mouse2": "🐁",
    "rat": "🐀",
    "hamster": "🐹",
    "rabbit": "🐰",
    "rabbit2": "🐇",
    "chipmunk": "🐿️",
    "beaver": "🦫",
    "hedgehog": "🦔",
    "bat": "🦇",
    "bear": "🐻",
    "polar_bear": "🐻‍❄️",
    "koala": "🐨",
    "panda_face": "🐼",
    "sloth": "🦥",
    "otter": "🦦",
    "skunk": "🦨",
    "kangaroo": "🦘",
    "badger": "🦡",
    "feet": "🐾",
    "paw_prints": "🐾",
    "turkey": "🦃",
    "chicken": "🐔",
    "rooster": "🐓",
    "hatching_chick": "🐣",
    "baby_chick": "🐤",
    "hatched_chick": "🐥",
    "bird": "🐦",
    "penguin": "🐧",
    "dove": "🕊️",
    "eagle": "🦅",
    "duck": "🦆",
    "swan": "🦢",
    "owl": "🦉",
    "dodo": "🦤",
    "feather": "🪶",
    "flamingo": "🦩",
    "peacock": "🦚",
    "parrot": "🦜",
    "wing": "🪽",
    "black_bird": "🐦‍⬛",
    "goose": "🪿",
    "frog": "🐸",
    "crocodile": "🐊",
    "turtle": "🐢",
    "lizard": "🦎",
    "snake": "🐍",
    "dragon_face": "🐲",
    "dragon": "🐉",
    "sauropod": "🦕",
    "t-rex": "🦖",
    "whale": "🐳",
    "whale2": "🐋",
    "dolphin": "🐬",
    "flipper": "🐬",
    "seal": "🦭",
    "fish": "🐟",
    "tropical_fish": "🐠",
    "blowfish": "🐡",
    "shark": "🦈",
    "octopus": "🐙",
    "shell": "🐚",
    "coral": "🪸",
    "jellyfish": "🪼",
    "snail": "🐌",
    "butterfly": "🦋",
    "bug": "🐛",
    "ant": "🐜",
    "bee": "🐝",
    "honeybee": "🐝",
    "beetle": "🪲",
    "lady_beetle": "🐞",
    "cricket": "🦗",
    "cockroach": "🪳",
    "spider": "🕷️",
    "spider_web": "🕸️",
    "scorpion": "🦂",
    "mosquito": "🦟",
    "fly": "🪰",
    "worm": "🪱",
    "microbe": "🦠",
    "bouquet": "💐",
    "cherry_blossom": "🌸",
    "white_flower": "💮",
    "lotus": "🪷",
    "rosette": "🏵️",
    "rose": "🌹",
    "wilted_flower": "🥀",
    "hibiscus": "🌺",
    "sunflower": "🌻",
    "blossom": "🌼",
    "tulip": "🌷",
    "hyacinth": "🪻",
    "seedling": "🌱",
    "potted_plant": "🪴",
    "evergreen_tree": "🌲",
    "deciduous_tree": "🌳",
    "palm_tree": "🌴",
    "cactus": "🌵",
    "ear_of_rice": "🌾",
    "herb": "🌿",
    "shamrock": "☘️",
    "four_leaf_clover": "🍀",
    "maple_leaf": "🍁",
    "fallen_leaf": "🍂",
    "leaves": "🍃",
    "empty_nest": "🪹",
    "nest_with_eggs": "🪺",
    "mushroom": "🍄",
    "grapes": "🍇",
    "melon": "🍈",
    "watermelon": "🍉",
    "tangerine": "🍊",
    "orange": "🍊",
    "mandarin": "🍊",
    "lemon": "🍋",
    "banana": "🍌",
    "pineapple": "🍍",
    "mango": "🥭",
    "apple": "🍎",
    "green_apple": "🍏",
    "pear": "🍐",
    "peach": "🍑",
    "cherries": "🍒",
    "strawberry": "🍓",
    "blueberries": "🫐",
    "kiwi_fruit": "🥝",
    "tomato": "🍅",
    "olive": "🫒",
    "coconut": "🥥",
    "avocado": "🥑",
    "eggplant": "🍆",
    "potato": "🥔",
    "carrot": "🥕",
    "corn": "🌽",
    "hot_pepper": "🌶️",
    "bell_pepper": "🫑",
    "cucumber": "🥒",
    "leafy_green": "🥬",
    "broccoli": "🥦",
    "garlic": "🧄",
    "onion": "🧅",
    "peanuts": "🥜",
    "beans": "🫘",
    "chestnut": "🌰",
    "ginger_root": "🫚",
    "pea_pod": "🫛",
    "bread": "🍞",
    "croissant": "🥐",
    "baguette_bread": "🥖",
    "flatbread": "🫓",
    "pretzel": "🥨",
    "bagel": "🥯",
    "pancakes": "🥞",
    "waffle": "🧇",
    "cheese": "🧀",
    "meat_on_bone": "🍖",
    "poultry_leg": "🍗",
    "cut_of_meat": "🥩",
    "bacon": "🥓",
    "hamburger": "🍔",
    "fries": "🍟",
    "pizza": "🍕",
    "hotdog": "🌭",
    "sandwich": "🥪",
    "taco": "🌮",
    "burrito": "🌯",
    "tamale": "🫔",
    "stuffed_flatbread": "🥙",
    "falafel": "🧆",
    "egg": "🥚",
    "fried_egg": "🍳",
    "shallow_pan_of_food": "🥘",
    "stew": "🍲",
    "fondue": "🫕",
    "bowl_with_spoon": "🥣",
    "green_salad": "🥗",
    "popcorn": "🍿",
    "butter": "🧈",
    "salt": "🧂",
    "canned_food": "🥫",
    "bento": "🍱",
    "rice_cracker": "🍘",
    "rice_ball": "🍙",
    "rice": "🍚",
    "curry": "🍛",
    "ramen": "🍜",
    "spaghetti": "🍝",
    "sweet_potato": "🍠",
    "oden": "🍢",
    "sushi": "🍣",
    "fried_shrimp": "🍤",
    "fish_cake": "🍥",
    "moon_cake": "🥮",
    "dango": "🍡",
    "dumpling": "🥟",
    "fortune_cookie": "🥠",
    "takeout_box": "🥡",
    "crab": "🦀",
    "lobster": "🦞",
    "shrimp": "🦐",
    "squid": "🦑",
    "oyster": "🦪",
    "icecream": "🍦",
    "shaved_ice": "🍧",
    "ice_cream": "🍨",
    "doughnut": "🍩",
    "cookie": "🍪",
    "birthday": "🎂",
    "cake": "🍰",
    "cupcake": "🧁",
    "pie": "🥧",
    "chocolate_bar": "🍫",
    "candy": "🍬",
    "lollipop": "🍭",
    "custard": "🍮",
    "honey_pot": "🍯",
    "baby_bottle": "🍼",
    "milk_glass": "🥛",
    "coffee": "☕",
    "teapot": "🫖",
    "tea": "🍵",
    "sake": "🍶",
    "champagne": "🍾",
    "wine_glass": "🍷",
    "cocktail": "🍸",
    "tropical_drink": "🍹",
    "beer": "🍺",
    "beers": "🍻",
    "clinking_glasses": "🥂",
    "tumbler_glass": "🥃",
    "pouring_liquid": "🫗",
    "cup_with_straw": "🥤",
    "bubble_tea": "🧋",
    "beverage_box": "🧃",
    "mate": "🧉",
    "ice_cube": "🧊",
    "chopsticks": "🥢",
    "plate_with_cutlery": "🍽️",
    "fork_and_knife": "🍴",
    "spoon": "🥄",
    "hocho": "🔪",
    "knife": "🔪",
    "jar": "🫙",
    "amphora": "🏺",
    "earth_africa": "🌍",
    "earth_americas": "🌎",
    "earth_asia": "🌏",
    "globe_with_meridians": "🌐",
    "world_map": "🗺️",
    "japan": "🗾",
    "compass": "🧭",
    "mountain_snow": "🏔️",
    "mountain": "⛰️",
    "volcano": "🌋",
    "mount_fuji": "🗻",
    "camping": "🏕️",
    "beach_umbrella": "🏖️",
    "desert": "🏜️",
    "desert_island": "🏝️",
    "national_park": "🏞️",
    "stadium": "🏟️",
    "classical_building": "🏛️",
    "building_construction": "🏗️",
    "bricks": "🧱",
    "rock": "🪨",
    "wood": "🪵",
    "hut": "🛖",
    "houses": "🏘️",
    "derelict_house": "🏚️",
    "house": "🏠",
    "house_with_garden": "🏡",
    "office": "🏢",
    "post_office": "🏣",
    "european_post_office": "🏤",
    "hospital": "🏥",
    "bank": "🏦",
    "hotel": "🏨",
    "love_hotel": "🏩",
    "convenience_store": "🏪",
    "school": "🏫",
    "department_store": "🏬",
    "factory": "🏭",
    "japanese_castle": "🏯",
    "european_castle": "🏰",
    "wedding": "💒",
    "tokyo_tower": "🗼",
    "statue_of_liberty": "🗽",
    "church": "⛪",
    "mosque": "🕌",
    "hindu_temple": "🛕",
    "synagogue": "🕍",
    "shinto_shrine": "⛩️",
    "kaaba": "🕋",
    "fountain": "⛲",
    "tent": "⛺",
    "foggy": "🌁",
    "night_with_stars": "🌃",
    "cityscape": "🏙️",
    "sunrise_over_mountains": "🌄",
    "sunrise": "🌅",
    "city_sunset": "🌆",
    "city_sunrise": "🌇",
    "bridge_at_night": "🌉",
    "hotsprings": "♨️",
    "carousel_horse": "🎠",
    "playground_slide": "🛝",
    "ferris_wheel": "🎡",
    "roller_coaster": "🎢",
    "barber": "💈",
    "circus_tent": "🎪",
    "steam_locomotive": "🚂",
    "railway_car": "🚃",
    "bullettrain_side": "🚄",
    "bullettrain_front": "🚅",
    "train2": "🚆",
    "metro": "🚇",
    "light_rail": "🚈",
    "station": "🚉",
    "tram": "🚊",
    "monorail": "🚝",
    "mountain_railway": "🚞",
    "train": "🚋",
    "bus": "🚌",
    "oncoming_bus": "🚍",
    "trolleybus": "🚎",
    "minibus": "🚐",
    "ambulance": "🚑",
    "fire_engine": "🚒",
    "police_car": "🚓",
    "oncoming_police_car": "🚔",
    "taxi": "🚕",
    "oncoming_taxi": "🚖",
    "car": "🚗",
    "red_car": "🚗",
    "oncoming_automobile": "🚘",
    "blue_car": "🚙",
    "pickup_truck": "🛻",
    "truck": "🚚",
    "articulated_lorry": "🚛",
    "tractor": "🚜",
    "racing_car": "🏎️",
    "motorcycle": "🏍️",
    "motor_scooter": "🛵",
    "manual_wheelchair": "🦽",
    "motorized_wheelchair": "🦼",
    "auto_rickshaw": "🛺",
    "bike": "🚲",
    "kick_scooter": "🛴",
    "skateboard": "🛹",
    "roller_skate": "🛼",
    "busstop": "🚏",
    "motorway": "🛣️",
    "railway_track": "🛤️",
    "oil_drum": "🛢️",
    "fuelpump": "⛽",
    "wheel": "🛞",
    "rotating_light": "🚨",
    "traffic_light": "🚥",
    "vertical_traffic_light": "🚦",
    "stop_sign": "🛑",
    "construction": "🚧",
    "anchor": "⚓",
    "ring_buoy": "🛟",
    "boat": "⛵",
    "sailboat": "⛵",
    "canoe": "🛶",
    "speedboat": "🚤",
    "passenger_ship": "🛳️",
    "ferry": "⛴️",
    "motor_boat": "🛥️",
    "ship": "🚢",
    "airplane": "✈️",
    "small_airplane": "🛩️",
    "flight_departure": "🛫",
    "flight_arrival": "🛬",
    "parachute": "🪂",
    "seat": "💺",
    "helicopter": "🚁",
    "suspension_railway": "🚟",
    "mountain_cableway": "🚠",
    "aerial_tramway": "🚡",
    "artificial_satellite": "🛰️",
    "rocket": "🚀",
    "flying_saucer": "🛸",
    "bellhop_bell": "🛎️",
    "luggage": "🧳",
    "hourglass": "⌛",
    "hourglass_flowing_sand": "⏳",
    "watch": "⌚",
    "alarm_clock": "⏰",
    "stopwatch": "⏱️",
    "timer_clock": "⏲️",
    "mantelpiece_clock": "🕰️",
    "clock12": "🕛",
    "clock1230": "🕧",
    "clock1": "🕐",
    "clock130": "🕜",
    "clock2": "🕑",
    "clock230": "🕝",
    "clock3": "🕒",
    "clock330": "🕞",
    "clock4": "🕓",
    "clock430": "🕟",
    "clock5": "🕔",
    "clock530": "🕠",
    "clock6": "🕕",
    "clock630": "🕡",
    "clock7": "🕖",
    "clock730": "🕢",
    "clock8": "🕗",
    "clock830": "🕣",
    "clock9": "🕘",
    "clock930": "🕤",
    "clock10": "🕙",
    "clock1030": "🕥",
    "clock11": "🕚",
    "clock1130": "🕦",
    "new_moon": "🌑",
    "waxing_crescent_moon": "🌒",
    "first_quarter_moon": "🌓",
    "moon": "🌔",
    "waxing_gibbous_moon": "🌔",
    "full_moon": "🌕",
    "waning_gibbous_moon": "🌖",
    "last_quarter_moon": "🌗",
    "waning_crescent_moon": "🌘",
    "crescent_moon": "🌙",
    "new_moon_with_face": "🌚",
    "first_quarter_moon_with_face": "🌛",
    "last_quarter_moon_with_face": "🌜",
    "thermometer": "🌡️",
    "sunny": "☀️",
    "full_moon_with_face": "🌝",
    "sun_with_face": "🌞",
    "ringed_planet": "🪐",
    "star": "⭐",
    "star2": "🌟",
    "stars": "🌠",
    "milky_way": "🌌",
    "cloud": "☁️",
    "partly_sunny": "⛅",
    "cloud_with_lightning_and_rain": "⛈️",
    "sun_behind_small_cloud": "🌤️",
    "sun_behind_large_cloud": "🌥️",
    "sun_behind_rain_cloud": "🌦️",
    "cloud_with_rain": "🌧️",
    "cloud_with_snow": "🌨️",
    "cloud_with_lightning": "🌩️",
    "tornado": "🌪️",
    "fog": "🌫️",
    "wind_face": "🌬️",
    "cyclone": "🌀",
    "rainbow": "🌈",
    "closed_umbrella": "🌂",
    "open_umbrella": "☂️",
    "umbrella": "☔",
    "parasol_on_ground": "⛱️",
    "zap": "⚡",
    "snowflake": "❄️",
    "snowman_with_snow": "☃️",
    "snowman": "⛄",
    "comet": "☄️",
    "fire": "🔥",
    "droplet": "💧",
    "ocean": "🌊",
    "jack_o_lantern": "🎃",
    "christmas_tree": "🎄",
    "fireworks": "🎆",
    "sparkler": "🎇",
    "firecracker": "🧨",
    "sparkles": "✨",
    "balloon": "🎈",
    "tada": "🎉",
    "confetti_ball": "🎊",
    "tanabata_tree": "🎋",
    "bamboo": "🎍",
    "dolls": "🎎",
    "flags": "🎏",
    "wind_chime": "🎐",
    "rice_scene": "🎑",
    "red_envelope": "🧧",
    "ribbon": "🎀",
    "gift": "🎁",
    "reminder_ribbon": "🎗️",
    "tickets": "🎟️",
    "ticket": "🎫",
    "medal_military": "🎖️",
    "trophy": "🏆",
    "medal_sports": "🏅",
    "1st_place_medal": "🥇",
    "2nd_place_medal": "🥈",
    "3rd_place_medal": "🥉",
    "soccer": "⚽",
    "baseball": "⚾",
    "softball": "🥎",
    "basketball": "🏀",
    "volleyball": "🏐",
    "football": "🏈",
    "rugby_football": "🏉",
    "tennis": "🎾",
    "flying_disc": "🥏",
    "bowling": "🎳",
    "cricket_game": "🏏",
    "field_hockey": "🏑",
    "ice_hockey": "🏒",
    "lacrosse": "🥍",
    "ping_pong": "🏓",
    "badminton": "🏸",
    "boxing_glove": "🥊",
    "martial_arts_uniform": "🥋",
    "goal_net": "🥅",
    "golf": "⛳",
    "ice_skate": "⛸️",
    "fishing_pole_and_fish": "🎣",
    "diving_mask": "🤿",
    "running_shirt_with_sash": "🎽",
    "ski": "🎿",
    "sled": "🛷",
    "curling_stone": "🥌",
    "dart": "🎯",
    "yo_yo": "🪀",
    "kite": "🪁",
    "gun": "🔫",
    "8ball": "🎱",
    "crystal_ball": "🔮",
    "magic_wand": "🪄",
    "video_game": "🎮",
    "joystick": "🕹️",
    "slot_machine": "🎰",
    "game_die": "🎲",
    "jigsaw": "🧩",
    "teddy_bear": "🧸",
    "pinata": "🪅",
    "mirror_ball": "🪩",
    "nesting_dolls": "🪆",
    "spades": "♠️",
    "hearts": "♥️",
    "diamonds": "♦️",
    "clubs": "♣️",
    "chess_pawn": "♟️",
    "black_joker": "🃏",
    "mahjong": "🀄",
    "flower_playing_cards": "🎴",
    "performing_arts": "🎭",
    "framed_picture": "🖼️",
    "art": "🎨",
    "thread": "🧵",
    "sewing_needle": "🪡",
    "yarn": "🧶",
    "knot": "🪢",
    "eyeglasses": "👓",
    "dark_sunglasses": "🕶️",
    "goggles": "🥽",
    "lab_coat": "🥼",
    "safety_vest": "🦺",
    "necktie": "👔",
    "shirt": "👕",
    "tshirt": "👕",
    "jeans": "👖",
    "scarf": "🧣",
    "gloves": "🧤",
    "coat": "🧥",
    "socks": "🧦",
    "dress": "👗",
    "kimono": "👘",
    "sari": "🥻",
    "one_piece_swimsuit": "🩱",
    "swim_brief": "🩲",
    "shorts": "🩳",
    "bikini": "👙",
    "womans_clothes": "👚",
    "folding_hand_fan": "🪭",
    "purse": "👛",
    "handbag": "👜",
    "pouch": "👝",
    "shopping": "🛍️",
    "school_satchel": "🎒",
    "thong_sandal": "🩴",
    "mans_shoe": "👞",
    "shoe": "👞",
    "athletic_shoe": "👟",
    "hiking_boot": "🥾",
    "flat_shoe": "🥿",
    "high_heel": "👠",
    "sandal": "👡",
    "ballet_shoes": "🩰",
    "boot": "👢",
    "hair_pick": "🪮",
    "crown": "👑",
    "womans_hat": "👒",
    "tophat": "🎩",
    "mortar_board": "🎓",
    "billed_cap": "🧢",
    "military_helmet": "🪖",
    "rescue_worker_helmet": "⛑️",
    "prayer_beads": "📿",
    "lipstick": "💄",
    "ring": "💍",
    "gem": "💎",
    "mute": "🔇",
    "speaker": "🔈",
    "sound": "🔉",
    "loud_sound": "🔊",
    "loudspeaker": "📢",
    "mega": "📣",
    "postal_horn": "📯",
    "bell": "🔔",
    "no_bell": "🔕",
    "musical_score": "🎼",
    "musical_note": "🎵",
    "notes": "🎶",
    "studio_microphone": "🎙️",
    "level_slider": "🎚️",
    "control_knobs": "🎛️",
    "microphone": "🎤",
    "headphones": "🎧",
    "radio": "📻",
    "saxophone": "🎷",
    "accordion": "🪗",
    "guitar": "🎸",
    "musical_keyboard": "🎹",
    "trumpet": "🎺",
    "violin": "🎻",
    "banjo": "🪕",
    "drum": "🥁",
    "long_drum": "🪘",
    "maracas": "🪇",
    "flute": "🪈",
    "iphone": "📱",
    "calling": "📲",
    "phone": "☎️",
    "telephone": "☎️",
    "telephone_receiver": "📞",
    "pager": "📟",
    "fax": "📠",
    "battery": "🔋",
    "low_battery": "🪫",
    "electric_plug": "🔌",
    "computer": "💻",
    "desktop_computer": "🖥️",
    "printer": "🖨️",
    "keyboard": "⌨️",
    "computer_mouse": "🖱️",
    "trackball": "🖲️",
    "minidisc": "💽",
    "floppy_disk": "💾",
    "cd": "💿",
    "dvd": "📀",
    "abacus": "🧮",
    "movie_camera": "🎥",
    "film_strip": "🎞️",
    "film_projector": "📽️",
    "clapper": "🎬",
    "tv": "📺",
    "camera": "📷",
    "camera_flash": "📸",
    "video_camera": "📹",
    "vhs": "📼",
    "mag": "🔍",
    "mag_right": "🔎",
    "candle": "🕯️",
    "bulb": "💡",
    "flashlight": "🔦",
    "izakaya_lantern": "🏮",
    "lantern": "🏮",
    "diya_lamp": "🪔",
    "notebook_with_decorative_cover": "📔",
    "closed_book": "📕",
    "book": "📖",
    "open_book": "📖",
    "green_book": "📗",
    "blue_book": "📘",
    "orange_book": "📙",
    "books": "📚",
    "notebook": "📓",
    "ledger": "📒",
    "page_with_curl": "📃",
    "scroll": "📜",
    "page_facing_up": "📄",
    "newspaper": "📰",
    "newspaper_roll": "🗞️",
    "bookmark_tabs": "📑",
    "bookmark": "🔖",
    "label": "🏷️",
    "moneybag": "💰",
    "coin": "🪙",
    "yen": "💴",
    "dollar": "💵",
    "euro": "💶",
    "pound": "💷",
    "money_with_wings": "💸",
    "credit_card": "💳",
    "receipt": "🧾",
    "chart": "💹",
    "envelope": "✉️",
    "email": "📧",
    "e-mail": "📧",
    "incoming_envelope": "📨",
    "envelope_with_arrow": "📩",
    "outbox_tray": "📤",
    "inbox_tray": "📥",
    "package": "📦",
    "mailbox": "📫",
    "mailbox_closed": "📪",
    "mailbox_with_mail": "📬",
    "mailbox_with_no_mail": "📭",
    "postbox": "📮",
    "ballot_box": "🗳️",
    "pencil2": "✏️",
    "black_nib": "✒️",
    "fountain_pen": "🖋️",
    "pen": "🖊️",
    "paintbrush": "🖌️",
    "crayon": "🖍️",
    "memo": "📝",
    "pencil": "📝",
    "briefcase": "💼",
    "file_folder": "📁",
    "open_file_folder": "📂",
    "card_index_dividers": "🗂️",
    "date": "📅",
    "calendar": "📆",
    "spiral_notepad": "🗒️",
    "spiral_calendar": "🗓️",
    "card_index": "📇",
    "chart_with_upwards_trend": "📈",
    "chart_with_downwards_trend": "📉",
    "bar_chart": "📊",
    "clipboard": "📋",
    "pushpin": "📌",
    "round_pushpin": "📍",
    "paperclip": "📎",
    "paperclips": "🖇️",
    "straight_ruler": "📏",
    "triangular_ruler": "📐",
    "scissors": "✂️",
    "card_file_box": "🗃️",
    "file_cabinet": "🗄️",
    "wastebasket": "🗑️",
    "lock": "🔒",
    "unlock": "🔓",
    "lock_with_ink_pen": "🔏",
    "closed_lock_with_key": "🔐",
    "key": "🔑",
    "old_key": "🗝️",
    "hammer": "🔨",
    "axe": "🪓",
    "pick": "⛏️",
    "hammer_and_pick": "⚒️",
    "hammer_and_wrench": "🛠️",
    "dagger": "🗡️",
    "crossed_swords": "⚔️",
    "bomb": "💣",
    "boomerang": "🪃",
    "bow_and_arrow": "🏹",
    "shield": "🛡️",
    "carpentry_saw": "🪚",
    "wrench": "🔧",
    "screwdriver": "🪛",
    "nut_and_bolt": "🔩",
    "gear": "⚙️",
    "clamp": "🗜️",
    "balance_scale": "⚖️",
    "probing_cane": "🦯",
    "link": "🔗",
    "chains": "⛓️",
    "hook": "🪝",
    "toolbox": "🧰",
    "magnet": "🧲",
    "ladder": "🪜",
    "alembic": "⚗️",
    "test_tube": "🧪",
    "petri_dish": "🧫",
    "dna": "🧬",
    "microscope": "🔬",
    "telescope": "🔭",
    "satellite": "📡",
    "syringe": "💉",
    "drop_of_blood": "🩸",
    "pill": "💊",
    "adhesive_bandage": "🩹",
    "crutch": "🩼",
    "stethoscope": "🩺",
    "x_ray": "🩻",
    "door": "🚪",
    "elevator": "🛗",
    "mirror": "🪞",
    "window": "🪟",
    "bed": "🛏️",
    "couch_and_lamp": "🛋️",
    "chair": "🪑",
    "toilet": "🚽",
    "plunger": "🪠",
    "shower": "🚿",
    "bathtub": "🛁",
    "mouse_trap": "🪤",
    "razor": "🪒",
    "lotion_bottle": "🧴",
    "safety_pin": "🧷",
    "broom": "🧹",
    "basket": "🧺",
    "roll_of_paper": "🧻",
    "bucket": "🪣",
    "soap": "🧼",
    "bubbles": "🫧",
    "toothbrush": "🪥",
    "sponge": "🧽",
    "fire_extinguisher": "🧯",
    "shopping_cart": "🛒",
    "smoking": "🚬",
    "coffin": "⚰️",
    "headstone": "🪦",
    "funeral_urn": "⚱️",
    "nazar_amulet": "🧿",
    "hamsa": "🪬",
    "moyai": "🗿",
    "placard": "🪧",
    "identification_card": "🪪",
    "atm": "🏧",
    "put_litter_in_its_place": "🚮",
    "potable_water": "🚰",
    "wheelchair": "♿",
    "mens": "🚹",
    "womens": "🚺",
    "restroom": "🚻",
    "baby_symbol": "🚼",
    "wc": "🚾",
    "passport_control": "🛂",
    "customs": "🛃",
    "baggage_claim": "🛄",
    "left_luggage": "🛅",
    "warning": "⚠️",
    "children_crossing": "🚸",
    "no_entry": "⛔",
    "no_entry_sign": "🚫",
    "no_bicycles": "🚳",
    "no_smoking": "🚭",
    "do_not_litter": "🚯",
    "non-potable_water": "🚱",
    "no_pedestrians": "🚷",
    "no_mobile_phones": "📵",
    "underage": "🔞",
    "radioactive": "☢️",
    "biohazard": "☣️",
    "arrow_up": "⬆️",
    "arrow_upper_right": "↗️",
    "arrow_right": "➡️",
    "arrow_lower_right": "↘️",
    "arrow_down": "⬇️",
    "arrow_lower_left": "↙️",
    "arrow_left": "⬅️",
    "arrow_upper_left": "↖️",
    "arrow_up_down": "↕️",
    "left_right_arrow": "↔️",
    "leftwards_arrow_with_hook": "↩️",
    "arrow_right_hook": "↪️",
    "arrow_heading_up": "⤴️",
    "arrow_heading_down": "⤵️",
    "arrows_clockwise": "🔃",
    "arrows_counterclockwise": "🔄",
    "back": "🔙",
    "end": "🔚",
    "on": "🔛",
    "soon": "🔜",
    "top": "🔝",
    "place_of_worship": "🛐",
    "atom_symbol": "⚛️",
    "om": "🕉️",
    "star_of_david": "✡️",
    "wheel_of_dharma": "☸️",
    "yin_yang": "☯️",
    "latin_cross": "✝️",
    "orthodox_cross": "☦️",
    "star_and_crescent": "☪️",
    "peace_symbol": "☮️",
    "menorah": "🕎",
    "six_pointed_star": "🔯",
    "khanda": "🪯",
    "aries": "♈",
    "taurus": "♉",
    "gemini": "♊",
    "cancer": "♋",
    "leo": "♌",
    "virgo": "♍",
    "libra": "♎",
    "scorpius": "♏",
    "sagittarius": "♐",
    "capricorn": "♑",
    "aquarius": "♒",
    "pisces": "♓",
    "ophiuchus": "⛎",
    "twisted_rightwards_arrows": "🔀",
    "repeat": "🔁",
    "repeat_one": "🔂",
    "arrow_forward": "▶️",
    "fast_forward": "⏩",
    "next_track_button": "⏭️",
    "play_or_pause_button": "⏯️",
    "arrow_backward": "◀️",
    "rewind": "⏪",
    "previous_track_button": "⏮️",
    "arrow_up_small": "🔼",
    "arrow_double_up": "⏫",
    "arrow_down_small": "🔽",
    "arrow_double_down": "⏬",
    "pause_button": "⏸️",
    "stop_button": "⏹️",
    "record_button": "⏺️",
    "eject_button": "⏏️",
    "cinema": "🎦",
    "low_brightness": "🔅",
    "high_brightness": "🔆",
    "signal_strength": "📶",
    "wireless": "🛜",
    "vibration_mode": "📳",
    "mobile_phone_off": "📴",
    "female_sign": "♀️",
    "male_sign": "♂️",
    "transgender_symbol": "⚧️",
    "heavy_multiplication_x": "✖️",
    "heavy_plus_sign": "➕",
    "heavy_minus_sign": "➖",
    "heavy_division_sign": "➗",
    "heavy_equals_sign": "🟰",
    "infinity": "♾️",
    "bangbang": "‼️",
    "interrobang": "⁉️",
    "question": "❓",
    "grey_question": "❔",
    "grey_exclamation": "❕",
    "exclamation": "❗",
    "heavy_exclamation_mark": "❗",
    "wavy_dash": "〰️",
    "currency_exchange": "💱",
    "heavy_dollar_sign": "💲",
    "medical_symbol": "⚕️",
    "recycle": "♻️",
    "fleur_de_lis": "⚜️",
    "trident": "🔱",
    "name_badge": "📛",
    "beginner": "🔰",
    "o": "⭕",
    "white_check_mark": "✅",
    "ballot_box_with_check": "☑️",
    "heavy_check_mark": "✔️",
    "x": "❌",
    "negative_squared_cross_mark": "❎",
    "curly_loop": "➰",
    "loop": "➿",
    "part_alternation_mark": "〽️",
    "eight_spoked_asterisk": "✳️",
    "eight_pointed_black_star": "✴️",
    "sparkle": "❇️",
    "copyright": "©️",
    "registered": "®️",
    "tm": "™️",
    "hash": "#️⃣",
    "asterisk": "*️⃣",
    "zero": "0️⃣",
    "one": "1️⃣",
    "two": "2️⃣",
    "three": "3️⃣",
    "four": "4️⃣",
    "five": "5️⃣",
    "six": "6️⃣",
    "seven": "7️⃣",
    "eight": "8️⃣",
    "nine": "9️⃣",
    "keycap_ten": "🔟",
    "capital_abcd": "🔠",
    "abcd": "🔡",
    "symbols": "🔣",
    "abc": "🔤",
    "a": "🅰️",
    "ab": "🆎",
    "b": "🅱️",
    "cl": "🆑",
    "cool": "🆒",
    "free": "🆓",
    "information_source": "ℹ️",
    "id": "🆔",
    "m": "Ⓜ️",
    "new": "🆕",
    "ng": "🆖",
    "o2": "🅾️",
    "ok": "🆗",
    "parking": "🅿️",
    "sos": "🆘",
    "up": "🆙",
    "vs": "🆚",
    "koko": "🈁",
    "sa": "🈂️",
    "ideograph_advantage": "🉐",
    "accept": "🉑",
    "congratulations": "㊗️",
    "secret": "㊙️",
    "u6e80": "🈵",
    "red_circle": "🔴",
    "orange_circle": "🟠",
    "yellow_circle": "🟡",
    "green_circle": "🟢",
    "large_blue_circle": "🔵",
    "purple_circle": "🟣",
    "brown_circle": "🟤",
    "black_circle": "⚫",
    "white_circle": "⚪",
    "red_square": "🟥",
    "orange_square": "🟧",
    "yellow_square": "🟨",
    "green_square": "🟩",
    "blue_square": "🟦",
    "purple_square": "🟪",
    "brown_square": "🟫",
    "black_large_square": "⬛",
    "white_large_square": "⬜",
    "black_medium_square": "◼️",
    "white_medium_square": "◻️",
    "black_medium_small_square": "◾",
    "white_medium_small_square": "◽",
    "black_small_square": "▪️",
    "white_small_square": "▫️",
    "large_orange_diamond": "🔶",
    "large_blue_diamond": "🔷",
    "small_orange_diamond": "🔸",
    "small_blue_diamond": "🔹",
    "small_red_triangle": "🔺",
    "small_red_triangle_down": "🔻",
    "diamond_shape_with_a_dot_inside": "💠",
    "radio_button": "🔘",
    "white_square_button": "🔳",
    "black_square_button": "🔲",
    "checkered_flag": "🏁",
    "triangular_flag_on_post": "🚩",
    "crossed_flags": "🎌",
    "black_flag": "🏴",
    "white_flag": "🏳️",
    "rainbow_flag": "🏳️‍🌈",
    "transgender_flag": "🏳️‍⚧️",
    "pirate_flag": "🏴‍☠️",
    "ascension_island": "🇦🇨",
    "andorra": "🇦🇩",
    "united_arab_emirates": "🇦🇪",
    "afghanistan": "🇦🇫",
    "antigua_barbuda": "🇦🇬",
    "anguilla": "🇦🇮",
    "albania": "🇦🇱",
    "armenia": "🇦🇲",
    "angola": "🇦🇴",
    "antarctica": "🇦🇶",
    "argentina": "🇦🇷",
    "american_samoa": "🇦🇸",
    "austria": "🇦🇹",
    "australia": "🇦🇺",
    "aruba": "🇦🇼",
    "aland_islands": "🇦🇽",
    "azerbaijan": "🇦🇿",
    "bosnia_herzegovina": "🇧🇦",
    "barbados": "🇧🇧",
    "bangladesh": "🇧🇩",
    "belgium": "🇧🇪",
    "burkina_faso": "🇧🇫",
    "bulgaria": "🇧🇬",
    "bahrain": "🇧🇭",
    "burundi": "🇧🇮",
    "benin": "🇧🇯",
    "st_barthelemy": "🇧🇱",
    "bermuda": "🇧🇲",
    "brunei": "🇧🇳",
    "bolivia": "🇧🇴",
    "caribbean_netherlands": "🇧🇶",
    "brazil": "🇧🇷",
    "bahamas": "🇧🇸",
    "bhutan": "🇧🇹",
    "bouvet_island": "🇧🇻",
    "botswana": "🇧🇼",
    "belarus": "🇧🇾",
    "belize": "🇧🇿",
    "canada": "🇨🇦",
    "cocos_islands": "🇨🇨",
    "congo_kinshasa": "🇨🇩",
    "central_african_republic": "🇨🇫",
    "congo_brazzaville": "🇨🇬",
    "switzerland": "🇨🇭",
    "cote_divoire": "🇨🇮",
    "cook_islands": "🇨🇰",
    "chile": "🇨🇱",
    "cameroon": "🇨🇲",
    "cn": "🇨🇳",
    "colombia": "🇨🇴",
    "clipperton_island": "🇨🇵",
    "costa_rica": "🇨🇷",
    "cuba": "🇨🇺",
    "cape_verde": "🇨🇻",
    "curacao": "🇨🇼",
    "christmas_island": "🇨🇽",
    "cyprus": "🇨🇾",
    "czech_republic": "🇨🇿",
    "de": "🇩🇪",
    "diego_garcia": "🇩🇬",
    "djibouti": "🇩🇯",
    "denmark": "🇩🇰",
    "dominica": "🇩🇲",
    "dominican_republic": "🇩🇴",
    "algeria": "🇩🇿",
    "ceuta_melilla": "🇪🇦",
    "ecuador": "🇪🇨",
    "estonia": "🇪🇪",
    "egypt": "🇪🇬",
    "western_sahara": "🇪🇭",
    "eritrea": "🇪🇷",
    "es": "🇪🇸",
    "ethiopia": "🇪🇹",
    "eu": "🇪🇺",
    "european_union": "🇪🇺",
    "finland": "🇫🇮",
    "fiji": "🇫🇯",
    "falkland_islands": "🇫🇰",
    "micronesia": "🇫🇲",
    "faroe_islands": "🇫🇴",
    "fr": "🇫🇷",
    "gabon": "🇬🇦",
    "gb": "🇬🇧",
    "uk": "🇬🇧",
    "grenada": "🇬🇩",
    "georgia": "🇬🇪",
    "french_guiana": "🇬🇫",
    "guernsey": "🇬🇬",
    "ghana": "🇬🇭",
    "gibraltar": "🇬🇮",
    "greenland": "🇬🇱",
    "gambia": "🇬🇲",
    "guinea": "🇬🇳",
    "guadeloupe": "🇬🇵",
    "equatorial_guinea": "🇬🇶",
    "greece": "🇬🇷",
    "south_georgia_south_sandwich_islands": "🇬🇸",
    "guatemala": "🇬🇹",
    "guam": "🇬🇺",
    "guinea_bissau": "🇬🇼",
    "guyana": "🇬🇾",
    "hong_kong": "🇭🇰",
    "heard_mcdonald_islands": "🇭🇲",
    "honduras": "🇭🇳",
    "croatia": "🇭🇷",
    "haiti": "🇭🇹",
    "hungary": "🇭🇺",
    "canary_islands": "🇮🇨",
    "indonesia": "🇮🇩",
    "ireland": "🇮🇪",
    "israel": "🇮🇱",
    "isle_of_man": "🇮🇲",
    "india": "🇮🇳",
    "british_indian_ocean_territory": "🇮🇴",
    "iraq": "🇮🇶",
    "iran": "🇮🇷",
    "iceland": "🇮🇸",
    "it": "🇮🇹",
    "jersey": "🇯🇪",
    "jamaica": "🇯🇲",
    "jordan": "🇯🇴",
    "jp": "🇯🇵",
    "kenya": "🇰🇪",
    "kyrgyzstan": "🇰🇬",
    "cambodia": "🇰🇭",
    "kiribati": "🇰🇮",
    "comoros": "🇰🇲",
    "st_kitts_nevis": "🇰🇳",
    "north_korea": "🇰🇵",
    "kr": "🇰🇷",
    "kuwait": "🇰🇼",
    "cayman_islands": "🇰🇾",
    "kazakhstan": "🇰🇿",
    "laos": "🇱🇦",
    "lebanon": "🇱🇧",
    "st_lucia": "🇱🇨",
    "liechtenstein": "🇱🇮",
    "sri_lanka": "🇱🇰",
    "liberia": "🇱🇷",
    "lesotho": "🇱🇸",
    "lithuania": "🇱🇹",
    "luxembourg": "🇱🇺",
    "latvia": "🇱🇻",
    "libya": "🇱🇾",
    "morocco": "🇲🇦",
    "monaco": "🇲🇨",
    "moldova": "🇲🇩",
    "montenegro": "🇲🇪",
    "st_martin": "🇲🇫",
    "madagascar": "🇲🇬",
    "marshall_islands": "🇲🇭",
    "macedonia": "🇲🇰",
    "mali": "🇲🇱",
    "myanmar": "🇲🇲",
    "mongolia": "🇲🇳",
    "macau": "🇲🇴",
    "northern_mariana_islands": "🇲🇵",
    "martinique": "🇲🇶",
    "mauritania": "🇲🇷",
    "montserrat": "🇲🇸",
    "malta": "🇲🇹",
    "mauritius": "🇲🇺",
    "maldives": "🇲🇻",
    "malawi": "🇲🇼",
    "mexico": "🇲🇽",
    "malaysia": "🇲🇾",
    "mozambique": "🇲🇿",
    "namibia": "🇳🇦",
    "new_caledonia": "🇳🇨",
    "niger": "🇳🇪",
    "norfolk_island": "🇳🇫",
    "nigeria": "🇳🇬",
    "nicaragua": "🇳🇮",
    "netherlands": "🇳🇱",
    "norway": "🇳🇴",
    "nepal": "🇳🇵",
    "nauru": "🇳🇷",
    "niue": "🇳🇺",
    "new_zealand": "🇳🇿",
    "oman": "🇴🇲",
    "panama": "🇵🇦",
    "peru": "🇵🇪",
    "french_polynesia": "🇵🇫",
    "papua_new_guinea": "🇵🇬",
    "philippines": "🇵🇭",
    "pakistan": "🇵🇰",
    "poland": "🇵🇱",
    "st_pierre_miquelon": "🇵🇲",
    "pitcairn_islands": "🇵🇳",
    "puerto_rico": "🇵🇷",
    "palestinian_territories": "🇵🇸",
    "portugal": "🇵🇹",
    "palau": "🇵🇼",
    "paraguay": "🇵🇾",
    "qatar": "🇶🇦",
    "reunion": "🇷🇪",
    "romania": "🇷🇴",
    "serbia": "🇷🇸",
    "ru": "🇷🇺",
    "rwanda": "🇷🇼",
    "saudi_arabia": "🇸🇦",
    "solomon_islands": "🇸🇧",
    "seychelles": "🇸🇨",
    "sudan": "🇸🇩",
    "sweden": "🇸🇪",
    "singapore": "🇸🇬",
    "st_helena": "🇸🇭",
    "slovenia": "🇸🇮",
    "svalbard_jan_mayen": "🇸🇯",
    "slovakia": "🇸🇰",
    "sierra_leone": "🇸🇱",
    "san_marino": "🇸🇲",
    "senegal": "🇸🇳",
    "somalia": "🇸🇴",
    "suriname": "🇸🇷",
    "south_sudan": "🇸🇸",
    "sao_tome_principe": "🇸🇹",
    "el_salvador": "🇸🇻",
    "sint_maarten": "🇸🇽",
    "syria": "🇸🇾",
    "swaziland": "🇸🇿",
    "tristan_da_cunha": "🇹🇦",
    "turks_caicos_islands": "🇹🇨",
    "chad": "🇹🇩",
    "french_southern_territories": "🇹🇫",
    "togo": "🇹🇬",
    "thailand": "🇹🇭",
    "tajikistan": "🇹🇯",
    "tokelau": "🇹🇰",
    "timor_leste": "🇹🇱",
    "turkmenistan": "🇹🇲",
    "tunisia": "🇹🇳",
    "tonga": "🇹🇴",
    "tr": "🇹🇷",
    "trinidad_tobago": "🇹🇹",
    "tuvalu": "🇹🇻",
    "taiwan": "🇹🇼",
    "tanzania": "🇹🇿",
    "ukraine": "🇺🇦",
    "uganda": "🇺🇬",
    "us_outlying_islands": "🇺🇲",
    "united_nations": "🇺🇳",
    "us": "🇺🇸",
    "uruguay": "🇺🇾",
    "uzbekistan": "🇺🇿",
    "vatican_city": "🇻🇦",
    "st_vincent_grenadines": "🇻🇨",
    "venezuela": "🇻🇪",
    "british_virgin_islands": "🇻🇬",
    "us_virgin_islands": "🇻🇮",
    "vietnam": "🇻🇳",
    "vanuatu": "🇻🇺",
    "wallis_futuna": "🇼🇫",
    "samoa": "🇼🇸",
    "kosovo": "🇽🇰",
    "yemen": "🇾🇪",
    "mayotte": "🇾🇹",
    "south_africa": "🇿🇦",
    "zambia": "🇿🇲",
    "zimbabwe": "🇿🇼",
    "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿"
  };

  function emoji_plugin (md, options) {
    const defaults = {
      defs: emojies_defs,
      shortcuts: emojies_shortcuts,
      enabled: []
    };

    const opts = md.utils.assign({}, defaults, options || {});

    emoji_plugin$2(md, opts);
  }

  var markdownItEmoji = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bare: emoji_plugin$2,
    full: emoji_plugin,
    light: emoji_plugin$1
  });

  var markdownItTaskLists$1;
  var hasRequiredMarkdownItTaskLists;

  function requireMarkdownItTaskLists () {
  	if (hasRequiredMarkdownItTaskLists) return markdownItTaskLists$1;
  	hasRequiredMarkdownItTaskLists = 1;
  	// Markdown-it plugin to render GitHub-style task lists; see
  	//
  	// https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments
  	// https://github.com/blog/1825-task-lists-in-all-markdown-documents

  	var disableCheckboxes = true;
  	var useLabelWrapper = false;
  	var useLabelAfter = false;

  	markdownItTaskLists$1 = function(md, options) {
  		if (options) {
  			disableCheckboxes = !options.enabled;
  			useLabelWrapper = !!options.label;
  			useLabelAfter = !!options.labelAfter;
  		}

  		md.core.ruler.after('inline', 'github-task-lists', function(state) {
  			var tokens = state.tokens;
  			for (var i = 2; i < tokens.length; i++) {
  				if (isTodoItem(tokens, i)) {
  					todoify(tokens[i], state.Token);
  					attrSet(tokens[i-2], 'class', 'task-list-item' + (!disableCheckboxes ? ' enabled' : ''));
  					attrSet(tokens[parentToken(tokens, i-2)], 'class', 'contains-task-list');
  				}
  			}
  		});
  	};

  	function attrSet(token, name, value) {
  		var index = token.attrIndex(name);
  		var attr = [name, value];

  		if (index < 0) {
  			token.attrPush(attr);
  		} else {
  			token.attrs[index] = attr;
  		}
  	}

  	function parentToken(tokens, index) {
  		var targetLevel = tokens[index].level - 1;
  		for (var i = index - 1; i >= 0; i--) {
  			if (tokens[i].level === targetLevel) {
  				return i;
  			}
  		}
  		return -1;
  	}

  	function isTodoItem(tokens, index) {
  		return isInline(tokens[index]) &&
  		       isParagraph(tokens[index - 1]) &&
  		       isListItem(tokens[index - 2]) &&
  		       startsWithTodoMarkdown(tokens[index]);
  	}

  	function todoify(token, TokenConstructor) {
  		token.children.unshift(makeCheckbox(token, TokenConstructor));
  		token.children[1].content = token.children[1].content.slice(3);
  		token.content = token.content.slice(3);

  		if (useLabelWrapper) {
  			if (useLabelAfter) {
  				token.children.pop();

  				// Use large random number as id property of the checkbox.
  				var id = 'task-item-' + Math.ceil(Math.random() * (10000 * 1000) - 1000);
  				token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
  				token.children.push(afterLabel(token.content, id, TokenConstructor));
  			} else {
  				token.children.unshift(beginLabel(TokenConstructor));
  				token.children.push(endLabel(TokenConstructor));
  			}
  		}
  	}

  	function makeCheckbox(token, TokenConstructor) {
  		var checkbox = new TokenConstructor('html_inline', '', 0);
  		var disabledAttr = disableCheckboxes ? ' disabled="" ' : '';
  		if (token.content.indexOf('[ ] ') === 0) {
  			checkbox.content = '<input class="task-list-item-checkbox"' + disabledAttr + 'type="checkbox">';
  		} else if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
  			checkbox.content = '<input class="task-list-item-checkbox" checked=""' + disabledAttr + 'type="checkbox">';
  		}
  		return checkbox;
  	}

  	// these next two functions are kind of hacky; probably should really be a
  	// true block-level token with .tag=='label'
  	function beginLabel(TokenConstructor) {
  		var token = new TokenConstructor('html_inline', '', 0);
  		token.content = '<label>';
  		return token;
  	}

  	function endLabel(TokenConstructor) {
  		var token = new TokenConstructor('html_inline', '', 0);
  		token.content = '</label>';
  		return token;
  	}

  	function afterLabel(content, id, TokenConstructor) {
  		var token = new TokenConstructor('html_inline', '', 0);
  		token.content = '<label class="task-list-item-label" for="' + id + '">' + content + '</label>';
  		token.attrs = [{for: id}];
  		return token;
  	}

  	function isInline(token) { return token.type === 'inline'; }
  	function isParagraph(token) { return token.type === 'paragraph_open'; }
  	function isListItem(token) { return token.type === 'list_item_open'; }

  	function startsWithTodoMarkdown(token) {
  		// leading whitespace in a list item is already trimmed off by markdown-it
  		return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0;
  	}
  	return markdownItTaskLists$1;
  }

  var markdownItTaskListsExports = requireMarkdownItTaskLists();
  var index = /*@__PURE__*/getDefaultExportFromCjs(markdownItTaskListsExports);

  var markdownItTaskLists = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    default: index
  }, [markdownItTaskListsExports]);

  // Enclose abbreviations in <abbr> tags
  //
  function abbr_plugin (md) {
    const escapeRE        = md.utils.escapeRE;
    const arrayReplaceAt  = md.utils.arrayReplaceAt;

    // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
    // you can check character classes here:
    // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
    const OTHER_CHARS      = ' \r\n$+<=>^`|~';

    const UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
    const UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;

    function abbr_def (state, startLine, endLine, silent) {
      let labelEnd;
      let pos = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];

      if (pos + 2 >= max) { return false }

      if (state.src.charCodeAt(pos++) !== 0x2A/* * */) { return false }
      if (state.src.charCodeAt(pos++) !== 0x5B/* [ */) { return false }

      const labelStart = pos;

      for (; pos < max; pos++) {
        const ch = state.src.charCodeAt(pos);
        if (ch === 0x5B /* [ */) {
          return false
        } else if (ch === 0x5D /* ] */) {
          labelEnd = pos;
          break
        } else if (ch === 0x5C /* \ */) {
          pos++;
        }
      }

      if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A/* : */) {
        return false
      }

      if (silent) { return true }

      const label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
      const title = state.src.slice(labelEnd + 2, max).trim();
      if (label.length === 0) { return false }
      if (title.length === 0) { return false }
      if (!state.env.abbreviations) { state.env.abbreviations = {}; }
      // prepend ':' to avoid conflict with Object.prototype members
      if (typeof state.env.abbreviations[':' + label] === 'undefined') {
        state.env.abbreviations[':' + label] = title;
      }

      state.line = startLine + 1;
      return true
    }

    function abbr_replace (state) {
      const blockTokens = state.tokens;

      if (!state.env.abbreviations) { return }

      const regSimple = new RegExp('(?:' +
        Object.keys(state.env.abbreviations).map(function (x) {
          return x.substr(1)
        }).sort(function (a, b) {
          return b.length - a.length
        }).map(escapeRE).join('|') +
      ')');

      const regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                      '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])' +
              '(' + Object.keys(state.env.abbreviations).map(function (x) {
        return x.substr(1)
      }).sort(function (a, b) {
        return b.length - a.length
      }).map(escapeRE).join('|') + ')' +
              '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                      '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';

      const reg = new RegExp(regText, 'g');

      for (let j = 0, l = blockTokens.length; j < l; j++) {
        if (blockTokens[j].type !== 'inline') { continue }
        let tokens = blockTokens[j].children;

        // We scan from the end, to keep position when new tags added.
        for (let i = tokens.length - 1; i >= 0; i--) {
          const currentToken = tokens[i];
          if (currentToken.type !== 'text') { continue }

          let pos = 0;
          const text = currentToken.content;
          reg.lastIndex = 0;
          const nodes = [];

          // fast regexp run to determine whether there are any abbreviated words
          // in the current token
          if (!regSimple.test(text)) { continue }

          let m;

          while ((m = reg.exec(text))) {
            if (m.index > 0 || m[1].length > 0) {
              const token = new state.Token('text', '', 0);
              token.content = text.slice(pos, m.index + m[1].length);
              nodes.push(token);
            }

            const token_o = new state.Token('abbr_open', 'abbr', 1);
            token_o.attrs = [['title', state.env.abbreviations[':' + m[2]]]];
            nodes.push(token_o);

            const token_t = new state.Token('text', '', 0);
            token_t.content = m[2];
            nodes.push(token_t);

            const token_c = new state.Token('abbr_close', 'abbr', -1);
            nodes.push(token_c);

            reg.lastIndex -= m[3].length;
            pos = reg.lastIndex;
          }

          if (!nodes.length) { continue }

          if (pos < text.length) {
            const token = new state.Token('text', '', 0);
            token.content = text.slice(pos);
            nodes.push(token);
          }

          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
        }
      }
    }

    md.block.ruler.before('reference', 'abbr_def', abbr_def, { alt: ['paragraph', 'reference'] });

    md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
  }

  var markdownItAbbr = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: abbr_plugin
  });

  // Process definition lists
  //
  function deflist_plugin (md) {
    const isSpace = md.utils.isSpace;

    // Search `[:~][\n ]`, returns next pos after marker on success
    // or -1 on fail.
    function skipMarker (state, line) {
      let start = state.bMarks[line] + state.tShift[line];
      const max = state.eMarks[line];

      if (start >= max) { return -1 }

      // Check bullet
      const marker = state.src.charCodeAt(start++);
      if (marker !== 0x7E/* ~ */ && marker !== 0x3A/* : */) { return -1 }

      const pos = state.skipSpaces(start);

      // require space after ":"
      if (start === pos) { return -1 }

      // no empty definitions, e.g. "  : "
      if (pos >= max) { return -1 }

      return start
    }

    function markTightParagraphs (state, idx) {
      const level = state.level + 2;

      for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
        if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
          state.tokens[i + 2].hidden = true;
          state.tokens[i].hidden = true;
          i += 2;
        }
      }
    }

    function deflist (state, startLine, endLine, silent) {
      if (silent) {
        // quirk: validation mode validates a dd block only, not a whole deflist
        if (state.ddIndent < 0) { return false }
        return skipMarker(state, startLine) >= 0
      }

      let nextLine = startLine + 1;
      if (nextLine >= endLine) { return false }

      if (state.isEmpty(nextLine)) {
        nextLine++;
        if (nextLine >= endLine) { return false }
      }

      if (state.sCount[nextLine] < state.blkIndent) { return false }
      let contentStart = skipMarker(state, nextLine);
      if (contentStart < 0) { return false }

      // Start list
      const listTokIdx = state.tokens.length;
      let tight = true;

      const token_dl_o = state.push('dl_open', 'dl', 1);
      const listLines = [startLine, 0];
      token_dl_o.map = listLines;

      //
      // Iterate list items
      //

      let dtLine = startLine;
      let ddLine = nextLine;

      // One definition list can contain multiple DTs,
      // and one DT can be followed by multiple DDs.
      //
      // Thus, there is two loops here, and label is
      // needed to break out of the second one
      //
      /* eslint no-labels:0,block-scoped-var:0 */
      OUTER:
      for (;;) {
        let prevEmptyEnd = false;

        const token_dt_o = state.push('dt_open', 'dt', 1);
        token_dt_o.map = [dtLine, dtLine];

        const token_i = state.push('inline', '', 0);
        token_i.map      = [dtLine, dtLine];
        token_i.content  = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim();
        token_i.children = [];

        state.push('dt_close', 'dt', -1);

        for (;;) {
          const token_dd_o = state.push('dd_open', 'dd', 1);
          const itemLines = [nextLine, 0];
          token_dd_o.map = itemLines;

          let pos = contentStart;
          const max = state.eMarks[ddLine];
          let offset = state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine]);

          while (pos < max) {
            const ch = state.src.charCodeAt(pos);

            if (isSpace(ch)) {
              if (ch === 0x09) {
                offset += 4 - offset % 4;
              } else {
                offset++;
              }
            } else {
              break
            }

            pos++;
          }

          contentStart = pos;

          const oldTight = state.tight;
          const oldDDIndent = state.ddIndent;
          const oldIndent = state.blkIndent;
          const oldTShift = state.tShift[ddLine];
          const oldSCount = state.sCount[ddLine];
          const oldParentType = state.parentType;
          state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2;
          state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
          state.sCount[ddLine] = offset;
          state.tight = true;
          state.parentType = 'deflist';

          state.md.block.tokenize(state, ddLine, endLine, true);

          // If any of list item is tight, mark list as tight
          if (!state.tight || prevEmptyEnd) {
            tight = false;
          }
          // Item become loose if finish with empty line,
          // but we should filter last element, because it means list finish
          prevEmptyEnd = (state.line - ddLine) > 1 && state.isEmpty(state.line - 1);

          state.tShift[ddLine] = oldTShift;
          state.sCount[ddLine] = oldSCount;
          state.tight = oldTight;
          state.parentType = oldParentType;
          state.blkIndent = oldIndent;
          state.ddIndent = oldDDIndent;

          state.push('dd_close', 'dd', -1);

          itemLines[1] = nextLine = state.line;

          if (nextLine >= endLine) { break OUTER }

          if (state.sCount[nextLine] < state.blkIndent) { break OUTER }
          contentStart = skipMarker(state, nextLine);
          if (contentStart < 0) { break }

          ddLine = nextLine;

          // go to the next loop iteration:
          // insert DD tag and repeat checking
        }

        if (nextLine >= endLine) { break }
        dtLine = nextLine;

        if (state.isEmpty(dtLine)) { break }
        if (state.sCount[dtLine] < state.blkIndent) { break }

        ddLine = dtLine + 1;
        if (ddLine >= endLine) { break }
        if (state.isEmpty(ddLine)) { ddLine++; }
        if (ddLine >= endLine) { break }

        if (state.sCount[ddLine] < state.blkIndent) { break }
        contentStart = skipMarker(state, ddLine);
        if (contentStart < 0) { break }

        // go to the next loop iteration:
        // insert DT and DD tags and repeat checking
      }

      // Finilize list
      state.push('dl_close', 'dl', -1);

      listLines[1] = nextLine;

      state.line = nextLine;

      // mark paragraphs tight if needed
      if (tight) {
        markTightParagraphs(state, listTokIdx);
      }

      return true
    }

    md.block.ruler.before('paragraph', 'deflist', deflist, { alt: ['paragraph', 'reference', 'blockquote'] });
  }

  var markdownItDeflist = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: deflist_plugin
  });

  function ins_plugin (md) {
    // Insert each marker as a separate text token, and add it to delimiter list
    //
    function tokenize (state, silent) {
      const start = state.pos;
      const marker = state.src.charCodeAt(start);

      if (silent) { return false }

      if (marker !== 0x3D/* = */) { return false }

      const scanned = state.scanDelims(state.pos, true);
      let len = scanned.length;
      const ch = String.fromCharCode(marker);

      if (len < 2) { return false }

      if (len % 2) {
        const token = state.push('text', '', 0);
        token.content = ch;
        len--;
      }

      for (let i = 0; i < len; i += 2) {
        const token = state.push('text', '', 0);
        token.content = ch + ch;

        if (!scanned.can_open && !scanned.can_close) { continue }

        state.delimiters.push({
          marker,
          length: 0,     // disable "rule of 3" length checks meant for emphasis
          jump: i / 2, // 1 delimiter = 2 characters
          token: state.tokens.length - 1,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close
        });
      }

      state.pos += scanned.length;

      return true
    }

    // Walk through delimiter list and replace text tokens with tags
    //
    function postProcess (state, delimiters) {
      const loneMarkers = [];
      const max = delimiters.length;

      for (let i = 0; i < max; i++) {
        const startDelim = delimiters[i];

        if (startDelim.marker !== 0x3D/* = */) {
          continue
        }

        if (startDelim.end === -1) {
          continue
        }

        const endDelim = delimiters[startDelim.end];

        const token_o = state.tokens[startDelim.token];
        token_o.type = 'mark_open';
        token_o.tag = 'mark';
        token_o.nesting = 1;
        token_o.markup = '==';
        token_o.content = '';

        const token_c = state.tokens[endDelim.token];
        token_c.type = 'mark_close';
        token_c.tag = 'mark';
        token_c.nesting = -1;
        token_c.markup = '==';
        token_c.content = '';

        if (state.tokens[endDelim.token - 1].type === 'text' &&
            state.tokens[endDelim.token - 1].content === '=') {
          loneMarkers.push(endDelim.token - 1);
        }
      }

      // If a marker sequence has an odd number of characters, it's splitted
      // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
      // start of the sequence.
      //
      // So, we have to move all those markers after subsequent s_close tags.
      //
      while (loneMarkers.length) {
        const i = loneMarkers.pop();
        let j = i + 1;

        while (j < state.tokens.length && state.tokens[j].type === 'mark_close') {
          j++;
        }

        j--;

        if (i !== j) {
          const token = state.tokens[j];
          state.tokens[j] = state.tokens[i];
          state.tokens[i] = token;
        }
      }
    }

    md.inline.ruler.before('emphasis', 'mark', tokenize);
    md.inline.ruler2.before('emphasis', 'mark', function (state) {
      let curr;
      const tokens_meta = state.tokens_meta;
      const max = (state.tokens_meta || []).length;

      postProcess(state, state.delimiters);

      for (curr = 0; curr < max; curr++) {
        if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
          postProcess(state, tokens_meta[curr].delimiters);
        }
      }
    });
  }

  var markdownItMark = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: ins_plugin
  });

  // Process ~subscript~

  // same as UNESCAPE_MD_RE plus a space
  const UNESCAPE_RE$1 = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;

  function subscript (state, silent) {
    const max = state.posMax;
    const start = state.pos;

    if (state.src.charCodeAt(start) !== 0x7E/* ~ */) { return false }
    if (silent) { return false } // don't run any pairs in validation mode
    if (start + 2 >= max) { return false }

    state.pos = start + 1;
    let found = false;

    while (state.pos < max) {
      if (state.src.charCodeAt(state.pos) === 0x7E/* ~ */) {
        found = true;
        break
      }

      state.md.inline.skipToken(state);
    }

    if (!found || start + 1 === state.pos) {
      state.pos = start;
      return false
    }

    const content = state.src.slice(start + 1, state.pos);

    // don't allow unescaped spaces/newlines inside
    if (content.match(/(^|[^\\])(\\\\)*\s/)) {
      state.pos = start;
      return false
    }

    // found!
    state.posMax = state.pos;
    state.pos = start + 1;

    // Earlier we checked !silent, but this implementation does not need it
    const token_so = state.push('sub_open', 'sub', 1);
    token_so.markup = '~';

    const token_t = state.push('text', '', 0);
    token_t.content = content.replace(UNESCAPE_RE$1, '$1');

    const token_sc = state.push('sub_close', 'sub', -1);
    token_sc.markup = '~';

    state.pos = state.posMax + 1;
    state.posMax = max;
    return true
  }

  function sub_plugin (md) {
    md.inline.ruler.after('emphasis', 'sub', subscript);
  }

  var markdownItSub = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: sub_plugin
  });

  // Process ^superscript^

  // same as UNESCAPE_MD_RE plus a space
  const UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;

  function superscript (state, silent) {
    const max = state.posMax;
    const start = state.pos;

    if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false }
    if (silent) { return false } // don't run any pairs in validation mode
    if (start + 2 >= max) { return false }

    state.pos = start + 1;
    let found = false;

    while (state.pos < max) {
      if (state.src.charCodeAt(state.pos) === 0x5E/* ^ */) {
        found = true;
        break
      }

      state.md.inline.skipToken(state);
    }

    if (!found || start + 1 === state.pos) {
      state.pos = start;
      return false
    }

    const content = state.src.slice(start + 1, state.pos);

    // don't allow unescaped spaces/newlines inside
    if (content.match(/(^|[^\\])(\\\\)*\s/)) {
      state.pos = start;
      return false
    }

    // found!
    state.posMax = state.pos;
    state.pos = start + 1;

    // Earlier we checked !silent, but this implementation does not need it
    const token_so = state.push('sup_open', 'sup', 1);
    token_so.markup = '^';

    const token_t = state.push('text', '', 0);
    token_t.content = content.replace(UNESCAPE_RE, '$1');

    const token_sc = state.push('sup_close', 'sup', -1);
    token_sc.markup = '^';

    state.pos = state.posMax + 1;
    state.posMax = max;
    return true
  }

  function sup_plugin (md) {
    md.inline.ruler.after('emphasis', 'sup', superscript);
  }

  var markdownItSup = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: sup_plugin
  });

  /**
   * OntoWave Markdown Parser avec markdown-it
   * Migration du parser maison vers markdown-it avec plugins optionnels
   */
  // Configuration plugins disponibles
  const AVAILABLE_PLUGINS = {
      footnote: {
          name: 'markdown-it-footnote',
          plugin: markdownItFootnote,
          description: 'Support des notes de bas de page [^1]',
      },
      emoji: {
          name: 'markdown-it-emoji',
          plugin: markdownItEmoji,
          description: 'Support des emoji :smile:',
      },
      taskLists: {
          name: 'markdown-it-task-lists',
          plugin: markdownItTaskLists,
          description: 'Support des task lists - [ ] et - [x]',
      },
      abbr: {
          name: 'markdown-it-abbr',
          plugin: markdownItAbbr,
          description: 'Support des abréviations *[HTML]: HyperText Markup Language',
      },
      deflist: {
          name: 'markdown-it-deflist',
          plugin: markdownItDeflist,
          description: 'Support des listes de définition',
      },
      mark: {
          name: 'markdown-it-mark',
          plugin: markdownItMark,
          description: 'Support du marquage ==texte surligné==',
      },
      sub: {
          name: 'markdown-it-sub',
          plugin: markdownItSub,
          description: 'Support du subscript H~2~O',
      },
      sup: {
          name: 'markdown-it-sup',
          plugin: markdownItSup,
          description: 'Support du superscript x^2^',
      },
  };
  class MarkdownParser {
      constructor(config = {}) {
          Object.defineProperty(this, "md", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          Object.defineProperty(this, "config", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          this.config = {
              html: true,
              linkify: true,
              typographer: true,
              breaks: false,
              plugins: [], // Pas de plugins par défaut (bundle léger)
              enableOntoWaveLinks: true,
              ...config,
          };
          // Initialiser markdown-it
          this.md = new MarkdownIt({
              html: this.config.html,
              linkify: this.config.linkify,
              typographer: this.config.typographer,
              breaks: this.config.breaks,
          });
          // Charger plugins configurés
          this.loadPlugins();
          // Customisation OntoWave
          if (this.config.enableOntoWaveLinks) {
              this.setupOntoWaveLinks();
          }
      }
      loadPlugins() {
          if (!this.config.plugins || this.config.plugins.length === 0) {
              console.log('🔧 markdown-it initialisé sans plugins (mode léger)');
              return;
          }
          console.log('🔌 Chargement plugins markdown-it:', this.config.plugins);
          this.config.plugins.forEach((pluginKey) => {
              const pluginInfo = AVAILABLE_PLUGINS[pluginKey];
              if (pluginInfo) {
                  this.md.use(pluginInfo.plugin);
                  console.log(`  ✅ ${pluginInfo.name} chargé`);
              }
              else {
                  console.warn(`  ⚠️ Plugin inconnu: ${pluginKey}`);
              }
          });
      }
      setupOntoWaveLinks() {
          // Sauvegarder le renderer de liens original
          const defaultRender = this.md.renderer.rules.link_open ||
              ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
          // Override du renderer pour liens internes OntoWave
          this.md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
              const token = tokens[idx];
              const hrefIndex = token.attrIndex('href');
              if (hrefIndex >= 0) {
                  const href = token.attrs[hrefIndex][1];
                  // Liens internes (pas http/https, pas fichiers téléchargeables)
                  const isExternal = /^https?:\/\//.test(href);
                  const isDownload = /\.(tar\.gz|zip|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|xml|js|css|png|jpg|jpeg|gif|svg|webp)$/i.test(href);
                  const isHtmlFile = /\.html/.test(href);
                  if (!isExternal && !isDownload && !isHtmlFile) {
                      // Lien interne OntoWave
                      token.attrSet('href', `#${href}`);
                      token.attrSet('onclick', `window.OntoWave?.loadPage('${href}'); return false;`);
                  }
                  else if (isExternal) {
                      // Lien externe
                      token.attrSet('target', '_blank');
                      token.attrSet('rel', 'noopener noreferrer');
                  }
                  else if (isDownload) {
                      // Fichier téléchargeable
                      token.attrSet('download', '');
                  }
              }
              return defaultRender(tokens, idx, options, env, self);
          };
      }
      /**
       * Parser Markdown vers HTML
       */
      render(markdown) {
          try {
              return this.md.render(markdown);
          }
          catch (error) {
              console.error('❌ Erreur parsing Markdown:', error);
              return `<div style="color: #d73a49; padding: 20px;">
        ❌ Erreur de rendu Markdown
        <pre style="margin-top: 10px; background: #f6f8fa; padding: 10px;">${error}</pre>
      </div>`;
          }
      }
      /**
       * Parser inline (sans blocs)
       */
      renderInline(markdown) {
          try {
              return this.md.renderInline(markdown);
          }
          catch (error) {
              console.error('❌ Erreur parsing Markdown inline:', error);
              return markdown;
          }
      }
      /**
       * Obtenir l'instance markdown-it pour customisation avancée
       */
      getMarkdownIt() {
          return this.md;
      }
      /**
       * Mettre à jour la configuration et réinitialiser
       */
      updateConfig(newConfig) {
          this.config = { ...this.config, ...newConfig };
          // Réinitialiser markdown-it avec nouvelle config
          this.md = new MarkdownIt({
              html: this.config.html,
              linkify: this.config.linkify,
              typographer: this.config.typographer,
              breaks: this.config.breaks,
          });
          this.loadPlugins();
          if (this.config.enableOntoWaveLinks) {
              this.setupOntoWaveLinks();
          }
      }
      /**
       * Lister les plugins actifs
       */
      getActivePlugins() {
          return this.config.plugins || [];
      }
      /**
       * Lister tous les plugins disponibles
       */
      static getAvailablePlugins() {
          return AVAILABLE_PLUGINS;
      }
  }

  /**
   * Point d'entrée pour build standalone OntoWave avec markdown-it
   * Ce fichier sera bundlé par Rollup en dist/ontowave.js (IIFE)
   */

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: CODE ONTOWAVE (navigation, UI, configuration)
  // ═══════════════════════════════════════════════════════════════


  // Traductions pour l'interface
  const TRANSLATIONS = {
    fr: {
      // Menu
      menuHome: "Accueil",
      menuGallery: "Galerie", 
      menuConfiguration: "Configuration",
      
      // Panneau de configuration
      configTitle: "OntoWave - Configuration Complète",
      configGeneral: "Général",
      configSiteTitle: "Titre du site :",
      configDefaultPage: "Page par défaut :",
      configBaseUrl: "URL de base :",
      configLanguages: "Langues et Localisation",
      configSupportedLanguages: "Langues supportées (séparées par des virgules) :",
      configFallbackLanguage: "Langue de fallback :",
      configNavigation: "Navigation et Interface",
      configShowGallery: "Afficher la galerie d'exemples",
      configHomeButton: "Bouton Accueil",
      configBreadcrumb: "Fil d'Ariane (breadcrumb)",
      configToc: "Table des matières",
      configMermaid: "Diagrammes Mermaid",
      configMermaidTheme: "Thème Mermaid :",
      configMermaidAuto: "Démarrage automatique",
      configMermaidMaxWidth: "Utiliser la largeur maximale",
      configPlantuml: "Diagrammes PlantUML",
      configPlantumlServer: "Serveur PlantUML :",
      configPlantumlFormat: "Format de sortie :",
      configPrism: "Coloration Syntaxique (Prism.js)",
      configPrismTheme: "Thème Prism :",
      configPrismAutoload: "Chargement automatique",
      configUI: "Interface Utilisateur",
      configUITheme: "Thème de l'interface :",
      configUIResponsive: "Design responsive",
      configUIAnimations: "Animations et transitions",
      configApply: "Appliquer Configuration",
      configDownloadHTML: "Télécharger HTML",
      configDownloadJS: "Télécharger ontowave.min.js",
      configReset: "Réinitialiser",
      configLanguageNote: "Laissez vide pour un site monolingue"
    },
    en: {
      // Menu
      menuHome: "Home",
      menuGallery: "Gallery",
      menuConfiguration: "Configuration",
      
      // Configuration Panel
      configTitle: "OntoWave - Complete Configuration",
      configGeneral: "General",
      configSiteTitle: "Site title:",
      configDefaultPage: "Default page:",
      configBaseUrl: "Base URL:",
      configLanguages: "Languages and Localization",
      configSupportedLanguages: "Supported languages (comma separated):",
      configFallbackLanguage: "Fallback language:",
      configNavigation: "Navigation and Interface",
      configShowGallery: "Show examples gallery",
      configHomeButton: "Home button",
      configBreadcrumb: "Breadcrumb navigation",
      configToc: "Table of contents",
      configMermaid: "Mermaid Diagrams",
      configMermaidTheme: "Mermaid theme:",
      configMermaidAuto: "Auto start",
      configMermaidMaxWidth: "Use maximum width",
      configPlantuml: "PlantUML Diagrams",
      configPlantumlServer: "PlantUML server:",
      configPlantumlFormat: "Output format:",
      configPrism: "Syntax Highlighting (Prism.js)",
      configPrismTheme: "Prism theme:",
      configPrismAutoload: "Auto loading",
      configUI: "User Interface",
      configUITheme: "Interface theme:",
      configUIResponsive: "Responsive design",
      configUIAnimations: "Animations and transitions",
      configApply: "Apply Configuration",
      configDownloadHTML: "Download HTML",
      configDownloadJS: "Download ontowave.min.js",
      configReset: "Reset",
      configLanguageNote: "Leave empty for monolingual site"
    }
  };

  // Configuration par défaut
  const DEFAULT_CONFIG = {
    title: "OntoWave Documentation",
    baseUrl: "/",
    defaultPage: "index.md",
    containerId: "ontowave-container",
    locales: ["fr", "en"], // Langues supportées par défaut
    fallbackLocale: "en",
    showGallery: false, // Gallerie désactivée par défaut
    mermaid: {
      theme: "default",
      startOnLoad: true,
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true },
      gantt: { useMaxWidth: true },
      journey: { useMaxWidth: true }
    },
    plantuml: {
      server: "https://www.plantuml.com/plantuml",
      format: "svg"
    },
    prism: {
      theme: "default",
      autoload: true
    },
    navigation: {
      showHome: true,
      showBreadcrumb: true,
      showToc: true
    },
    ui: {
      theme: "default",
      responsive: true,
      animations: true,
      languageButtons: "menu" // "fixed", "menu", "both"
    }
  };

  // Styles CSS intégrés
  const CSS_STYLES = `
    .ontowave-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      background: #fff;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
    
    
    .ontowave-floating-menu {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #e1e4e8;
      border-radius: 44px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(27,31,35,0.15);
      cursor: move;
      transition: all 0.3s ease;
      font-size: 1.2em;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0;
      width: 44px;
      height: 44px;
      overflow: visible;
      white-space: nowrap;
    }
    
    .ontowave-floating-menu.no-drag {
      cursor: default;
    }
    
    .ontowave-floating-menu.expanded {
      width: auto;
      height: auto;
      min-height: 44px;
      border-radius: 22px;
      padding: 10px 18px;
      gap: 10px;
    }
    
    .ontowave-floating-menu:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(27,31,35,0.25);
    }
    
    
    .ontowave-floating-menu.has-config-panel:hover {
      transform: none;
    }
    
    .ontowave-menu-icon {
      cursor: pointer;
      transition: transform 0.3s ease;
      flex-shrink: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4em;
      text-align: center;
      line-height: 1;
      margin: 0 auto;
    }
    
    .ontowave-menu-icon:hover {
      transform: scale(1.2);
    }
    
    .ontowave-menu-content {
      display: flex;
      align-items: center;
      gap: 15px;
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
    
    .ontowave-floating-menu.expanded .ontowave-menu-content {
      opacity: 1;
      width: auto;
      overflow: visible;
    }
    
    .ontowave-menu-brand {
      font-weight: 600;
      color: #0969da;
      text-decoration: none;
      cursor: pointer;
      font-size: 0.9em;
    }
    
    .ontowave-menu-brand:hover {
      color: #0550ae;
    }
    
    .org-suffix {
      font-size: 0.7em;
      opacity: 0.7;
      font-weight: normal;
    }
    
    .ontowave-menu-options {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }
    
    .ontowave-menu-option {
      padding: 6px 10px;
      background: #f8f9fa;
      border: 1px solid #d0d7de;
      border-radius: 15px;
      font-size: 0.75em;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      pointer-events: auto;
    }
    
    .ontowave-menu-option:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }
    
    .ontowave-menu-option.selected {
      background: #0969da;
      color: white;
      border-color: #0969da;
      box-shadow: 0 2px 8px rgba(9, 105, 218, 0.3);
    }
    
    .ontowave-menu-option.selected:hover {
      background: #0550ae;
      border-color: #0550ae;
      transform: translateY(-1px);
    }
    
    
    .ontowave-lang-btn {
      font-weight: bold;
      font-size: 11px;
    }
    
    .ontowave-lang-btn.active {
      background: #28a745;
      color: white;
      border-color: #28a745;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }
    
    .ontowave-lang-btn.active:hover {
      background: #1e7e34;
      border-color: #1e7e34;
    }
    
    
    .ontowave-fixed-lang-buttons {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999;
      display: flex;
      gap: 8px;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px 12px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    
    @media (max-width: 768px) {
      .ontowave-fixed-lang-buttons {
        top: 10px;
        right: 10px;
        padding: 6px 8px;
        gap: 4px;
      }
    }
    
    .ontowave-fixed-lang-btn {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 40px;
      justify-content: center;
    }
    
    
    @media (max-width: 768px) {
      .ontowave-fixed-lang-btn {
        padding: 4px 8px;
        font-size: 11px;
        min-width: 35px;
        gap: 2px;
      }
    }
    
    .ontowave-fixed-lang-btn:hover {
      background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .ontowave-fixed-lang-btn.active {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
    }
    
    .ontowave-fixed-lang-btn.active:hover {
      background: linear-gradient(135deg, #1e7e34 0%, #198754 100%);
      transform: translateY(-2px);
    }
    
    
    .ontowave-header {
      display: none;
    }
    
    .ontowave-nav {
      background: #f8f9fa;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .ontowave-nav h3 {
      margin: 0 0 1rem 0;
      color: #24292e;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .ontowave-nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .ontowave-nav-item {
      padding: 1rem;
      background: white;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      text-decoration: none;
      color: #24292e;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      font-weight: 500;
      cursor: pointer;
    }
    
    .ontowave-nav-item:hover {
      background: #f3f4f6;
      border-color: #0969da;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(27,31,35,0.15);
    }
    
    .ontowave-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(27,31,35,0.15);
      border: 1px solid #e1e4e8;
      margin-bottom: 2rem;
      min-height: 300px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    
    
    .ontowave-content h1 {
      color: #24292e;
      border-bottom: 2px solid #e1e4e8;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-size: 2em;
      font-weight: 600;
    }
    
    .ontowave-content h2 {
      color: #24292e;
      margin-top: 24px;
      margin-bottom: 16px;
      font-size: 1.5em;
      font-weight: 600;
    }
    
    .ontowave-content h3 {
      color: #24292e;
      margin-top: 20px;
      margin-bottom: 12px;
      font-size: 1.25em;
      font-weight: 600;
    }
    
    .ontowave-content h4 {
      color: #24292e;
      margin-top: 16px;
      margin-bottom: 10px;
      font-size: 1.1em;
      font-weight: 600;
    }
    
    .ontowave-content h5 {
      color: #24292e;
      margin-top: 14px;
      margin-bottom: 8px;
      font-size: 1em;
      font-weight: 600;
    }
    
    .ontowave-content h6 {
      color: #24292e;
      margin-top: 12px;
      margin-bottom: 6px;
      font-size: 0.9em;
      font-weight: 600;
    }
    
    
    .ontowave-content hr {
      border: none;
      border-top: 1px solid #e1e4e8;
      margin: 24px 0;
    }
    
    
    .ontowave-mermaid {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      text-align: center;
    }
    
    .ontowave-loading {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
    
    .ontowave-error {
      color: #d73a49;
      text-align: center;
      padding: 2rem;
      background: #ffeef0;
      border: 1px solid #fdaeb7;
      border-radius: 6px;
    }
    
    .ontowave-mermaid {
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    
    .ontowave-plantuml {
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    
    .ontowave-plantuml img {
      max-width: 100%;
      height: auto;
    }
    
    .ontowave-code {
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    
    .ontowave-breadcrumb {
      padding: 0.5rem 0;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e1e4e8;
    }
    
    .ontowave-breadcrumb a {
      color: #0969da;
      text-decoration: none;
      margin-right: 0.5rem;
    }
    
    .ontowave-breadcrumb a:hover {
      text-decoration: underline;
    }
    
    .ontowave-breadcrumb span {
      color: #656d76;
      margin-right: 0.5rem;
    }
    
    .ontowave-status {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 2rem;
    }
    
    .ontowave-status h4 {
      margin: 0 0 0.5rem 0;
      color: #155724;
    }
    
    .ontowave-status ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #155724;
    }
    
    /* === FIX #1: STYLES TABLEAUX === */
    .ontowave-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .ontowave-table th {
      background: #f6f8fa;
      padding: 12px 16px;
      font-weight: 600;
      border: 1px solid #d0d7de;
      color: #24292f;
    }
    
    .ontowave-table td {
      padding: 12px 16px;
      border: 1px solid #d0d7de;
      color: #24292f;
    }
    
    .ontowave-table tbody tr:nth-child(even) {
      background: #f6f8fa;
    }
    
    .ontowave-table tbody tr:hover {
      background: #eaeef2;
    }
    /* === FIN FIX #1 === */
    
    /* === FIX #4: STYLES CODE SOURCE PLANTUML + DIAGRAMME === */
    .ontowave-plantuml-container {
      margin: 20px 0;
    }
    
    .ontowave-plantuml-source {
      margin-bottom: 30px;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .ontowave-plantuml-source h3 {
      margin: 0;
      padding: 12px 16px;
      background: #f6f8fa;
      border-bottom: 1px solid #d0d7de;
      font-size: 16px;
      font-weight: 600;
      color: #24292f;
    }
    
    .ontowave-plantuml-source pre {
      margin: 0;
      background: #ffffff;
      padding: 16px;
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .ontowave-plantuml-source code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .ontowave-plantuml-render {
      /* Bordure désactivée à la demande de l'utilisateur */
      /* border: 1px solid #d0d7de; */
      /* border-radius: 6px; */
      overflow: hidden;
      background: #ffffff;
    }
    
    .ontowave-plantuml-render h3 {
      margin: 0;
      padding: 12px 16px;
      background: #f6f8fa;
      border-bottom: 1px solid #d0d7de;
      font-size: 16px;
      font-weight: 600;
      color: #24292f;
    }
    
    .ontowave-plantuml-render img {
      padding: 20px;
      display: block;
      margin: 0 auto;
    }
    
    /* Styles pour les liens dans les SVG PlantUML */
    .plantuml-diagram a.ontowave-internal-link {
      transition: opacity 0.2s;
    }
    
    .plantuml-diagram a.ontowave-internal-link:hover {
      opacity: 0.7;
    }
    
    .plantuml-diagram svg {
      max-width: 100%;
      height: auto;
    }
    /* === FIN FIX #4 === */
    
    @media (max-width: 768px) {
      .ontowave-header {
        padding: 1rem;
      }
      
      .ontowave-header h1 {
        font-size: 2em;
      }
      
      .ontowave-nav-grid {
        grid-template-columns: 1fr;
      }
      
      .ontowave-content {
        padding: 1rem;
      }
    }
  `;

  class OntoWave {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      
      // Support pour le format i18n (compatibilité avec config.json)
      if (config.i18n) {
        if (config.i18n.supported) {
          this.config.locales = config.i18n.supported;
        }
        if (config.i18n.default) {
          this.config.fallbackLocale = config.i18n.default;
        }
      }
      
      this.container = null;
      this.mermaidLoaded = false;
      this.prismLoaded = false;
      this.currentPage = null;
      this.currentLanguage = null; // Langue courante stockée
      
      // === CACHE SVG POUR PERFORMANCE ===
      this.svgCache = new Map(); // Cache: URL -> {svg: string, timestamp: number}
      this.svgCacheTTL = 5 * 60 * 1000; // 5 minutes par défaut
      this.svgCacheEnabled = config.svgCache !== false; // Activé par défaut
    }

    /**
     * Récupère un SVG du cache s'il est valide
     */
    getCachedSVG(url) {
      if (!this.svgCacheEnabled) return null;
      
      const cached = this.svgCache.get(url);
      if (!cached) return null;
      
      // Vérifier si le cache est expiré
      const now = Date.now();
      if (now - cached.timestamp > this.svgCacheTTL) {
        this.svgCache.delete(url);
        return null;
      }
      
      console.log('✅ SVG récupéré du cache:', url);
      return cached.svg;
    }

    /**
     * Ajoute un SVG au cache
     */
    cacheSVG(url, svg) {
      if (!this.svgCacheEnabled) return;
      
      this.svgCache.set(url, {
        svg: svg,
        timestamp: Date.now()
      });
      
      console.log('💾 SVG mis en cache:', url, `(${this.svgCache.size} entrées)`);
    }

    /**
     * Vide le cache SVG
     */
    clearSVGCache() {
      const count = this.svgCache.size;
      this.svgCache.clear();
      console.log(`🗑️ Cache SVG vidé (${count} entrées supprimées)`);
    }

    getCurrentLanguage() {
      // Si une langue a été explicitement définie, l'utiliser
      if (this.currentLanguage) {
        return this.currentLanguage;
      }
      
      // Vérifier s'il y a une langue sélectionnée dans l'interface
      const langFr = document.getElementById('lang-fr');
      const langEn = document.getElementById('lang-en');
      
      if (langFr && langEn) {
        // Système multilingue détecté - vérifier les classes visible/hidden
        if (langFr.classList.contains('visible') || (!langFr.classList.contains('hidden') && langFr.style.display !== 'none')) {
          return 'fr';
        } else if (langEn.classList.contains('visible') || (!langEn.classList.contains('hidden') && langEn.style.display !== 'none')) {
          return 'en';
        }
      }
      
      // Fallback - vérifier les boutons actifs
      const btnFr = document.getElementById('btn-fr');
      const btnEn = document.getElementById('btn-en');
      
      if (btnFr && btnEn) {
        if (btnFr.classList.contains('active')) {
          return 'fr';
        } else if (btnEn.classList.contains('active')) {
          return 'en';
        }
      }
      
      // Fallback sur les préférences du navigateur
      return this.resolveLocale() || 'en';
    }

    t(key, locale = null) {
      const targetLang = locale || this.getCurrentLanguage();
      const translations = TRANSLATIONS[targetLang] || TRANSLATIONS['en'];
      return translations[key] || key;
    }

    updateInterfaceTexts(locale = null) {
      const targetLang = locale || this.getCurrentLanguage();
      console.log('🌐 Interface texts updating for language:', targetLang);
      
      // Mettre à jour les textes du menu
      const homeOption = document.querySelector('.ontowave-menu-option[onclick*="goHome"]');
      if (homeOption) {
        homeOption.innerHTML = `🏠 ${this.t('menuHome', targetLang)}`;
      }

      const galleryOption = document.querySelector('.ontowave-menu-option[onclick*="gallery.html"]');
      if (galleryOption) {
        galleryOption.innerHTML = `🎨 ${this.t('menuGallery', targetLang)}`;
      }

      const configOption = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
      if (configOption) {
        configOption.innerHTML = `⚙️ ${this.t('menuConfiguration', targetLang)}`;
      }

      // Si le panneau de configuration est ouvert, le recréer avec les nouveaux textes
      const configPanel = document.getElementById('ontowave-config-panel');
      if (configPanel) {
        // Sauvegarder l'état des champs avant de recréer le panneau
        const titleValue = document.getElementById('config-title-full')?.value || this.config.title;
        const defaultPageValue = document.getElementById('config-defaultPage-full')?.value || this.config.defaultPage;
        const baseUrlValue = document.getElementById('config-baseUrl-full')?.value || this.config.baseUrl;
        
        // Fermer et rouvrir le panneau pour le mettre à jour
        configPanel.remove();
        const configButton = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
        if (configButton) {
          configButton.classList.remove('selected');
        }
        
        // Rouvrir avec les nouvelles traductions et la langue spécifiée
        setTimeout(() => {
          this.toggleConfigurationPanel(null, targetLang);
          
          // Restaurer les valeurs des champs
          setTimeout(() => {
            const titleField = document.getElementById('config-title-full');
            const defaultPageField = document.getElementById('config-defaultPage-full');
            const baseUrlField = document.getElementById('config-baseUrl-full');
            
            if (titleField) titleField.value = titleValue;
            if (defaultPageField) defaultPageField.value = defaultPageValue;
            if (baseUrlField) baseUrlField.value = baseUrlValue;
          }, 100);
        }, 50);
      }

      console.log('🌐 Interface texts updated for language:', targetLang);
    }

    switchLanguage(targetLang) {
      // Stocker la langue courante
      this.currentLanguage = targetLang;
      
      // Mettre à jour l'état des boutons de langue
      this.updateLanguageButtonsState(targetLang);
      
      // Mettre à jour l'interface
      this.updateInterfaceTexts(targetLang);
      
      // Recharger la page avec la bonne langue
      const sources = this.config.sources || {};
      const targetPage = sources[targetLang] || this.config.defaultPage;
      
      if (targetPage) {
        this.loadPage(targetPage);
      }
    }

    updateLanguageButtonsState(currentLang = null) {
      const lang = currentLang || this.getCurrentLanguage();
      
      // Mettre à jour les boutons de langue dans le menu
      document.querySelectorAll('.ontowave-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(lang.toUpperCase())) {
          btn.classList.add('active');
        }
      });
      
      // Mettre à jour les boutons de langue fixés
      document.querySelectorAll('.ontowave-fixed-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(lang.toUpperCase())) {
          btn.classList.add('active');
        }
      });
      
      console.log('🌐 État des boutons de langue mis à jour pour:', lang);
    }

    goHome() {
      // Support pour les différents modes OntoWave
      if (this.config.routing && this.config.defaultRoute) {
        // Mode routing : naviguer vers defaultRoute
        window.location.hash = this.config.defaultRoute;
      } else if (this.config.i18n && this.config.i18nFolder) {
        // Mode i18n : recharger la page courante (équivalent à "home" pour i18n)
        const currentLang = this.getCurrentLanguage();
        this.loadI18nContent(currentLang);
      } else {
        // Mode classique : utiliser sources/defaultPage
        const currentLang = this.getCurrentLanguage();
        const sources = this.config.sources || {};
        const homePage = sources[currentLang] || this.config.defaultPage;
        this.loadPage(homePage);
      }
    }

    getBrowserLocales() {
      const languages = [];
      
      // navigator.languages (préférences utilisateur)
      if (navigator.languages) {
        languages.push(...navigator.languages);
      }
      
      // Fallbacks
      if (navigator.language) {
        languages.push(navigator.language);
      }
      if (navigator.userLanguage) {
        languages.push(navigator.userLanguage);
      }
      
      return [...new Set(languages)]; // Enlever doublons
    }

    resolveLocale() {
      const browserLocales = this.getBrowserLocales();
      const supportedLocales = this.config.locales || [];
      const defaultLocale = this.config.defaultLocale || this.config.fallbackLocale;
      
      console.log('🌐 Browser locales:', browserLocales);
      console.log('🌐 Supported locales:', supportedLocales);
      console.log('🌐 Default locale:', defaultLocale);
      
      if (supportedLocales.length === 0) {
        return null; // Mode monolingue
      }
      
      // PRIORITÉ 1 : Détecter la langue depuis l'URL actuelle
      const currentUrl = window.location.hash || window.location.pathname;
      console.log('🔍 Current URL:', currentUrl);
      
      for (const locale of supportedLocales) {
        // Rechercher des patterns comme index.fr.md, about.en.md, etc.
        const langPattern = new RegExp(`\\.${locale}\\.(md|html)`);
        if (langPattern.test(currentUrl)) {
          console.log('🎯 Page language detected from URL:', locale, 'in', currentUrl);
          return locale;
        }
      }
      
      // PRIORITÉ 2 : Recherche exacte dans les langues navigateur
      for (const browserLang of browserLocales) {
        if (supportedLocales.includes(browserLang)) {
          console.log('🎯 Exact browser match found:', browserLang);
          return browserLang;
        }
      }
      
      // PRIORITÉ 2 : Recherche par préfixe (fr-CA -> fr)
      for (const browserLang of browserLocales) {
        const prefix = browserLang.split('-')[0];
      
      // PRIORITÉ 3 : Recherche par préfixe (fr-CA -> fr)
      for (const browserLang of browserLocales) {
        const prefix = browserLang.split('-')[0];
        const match = supportedLocales.find(locale => locale.startsWith(prefix));
        if (match) {
          console.log('🎯 Prefix match found:', browserLang, '->', match);
          return match;
        }
      }
      
      // PRIORITÉ 4 : Utiliser defaultLocale si défini et supporté
      if (defaultLocale && supportedLocales.includes(defaultLocale)) {
        console.log('🎯 Using configured default locale:', defaultLocale);
        return defaultLocale;
      }
      
      // PRIORITÉ 5 : Fallback sur la première langue supportée
      }
      
      // PRIORITÉ 4 : Fallback sur la première langue supportée
      const fallback = supportedLocales[0];
      console.log('🎯 Using fallback locale:', fallback);
      return fallback;
    }

    isMultilingualMode() {
      return this.config.locales && this.config.locales.length > 0 && this.config.sources;
    }

    generatePageCandidates(basePage) {
      const resolvedLocale = this.resolveLocale();
      const candidates = [];
      
      if (!resolvedLocale) {
        // Mode monolingue - essayer la page directement
        candidates.push(basePage);
        return candidates;
      }
      
      const pageName = basePage.replace(/\.md$/, '');
      
      // Essayer avec la locale résolue
      candidates.push(`${pageName}.${resolvedLocale}.md`);
      
      // Si c'est une locale composée (fr-CA), essayer le préfixe
      if (resolvedLocale.includes('-')) {
        const prefix = resolvedLocale.split('-')[0];
        candidates.push(`${pageName}.${prefix}.md`);
      }
      
      // Fallback sur la page de base
      candidates.push(basePage);
      
      console.log('📄 Page candidates for', basePage, ':', candidates);
      return candidates;
    }

    async init() {
      try {
        // Charger la configuration depuis le script JSON si disponible
        await this.loadConfigFromScript();
        
        // Injecter les styles CSS
        this.injectStyles();
        
        // Charger Mermaid si nécessaire
        await this.loadMermaid();
        
        // Charger Prism si nécessaire
        await this.loadPrism();
        
        // Créer l'interface
        this.createInterface();
        
        // Initialiser la langue courante
        this.currentLanguage = this.resolveLocale();
        
        // Initialiser la navigation
        this.initializeNavigation();
        
        // Mettre à jour l'état des boutons de langue après la création du menu
        this.updateLanguageButtonsState();
        
        // Charger la page initiale
        await this.loadInitialPage();
        
        console.log('✅ OntoWave successfully initialized');
        
      } catch (error) {
        console.error('❌ OntoWave initialization failed:', error);
        this.showError('Erreur d\'initialisation OntoWave: ' + error.message);
      }
    }

    async loadConfigFromScript() {
      // Priorité 1: Chercher dans window.ontoWaveConfig
      if (window.ontoWaveConfig) {
        this.config = { ...this.config, ...window.ontoWaveConfig };
        console.log('📄 Configuration loaded from window.ontoWaveConfig');
        console.log('📄 Final config:', this.config);
        return;
      }
      
      // Priorité 2: Chercher dans script tag
      const configScript = document.getElementById('ontowave-config');
      if (configScript && configScript.type === 'application/json') {
        try {
          const userConfig = JSON.parse(configScript.textContent);
          this.config = { ...this.config, ...userConfig };
          console.log('📄 Configuration loaded from script tag');
          console.log('📄 Final config:', this.config);
        } catch (error) {
          console.warn('⚠️ Invalid JSON in ontowave-config script tag:', error);
        }
      }
    }

    injectStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = CSS_STYLES;
      document.head.appendChild(styleElement);
    }

    async loadMermaid() {
      return new Promise((resolve) => {
        if (window.mermaid) {
          this.mermaidLoaded = true;
          this.initializeMermaid();
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.onload = () => {
          this.mermaidLoaded = true;
          this.initializeMermaid();
          resolve();
        };
        script.onerror = () => {
          console.warn('⚠️ Failed to load Mermaid library');
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    initializeMermaid() {
      if (window.mermaid) {
        window.mermaid.initialize(this.config.mermaid);
        console.log('🎨 Mermaid initialized');
      }
    }

    async loadPrism() {
      return new Promise((resolve) => {
        if (window.Prism) {
          this.prismLoaded = true;
          console.log('🎨 Prism already loaded');
          return resolve();
        }

        // Charger CSS Prism
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
        document.head.appendChild(cssLink);

        // Charger JS Prism
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js';
        script.onload = () => {
          console.log('🎨 Prism core loaded');
          
          // FIX: Préparer des stubs pour éviter les erreurs de dépendances circulaires
          // Certains composants Prism essaient de lire des propriétés avant qu'elles soient définies
          if (!window.Prism.languages.javascript) {
            window.Prism.languages.javascript = { 'class-name': null };
          }
          
          // Charger les langages essentiels et attendre leur chargement
          const essentialLanguages = ['markup', 'css', 'javascript'];
          let loadedCount = 0;
          
          const checkComplete = () => {
            loadedCount++;
            console.log(`🔤 Essential language loaded: ${loadedCount}/${essentialLanguages.length}`);
            if (loadedCount >= essentialLanguages.length) {
              // HTML est un alias de markup dans Prism
              if (window.Prism.languages.markup) {
                window.Prism.languages.html = window.Prism.languages.markup;
                console.log('🔤 HTML alias created from markup');
              }
              
              this.prismLoaded = true;
              console.log('✅ Prism ready with essential languages');
              resolve();
              
              // === FIX #4: DÉFINITION LANGAGE PLANTUML POUR PRISM ===
              // PlantUML n'a pas de plugin officiel, on crée la définition
              if (window.Prism && window.Prism.languages) {
                window.Prism.languages.plantuml = {
                  'comment': /'[^\n]*/,
                  'keyword': /@startuml|@enduml|@startmindmap|@endmindmap|@startsalt|@endsalt|@startgantt|@endgantt|participant|actor|boundary|control|entity|database|collections|queue|as|title|note|over|left|right|end|alt|else|opt|loop|par|break|critical|group|autonumber|activate|deactivate|destroy|create|hide|show|class|interface|abstract|enum|extends|implements|package|namespace|skinparam|style|sprite/,
                  'string': {
                    pattern: /"(?:\\.|[^\\"\r\n])*"/,
                    greedy: true
                  },
                  'arrow': /(?:--|->|o-|-o|\*-|-\*|\.-|-\.)/,
                  'operator': /[:=[\](){}|]/,
                  'tag': /#[a-zA-Z0-9]+/,
                  'function': /\[\[.*?\]\]/,
                  'number': /\b\d+\b/,
                  'punctuation': /[,;]/
                };
                console.log('🏭 PlantUML language definition added to Prism');
              }
              // === FIN FIX #4 ===
              
              // Charger les langages supplémentaires en arrière-plan (séquentiellement pour respecter les dépendances)
              // Attendre que JavaScript soit complètement prêt avant de charger TypeScript qui l'étend
              setTimeout(() => {
                // Langages qui n'étendent PAS JavaScript (chargement sûr)
                const safeLanguages = ['python', 'java', 'bash', 'json', 'yaml', 'mermaid'];
                // TypeScript sera chargé EN DERNIER après vérification
                
                let loadIndex = 0;
                
                const loadNextLanguage = () => {
                  if (loadIndex >= safeLanguages.length) {
                    console.log('✅ All safe Prism languages loaded');
                    // Maintenant charger TypeScript avec vérification
                    loadTypescript();
                    return;
                  }
                  
                  const lang = safeLanguages[loadIndex++];
                  const langScript = document.createElement('script');
                  langScript.src = `https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-${lang}.min.js`;
                  langScript.onload = () => {
                    console.log(`🔤 Additional Prism language loaded: ${lang}`);
                    // Petit délai entre chaque langage pour éviter les conflits
                    setTimeout(loadNextLanguage, 10);
                  };
                  langScript.onerror = () => {
                    console.warn(`⚠️ Failed to load Prism language: ${lang}`);
                    loadNextLanguage(); // Continuer même en cas d'erreur
                  };
                  document.head.appendChild(langScript);
                };
                
                const loadTypescript = () => {
                  // Vérifier que JavaScript est complet avant de charger TypeScript
                  if (!window.Prism.languages.javascript || !window.Prism.languages.javascript['class-name']) {
                    console.warn('⚠️ JavaScript grammar incomplete, skipping TypeScript');
                    return;
                  }
                  
                  const tsScript = document.createElement('script');
                  tsScript.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js';
                  tsScript.onload = () => {
                    console.log('🔤 Additional Prism language loaded: typescript');
                  };
                  tsScript.onerror = () => {
                    console.warn('⚠️ Failed to load Prism language: typescript');
                  };
                  document.head.appendChild(tsScript);
                };
                
                loadNextLanguage(); // Démarrer le chargement séquentiel
              }, 100); // Attendre 100ms pour que JavaScript soit stable
            }
          };
          
          essentialLanguages.forEach(lang => {
            const langScript = document.createElement('script');
            langScript.src = `https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-${lang}.min.js`;
            langScript.onload = checkComplete;
            langScript.onerror = () => {
              console.warn(`⚠️ Failed to load essential Prism language: ${lang}`);
              checkComplete(); // Continue même en cas d'erreur
            };
            document.head.appendChild(langScript);
          });
        };
        script.onerror = () => {
          console.warn('⚠️ Failed to load Prism library');
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    createInterface(locale = null) {
      // COURT-CIRCUIT: Si nouveau mode (routing/i18n) actif, créer seulement le menu flottant
      if (this.config.disableHashLoading) {
        console.log('🚫 createInterface() désactivé (nouveau mode crée son propre DOM)');
        console.log('✅ Création du menu flottant uniquement pour nouveau mode');
        this.createFloatingMenuOnly(locale);
        return;
      }
      
      // Trouver ou créer le conteneur
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = this.config.containerId;
        document.body.appendChild(this.container);
      }

      this.container.className = 'ontowave-container';
      
      // Créer les options du menu selon la configuration
      const galleryOption = this.config.showGallery ? 
        `<span class="ontowave-menu-option" onclick="window.location.href='gallery.html'">🎨 ${this.t('menuGallery', locale)}</span>` : '';
      
      // Créer les boutons de langue si multilingue et selon la configuration
      const languageButtonsMode = this.config.ui?.languageButtons || "menu";
      const shouldCreateMenuButtons = (languageButtonsMode === "menu" || languageButtonsMode === "both");
      
      const languageButtons = this.config.locales && this.config.locales.length > 1 && shouldCreateMenuButtons ?
        this.config.locales.map(lang => {
          const isActive = (locale || this.getCurrentLanguage()) === lang;
          const activeClass = isActive ? ' active' : '';
          return `<span class="ontowave-menu-option ontowave-lang-btn${activeClass}" onclick="event.stopPropagation(); window.OntoWave.instance.switchLanguage('${lang}');">🌐 ${lang.toUpperCase()}</span>`;
        }).join('') : '';
      
      // Créer la structure HTML minimaliste
      this.container.innerHTML = `
        <div class="ontowave-floating-menu" id="ontowave-floating-menu" title="OntoWave Menu">
          <span class="ontowave-menu-icon" id="ontowave-menu-icon">&#127754;</span>
          <div class="ontowave-menu-content" id="ontowave-menu-content">
            <a href="https://ontowave.org/" target="_blank" class="ontowave-menu-brand">OntoWave<span class="org-suffix">.org</span></a>
            <div class="ontowave-menu-options">
              <span class="ontowave-menu-option" onclick="window.OntoWave.instance.goHome()">🏠 ${this.t('menuHome', locale)}</span>
              ${galleryOption}
              ${languageButtons}
              <span class="ontowave-menu-option" onclick="event.stopPropagation(); window.OntoWave.instance.toggleConfigurationPanel(event, '${locale || this.getCurrentLanguage()}');">⚙️ ${this.t('menuConfiguration', locale)}</span>
            </div>
          </div>
        </div>
        
        <div class="ontowave-content" id="ontowave-content">
          <div class="ontowave-loading">⏳ Chargement du contenu...</div>
        </div>
        
        <div class="ontowave-status" style="display: none;">
          <h4>✅ OntoWave Package Actif</h4>
          <ul>
            <li><strong>Chargement rapide:</strong> Système intégré</li>
            <li><strong>Mermaid:</strong> ${this.mermaidLoaded ? 'Chargé' : 'Non disponible'}</li>
            <li><strong>Prism:</strong> ${this.prismLoaded ? 'Chargé' : 'Non disponible'}</li>
            <li><strong>PlantUML:</strong> Support intégré</li>
            <li><strong>Navigation:</strong> Hash préservé</li>
          </ul>
        </div>
      `;
      
      // Créer les boutons de langue fixés si multilingue
      this.createFixedLanguageButtons(locale);
    }

    createFloatingMenuOnly(locale = null) {
      // Créer seulement le menu flottant pour les nouveaux modes (routing/i18n)
      // sans créer tout le container de l'ancien système
      
      // Créer un container minimal juste pour le menu
      let menuContainer = document.getElementById('ontowave-menu-container');
      if (!menuContainer) {
        menuContainer = document.createElement('div');
        menuContainer.id = 'ontowave-menu-container';
        menuContainer.className = 'ontowave-menu-container';
        document.body.appendChild(menuContainer);
      }
      
      // Créer les options du menu
      const galleryOption = this.config.showGallery ? 
        `<span class="ontowave-menu-option" onclick="window.location.href='gallery.html'">🎨 ${this.t('menuGallery', locale)}</span>` : '';
      
      const languageButtonsMode = this.config.ui?.languageButtons || "menu";
      const shouldCreateMenuButtons = (languageButtonsMode === "menu" || languageButtonsMode === "both");
      
      const languageButtons = this.config.locales && this.config.locales.length > 1 && shouldCreateMenuButtons ?
        this.config.locales.map(lang => {
          const isActive = (locale || this.getCurrentLanguage()) === lang;
          const activeClass = isActive ? ' active' : '';
          return `<span class="ontowave-menu-option ontowave-lang-btn${activeClass}" onclick="event.stopPropagation(); window.OntoWave.instance.switchLanguage('${lang}');">🌐 ${lang.toUpperCase()}</span>`;
        }).join('') : '';
      
      // Créer le menu flottant
      menuContainer.innerHTML = `
        <div class="ontowave-floating-menu" id="ontowave-floating-menu" title="OntoWave Menu">
          <span class="ontowave-menu-icon" id="ontowave-menu-icon">&#127754;</span>
          <div class="ontowave-menu-content" id="ontowave-menu-content">
            <a href="https://ontowave.org/" target="_blank" class="ontowave-menu-brand">OntoWave<span class="org-suffix">.org</span></a>
            <div class="ontowave-menu-options">
              <span class="ontowave-menu-option" onclick="window.OntoWave.instance.goHome()">🏠 ${this.t('menuHome', locale)}</span>
              ${galleryOption}
              ${languageButtons}
              <span class="ontowave-menu-option" onclick="event.stopPropagation(); window.OntoWave.instance.toggleConfigurationPanel(event, '${locale || this.getCurrentLanguage()}');">⚙️ ${this.t('menuConfiguration', locale)}</span>
            </div>
          </div>
        </div>
      `;
      
      console.log('✅ Menu flottant créé pour nouveau mode');
    }

    createFixedLanguageButtons(locale = null) {
      // Supprimer les boutons existants s'ils existent
      const existingButtons = document.getElementById('ontowave-fixed-lang-buttons');
      if (existingButtons) {
        existingButtons.remove();
      }
      
      // Créer les boutons de langue fixés seulement si multilingue et si configuré
      const languageButtonsMode = this.config.ui?.languageButtons || "menu";
      const shouldCreateFixed = (languageButtonsMode === "fixed" || languageButtonsMode === "both");
      
      if (this.config.locales && this.config.locales.length > 1 && shouldCreateFixed) {
        const currentLang = locale || this.getCurrentLanguage();
        
        const fixedLangContainer = document.createElement('div');
        fixedLangContainer.id = 'ontowave-fixed-lang-buttons';
        fixedLangContainer.className = 'ontowave-fixed-lang-buttons';
        
        // Créer les boutons pour chaque langue
        const buttonsHtml = this.config.locales.map(lang => {
          const isActive = currentLang === lang;
          const activeClass = isActive ? ' active' : '';
          const flag = this.getLanguageFlag(lang);
          return `<button class="ontowave-fixed-lang-btn${activeClass}" onclick="window.OntoWave.instance.switchLanguage('${lang}')" title="Changer en ${lang.toUpperCase()}">${flag} ${lang.toUpperCase()}</button>`;
        }).join('');
        
        fixedLangContainer.innerHTML = buttonsHtml;
        document.body.appendChild(fixedLangContainer);
        
        console.log('🌐 Boutons de langue fixés créés:', this.config.locales, 'Mode:', languageButtonsMode);
      }
    }
    
    getLanguageFlag(lang) {
      const flags = {
        'fr': '🇫🇷',
        'en': '🇬🇧',
        'es': '🇪🇸',
        'de': '🇩🇪',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'zh': '🇨🇳',
        'ja': '🇯🇵',
        'ko': '🇰🇷',
        'ru': '🇷🇺'
      };
      return flags[lang] || '🌐';
    }

    initializeNavigation() {
      // COURT-CIRCUIT: Si nouveau mode (routing) actif, ne pas initialiser la navigation de l'ancien système
      if (this.config.disableHashLoading) {
        console.log('🚫 initializeNavigation() désactivé (nouveau mode gère sa propre navigation)');
        // Initialiser quand même le menu flottant
        this.initializeFloatingMenu();
        return;
      }
      
      // Gestion des changements de hash
      window.addEventListener('hashchange', () => {
        const hash = location.hash.replace('#', '') || this.config.defaultPage;
        this.loadPage(hash);
      });

      // Navigation par défaut
      this.createDefaultNavigation();
      
      // Initialiser le menu flottant interactif
      this.initializeFloatingMenu();
    }

    initializeFloatingMenu() {
      const menu = document.getElementById('ontowave-floating-menu');
      const menuIcon = document.getElementById('ontowave-menu-icon');
      
      if (!menu || !menuIcon) return;

      let isExpanded = false;
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };

      // Fonction pour mettre à jour l'état de déplacement
      function updateDragState() {
        const canDrag = !isExpanded && !document.querySelector('.ontowave-config-panel');
        if (canDrag) {
          menu.classList.remove('no-drag');
        } else {
          menu.classList.add('no-drag');
          // Sécurité : forcer l'arrêt du drag
          isDragging = false;
          document.body.style.userSelect = '';
          document.body.style.cursor = '';
        }
      }

      // Stocker la référence globalement pour les panneaux de configuration
      window.ontowaveUpdateDragState = updateDragState;

      // Toggle menu au clic sur l'icône
      menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        if (isExpanded) {
          menu.classList.add('expanded');
        } else {
          menu.classList.remove('expanded');
        }
        updateDragState();
      });

      // Fermer le menu au clic en dehors
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && isExpanded) {
          isExpanded = false;
          menu.classList.remove('expanded');
          updateDragState();
        }
      });

      // Drag & Drop functionality
      menu.addEventListener('mousedown', (e) => {
        // Ne pas démarrer le drag si le menu est étendu ou si un panneau de config est ouvert
        if (isExpanded || document.querySelector('.ontowave-config-panel')) {
          return;
        }
        
        // Ne pas démarrer le drag si on clique sur les liens/boutons
        if (e.target.closest('a, .ontowave-menu-option')) return;
        
        isDragging = true;
        const rect = menu.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        menu.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        // Empêcher l'interception des événements par d'autres éléments
        e.preventDefault();
        e.stopPropagation();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        
        // Contraintes pour rester dans la fenêtre
        const maxX = window.innerWidth - menu.offsetWidth;
        const maxY = window.innerHeight - menu.offsetHeight;
        
        menu.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
        menu.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          menu.style.cursor = 'move';
          document.body.style.userSelect = '';
        }
      });

      // Solution de sécurité : Remettre l'état normal après un délai
      function resetDragState() {
        isDragging = false;
        menu.style.cursor = 'move';
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }

      // Reset automatique après perte de focus ou changement de page
      document.addEventListener('visibilitychange', resetDragState);
      window.addEventListener('blur', resetDragState);
      window.addEventListener('focus', resetDragState);
      
      // Fonction globale accessible pour reset manuel
      window.resetOntoWaveDragState = resetDragState;

      // Support tactile pour mobile
      menu.addEventListener('touchstart', (e) => {
        if (e.target.closest('a, .ontowave-menu-option')) return;
        
        const touch = e.touches[0];
        const rect = menu.getBoundingClientRect();
        dragOffset.x = touch.clientX - rect.left;
        dragOffset.y = touch.clientY - rect.top;
        isDragging = true;
      });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const x = touch.clientX - dragOffset.x;
        const y = touch.clientY - dragOffset.y;
        
        const maxX = window.innerWidth - menu.offsetWidth;
        const maxY = window.innerHeight - menu.offsetHeight;
        
        menu.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
        menu.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
      });

      document.addEventListener('touchend', () => {
        isDragging = false;
      });
      
      // Initialiser l'état de déplacement
      updateDragState();
      
      // Améliorer la gestion des clics sur les options du menu
      this.enhanceMenuOptionClicks();
    }
    
    enhanceMenuOptionClicks() {
      // Ajouter des gestionnaires d'événements robustes pour les options du menu
      const configOption = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');
      if (configOption) {
        configOption.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Configuration button clicked via event listener');
          this.toggleConfigurationPanel(e);
        }, { capture: true });
      }
    }

    createDefaultNavigation() {
      const navGrid = document.getElementById('ontowave-nav-grid');
      if (!navGrid) return;

      const defaultNavItems = [
        { href: 'index.md', icon: '🏠', label: 'Accueil' },
        { href: 'en/index.md', icon: '🇬🇧', label: 'English' },
        { href: 'fr/index.md', icon: '🇫🇷', label: 'Français' },
        { href: 'demo/mermaid.md', icon: '🧜‍♀️', label: 'Démo Mermaid' },
        { href: 'demo/plantuml.md', icon: '🏭', label: 'PlantUML' },
        { href: 'demo/advanced-shapes.md', icon: '🎯', label: 'Formes Avancées' }
      ];

      navGrid.innerHTML = defaultNavItems.map(item => `
        <a href="#${item.href}" class="ontowave-nav-item" onclick="window.OntoWave.loadPage('${item.href}')">
          ${item.icon} ${item.label}
        </a>
      `).join('');
    }

    async loadInitialPage() {
      // COURT-CIRCUIT: Si nouveau mode (contentPath/routing/i18n) actif, ne rien faire
      if (this.config.disableHashLoading) {
        console.log('🚫 loadInitialPage() désactivé (nouveau mode actif)');
        return;
      }
      
      const currentHash = location.hash.replace('#', '');
      
      // === FIX #3: DÉTECTION AUTOMATIQUE LANGUE NAVIGATEUR ===
      // Détecter la langue du navigateur si pas de hash et pas de langue explicite
      if (!currentHash && this.config.languages && this.config.languages.supported) {
        const browserLang = navigator.language.split('-')[0].toLowerCase(); // 'en-US' → 'en'
        console.log('🌍 Browser language detected:', browserLang);
        
        const supportedLangs = this.config.languages.supported.split(',').map(l => l.trim().toLowerCase());
        const fallbackLang = this.config.languages.fallback || 'fr';
        
        // Vérifier si la langue du navigateur est supportée et différente du fallback
        if (supportedLangs.includes(browserLang) && browserLang !== fallbackLang) {
          console.log(`🌍 Auto-redirecting to browser language: ${browserLang}`);
          
          // Construire le nom de page dans la langue du navigateur
          const basePage = this.config.defaultPage.replace(/\.([a-z]{2})\.md$/, '.md').replace(/\.md$/, '');
          const langPage = `${basePage}.${browserLang}.md`;
          
          // Vérifier si la page existe
          try {
            const testResponse = await fetch(this.config.baseUrl + langPage, { method: 'HEAD' });
            if (testResponse.ok) {
              console.log(`🌍 Language page found: ${langPage}`);
              location.hash = '#' + langPage;
              await this.loadPage(langPage);
              return;
            }
          } catch (e) {
            console.log(`🌍 Language page not found: ${langPage}, using fallback`);
          }
        }
      }
      // === FIN FIX #3 ===
      
      // Mode multilingue : redirection automatique si pas de hash
      if (this.isMultilingualMode() && !currentHash) {
        const defaultSource = this.config.sources[this.config.defaultLocale];
        console.log('🌐 Multilingual mode detected');
        console.log('🌐 Default locale:', this.config.defaultLocale);
        console.log('🌐 Default source:', defaultSource);
        console.log('🌐 Sources config:', this.config.sources);
        
        if (defaultSource) {
          console.log('🌐 Multilingual mode: redirecting to', defaultSource);
          location.hash = '#' + defaultSource;
          return;
        }
      }
      
      const initialPage = currentHash || this.config.defaultPage;
      
      // Si on n'a pas de fichier index, afficher la configuration
      if (initialPage === 'index.md') {
        const candidates = this.generatePageCandidates(initialPage);
        let found = false;
        
        for (const candidate of candidates) {
          try {
            const response = await fetch(this.config.baseUrl + candidate, { method: 'HEAD' });
            if (response.ok) {
              await this.loadPage(candidate);
              found = true;
              break;
            }
          } catch (error) {
            // Continue avec le candidat suivant
            continue;
          }
        }
        
        if (!found) {
          console.log('📄 No index file found, showing configuration');
          this.showConfigurationInterface();
          return;
        }
      } else {
        await this.loadPage(initialPage);
      }
    }

    async loadPage(pagePath) {
      const contentDiv = document.getElementById('ontowave-content');
      if (!contentDiv) return;

      console.log('📄 Loading page:', pagePath);
      this.currentPage = pagePath;
      
      // Sécurité : Reset de l'état de drag au changement de page
      if (window.resetOntoWaveDragState) {
        window.resetOntoWaveDragState();
      }
      
      // Mettre à jour le hash
      if (location.hash !== '#' + pagePath) {
        location.hash = '#' + pagePath;
      }

      // Mettre à jour le breadcrumb
      this.updateBreadcrumb(pagePath);

      // Afficher le loading
      contentDiv.innerHTML = '<div class="ontowave-loading">⏳ Chargement de ' + pagePath + '...</div>';

      try {
        const response = await fetch(this.config.baseUrl + pagePath);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();
        console.log('✅ Content loaded:', content.length, 'characters');

        // === FIX #2A: SUPPORT FICHIERS .PUML (avec coloration Prism) ===
        let html;
        if (pagePath.endsWith('.puml')) {
          // Fichier PlantUML direct
          console.log('🏭 Processing .puml file');
          
          // Fonction d'encodage PlantUML (réutiliser celle existante)
          function encodePlantUML(text) {
            const utf8Encoder = new TextEncoder();
            const utf8Bytes = utf8Encoder.encode(text);
            let hex = '';
            for (let i = 0; i < utf8Bytes.length; i++) {
              hex += utf8Bytes[i].toString(16).padStart(2, '0');
            }
            return 'h' + hex;
          }
          
          const encodedContent = encodePlantUML(content);
          const plantUMLUrl = `${this.config.plantuml.server}/${this.config.plantuml.format}/~${encodedContent}`;
          
          // Échapper le code source pour l'affichage
          const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          
          // === FIX #4: CODE SOURCE COLORÉ + DIAGRAMME (SVG inline) ===
          html = `
            <div class="ontowave-plantuml-container">
              <div class="ontowave-plantuml-source">
                <h3>📝 Code Source PlantUML</h3>
                <pre><code class="language-plantuml">${escapedContent}</code></pre>
              </div>
              <div class="ontowave-plantuml-render">
                <h3>🎨 Diagramme Rendu</h3>
                <div class="plantuml-diagram" data-plantuml-url="${plantUMLUrl}">⏳ Chargement diagramme PlantUML...</div>
              </div>
            </div>
          `;
        } else {
          // Fichier markdown classique
          html = await this.renderMarkdown(content);
        }
        // === FIN FIX #2A ===
        
        contentDiv.innerHTML = html;
        
        // Supprimer explicitement tous les éléments de loading restants
        const loadingElements = document.querySelectorAll('.ontowave-loading');
        loadingElements.forEach(el => el.remove());

        // Traiter les diagrammes Mermaid
        await this.processDiagrams(contentDiv);

        // Traiter les diagrammes PlantUML (SVG inline)
        await this.processPlantUML(contentDiv);

        // Traiter la coloration syntaxique
        await this.processPrism(contentDiv);

      } catch (error) {
        console.error('❌ Failed to load page:', error);
        this.showError(`Impossible de charger ${pagePath}: ${error.message}`);
      }
    }

    updateBreadcrumb(pagePath) {
      const breadcrumbDiv = document.getElementById('ontowave-breadcrumb');
      if (!breadcrumbDiv || !this.config.navigation.showBreadcrumb) return;

      const parts = pagePath.split('/');
      const breadcrumbs = ['<a href="#' + this.config.defaultPage + '">🏠 Accueil</a>'];
      
      let currentPath = '';
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Dernier élément (page actuelle)
          breadcrumbs.push('<span>' + part.replace('.md', '') + '</span>');
        } else {
          currentPath += (currentPath ? '/' : '') + part;
          breadcrumbs.push('<a href="#' + currentPath + '/index.md">' + part + '</a>');
        }
      });

      breadcrumbDiv.innerHTML = breadcrumbs.join(' <span>›</span> ');
      breadcrumbDiv.style.display = 'block';
    }

    async renderMarkdown(markdown) {
      // NOUVEAU: Utilise markdown-it au lieu du parser maison
      if (!this.markdownParser) {
        // Initialiser markdown-it parser avec plugins configurés
        const plugins = this.config.markdownPlugins || [];
        this.markdownParser = new MarkdownParser({
          plugins: plugins,
          html: true,
          linkify: true,
          typographer: true,
          enableOntoWaveLinks: true,
        });
        console.log('📝 markdown-it initialisé avec plugins:', plugins);
      }

      // Traiter les blocs de code spéciaux (mermaid, plantuml) AVANT markdown-it
      const codeBlocks = [];
      let html = markdown;
      
      html = html.replace(/```(\w+)([\s\S]*?)```/g, (match, language, content) => {
        const trimmedContent = content.trim();
        // Utiliser un placeholder HTML qui ne sera pas modifié par markdown-it
        const placeholder = `<div class="code-block-placeholder" data-index="${codeBlocks.length}"></div>`;
        
        if (language === 'mermaid') {
          const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
          codeBlocks.push(`<div class="mermaid" id="${id}">${trimmedContent}</div>`);
          return placeholder;
        } else if (language === 'plantuml') {
          const id = 'plantuml-' + Math.random().toString(36).substr(2, 9);
          
          // Encodage PlantUML
          function encodePlantUML(text) {
            const utf8Encoder = new TextEncoder();
            const utf8Bytes = utf8Encoder.encode(text);
            let hex = '';
            for (let i = 0; i < utf8Bytes.length; i++) {
              hex += utf8Bytes[i].toString(16).padStart(2, '0');
            }
            return 'h' + hex;
          }
          
          const encodedContent = encodePlantUML(trimmedContent);
          const plantUMLUrl = `${this.config.plantuml.server}/${this.config.plantuml.format}/~${encodedContent}`;
          
          codeBlocks.push(`<div class="plantuml-diagram" id="${id}" data-plantuml-url="${plantUMLUrl}">⏳ Chargement diagramme PlantUML...</div>`);
          return placeholder;
        }
        
        // Autres langages: laisser markdown-it gérer avec highlight.js
        return match;
      });
      
      // Utiliser markdown-it pour le rendu
      html = this.markdownParser.render(html);
      
      // Restaurer les blocs spéciaux en remplaçant les placeholders
      codeBlocks.forEach((block, index) => {
        const placeholderRegex = new RegExp(`<div class="code-block-placeholder" data-index="${index}"><\\/div>`, 'g');
        html = html.replace(placeholderRegex, block);
      });

      return html;
    }

    renderAdvancedTables(html) {
      // Styles CSS avancés pour les tableaux
      const tableStyles = `
<style>
table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 6px;
    overflow: hidden;
}

thead th, th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    color: #495057;
    border: 1px solid #dee2e6;
    padding: 12px 16px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
}

tbody td, td {
    border: 1px solid #dee2e6;
    padding: 12px 16px;
    background-color: white;
    transition: background-color 0.2s ease;
}

tbody tr:nth-child(even), tr:nth-child(even) {
    background-color: #f8f9fa;
}

tbody tr:hover, tr:hover {
    background-color: #e3f2fd;
}

.text-left { text-align: left !important; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-justify { text-align: justify !important; hyphens: auto; }

td:empty::before {
    content: "—";
    color: #6c757d;
    font-style: italic;
}

@media (max-width: 768px) {
    table {
        font-size: 12px;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
    th, td {
        padding: 8px 12px;
        min-width: 100px;
    }
}
</style>`;

      // Regex pour détecter les tableaux avec alignements
      const tableRegex = /(\|[^|\n]*\|[^|\n]*\|[^\n]*\n\|[-:| ]+\|[^\n]*\n(?:\|[^\n]*\n?)*)/g;
      
      let hasTables = false;
      
      html = html.replace(tableRegex, (match) => {
        const lines = match.trim().split('\n');
        if (lines.length < 2) return match;
        
        const headerLine = lines[0];
        const separatorLine = lines[1];
        const dataLines = lines.slice(2);
        
        // Vérifier que c'est un tableau valide
        if (!headerLine.includes('|') || !separatorLine.includes('|')) return match;
        
        hasTables = true;
        
        // Parser les en-têtes
        const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
        
        // Parser les alignements depuis la ligne de séparation
        const separators = separatorLine.split('|').map(s => s.trim()).filter(s => s);
        const alignments = separators.map(sep => {
          if (sep.startsWith(':') && sep.endsWith(':')) return 'center';
          if (sep.endsWith(':')) return 'right';
          if (sep.startsWith(':')) return 'left';
          return 'left'; // par défaut
        });
        
        // Parser les données
        const rows = dataLines.map(line => 
          line.split('|').map(cell => cell.trim()).filter(cell => cell)
        ).filter(row => row.length > 0);
        
        // Construire le tableau HTML avec styles et alignements
        let tableHtml = '<table>';
        
        // En-têtes avec alignement
        tableHtml += '<thead><tr>';
        headers.forEach((header, i) => {
          const align = alignments[i] || 'left';
          tableHtml += `<th class="text-${align}">${header}</th>`;
        });
        tableHtml += '</tr></thead>';
        
        // Corps du tableau avec alignement
        tableHtml += '<tbody>';
        rows.forEach((row) => {
          tableHtml += '<tr>';
          row.forEach((cell, i) => {
            const align = alignments[i] || 'left';
            tableHtml += `<td class="text-${align}">${cell}</td>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        
        return tableHtml;
      });
      
      // Ajouter les styles seulement si on a des tableaux
      if (hasTables) {
        // Injecter les styles directement dans le DOM
        this.injectTableStyles();
      }
      
      return html;
    }
    
    injectTableStyles() {
      // Vérifier si les styles sont déjà injectés
      if (document.getElementById('ontowave-table-styles')) {
        return; // Déjà injectés
      }
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'ontowave-table-styles';
      styleSheet.textContent = `
table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 6px;
    overflow: hidden;
}

thead th, th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    color: #495057;
    border: 1px solid #dee2e6;
    padding: 12px 16px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
}

tbody td, td {
    border: 1px solid #dee2e6;
    padding: 12px 16px;
    background-color: white;
    transition: background-color 0.2s ease;
}

tbody tr:nth-child(even), tr:nth-child(even) {
    background-color: #f8f9fa;
}

tbody tr:hover, tr:hover {
    background-color: #e3f2fd;
}

.text-left { text-align: left !important; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-justify { text-align: justify !important; hyphens: auto; }

td:empty::before {
    content: "—";
    color: #6c757d;
    font-style: italic;
}

@media (max-width: 768px) {
    table {
        font-size: 12px;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
    th, td {
        padding: 8px 12px;
        min-width: 100px;
    }
}`;
      
      // Ajouter au head du document
      document.head.appendChild(styleSheet);
      console.log('✅ Styles CSS tableaux injectés dans le DOM');
    }

    async processDiagrams(container) {
      if (!this.mermaidLoaded || !window.mermaid) return;

      const mermaidElements = container.querySelectorAll('.mermaid');
      if (mermaidElements.length === 0) return;

      console.log('🎨 Processing', mermaidElements.length, 'Mermaid diagrams');

      try {
        // Nettoyer les éléments déjà traités
        mermaidElements.forEach(el => {
          el.removeAttribute('data-processed');
        });

        await window.mermaid.run();
        console.log('✅ Mermaid diagrams rendered successfully');

        // Vérification post-rendu
        setTimeout(() => {
          const svgElements = container.querySelectorAll('.mermaid svg');
          console.log('🎨 SVG elements found:', svgElements.length);
          
          if (svgElements.length === 0 && mermaidElements.length > 0) {
            console.log('⚠️ Retrying Mermaid rendering...');
            mermaidElements.forEach(el => {
              el.removeAttribute('data-processed');
            });
            window.mermaid.init(undefined, mermaidElements);
          }
        }, 1000);

      } catch (error) {
        console.error('❌ Mermaid rendering error:', error);
        // Fallback: afficher le code brut
        mermaidElements.forEach(el => {
          if (!el.querySelector('svg')) {
            el.innerHTML = `<div style="color: #d73a49; padding: 10px;">❌ Erreur de rendu Mermaid: ${error.message}</div><pre style="background: #f8f8f8; padding: 10px; margin-top: 10px; border-radius: 4px;"><code>${el.textContent}</code></pre>`;
          }
        });
      }
    }

    // === NOUVEAU: TRAITEMENT SVG PLANTUML INLINE ===
    async processPlantUML(container) {
      const plantUMLElements = container.querySelectorAll('.plantuml-diagram[data-plantuml-url]');
      if (plantUMLElements.length === 0) return;

      console.log('🌱 Processing', plantUMLElements.length, 'PlantUML diagrams');

      // Traiter tous les diagrammes en parallèle pour la performance
      const promises = Array.from(plantUMLElements).map(async (element) => {
        const plantUMLUrl = element.getAttribute('data-plantuml-url');
        
        try {
          let svgText;
          
          // === CACHE SVG ===
          const cachedSVG = this.getCachedSVG(plantUMLUrl);
          if (cachedSVG) {
            svgText = cachedSVG;
          } else {
            // Fetch le SVG depuis le serveur PlantUML
            const response = await fetch(plantUMLUrl);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            svgText = await response.text();
            
            // Mettre en cache
            this.cacheSVG(plantUMLUrl, svgText);
          }
          
          // Parser le SVG
          const temp = document.createElement('div');
          temp.innerHTML = svgText;
          const svg = temp.querySelector('svg');
          
          if (!svg) {
            throw new Error('No SVG found in response');
          }
          
          // Appliquer les styles au SVG
          svg.style.maxWidth = '100%';
          svg.style.height = 'auto';
          svg.style.display = 'block';
          svg.style.margin = '0 auto';
          
          // === GESTION DES LIENS CLIQUABLES ===
          const links = svg.querySelectorAll('a[href]');
          console.log(`🔗 Found ${links.length} links in PlantUML diagram`);
          
          links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Si c'est un lien interne (.md, .html, .puml), utiliser le router OntoWave
            if (href && (href.endsWith('.md') || href.endsWith('.html') || href.endsWith('.puml'))) {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🔗 Navigating to: ${href}`);
                this.loadPage(href);
              });
              
              // Style hover pour indiquer que c'est cliquable
              link.style.cursor = 'pointer';
              link.setAttribute('class', (link.getAttribute('class') || '') + ' ontowave-internal-link');
            }
          });
          
          // Remplacer le placeholder par le SVG
          element.innerHTML = '';
          element.appendChild(svg);
          
          console.log('✅ PlantUML diagram rendered with', links.length, 'clickable links');
          
        } catch (error) {
          console.error('❌ Failed to load PlantUML diagram:', error);
          element.innerHTML = `
            <div style="color: #d73a49; padding: 20px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 6px;">
              <strong>❌ Erreur de rendu PlantUML</strong>
              <p style="margin: 5px 0; font-size: 14px;">${error.message}</p>
              <details style="margin-top: 10px;">
                <summary style="cursor: pointer; color: #0366d6;">Détails techniques</summary>
                <pre style="background: #f6f8fa; padding: 10px; margin-top: 5px; border-radius: 4px; overflow-x: auto; font-size: 12px;">URL: ${plantUMLUrl}</pre>
              </details>
            </div>
          `;
        }
      });

      // Attendre que tous les diagrammes soient traités
      await Promise.all(promises);
      console.log('✅ All PlantUML diagrams processed');
    }
    // === FIN TRAITEMENT PLANTUML ===

    async processPrism(container) {
      console.log('🔍 processPrism called - prismLoaded:', this.prismLoaded, 'window.Prism:', !!window.Prism);
      
      if (!window.Prism) {
        console.log('🎨 Prism not available, skipping syntax highlighting');
        return;
      }

      // Attendre que JavaScript soit chargé (langage essentiel)
      if (!window.Prism.languages || !window.Prism.languages.javascript) {
        console.log('⏳ JavaScript not loaded yet, waiting...');
        // Attendre maximum 2 secondes
        for (let i = 0; i < 20; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (window.Prism.languages && window.Prism.languages.javascript) {
            console.log('✅ JavaScript language now available');
            break;
          }
        }
        
        if (!window.Prism.languages || !window.Prism.languages.javascript) {
          console.warn('⚠️ JavaScript language still not available after waiting');
        }
      }

      try {
        // Vérifier les langages disponibles
        console.log('🔤 Available Prism languages:', window.Prism.languages ? Object.keys(window.Prism.languages) : 'none');
        
        // Trouver tous les blocs de code avec des classes de langue
        const codeElements = container.querySelectorAll('code[class*="language-"]');
        console.log('🎨 Found', codeElements.length, 'code blocks with language classes');
        
        // Debug détaillé de chaque bloc de code
        codeElements.forEach((el, i) => {
          console.log(`🔍 Code block ${i}:`);
          console.log(`  - class: "${el.className}"`);
          console.log(`  - content length: ${el.textContent?.length}`);
          console.log(`  - content preview: "${el.textContent?.substring(0, 50)}..."`);
          console.log(`  - parent visible: ${window.getComputedStyle(el.parentElement).display !== 'none'}`);
          console.log(`  - element visible: ${window.getComputedStyle(el).display !== 'none'}`);
        });
        
        // Aussi chercher les blocs sans classe pour debug
        const allCodeElements = container.querySelectorAll('code');
        console.log('📝 Total code blocks found:', allCodeElements.length);

        if (codeElements.length > 0) {
          // Tenter manuellement sur le premier élément pour debug
          const firstElement = codeElements[0];
          console.log('🧪 Testing manual highlighting on first element...');
          
          // Vérifier le langage
          const classList = firstElement.className.split(' ');
          const langClass = classList.find(cls => cls.startsWith('language-'));
          const lang = langClass ? langClass.replace('language-', '') : 'unknown';
          console.log(`🔤 Language detected: "${lang}"`);
          console.log(`🔤 Language available in Prism: ${!!(window.Prism.languages && window.Prism.languages[lang])}`);
          
          // Test manuel
          if (window.Prism.languages && window.Prism.languages[lang]) {
            console.log('🧪 Attempting manual highlight...');
            const originalContent = firstElement.textContent;
            try {
              const highlighted = window.Prism.highlight(originalContent, window.Prism.languages[lang], lang);
              console.log(`🎨 Manual highlight result length: ${highlighted.length}`);
              console.log(`🎨 Manual highlight preview: "${highlighted.substring(0, 100)}..."`);
              
              // Appliquer le résultat
              firstElement.innerHTML = highlighted;
              console.log('✅ Manual highlight applied');
            } catch (manualError) {
              console.error('❌ Manual highlight failed:', manualError);
            }
          }
          
          // Puis essayer la méthode normale
          window.Prism.highlightAllUnder(container);
          console.log('✅ Prism syntax highlighting applied to', codeElements.length, 'blocks');
          
          // Vérifier que la coloration a fonctionné
          const tokenElements = container.querySelectorAll('.token');
          console.log('🎨 Tokens created after highlighting:', tokenElements.length);
          
          // Debug des tokens créés
          if (tokenElements.length > 0) {
            tokenElements.forEach((token, i) => {
              console.log(`Token ${i}: "${token.textContent}" (class: ${token.className})`);
            });
          }
        } else {
          console.log('⚠️ No code blocks with language classes found for Prism');
        }
      } catch (error) {
        console.error('❌ Prism highlighting error:', error);
      }
    }

    // === ANCIENNE FONCTION SUPPRIMÉE ===
    // attachPlantUMLLinks() n'est plus nécessaire car on insère directement le SVG inline
    // Les liens sont attachés dans processPlantUML()
    // === FIN SUPPRESSION ===

    showConfigurationInterface() {
      const contentDiv = document.getElementById('ontowave-content');
      if (!contentDiv) return;

      const currentConfigString = JSON.stringify(this.config, null, 2)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      contentDiv.innerHTML = `
        <div class="ontowave-config-interface">
          <div class="config-header">
            <h1>🌊 OntoWave Configuration</h1>
            <p>Aucun fichier index trouvé. Configurez OntoWave pour votre projet :</p>
          </div>
          
          <div class="config-content">
            <div class="config-form">
              <h2>📝 Configuration</h2>
              
              <div class="form-group">
                <label for="config-title">Titre du site :</label>
                <input type="text" id="config-title" />
              </div>
              
              <div class="form-group">
                <label for="config-defaultPage">Page par défaut :</label>
                <input type="text" id="config-defaultPage" />
              </div>
              
              <div class="form-group">
                <label for="config-locales">Langues supportées (séparées par des virgules) :</label>
                <input type="text" id="config-locales" placeholder="fr-CA, fr, en" />
              </div>
              
              <div class="form-group">
                <label>
                  <input type="checkbox" id="config-showGallery" />
                  Afficher la galerie d'exemples
                </label>
              </div>
              
              <div class="form-group">
                <label for="config-mermaidTheme">Thème Mermaid :</label>
                <select id="config-mermaidTheme">
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="forest">Forest</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button onclick="window.OntoWave.instance.updateConfigFromForm()">✅ Appliquer</button>
                <button onclick="window.OntoWave.instance.downloadConfig()">💾 Télécharger HTML</button>
                <button onclick="window.OntoWave.instance.resetConfig()">🔄 Reset</button>
              </div>
            </div>
            
            <div class="config-code">
              <h2>💻 Code HTML généré</h2>
              <div class="code-preview">
                <pre><code id="generated-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;${this.config.title}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;script src="ontowave.min.js"&gt;&lt;/script&gt;
    &lt;script type="application/json" id="ontowave-config"&gt;
${currentConfigString}
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
              </div>
              
              <div class="usage-info">
                <h3>📋 Instructions d'utilisation</h3>
                <ol>
                  <li>Configurez les options dans le formulaire</li>
                  <li>Cliquez sur "Télécharger HTML" pour obtenir votre fichier</li>
                  <li>Placez vos fichiers .md dans le même dossier</li>
                  <li>Ouvrez le fichier HTML dans votre navigateur</li>
                </ol>
                
                <h3>🌐 Gestion des langues</h3>
                <ul>
                  <li><strong>Monolingue :</strong> Laissez "Langues supportées" vide</li>
                  <li><strong>Multilingue :</strong> Ajoutez les codes de langue (ex: fr, en, fr-CA)</li>
                  <li><strong>Fichiers :</strong> index.fr.md, index.en.md, etc.</li>
                  <li><strong>Fallback :</strong> index.md si aucune langue trouvée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;

      // Ajouter les styles pour l'interface de configuration
      this.addConfigStyles();
      
      // Remplir les valeurs des champs après génération du HTML (une seule fois)
      this.populateConfigForm();
      
      // Générer le code HTML initial
      this.updateGeneratedCode();
    }
    
    // Méthode pour remplir les valeurs du formulaire
    populateConfigForm() {
      const titleField = document.getElementById('config-title');
      const defaultPageField = document.getElementById('config-defaultPage');
      const localesField = document.getElementById('config-locales');
      const showGalleryField = document.getElementById('config-showGallery');
      const mermaidThemeField = document.getElementById('config-mermaidTheme');
      
      if (titleField) titleField.value = this.config.title;
      if (defaultPageField) defaultPageField.value = this.config.defaultPage;
      if (localesField) localesField.value = this.config.locales.join(', ');
      if (showGalleryField) showGalleryField.checked = this.config.showGallery;
      if (mermaidThemeField) mermaidThemeField.value = this.config.mermaid.theme;
    }

    addConfigStyles() {
      if (document.getElementById('ontowave-config-styles')) return;

      const style = document.createElement('style');
      style.id = 'ontowave-config-styles';
      style.textContent = `
        .ontowave-config-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .config-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .config-header h1 {
          color: #0969da;
          margin-bottom: 10px;
        }
        
        .config-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        
        .config-form {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e1e4e8;
        }
        
        .config-code {
          background: #ffffff;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e1e4e8;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #24292e;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }
        
        .form-actions button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .form-actions button:first-child {
          background: #28a745;
          color: white;
        }
        
        .form-actions button:nth-child(2) {
          background: #0969da;
          color: white;
        }
        
        .form-actions button:last-child {
          background: #6c757d;
          color: white;
        }
        
        .form-actions button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .code-preview {
          background: #f6f8fa;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          margin-bottom: 20px;
        }
        
        .code-preview pre {
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .usage-info h3 {
          color: #0969da;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        
        .usage-info ul, .usage-info ol {
          padding-left: 20px;
        }
        
        .usage-info li {
          margin-bottom: 5px;
        }
        
        @media (max-width: 768px) {
          .config-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }

    updateConfigFromForm() {
      // Mettre à jour la configuration depuis le formulaire
      const title = document.getElementById('config-title').value;
      const defaultPage = document.getElementById('config-defaultPage').value;
      const locales = document.getElementById('config-locales').value
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      const showGallery = document.getElementById('config-showGallery').checked;
      const mermaidTheme = document.getElementById('config-mermaidTheme').value;

      this.config.title = title;
      this.config.defaultPage = defaultPage;
      this.config.locales = locales;
      this.config.showGallery = showGallery;
      this.config.mermaid.theme = mermaidTheme;

      console.log('📝 Configuration updated:', this.config);
      
      // Mettre à jour le titre de la page
      document.title = this.config.title;
      
      // Régénérer le code HTML
      this.updateGeneratedCode();
      
      // Afficher notification
      this.showNotification('✅ Configuration mise à jour');
    }

    updateGeneratedCode() {
      // Créer une config simplifiée pour l'affichage
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const htmlCode = `&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;${this.config.title}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;script src="ontowave.min.js"&gt;&lt;/script&gt;
    &lt;script type="application/json" id="ontowave-config"&gt;
${configString}
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

      const codeElement = document.getElementById('generated-html');
      if (codeElement) {
        codeElement.innerHTML = htmlCode;
      }
    }

    downloadConfig() {
      // Utiliser la config simplifiée pour le téléchargement aussi
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2);
      
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.config.title}</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
    <script type="application/json" id="ontowave-config">
${configString}
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('💾 Fichier HTML téléchargé');
    }

    resetConfig() {
      this.config = { ...DEFAULT_CONFIG };
      this.showConfigurationInterface();
      this.showNotification('🔄 Configuration réinitialisée');
    }

    showNotification(message) {
      // Créer une notification temporaire
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      `;
      notification.textContent = message;
      
      // Ajouter animation CSS
      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }

    showError(message) {
      const contentDiv = document.getElementById('ontowave-content');
      if (contentDiv) {
        contentDiv.innerHTML = `<div class="ontowave-error">❌ ${message}</div>`;
      }
    }

    // Panneau de configuration dans le menu flottant
    toggleConfigurationPanel(event, locale = null) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      const targetLang = locale || this.getCurrentLanguage();
      console.log('⚙️ Opening config panel with locale:', targetLang);
      
      const menuContent = document.querySelector('.ontowave-menu-content');
      if (!menuContent) {
        console.error('Menu content not found');
        return;
      }

      // Trouver le bouton Configuration
      const configButton = document.querySelector('.ontowave-menu-option[onclick*="toggleConfigurationPanel"]');

      // Vérifier si le panneau existe déjà
      let configPanel = document.getElementById('ontowave-config-panel');
      
      if (configPanel) {
        // Si le panneau existe, le supprimer (toggle off)
        configPanel.remove();
        if (configButton) {
          configButton.classList.remove('selected');
        }
        
        // Supprimer la classe pour réactiver le zoom au survol
        const floatingMenu = document.getElementById('ontowave-floating-menu');
        if (floatingMenu) {
          floatingMenu.classList.remove('has-config-panel');
        }
        
        // Mettre à jour l'état de déplacement après fermeture du panneau
        if (typeof window.ontowaveUpdateDragState === 'function') {
          window.ontowaveUpdateDragState();
        }
        console.log('Config panel closed');
        return;
      }

      // Marquer le bouton comme sélectionné
      if (configButton) {
        configButton.classList.add('selected');
      }

      // Créer le panneau de configuration
      configPanel = document.createElement('div');
      configPanel.id = 'ontowave-config-panel';
      configPanel.className = 'ontowave-config-panel';
      
      configPanel.innerHTML = `
        <div class="config-panel-content">
          <div class="config-full-panel">
            <h3>🌊 ${this.t('configTitle', targetLang)}</h3>
            
            <!-- Section Général -->
            <div class="config-section">
              <h4>📖 ${this.t('configGeneral', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-title-full">${this.t('configSiteTitle', targetLang)}</label>
                  <input type="text" id="config-title-full" value="${this.config.title}" />
                </div>
                <div class="form-group-full">
                  <label for="config-defaultPage-full">${this.t('configDefaultPage', targetLang)}</label>
                  <input type="text" id="config-defaultPage-full" value="${this.config.defaultPage}" placeholder="index.md" />
                </div>
              </div>
              <div class="form-group-full">
                <label for="config-baseUrl-full">${this.t('configBaseUrl', targetLang)}</label>
                <input type="text" id="config-baseUrl-full" value="${this.config.baseUrl}" placeholder="/" />
              </div>
            </div>

            <!-- Section Langues et Localisation -->
            <div class="config-section">
              <h4>🌍 ${this.t('configLanguages', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-locales-full">${this.t('configSupportedLanguages', targetLang)}</label>
                  <input type="text" id="config-locales-full" value="${this.config.locales.join(', ')}" placeholder="fr-CA, fr, en" />
                  <small>${this.t('configLanguageNote', targetLang)}</small>
                </div>
                <div class="form-group-full">
                  <label for="config-fallbackLocale-full">${this.t('configFallbackLanguage', targetLang)}</label>
                  <select id="config-fallbackLocale-full">
                    <option value="en" ${this.config.fallbackLocale === 'en' ? 'selected' : ''}>English (en)</option>
                    <option value="fr" ${this.config.fallbackLocale === 'fr' ? 'selected' : ''}>Français (fr)</option>
                    <option value="es" ${this.config.fallbackLocale === 'es' ? 'selected' : ''}>Español (es)</option>
                    <option value="de" ${this.config.fallbackLocale === 'de' ? 'selected' : ''}>Deutsch (de)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section Navigation et Interface -->
            <div class="config-section">
              <h4>🧭 ${this.t('configNavigation', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-showGallery-full" ${this.config.showGallery ? 'checked' : ''} />
                    🎨 ${this.t('configShowGallery', targetLang)}
                  </label>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-navHome-full" ${this.config.navigation?.showHome !== false ? 'checked' : ''} />
                    🏠 ${this.t('configHomeButton', targetLang)}
                  </label>
                </div>
              </div>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-navBreadcrumb-full" ${this.config.navigation?.showBreadcrumb !== false ? 'checked' : ''} />
                    📍 ${this.t('configBreadcrumb', targetLang)}
                  </label>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-navToc-full" ${this.config.navigation?.showToc !== false ? 'checked' : ''} />
                    📑 ${this.t('configToc', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section Diagrammes Mermaid -->
            <div class="config-section">
              <h4>📊 ${this.t('configMermaid', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-mermaidTheme-full">${this.t('configMermaidTheme', targetLang)}</label>
                  <select id="config-mermaidTheme-full">
                    <option value="default" ${this.config.mermaid?.theme === 'default' ? 'selected' : ''}>Default (clair)</option>
                    <option value="dark" ${this.config.mermaid?.theme === 'dark' ? 'selected' : ''}>Dark (sombre)</option>
                    <option value="forest" ${this.config.mermaid?.theme === 'forest' ? 'selected' : ''}>Forest (vert)</option>
                    <option value="neutral" ${this.config.mermaid?.theme === 'neutral' ? 'selected' : ''}>Neutral (neutre)</option>
                  </select>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-mermaidStart-full" ${this.config.mermaid?.startOnLoad !== false ? 'checked' : ''} />
                    🚀 ${this.t('configMermaidAuto', targetLang)}
                  </label>
                </div>
              </div>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-mermaidMaxWidth-full" ${this.config.mermaid?.flowchart?.useMaxWidth !== false ? 'checked' : ''} />
                    📐 ${this.t('configMermaidMaxWidth', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section PlantUML -->
            <div class="config-section">
              <h4>🌿 ${this.t('configPlantuml', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-plantumlServer-full">${this.t('configPlantumlServer', targetLang)}</label>
                  <input type="text" id="config-plantumlServer-full" value="${this.config.plantuml?.server || 'https://www.plantuml.com/plantuml'}" />
                </div>
                <div class="form-group-full">
                  <label for="config-plantumlFormat-full">${this.t('configPlantumlFormat', targetLang)}</label>
                  <select id="config-plantumlFormat-full">
                    <option value="svg" ${this.config.plantuml?.format === 'svg' ? 'selected' : ''}>SVG (vectoriel)</option>
                    <option value="png" ${this.config.plantuml?.format === 'png' ? 'selected' : ''}>PNG (bitmap)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Section Coloration Syntaxique -->
            <div class="config-section">
              <h4>🎨 ${this.t('configPrism', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-prismTheme-full">${this.t('configPrismTheme', targetLang)}</label>
                  <select id="config-prismTheme-full">
                    <option value="default" ${this.config.prism?.theme === 'default' ? 'selected' : ''}>Default (clair)</option>
                    <option value="dark" ${this.config.prism?.theme === 'dark' ? 'selected' : ''}>Dark (sombre)</option>
                    <option value="twilight" ${this.config.prism?.theme === 'twilight' ? 'selected' : ''}>Twilight</option>
                  </select>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-prismAutoload-full" ${this.config.prism?.autoload !== false ? 'checked' : ''} />
                    🔄 ${this.t('configPrismAutoload', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section Interface Utilisateur -->
            <div class="config-section">
              <h4>💻 ${this.t('configUI', targetLang)}</h4>
              <div class="config-row">
                <div class="form-group-full">
                  <label for="config-uiTheme-full">${this.t('configUITheme', targetLang)}</label>
                  <select id="config-uiTheme-full">
                    <option value="default" ${this.config.ui?.theme === 'default' ? 'selected' : ''}>Default (clair)</option>
                    <option value="dark" ${this.config.ui?.theme === 'dark' ? 'selected' : ''}>Dark (sombre)</option>
                    <option value="auto" ${this.config.ui?.theme === 'auto' ? 'selected' : ''}>Auto (système)</option>
                  </select>
                </div>
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-uiResponsive-full" ${this.config.ui?.responsive !== false ? 'checked' : ''} />
                    📱 ${this.t('configUIResponsive', targetLang)}
                  </label>
                </div>
              </div>
              <div class="config-row">
                <div class="form-group-checkbox">
                  <label>
                    <input type="checkbox" id="config-uiAnimations-full" ${this.config.ui?.animations !== false ? 'checked' : ''} />
                    ✨ ${this.t('configUIAnimations', targetLang)}
                  </label>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions-full">
              <button onclick="window.OntoWave.instance.updateConfigFromFullPanel()" class="btn-primary">✅ ${this.t('configApply', targetLang)}</button>
              <button onclick="window.OntoWave.instance.downloadConfigFromPanel()" class="btn-secondary">💾 ${this.t('configDownloadHTML', targetLang)}</button>
              <button onclick="window.OntoWave.instance.downloadOntoWaveScript()" class="btn-secondary">📥 ${this.t('configDownloadJS', targetLang)}</button>
              <button onclick="window.OntoWave.instance.resetConfigToDefaults()" class="btn-warning">🔄 ${this.t('configReset', targetLang)}</button>
            </div>
          </div>
        </div>
      `;

      // Ajouter les styles du panneau
      this.addConfigPanelStyles();
      
      // Insérer le panneau après le menu
      menuContent.appendChild(configPanel);
      
      // Ajouter la classe pour désactiver le zoom au survol
      const floatingMenu = document.getElementById('ontowave-floating-menu');
      if (floatingMenu) {
        floatingMenu.classList.add('has-config-panel');
      }
      
      // Mettre à jour l'état de déplacement après ouverture du panneau
      if (typeof window.ontowaveUpdateDragState === 'function') {
        window.ontowaveUpdateDragState();
      }
      
      // Générer le code HTML initial
      this.updateGeneratedCodeMini();
      
      console.log('Config panel opened');
    }

    // Méthodes pour le panneau complet
    updateConfigFromFullPanel() {
      // Général
      const title = document.getElementById('config-title-full')?.value || this.config.title;
      const defaultPage = document.getElementById('config-defaultPage-full')?.value || this.config.defaultPage;
      const baseUrl = document.getElementById('config-baseUrl-full')?.value || this.config.baseUrl;

      // Langues
      const locales = document.getElementById('config-locales-full')?.value
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0) || this.config.locales;
      const fallbackLocale = document.getElementById('config-fallbackLocale-full')?.value || this.config.fallbackLocale;

      // Navigation
      const showGallery = document.getElementById('config-showGallery-full')?.checked || false;
      const showHome = document.getElementById('config-navHome-full')?.checked !== false;
      const showBreadcrumb = document.getElementById('config-navBreadcrumb-full')?.checked !== false;
      const showToc = document.getElementById('config-navToc-full')?.checked !== false;

      // Mermaid
      const mermaidTheme = document.getElementById('config-mermaidTheme-full')?.value || 'default';
      const mermaidStart = document.getElementById('config-mermaidStart-full')?.checked !== false;
      const mermaidMaxWidth = document.getElementById('config-mermaidMaxWidth-full')?.checked !== false;

      // PlantUML
      const plantumlServer = document.getElementById('config-plantumlServer-full')?.value || 'https://www.plantuml.com/plantuml';
      const plantumlFormat = document.getElementById('config-plantumlFormat-full')?.value || 'svg';

      // Prism
      const prismTheme = document.getElementById('config-prismTheme-full')?.value || 'default';
      const prismAutoload = document.getElementById('config-prismAutoload-full')?.checked !== false;

      // UI
      const uiTheme = document.getElementById('config-uiTheme-full')?.value || 'default';
      const uiResponsive = document.getElementById('config-uiResponsive-full')?.checked !== false;
      const uiAnimations = document.getElementById('config-uiAnimations-full')?.checked !== false;

      // Mettre à jour la configuration
      this.config.title = title;
      this.config.defaultPage = defaultPage;
      this.config.baseUrl = baseUrl;
      this.config.locales = locales;
      this.config.fallbackLocale = fallbackLocale;
      this.config.showGallery = showGallery;
      
      this.config.navigation = {
        showHome: showHome,
        showBreadcrumb: showBreadcrumb,
        showToc: showToc
      };

      this.config.mermaid = {
        theme: mermaidTheme,
        startOnLoad: mermaidStart,
        flowchart: { useMaxWidth: mermaidMaxWidth },
        sequence: { useMaxWidth: mermaidMaxWidth },
        gantt: { useMaxWidth: mermaidMaxWidth },
        journey: { useMaxWidth: mermaidMaxWidth }
      };

      this.config.plantuml = {
        server: plantumlServer,
        format: plantumlFormat
      };

      this.config.prism = {
        theme: prismTheme,
        autoload: prismAutoload
      };

      this.config.ui = {
        theme: uiTheme,
        responsive: uiResponsive,
        animations: uiAnimations
      };

      // Mettre à jour le titre de la page
      document.title = this.config.title;

      // Afficher une notification
      this.showNotification('Configuration appliquée avec succès ! 🎉');

      console.log('Configuration mise à jour:', this.config);
    }

    resetConfigToDefaults() {
      if (confirm('Voulez-vous vraiment réinitialiser toute la configuration aux valeurs par défaut ?')) {
        // Réinitialiser avec les valeurs par défaut
        Object.assign(this.config, {
          title: "OntoWave Documentation",
          baseUrl: "/",
          defaultPage: "index.md",
          locales: [],
          fallbackLocale: "en",
          showGallery: false,
          mermaid: {
            theme: "default",
            startOnLoad: true,
            flowchart: { useMaxWidth: true },
            sequence: { useMaxWidth: true },
            gantt: { useMaxWidth: true },
            journey: { useMaxWidth: true }
          },
          plantuml: {
            server: "https://www.plantuml.com/plantuml",
            format: "svg"
          },
          prism: {
            theme: "default",
            autoload: true
          },
          navigation: {
            showHome: true,
            showBreadcrumb: true,
            showToc: true
          },
          ui: {
            theme: "default",
            responsive: true,
            animations: true
          }
        });

        // Fermer et rouvrir le panneau pour actualiser les valeurs
        const configPanel = document.getElementById('ontowave-config-panel');
        if (configPanel) {
          configPanel.remove();
          // Mettre à jour l'état de déplacement après suppression du panneau
          if (typeof window.ontowaveUpdateDragState === 'function') {
            window.ontowaveUpdateDragState();
          }
          setTimeout(() => this.toggleConfigurationPanel(), 100);
        }

        this.showNotification('Configuration réinitialisée ! 🔄');
      }
    }

    // Méthodes pour le panneau compact (compatibilité)
    updateConfigFromPanel() {
      const title = document.getElementById('config-title-mini')?.value || this.config.title;
      const locales = document.getElementById('config-locales-mini')?.value
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0) || this.config.locales;
      const showGallery = document.getElementById('config-showGallery-mini')?.checked || this.config.showGallery;

      this.config.title = title;
      this.config.locales = locales;
      this.config.showGallery = showGallery;

      // Mettre à jour le titre de la page
      document.title = this.config.title;
      
      // Régénérer le code HTML
      this.updateGeneratedCodeMini();
      
      this.showNotification('✅ Configuration mise à jour');
    }

    downloadConfigFromPanel() {
      // Utiliser la config simplifiée pour le téléchargement
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2);
      
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.config.title}</title>
</head>
<body>
    <script src="ontowave.min.js"></script>
    <script type="application/json" id="ontowave-config">
${configString}
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('💾 Fichier HTML téléchargé');
    }

    downloadOntoWaveScript() {
      // Créer un lien de téléchargement vers le fichier ontowave.min.js
      const a = document.createElement('a');
      a.href = 'ontowave.min.js';
      a.download = 'ontowave.min.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      this.showNotification('📥 Fichier ontowave.min.js téléchargé');
    }

    updateGeneratedCodeMini() {
      // Créer une config simplifiée pour l'affichage
      const simpleConfig = {
        title: this.config.title,
        baseUrl: this.config.baseUrl,
        defaultPage: this.config.defaultPage,
        locales: this.config.locales,
        fallbackLocale: this.config.fallbackLocale,
        showGallery: this.config.showGallery,
        mermaid: {
          theme: this.config.mermaid.theme
        }
      };

      const configString = JSON.stringify(simpleConfig, null, 2)
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const htmlCode = `&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;${this.config.title}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;script src="ontowave.min.js"&gt;&lt;/script&gt;
    &lt;script type="application/json" id="ontowave-config"&gt;
${configString}
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

      const codeElement = document.getElementById('generated-html-mini');
      if (codeElement) {
        codeElement.innerHTML = htmlCode;
      }
    }

    addConfigPanelStyles() {
      if (document.getElementById('ontowave-config-panel-styles')) return;

      const style = document.createElement('style');
      style.id = 'ontowave-config-panel-styles';
      style.textContent = `
        
        .ontowave-config-panel {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 12px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.15);
          z-index: 1001;
          margin-top: 12px;
          max-height: 90vh;
          overflow-y: auto;
          min-width: 90vw;
          max-width: 95vw;
          width: auto;
        }
        
        .config-panel-content {
          padding: 0;
        }
        
        .config-full-panel {
          padding: 32px;
          max-width: none;
        }
        
        .config-full-panel h3 {
          margin: 0 0 32px 0;
          color: #0969da;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #f6f8fa;
        }
        
        
        .config-section {
          margin-bottom: 32px;
          padding: 24px;
          background: #f6f8fa;
          border-radius: 8px;
          border-left: 4px solid #0969da;
        }
        
        .config-section h4 {
          margin: 0 0 20px 0;
          color: #24292e;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        
        .config-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }
        
        .config-row:last-child {
          margin-bottom: 0;
        }
        
        
        .form-group-full {
          margin-bottom: 0;
        }
        
        .form-group-full label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #24292e;
          font-size: 14px;
        }
        
        .form-group-full input,
        .form-group-full select {
          width: 100%;
          padding: 12px;
          border: 2px solid #d0d7de;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        
        .form-group-full input:focus,
        .form-group-full select:focus {
          outline: none;
          border-color: #0969da;
          box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
        }
        
        .form-group-full small {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #656d76;
          font-style: italic;
        }
        
        
        .form-group-checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 0;
        }
        
        .form-group-checkbox label {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #24292e;
          font-size: 14px;
          cursor: pointer;
          margin: 0;
        }
        
        .form-group-checkbox input[type="checkbox"] {
          width: auto;
          margin: 0 8px 0 0;
          transform: scale(1.2);
          accent-color: #0969da;
        }
        
        
        .form-actions-full {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 2px solid #f6f8fa;
          flex-wrap: wrap;
        }
        
        .form-actions-full button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: #0969da;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0550ae;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(9, 105, 218, 0.3);
        }
        
        .btn-secondary {
          background: #6f7782;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #57606a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(111, 119, 130, 0.3);
        }
        
        .btn-warning {
          background: #d73a49;
          color: white;
        }
        
        .btn-warning:hover {
          background: #b31d28;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(215, 58, 73, 0.3);
        }
        
        
        @media (max-width: 768px) {
          .ontowave-config-panel {
            min-width: 95vw;
            margin-top: 8px;
          }
          
          .config-full-panel {
            padding: 20px;
          }
          
          .config-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .form-actions-full {
            flex-direction: column;
            align-items: stretch;
          }
          
          .form-actions-full button {
            min-width: auto;
          }
        }
        
        
        .config-form-compact h3,
        .config-preview-compact h3 {
          margin: 0 0 16px 0;
          color: #0969da;
          font-size: 16px;
          font-weight: 600;
        }
        
        .form-group-compact {
          margin-bottom: 16px;
        }
        
        .form-group-compact label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #24292e;
          font-size: 13px;
        }
        
        .form-group-compact input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d0d7de;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .form-group-compact input[type="checkbox"] {
          width: auto;
          margin-right: 6px;
        }
        
        .form-actions-compact {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .form-actions-compact button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          background: #0969da;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
          min-width: 120px;
        }
        
        .form-actions-compact button:hover {
          background: #0550ae;
        }
        
        .config-preview-compact {
          background: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
        }
        
        .code-preview-mini {
          background: #24292e;
          color: #f6f8fa;
          padding: 12px;
          border-radius: 4px;
          font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 11px;
          line-height: 1.4;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
      `;
      document.head.appendChild(style);
    }

    // API publique
    navigate(page) {
      this.loadPage(page);
    }

    getConfig() {
      return { ...this.config };
    }

    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      console.log('📝 Configuration updated');
    }
  }

  // Export de la classe OntoWave immédiatement (avant DOMContentLoaded)
  window.OntoWave = OntoWave;
  console.log('✅ OntoWave class exported to window.OntoWave');

  // Initialisation automatique au chargement de la page
  document.addEventListener('DOMContentLoaded', async () => {
    // Utiliser UNIQUEMENT window.OntoWaveConfig (architecture inline)
    const config = window.OntoWaveConfig || {};
    
    // Si contentPath est fourni, utiliser l'ancien système MAIS charger contentPath
    if (config.contentPath) {
      console.log('🚀 OntoWave AUTO-INIT avec contentPath:', config.contentPath);
      
      // IMPORTANT: Flag pour désactiver SEULEMENT le chargement auto du hash
      config.disableHashLoading = true;
      
      // Initialiser OntoWave normalement (garde le menu, les styles, etc.)
      const instance = new OntoWave(config);
      await instance.init();
      
      // Charger le contenu depuis contentPath au lieu du hash
      try {
        const response = await fetch(config.contentPath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const content = await response.text();
        const html = await instance.renderMarkdown(content);
        
        // Utiliser le container créé par l'ancien système
        const appContainer = document.getElementById('ontowave-content') || document.getElementById('app');
        if (appContainer) {
          appContainer.innerHTML = html;
          console.log('✅ Contenu chargé depuis:', config.contentPath);
          
          // Traiter les diagrammes Mermaid/PlantUML après injection
          await instance.processDiagrams(appContainer);
          await instance.processPlantUML(appContainer);
        } else {
          console.error('❌ Container ontowave-content introuvable');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du contenu:', error);
        const appContainer = document.getElementById('ontowave-content') || document.getElementById('app');
        if (appContainer) {
          appContainer.innerHTML = `
            <div style="color: red; padding: 2rem; border: 2px solid red; border-radius: 8px;">
              <h2>Erreur de chargement</h2>
              <p><strong>Fichier:</strong> ${config.contentPath}</p>
              <p><strong>Erreur:</strong> ${error.message}</p>
            </div>
          `;
        }
      }
      
      // Stocker l'instance
      window.OntoWave.instance = instance;
      
    } else if (config.routing) {
      // Mode SPA Routing avec hash navigation
      console.log('🚀 OntoWave AUTO-ROUTING activé');
      
      // IMPORTANT: Flag pour désactiver le chargement auto du hash (nouveau mode)
      config.disableHashLoading = true;
      
      // Créer le header
      if (config.title) {
        const header = document.createElement('div');
        header.className = 'ontowave-header';
        header.innerHTML = `
          <h1>${config.title}</h1>
          ${config.subtitle ? `<p>${config.subtitle}</p>` : ''}
        `;
        document.body.insertBefore(header, document.body.firstChild);
      }
      
      // Créer la navigation si routes fournis
      if (config.routes && config.routes.length > 0) {
        const nav = document.createElement('div');
        nav.className = 'ontowave-nav';
        nav.innerHTML = config.routes.map(route => 
          `<a href="#${route.hash}">${route.icon || '📄'} ${route.label}</a>`
        ).join('');
        document.body.appendChild(nav);
      }
      
      // Créer le container
      let appContainer = document.getElementById('app');
      if (!appContainer) {
        appContainer = document.createElement('div');
        appContainer.id = 'app';
        appContainer.className = 'ontowave-app';
        document.body.appendChild(appContainer);
      }
      
      // Injecter styles (header + nav + app)
      if (!config.noDefaultStyles) {
        const styles = document.createElement('style');
        styles.textContent = `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
          }
          .ontowave-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
          }
          .ontowave-header h1 { margin: 0 0 0.5rem 0; }
          .ontowave-header p { margin: 0; opacity: 0.9; }
          .ontowave-nav {
            margin-bottom: 1rem;
          }
          .ontowave-nav a {
            display: inline-block;
            margin-right: 1rem;
            padding: 0.5rem 1rem;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.3s;
          }
          .ontowave-nav a:hover { background: #764ba2; }
          .ontowave-app {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            min-height: 500px;
          }
        `;
        document.head.appendChild(styles);
      }
      
      // Initialiser OntoWave
      const instance = new OntoWave(config);
      await instance.init();
      
      // Fonction de chargement de page
      const loadPage = async () => {
        const hash = location.hash.slice(1) || config.defaultRoute || 'page1.md';
        const contentPath = config.contentFolder ? `${config.contentFolder}/${hash}` : `./content/${hash}`;
        
        try {
          const response = await fetch(contentPath);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const content = await response.text();
          const html = await instance.renderMarkdown(content);
          appContainer.innerHTML = html;
          console.log('✅ Route chargée:', hash);
          
          // Traiter les diagrammes Mermaid/PlantUML après injection
          await instance.processDiagrams(appContainer);
          await instance.processPlantUML(appContainer);
        } catch (error) {
          console.error('❌ Erreur de routing:', error);
          appContainer.innerHTML = `
            <div style="color: red; padding: 2rem;">
              <h2>Page non trouvée</h2>
              <p><strong>Route:</strong> ${hash}</p>
              <p><strong>Chemin:</strong> ${contentPath}</p>
              <p><strong>Erreur:</strong> ${error.message}</p>
            </div>
          `;
        }
      };
      
      // Écouter les changements de hash
      window.addEventListener('hashchange', loadPage);
      
      // Intercepter les clics sur liens .md pour les transformer en navigation hash
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
          const url = new URL(link.href, window.location.href);
          // Si c'est un lien vers un fichier .md dans le même domaine
          if (url.origin === window.location.origin && url.pathname.endsWith('.md')) {
            e.preventDefault();
            const filename = url.pathname.split('/').pop();
            window.location.hash = filename;
          }
        }
      });
      
      loadPage(); // Chargement initial
      
      // Stocker l'instance
      window.OntoWave.instance = instance;
      
    } else if (config.i18n) {
      // Mode i18n avec sélecteur de langues
      console.log('🚀 OntoWave AUTO-I18N activé');
      
      // IMPORTANT: Flag pour désactiver le chargement auto du hash (nouveau mode)
      config.disableHashLoading = true;
      
      // Créer le header
      if (config.title) {
        const header = document.createElement('div');
        header.className = 'ontowave-header';
        header.innerHTML = `
          <h1>${config.title}</h1>
          ${config.subtitle ? `<p>${config.subtitle}</p>` : ''}
        `;
        document.body.insertBefore(header, document.body.firstChild);
      }
      
      // Créer le sélecteur de langues
      if (config.i18n.langs && config.i18n.langs.length > 0) {
        const langSwitcher = document.createElement('div');
        langSwitcher.className = 'ontowave-lang-switcher';
        langSwitcher.innerHTML = config.i18n.langs.map(lang => {
          const flags = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹' };
          const labels = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português' };
          const active = lang === (config.i18n.defaultLang || 'fr') ? ' active' : '';
          return `<button id="btn-${lang}" data-lang="${lang}" class="lang-btn${active}">${flags[lang] || '🌍'} ${labels[lang] || lang}</button>`;
        }).join('');
        document.body.appendChild(langSwitcher);
      }
      
      // Créer le container
      let appContainer = document.getElementById('app');
      if (!appContainer) {
        appContainer = document.createElement('div');
        appContainer.id = 'app';
        appContainer.className = 'ontowave-app';
        document.body.appendChild(appContainer);
      }
      
      // Injecter styles
      if (!config.noDefaultStyles) {
        const styles = document.createElement('style');
        styles.textContent = `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
          }
          .ontowave-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
          }
          .ontowave-header h1 { margin: 0 0 0.5rem 0; }
          .ontowave-header p { margin: 0; opacity: 0.9; }
          .ontowave-lang-switcher {
            margin-bottom: 1rem;
            text-align: center;
          }
          .ontowave-lang-switcher button {
            padding: 0.5rem 1rem;
            margin: 0 0.5rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s;
          }
          .ontowave-lang-switcher button:hover { background: #764ba2; }
          .ontowave-lang-switcher button.active { background: #28a745; }
          .ontowave-app {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            min-height: 500px;
          }
        `;
        document.head.appendChild(styles);
      }
      
      // Initialiser OntoWave
      const instance = new OntoWave(config);
      await instance.init();
      
      // État de la langue courante
      let currentLang = config.i18n.defaultLang || 'fr';
      
      // Fonction de chargement du contenu i18n
      const loadLang = async (lang) => {
        currentLang = lang;
        const contentPath = config.i18n.contentPattern 
          ? config.i18n.contentPattern.replace('{lang}', lang)
          : `./content/i18n-${lang}.md`;
        
        try {
          const response = await fetch(contentPath);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const content = await response.text();
          const html = await instance.renderMarkdown(content);
          appContainer.innerHTML = html;
          
          // Mettre à jour les boutons
          document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
          });
          
          console.log('✅ Langue chargée:', lang);
        } catch (error) {
          console.error('❌ Erreur i18n:', error);
          appContainer.innerHTML = `
            <div style="color: red; padding: 2rem;">
              <h2>Erreur de chargement</h2>
              <p><strong>Langue:</strong> ${lang}</p>
              <p><strong>Erreur:</strong> ${error.message}</p>
            </div>
          `;
        }
      };
      
      // Écouter les clics sur les boutons de langue
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-btn')) {
          loadLang(e.target.dataset.lang);
        }
      });
      
      // Chargement initial
      loadLang(currentLang);
      
      // Stocker l'instance
      window.OntoWave.instance = instance;
      
    } else {
      // Mode manuel classique (rétrocompatibilité)
      const instance = new OntoWave(config);
      await instance.init();
      window.OntoWave.instance = instance;
      console.log('🌊 OntoWave initialisé (mode manuel)');
    }
  });


})(window);
