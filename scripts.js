let jsonData = {};
let jsonDataTimestamp = "20220409130457";
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
        searchBox.focus();

        let params = new URLSearchParams(document.location.search);
        if(params.get("q")) {
            searchBox.value = params.get("q");
            doSearch();
        }
    });
});

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
    document.querySelector("#searchBox").value = showName;
    doSearch();
}
