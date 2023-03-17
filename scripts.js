let jsonData = {};
let jsonDataTimestamp = "20230317133632";
let orderedShowNames = [];
let entriesPerPage = 20;

window.addEventListener('load', (event) => {
    let searchBox = document.querySelector("#searchBox");
    searchBox.disabled = true;
    searchBox.placeholder = "⏲ Loading...";

    fetch(`./data.json?${jsonDataTimestamp}`)
    .then(response => { return response.json(); })
    .then(data => {
        jsonData = data;

        document.querySelector("span#numShows").innerHTML = Object.keys(jsonData).length;

        // Sort json keys into array
        let jsonEntries = Object.entries(jsonData);
        let jsonKeys = [];

        for(let i = 0; i < jsonEntries.length; i++) {
            jsonKeys.push(jsonEntries[i][0]);
        }

        // Adapted from https://stackoverflow.com/a/34347659
        orderedShowNames = jsonKeys.slice().sort(function titleComparator(a, b) {
            let articleRegex = new RegExp('^(?:(a|an|the) )(.*)$'),
                replaceFunc = function ($0, $1, $2) {
                    return $2 + ', ' + $1;
                };
            a = a.toLowerCase().replace(articleRegex, replaceFunc);
            b = b.toLowerCase().replace(articleRegex, replaceFunc);
            return a === b ? 0 : a < b ? -1 : 1;
        });

        searchBox.placeholder = "🔍 Search for a TV show";
        searchBox.disabled = false;
        searchBox.onsearch = function() { doSearch(); };
        
        let recentsDiv = document.getElementById("recentsDiv");
        recentsDiv.innerHTML = `<b>Most recently added TV shows:</b><br /><br />`;
        let entries = Object.entries(jsonData);
        for(let i = 1; i < entries.length; i++) {
            recentsDiv.innerHTML += getShowBoxHTML(entries[entries.length - i][0]);

            if(i == 10) {
                break;
            }
        }
        
        let browseNav = document.getElementById("browseNav");
        let browseKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        browseNav.innerHTML = `
            <input type="radio" name="browseMenu" id="browseRadioSymbols" />
            <label id="browseNavSymbols" for="browseRadioSymbols" class="menuChoice" title="Numbers and symbols">#</label>
        `;

        for(let i = 0; i < 26; i++) {
            browseNav.innerHTML += `
                <input type="radio" name="browseMenu" id="browseRadio${browseKeys[i]}" />
                <label id="browseNav${browseKeys[i]}" for="browseRadio${browseKeys[i]}" class="menuChoice">${browseKeys[i]}</label>
            `;
        }
        
        document.getElementById("browseNavSymbols").onclick = function() { 
            changeBrowsePage("sym"); 
        };
        
        for(let i = 0; i < 26; i++) {
            document.getElementById(`browseNav${browseKeys[i]}`).onclick = function() {
                changeBrowsePage(browseKeys[i]);
            };
        }

        let params = new URLSearchParams(document.location.search);

        if(!params.get("letter")) {
            changeBrowsePage("A");
            document.getElementById("browseRadioA").checked = true;
        }

        if(params.get("q")) {
            searchBox.value = params.get("q");
            searchBox.focus();
            doSearch();
        } else if(params.get("page") == "search") {
            changePage("search");
            searchBox.focus();
        } else if(params.get("page") == "recents") {
            changePage("recents");
        } else if(params.get("page") == "browse") {
            changePage("browse");
            if(params.get("letter")) {
                changeBrowsePage(params.get("letter"));
                if(params.get("letter") == "sym") {
                    document.getElementById(`browseRadioSymbols`).checked = true;
                } else {
                    document.getElementById(`browseRadio${params.get("letter")}`).checked = true;
                }
            }
        } else if(params.get("page") == "list") {
            changePage("list");
        } else {
            searchBox.focus();
        }
    });
});

window.onpopstate = function(event) {
    const url = new URL(window.location);
    let currPage = url.searchParams.get("page");
    
    if(url.searchParams.get("q")) {
        searchBox.value = url.searchParams.get("q");
        searchBox.focus();
        doSearch();
    } else if(currPage == "search") {
        changePage("search", true);
        searchBox.focus();
    } else if(currPage == "recents") {
        changePage("recents", true);
    } else if(currPage == "browse") {
        changePage("browse", true);
        if(url.searchParams.get("letter")) {
            changeBrowsePage(url.searchParams.get("letter"));
            if(url.searchParams.get("letter") == "sym") {
                document.getElementById(`browseRadioSymbols`).checked = true;
            } else {
                document.getElementById(`browseRadio${url.searchParams.get("letter")}`).checked = true;
            }
        }
    } else if(currPage == "list") {
        changePage("list", true);
    } else {
        changePage("search", true);
        searchBox.focus();
    }
};

