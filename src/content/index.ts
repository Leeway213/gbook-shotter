console.log('Hey, the content script is running!');
import "core-js/stable";
import "regenerator-runtime/runtime";
import $ from 'jquery';
import JSZip from 'jszip';
import Url from 'url-parse';
import { saveAs } from 'file-saver';

function parseQuery(queryString: string) {
  const query: any = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

const history: string[] = [];

function saveHistory(urls: string[]) {
  let changed = false;
  for (const url of urls) {
    if (!history.includes(url)) {
      history.push(url);
      changed = true;
    }
  }
  return changed;
}

async function tickShot() {
  let count = 0;
  const zip = new JSZip();
  zip.folder(document.title);
  while (true) {
    let historyLen = history.length;
    $('.pageImageDisplay img').each((index, element) => {
      const url = (element.getAttribute('src'));
      if (url) {
        saveHistory([url]);
      }
    });
    $('.SPRITE_page_down').trigger('click');
    await new Promise(resolve => setTimeout(resolve, 300));
    if (history.length > historyLen) {
      count = 0;
      historyLen = history.length;
      const url = new Url(history[historyLen - 1], true);
      const blob = await fetch(url.href).then(res => res.blob());
      const page = url.query.pg;
      const ext = blob.type.split('/')[1];
      zip.file(`${document.title}/${page}.${ext}`, blob);
    } else {
      count++;
    }
    if (count >= 10) {
      zip.generateAsync({ type: 'blob' }).then(blob => {
        saveAs(blob, document.title + '.zip');
      });
      break;
    }
  }
}

chrome.runtime.onMessage.addListener((msg, sender, res) => {
  console.log(msg);
  const { type } = msg;
  switch (type) {
    case 'start-shot':
      tickShot().then(() => res({ type: 'start-shot', status: 'completed' }));
      break;

    default:
      break;
  }
});