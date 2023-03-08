let jsonData = {};
let jsonDataTimestamp = "20230307142016";
let orderedShowNames = [];

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

        let listDiv = document.getElementById("listDiv");
        listDiv.innerHTML = `<b>All TV shows in database:</b><br /><br />`;
        
        for(let i = 1; i < orderedShowNames.length; i++) {
            listDiv.innerHTML += getShowBoxHTML(orderedShowNames[i]);
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

document.getElementById("searchMenuChoice").onclick = function() { changePage("search"); };
document.getElementById("recentsMenuChoice").onclick = function() { changePage("recents"); };
document.getElementById("browseMenuChoice").onclick = function() { changePage("browse"); };
document.getElementById("listMenuChoice").onclick = function() { changePage("list"); };

function changePage(pageName) {
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
        window.history.pushState({}, "", url);

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
        url.searchParams.delete("letter");
        url.searchParams.set("page", "recents");
        window.history.pushState({}, "", url);
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

        window.history.pushState({}, "", url);
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
        url.searchParams.delete("q");
        url.searchParams.delete("letter");
        url.searchParams.set("page", "list");
        window.history.pushState({}, "", url);
    }
}

function changeBrowsePage(letter) {
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
        window.history.pushState({}, "", url);
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
                ${jsonData[show].hasCliffhanger == "1" ? `It <span class="cutShort">ended on a cliffhanger</span>.` : `${jsonData[show].hasCliffhanger == "0" ? `It <span class="notCutShort">does not end with a cliffhanger</span>.` : "There is no data available on whether it ended on a cliffhanger."}`}
                ${jsonData[show].extraInfo ? `<br /><br />${jsonData[show].extraInfo.content} <a href="${jsonData[show].extraInfo.url}">(${jsonData[show].extraInfo.source})</a>` : ""}
            </small>
        </div>\n
    `;
}

function doSearch(event) {
    let searchTerm = document.querySelector("#searchBox").value.trim();
    if(searchTerm) {
        let results = "";
        let count = 0;

        for(let i = 0; i < orderedShowNames.length; i++) {
            let show = orderedShowNames[i];
            if(count < 5) {
                if(show.toLowerCase().includes(searchTerm.toLowerCase())) {
                    let showName = show.match(/^(.+) \([0-9]{4}\)$/)[1];
                    results += `
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
                "https://github.com/xdpirate/isitcutshort.com/issues/new?title=" + 
                `${encodeURIComponent(`Show request: ${searchTerm}`)}`.replace(/%20/g, "+") + 
                "&body=" +
                `${encodeURIComponent(`Please consider adding the show "${searchTerm}" to the site!`)}`.replace(/%20/g, "+")
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
    window.history.pushState({}, "", url);
}

function permalink(showName) {
    const url = new URL(window.location);
    url.searchParams.set("q", showName);
    window.history.pushState({}, "", url);
    changePage("search");
    document.querySelector("#searchBox").value = showName;
    doSearch();
}
