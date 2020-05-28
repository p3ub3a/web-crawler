const fetch = require('node-fetch');
var requests = [];
const PAGE_REFRESH_ATTEMPTS = 3;
const MAX_REQUEST_NR = 20;
const HOST_REFRESH_ATTEMPTS = 4;

var urls = ["https://iclp.imfast.io/"];
var visitedUrls = [];
var reSearch;
var re = /<.*?href="(.*?\.html)/g;
var domaineRE = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g;

start();

async function start(){
    var urlsToVisit;
    if(urls.length > 20){
        urlsToVisit = urls;
    }else{
        urlsToVisit = urls.slice(0,19);
    }
    await Promise.all(urls.map(async (urlsToVisit)=>{
        try{
            if(!visitedUrls.includes(item)){
                var content = await getContent(item);
                var domain = domaineRE.exec(item);
                // console.log(domain[1]);
                var found = await parseHtml(content, domain[1]);
                Promise.all(content, found);

                console.log("On node \x1b[4m\x1b[1m\x1b[32m" + item + "\x1b[0m found: \x1b[32m" + found + "\x1b[0m");
                visitedUrls.push(item);
                urls.splice(urls.indexOf(item), 1);
                console.log('executed');
            }
        }catch(err){
            // console.warn('Something went wrong.', err);
        }
    }));

    console.log("ajunge");
    // start();
}

async function getContent(url){
    content = fetch(url)
        .then(response => response.text())
        .catch(function (err) {
            console.warn('Something went wrong.', err);
        });
    return content;
}


async function parseHtml(html, domain) {
    var foundUrls = [];
    do {
        reSearch = re.exec(html);
        if (reSearch) {
            pushUrl(foundUrls, domain, reSearch[1],);
            if(!urls.includes(reSearch[1])){
                pushUrl(urls, domain, reSearch[1]);
            }
        }
    } while (reSearch);
    return foundUrls;
}

function pushUrl(urlArray, domain, path ) {
    if (path.startsWith("http")) {
        urlArray.push(path);
    }
    else {
        urlArray.push(domain + "/" + path);
    }
}