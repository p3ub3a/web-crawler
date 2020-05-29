const fetch = require('node-fetch');
const fs = require('fs');
var requests = [];
const PAGE_RETRY_ATTEMPTS = 3;
const MAX_REQUEST_NR = 20;
const HOST_RETRY_ATTEMPTS = 4;
const MAX_URL_LENGTH = 2048;

var urls = ["http://iclp.imfast.io/"];
var urlsToVisit = [];
var visitedUrls = [];

crawl();

async function crawl(){
    if(urls.length <= MAX_REQUEST_NR){
        urlsToVisit = urls;
    }else{
        urlsToVisit = urls.slice(0,20);
    }
    console.log("\x1b[36mTrying to visit " + urlsToVisit.length + " URLs...\x1b[0m");
    await Promise.all(urlsToVisit.map(async (item)=>{
        try{
            // gets the domain name
            var domaineRE = /^((?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?[^:\/?\n]+)/g;

            if(!visitedUrls.includes(item)){
                var domain = domaineRE.exec(item);
                var content = await getContent(item);
                var found = await parseHtml(content, domain[1]);

                console.log("On node \x1b[4m\x1b[1m\x1b[32m" + item + "\x1b[0m found: \x1b[32m" + found + "\x1b[0m");
                visitedUrls.push(item);
                urls.splice(urls.indexOf(item), 1);
            }
        }catch(err){
            console.warn("\x1b[31mSomething went wrong:\x1b[0m", err);
        }
    }));
    
    console.log("\x1b[36mVisited a total of " + visitedUrls.length + " URLs.\x1b[0m");
    crawl();
}

async function getContent(url){
    content = fetch(url)
        .then(response => response.text())
        .catch(function (err) {
            console.warn('\x1b[31mSomething went wrong:\x1b[0m', err);
        });
    return content;
}


async function parseHtml(html, domain) {
    var foundUrls = [];

    // finds hrefs inside the page source
    // var re = /<.*?href="(.*?\.html)/g;
    var re = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    var reSearch;
    do {
        reSearch = re.exec(html);
        if (reSearch) {
            pushUrl(foundUrls, domain, reSearch[2],);
            pushUrl(urls, domain, reSearch[2]);
        }
    } while (reSearch);
    return foundUrls;
}

function pushUrl(urlArray, domain, path ) {
    var urlToBePushed;
    if (path.startsWith("http")) {
        urlToBePushed = path;
        if(!urlArray.includes(urlToBePushed) && urlToBePushed.length < MAX_URL_LENGTH){
            urlArray.push(path);
        }
    }
    else {
        urlToBePushed = domain + "/" + path;
        if(!urlArray.includes(urlToBePushed) && urlToBePushed.length < MAX_URL_LENGTH){
            urlArray.push(domain + "/" + path);
        }
    }
}