let jsonData = {};
let jsonDataTimestamp = "20230306055100";
let jsonDataOrdered = {};

window.addEventListener('load', (event) => {
    let searchBox = document.querySelector("#searchBox");
    searchBox.disabled = true;
    searchBox.placeholder = "⏲ Loading...";

    fetch(`./data.json?${jsonDataTimestamp}`)
    .then(response => { return response.json(); })
    .then(data => {
        jsonData = data;

        document.querySelector("span#numShows").innerHTML = Object.keys(jsonData).length;

        // Because FUCK trying to keep data.json sorted manually
        jsonDataOrdered = Object.keys(jsonData).sort().reduce(
            (obj, key) => { 
              obj[key] = jsonData[key]; 
              return obj;
            }, {}
        );

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
        } else {
            searchBox.focus();
        }
    });
});

document.getElementById("searchMenuChoice").onclick = function() { changePage("search"); };
document.getElementById("recentsMenuChoice").onclick = function() { changePage("recents"); };
document.getElementById("browseMenuChoice").onclick = function() { changePage("browse"); };

function changePage(pageName) {
    if(pageName == "search") {
        document.getElementById("searchMenuChoice").style.textDecoration = "underline";
        document.getElementById("recentsMenuChoice").style.textDecoration = "none";
        document.getElementById("browseMenuChoice").style.textDecoration = "none";
    
        document.getElementById("searchWrapper").style.display = "block";
        document.getElementById("recentsWrapper").style.display = "none";
        document.getElementById("browseWrapper").style.display = "none";

        const url = new URL(window.location);
        url.searchParams.delete("page");
        url.searchParams.delete("letter");
        window.history.pushState({}, "", url);

        doSearch();
    } else if(pageName == "recents") {
        document.getElementById("searchMenuChoice").style.textDecoration = "none";
        document.getElementById("recentsMenuChoice").style.textDecoration = "underline";
        document.getElementById("browseMenuChoice").style.textDecoration = "none";

        document.getElementById("searchWrapper").style.display = "none";
        document.getElementById("recentsWrapper").style.display = "block";
        document.getElementById("browseWrapper").style.display = "none";
        
        const url = new URL(window.location);
        url.searchParams.delete("q");
        url.searchParams.delete("letter");
        url.searchParams.set("page", "recents");
        window.history.pushState({}, "", url);
    } else if(pageName == "browse") {
        document.getElementById("searchMenuChoice").style.textDecoration = "none";
        document.getElementById("recentsMenuChoice").style.textDecoration = "none";
        document.getElementById("browseMenuChoice").style.textDecoration = "underline";
    
        document.getElementById("searchWrapper").style.display = "none";
        document.getElementById("recentsWrapper").style.display = "none";
        document.getElementById("browseWrapper").style.display = "block";

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
    }
}

function changeBrowsePage(letter) {
    document.getElementById("browseDiv").innerHTML = "";

    let currentLetterShows = {};

    if(letter == "sym") {
        for(let show in jsonDataOrdered) {
            if(new RegExp(/^[^A-Za-z\n]/).test(show)) {
                currentLetterShows[show] = jsonDataOrdered[show];
            }
        }
    } else {
        for(let show in jsonDataOrdered) {
            if(show.toLowerCase().startsWith(letter.toLowerCase())) {
                currentLetterShows[show] = jsonDataOrdered[show];
            }
        }
    }

    if(Object.entries(currentLetterShows).length > 0) {
        for(let show in currentLetterShows) {
            document.getElementById("browseDiv").innerHTML += getShowBoxHTML(show);
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
        <div class="tvShowDiv${jsonDataOrdered[show].isCutShort == "1" || jsonDataOrdered[show].hasCliffhanger == "1" ? " cutShort" : " notCutShort"}">
            <b><span class="permalink" title="Permalink" onclick="javascript:permalink('${show}');">${show}</span></b> ${jsonDataOrdered[show].isCutShort == "1" || jsonDataOrdered[show].hasCliffhanger == "1" ? `<span title="Cut short!">❌</span>` : `<span title="Not cut short!">✅</span>`}
            <small>
                <sup><a href="https://www.imdb.com/title/tt${jsonDataOrdered[show].imdbID}/">(IMDb)</a></sup><hr />
                <i>${showName}</i> ${jsonDataOrdered[show].isCutShort == "1" ? `was <span class="cutShort">cut short</span>. ` : `has <span class="notCutShort">not been cut short</span>. `}
                ${jsonDataOrdered[show].hasCliffhanger == "1" ? `It <span class="cutShort">ended on a cliffhanger</span>.` : `${jsonDataOrdered[show].hasCliffhanger == "0" ? `It <span class="notCutShort">does not end with a cliffhanger</span>.` : "There is no data available on whether it ended on a cliffhanger."}`}
                ${jsonDataOrdered[show].extraInfo ? `<br /><br />${jsonDataOrdered[show].extraInfo.content} <a href="${jsonDataOrdered[show].extraInfo.url}">(${jsonDataOrdered[show].extraInfo.source})</a>` : ""}
            </small>
        </div>\n
    `;
}

function doSearch(event) {
    let searchTerm = document.querySelector("#searchBox").value.trim();
    if(searchTerm) {
        let results = "";
        let i = 0;

        for(let show in jsonDataOrdered) {
            if(i < 5) {
                if(show.toLowerCase().includes(searchTerm.toLowerCase())) {
                    let showName = show.match(/^(.+) \([0-9]{4}\)$/)[1];
                    results += `
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
                    i++;
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