document.getElementById("searchMenuChoice").onclick = function() { changePage("search"); };
document.getElementById("recentsMenuChoice").onclick = function() { changePage("recents"); };
document.getElementById("browseMenuChoice").onclick = function() { changePage("browse"); };
document.getElementById("listMenuChoice").onclick = function() { changePage("list"); };

let listFirstPageButtons = document.getElementsByClassName("listFirstPage");
listFirstPageButtons[0].onclick = function() { changeListPage(1); };
listFirstPageButtons[1].onclick = function() { changeListPage(1); document.getElementById("listNav").scrollIntoView(); };

let listPrevPageButtons = document.getElementsByClassName("listPrevPage");
listPrevPageButtons[0].onclick = function() { listPrevPage(); };
listPrevPageButtons[1].onclick = function() { listPrevPage(); document.getElementById("listNav").scrollIntoView(); };

let listNextPageButtons = document.getElementsByClassName("listNextPage");
listNextPageButtons[0].onclick = function() { listNextPage(); };
listNextPageButtons[1].onclick = function() { listNextPage(); document.getElementById("listNav").scrollIntoView(); };

let listLastPageButtons = document.getElementsByClassName("listLastPage");
listLastPageButtons[0].onclick = function() { changeListPage(Math.ceil(orderedShowNames.length / entriesPerPage)); };
listLastPageButtons[1].onclick = function() { changeListPage(Math.ceil(orderedShowNames.length / entriesPerPage)); document.getElementById("listNav").scrollIntoView(); };

function listPrevPage() {
    const url = new URL(window.location);
    let currPgNum = Number(url.searchParams.get("pn"));
    if(currPgNum && currPgNum > 1) {
        currPgNum--;
    } else {
        currPgNum = 1;
    }
    changeListPage(currPgNum);
}

function listNextPage() {
    const url = new URL(window.location);
    let currPgNum = Number(url.searchParams.get("pn"));
    if(currPgNum && currPgNum < Math.ceil(orderedShowNames.length / entriesPerPage)) {
        currPgNum++;
    } else {
        currPgNum = Math.ceil(orderedShowNames.length / entriesPerPage);
    }
    changeListPage(currPgNum);
}

function changePage(pageName, boolReplaceState = false) {
    if(pageName == "search") {
        document.getElementById("searchMenuChoice").style.textDecoration = "underline";
        document.getElementById("recentsMenuChoice").style.textDecoration = "none";
        document.getElementById("browseMenuChoice").style.textDecoration = "none";
        document.getElementById("listMenuChoice").style.textDecoration = "none";
    
        document.getElementById("searchWrapper").style.display = "block";
        document.getElementById("recentsWrapper").style.display = "none";
        document.getElementById("browseWrapper").style.display = "none";
        document.getElementById("listWrapper").style.display = "none";

        const url = new URL(window.location);
        url.searchParams.delete("page");
        url.searchParams.delete("letter");
        url.searchParams.delete("pn");

        doSearch();
    } else if(pageName == "recents") {
        document.getElementById("searchMenuChoice").style.textDecoration = "none";
        document.getElementById("recentsMenuChoice").style.textDecoration = "underline";
        document.getElementById("browseMenuChoice").style.textDecoration = "none";
        document.getElementById("listMenuChoice").style.textDecoration = "none";

        document.getElementById("searchWrapper").style.display = "none";
        document.getElementById("recentsWrapper").style.display = "block";
        document.getElementById("browseWrapper").style.display = "none";
        document.getElementById("listWrapper").style.display = "none";
        
        const url = new URL(window.location);
        url.searchParams.delete("q");
        url.searchParams.delete("pn");
        url.searchParams.delete("letter");
        url.searchParams.set("page", "recents");

        if(boolReplaceState) {
            window.history.replaceState({}, "", url);
        } else {
            window.history.pushState({}, "", url);
        }
    } else if(pageName == "browse") {
        document.getElementById("searchMenuChoice").style.textDecoration = "none";
        document.getElementById("recentsMenuChoice").style.textDecoration = "none";
        document.getElementById("browseMenuChoice").style.textDecoration = "underline";
        document.getElementById("listMenuChoice").style.textDecoration = "none";
    
        document.getElementById("searchWrapper").style.display = "none";
        document.getElementById("recentsWrapper").style.display = "none";
        document.getElementById("browseWrapper").style.display = "block";
        document.getElementById("listWrapper").style.display = "none";

        const url = new URL(window.location);
        url.searchParams.delete("q");
        url.searchParams.delete("pn");
        url.searchParams.set("page", "browse");

        let radioButtons = document.querySelectorAll('input[name="browseMenu"]');
        for(let i = 0; i < radioButtons.length; i++) {
            if(radioButtons[i].checked) {
                if(radioButtons[i].id == "browseRadioSymbols") {
                    url.searchParams.set("letter", "sym");
                } else {
                    url.searchParams.set("letter", radioButtons[i].id.match(/browseRadio(.)/)[1]);
                }
                break; // Only one radio button can be checked at a time so stop the loop
            }
        }

        if(boolReplaceState) {
            window.history.replaceState({}, "", url);
        } else {
            window.history.pushState({}, "", url);
        }
    } else if(pageName == "list") {
        document.getElementById("searchMenuChoice").style.textDecoration = "none";
        document.getElementById("recentsMenuChoice").style.textDecoration = "none";
        document.getElementById("browseMenuChoice").style.textDecoration = "none";
        document.getElementById("listMenuChoice").style.textDecoration = "underline";

        document.getElementById("searchWrapper").style.display = "none";
        document.getElementById("recentsWrapper").style.display = "none";
        document.getElementById("browseWrapper").style.display = "none";
        document.getElementById("listWrapper").style.display = "block";
        
        const url = new URL(window.location);
        
        let maximumPages = Math.ceil(orderedShowNames.length / entriesPerPage);

        let currPgNum = 1;
        if(url.searchParams.get("pn")) {
            currPgNum = Number(url.searchParams.get("pn"));
            if(currPgNum > maximumPages) {
                currPgNum = maximumPages;
            }
        }

        changeListPage(currPgNum, boolReplaceState);
    }
}

