// ==UserScript==
// @name         Wikipedia EZ IMDb ID
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Put an IMDb ID on Wikipedia TV show/movie articles, below the article title
// @author       xdpirate
// @match        https://en.wikipedia.org/wiki/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org
// @grant        none
// ==/UserScript==

let links = document.getElementsByTagName("a");
let ids = [];

for(let i = 0; i < links.length; i++) {
    if(links[i].href.startsWith("https://www.imdb.com/title/tt")) {
        let imdbID = links[i].href.match(/[0-9]{5,10}/gi)[0];
        if(!ids.includes(imdbID)) {
            ids.push(imdbID);
        }
    }
}

if(ids.length > 0) {
    let linkList = "";
    for(let i = 0; i < ids.length; i++) {
        linkList = `${linkList}<a href="https://www.imdb.com/title/tt${ids[i]}" target="_blank"><img style="margin-right: 5px;" width="16px" height="16px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAahJREFUWMNj+HpU4v9AYoZRB4w6YNQBow4YdQC6wKIm/v+u5mz/w1w5/h+aIwxmg3CiH+f/pzvE4HwQvrJaBIXvZsH2vyqJ5//nw+L/c8K5wGLdBbykOaAxg+c/AwPDfwlhpv9ruwXBbBDmZGf4f2SuMJwPwicWIviCvIxw9vI2gf9mOqxgdhLQ4VRxAAh35vHidMD2yYL/WZgh7AnFfHAHgEJudacAGH85Ik6eA9hYIQaDghQUEtgcsGuq0H8uDkYMB7CzIdQ3Z/KQ5wB1eWYwzQE0TEuRhSgHmGpDHBDjxfnf34EdzPa1YyfPAYYaLP8lRZjAbG9bdpJCIMmfE4xBbB9bMh1gBHSArSEbmA1K3bgcAIsemjgAlJhA7L4iXqwOqE3lgbMnliCiIBYYBaEuHJRFAcgBrdkQi9f3CmJ1AAwzMTH8PzpfGB4CrCwIucpEbsIOOLlI+P/0Kr7/Cxv5/99aLwpmr+4S+H9llQiY/Xi7GJgG4SfbReFsEJ4BxCD9IHPWdAuAxQ4DC7OpFXz/p5Tz/f9wUHy0Lhh1wKgDRh0w6oDB5wAAnyEaXz1l5ZIAAAAASUVORK5CYII=" /></a>${ids[i]}<br />\n
        `;
    }

    let imdbArea = document.createElement("div");
    imdbArea.innerHTML = linkList;
    document.querySelector("div#siteSub").insertAdjacentElement("afterend", imdbArea);
}
