const fetch = require('node-fetch');
const PAGE_RETRY_ATTEMPTS = 3;
const MAX_PARALLEL_REQUESTS = 20;
const MAX_HOST_PARALLEL_REQUESTS = 4;
const MAX_URL_LENGTH = 2048;

var urls = ["https://iclp.imfast.io/"];
var visitedUrls = [];

var options = {
    follow: 2,
    timeout: 5000
}

crawl();

async function crawl(){
    var urlsToVisit = getUrlsToVisit();
    console.log("\x1b[36mThere are " + urls.length + " URLs left to visit...\x1b[0m");
    console.log("\x1b[36mTrying to visit " + urlsToVisit.length + " URLs...\x1b[0m \n" + urlsToVisit);

    await Promise.all(urlsToVisit.map(async (item)=>{
        try{
            if(!visitedUrls.includes(item)){
                var domain = getHttpDomain(item)[1];

                var content = await getContent(item, PAGE_RETRY_ATTEMPTS);
                var found = await parseHtml(content, domain);
                // console.log("On node \x1b[4m\x1b[1m\x1b[32m" + item + "\x1b[0m found: \x1b[32m" + found + "\x1b[0m");
                updateUrls(item);
            }
        }catch(err){
            console.warn("\x1b[31mSomething went wrong:\x1b[0m", err);
        }
    }));

    console.log("\x1b[36mVisited a total of " + visitedUrls.length + " URLs.\x1b[0m");
    if(urls.length > 0){
        crawl();
    } 
}

async function getContent(url, attemptsNr){
    return fetch(url,options)
    .then(response => response.text())
    .catch((err) => {
        if(attemptsNr !== 0){
            var nr = PAGE_RETRY_ATTEMPTS - attemptsNr + 1;
            console.warn("\x1b[31mRetrying request (attempt nr:" + nr + ") for: "+ url + "\x1b[0m");
            getContent(url, attemptsNr - 1);
        }else{
            updateUrls(url);
        }
    });
}


async function parseHtml(html, domain) {
    // foundUrls can be used for logging purposes
    var foundUrls = [];

    // finds hrefs inside the page source
    // var re = /<.*?href="(.*?\.html)/g;
    var re = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    var reSearch;
    do {
        reSearch = re.exec(html);
        if (reSearch) {
            pushUrl(foundUrls, domain, reSearch[2]);
            pushUrl(urls, domain, reSearch[2]);
        }
    } while (reSearch);
    return foundUrls;
}

function pushUrl(urlArray, domain, path ) {
    var urlToBePushed;
    if (path.startsWith("http")) {
        urlToBePushed = path;
        if(!urlArray.includes(urlToBePushed) && urlToBePushed.length < MAX_URL_LENGTH && !visitedUrls.includes(urlToBePushed)){
            urlArray.push(urlToBePushed);
        }
    }
    else {
        urlToBePushed = domain + "/" + path;
        if(!urlArray.includes(urlToBePushed) && urlToBePushed.length < MAX_URL_LENGTH && !visitedUrls.includes(urlToBePushed)){
            urlArray.push(urlToBePushed);
        }
    }
}

function updateUrls(url){
    visitedUrls.push(url);
    urls.splice(urls.indexOf(url), 1);
}

function getHttpDomain(url){
    var domaineRE = /^((?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?[^:\/?\n]+)/g;
    return domaineRE.exec(url);
}

function getDomain(url){
    var domaineRE = /^(?:https?:\/\/)?((?:[^@\/\n]+@)?(?:www\.)?[^:\/?\n]+)/g;
    return domaineRE.exec(url);
}

function getUrlsToVisit(){
    var urlsToVisit = [];
    var domainOccurenceMap = new Map();

    for(var i=0; i < urls.length; i++){
        if(urlsToVisit.length < MAX_PARALLEL_REQUESTS){
            var domain = getDomain(urls[i])[1];
            var occurenceNr = domainOccurenceMap.get(domain);

            if(occurenceNr !== undefined){
                if(occurenceNr < MAX_HOST_PARALLEL_REQUESTS){
                    urlsToVisit.push(urls[i]);
                }else{
                    // console.log("-----------------------> host: " + domain + "; occurences: " + occurenceNr);
                }

                domainOccurenceMap.set(domain, ++occurenceNr);
            }else{
                occurenceNr = 1;
                domainOccurenceMap.set(domain, occurenceNr);

                urlsToVisit.push(urls[i]);
            }
        }else{
            break;
        }
    }
    return urlsToVisit;
}