function changeListPage(currPgNum, boolReplaceState = false) {
    let maximumPages = Math.ceil(orderedShowNames.length / entriesPerPage);
    let currPageShowLow, currPageShowHigh;
    currPageShowLow = (currPgNum * entriesPerPage) - (entriesPerPage - 1);
    currPageShowHigh = currPgNum * entriesPerPage;

    if(currPgNum == maximumPages) {
        currPageShowHigh = orderedShowNames.length;
    }

    let currPageNums = document.getElementsByClassName("currPageNum");
    currPageNums[0].innerHTML = currPgNum;
    currPageNums[1].innerHTML = currPgNum;

    let currPageRanges = document.getElementsByClassName("currPageRange");
    currPageRanges[0].innerHTML = currPageShowLow + "-" + currPageShowHigh;
    currPageRanges[1].innerHTML = currPageShowLow + "-" + currPageShowHigh;

    let maxPageNums = document.getElementsByClassName("maxPageNum");
    maxPageNums[0].innerHTML = Math.ceil(orderedShowNames.length / entriesPerPage);
    maxPageNums[1].innerHTML = Math.ceil(orderedShowNames.length / entriesPerPage);
    
    let maxPageRanges = document.getElementsByClassName("maxPageRange");
    maxPageRanges[0].innerHTML = orderedShowNames.length;
    maxPageRanges[1].innerHTML = orderedShowNames.length;
    
    let listDiv = document.getElementById("listDiv");
    listDiv.innerHTML = "";
    for(let i = (currPageShowLow - 1); i < (currPageShowHigh - 1); i++) {
        listDiv.innerHTML += getShowBoxHTML(orderedShowNames[i]);
    }

    const url = new URL(window.location);
    
    url.searchParams.delete("q");
    url.searchParams.delete("letter");
    url.searchParams.set("page", "list");
    url.searchParams.set("pn", currPgNum);

    if(boolReplaceState) {
        window.history.replaceState({}, "", url);
    } else {
        window.history.pushState({}, "", url);
    }
}

function changeBrowsePage(letter, boolReplaceState = false) {
    document.getElementById("browseDiv").innerHTML = "";

    let currentLetterShows = [];

    if(letter == "sym") {
        for(let i = 0; i < orderedShowNames.length; i++) {
            let show = orderedShowNames[i];

            if(show.startsWith("The ")) {
                show = show.substr(4);
            } else if(show.startsWith("A ")) {
                show = show.substr(2);
            } else if(show.startsWith("An ")) {
                show = show.substr(3);
            }

            if(new RegExp("^[^a-z]","i").test(show)) {
                currentLetterShows.push(orderedShowNames[i]);
            }
        }
    } else {
        for(let i = 0; i < orderedShowNames.length; i++) {
            let show = orderedShowNames[i];

            if(show.startsWith("The ")) {
                show = show.substr(4);
            } else if(show.startsWith("A ")) {
                show = show.substr(2);
            } else if(show.startsWith("An ")) {
                show = show.substr(3);
            }

            if(new RegExp("^[" + letter + "]","i").test(show)) {
                currentLetterShows.push(orderedShowNames[i]);
            }
        }
    }

    if(currentLetterShows.length > 0) {
        for(let i = 0; i < currentLetterShows.length; i++) {
            document.getElementById("browseDiv").innerHTML += getShowBoxHTML(currentLetterShows[i]);
        }
    } else {
        document.getElementById("browseDiv").innerHTML = `There are currently no shows in the database that matches these criteria.`;
    }

    const url = new URL(window.location);
    if(url.searchParams.get("page") == "browse") {
        url.searchParams.set("letter", letter);
        
        if(boolReplaceState) {
            window.history.replaceState({}, "", url);
        } else {
            window.history.pushState({}, "", url);
        }
    }
}

function getShowBoxHTML(show) {
    let showName = show.match(/^(.+) \([0-9]{4}\)$/)[1];
    return `
        <div class="tvShowDiv${jsonData[show].isCutShort == "1" || jsonData[show].hasCliffhanger == "1" ? " cutShort" : " notCutShort"}">
            <b><span class="permalink" title="Permalink" onclick="javascript:permalink('${show}');">${show}</span></b> ${jsonData[show].isCutShort == "1" || jsonData[show].hasCliffhanger == "1" ? `<span title="Cut short!">❌</span>` : `<span title="Not cut short!">✅</span>`}
            <small>
                <sup><a href="https://www.imdb.com/title/tt${jsonData[show].imdbID}/">(IMDb)</a></sup><hr />
                <i>${showName}</i> ${jsonData[show].isCutShort == "1" ? `was <span class="cutShort">cut short</span>. ` : `has <span class="notCutShort">not been cut short</span>. `}
                ${jsonData[show].hasCliffhanger == "1" ? `It <span class="cutShort">ended on a cliffhanger</span>.` : `${jsonData[show].hasCliffhanger == "0" ? `It <span class="notCutShort">does not end with a cliffhanger</span>.` : `There is <span class="noData">no data available</span> on whether it ended on a cliffhanger.<br />If you know, <a href="https://github.com/xdpirate/isitcutshort.com#how-to-contribute" target="_blank">please contribute to the database</a>!`}`}
                ${jsonData[show].extraInfo ? `<br /><br />${jsonData[show].extraInfo.content} <a href="${jsonData[show].extraInfo.url}">(${jsonData[show].extraInfo.source})</a>` : ""}
            </small>
        </div>\n
    `;
}

function doSearch(event, boolReplaceState = false) {
    let searchTerm = document.querySelector("#searchBox").value.trim();
    if(searchTerm) {
        let results = "";
        let count = 0;

        for(let i = 0; i < orderedShowNames.length; i++) {
            let show = orderedShowNames[i];
            if(count < 5) {
                if(show.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results += getShowBoxHTML(show);
                    count++;
                }
            } else {
                break;
            }
        }

        if(results != "") {
            document.querySelector("#resultsDiv").innerHTML = results;
        } else {
            let githubIssueLink = 
                "https://github.com/xdpirate/isitcutshort.com/issues/new?assignees=&labels=show+suggestion&template=show-request.md&title=" + 
                `${encodeURIComponent(`Show request: ${searchTerm}`)}`.replace(/%20/g, "+")
            ;
                

            document.querySelector("#resultsDiv").innerHTML = 
            `<big>No results found for &quot;${searchTerm}&quot; &mdash; it either had a normal run, or it's not in the database.</big><br /><br />
            
            You can <a href="${githubIssueLink}">request it to be included</a>, or <a href="https://www.imdb.com/find?q=${encodeURIComponent(searchTerm).replace(/%20/, "+")}&s=all">search IMDb</a>!<br /><br />
            
            <small>Please read the <a href="https://github.com/xdpirate/isitcutshort.com#viable-show-inclusions">criteria for inclusion</a> before submitting a request to add a show.</small>`;
        }
    } else {
        document.querySelector("#resultsDiv").innerHTML = "";    
    }
    
    const url = new URL(window.location);
    if(document.querySelector("#searchBox").value == "") {
        url.searchParams.delete("q");
    } else {
        url.searchParams.set("q", document.querySelector("#searchBox").value);
    }

    if(boolReplaceState) {
        window.history.replaceState({}, "", url);
    } else {
        window.history.pushState({}, "", url);
    }
}

function permalink(showName) {
    const url = new URL(window.location);
    url.searchParams.set("q", showName);
    window.history.pushState({}, "", url);
    changePage("search");
    document.querySelector("#searchBox").value = showName;
    doSearch();
}
