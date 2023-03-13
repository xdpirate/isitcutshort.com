# Is it cut short?
[Is it cut short?](https://www.isitcutshort.com/) (IsItCutShort.com) is a website that tracks TV shows that were cut short (ended prematurely or cancelled), and/or ends on a cliffhanger ending.

## Contributing
### How to contribute
Feel free to contribute shows. You can:
- post a pull request (see [data.json](https://github.com/xdpirate/isitcutshort.com/blob/main/data.json) for the data structure used, and add your show to that file)
- post an issue with the show's name for review
- shoot me an [email](mailto:webmaster@isitcutshort.com?subject=Show%20contribution) with the show's name for review

## Contribution guidelines
1. **Absolutely _zero spoilers_ in submissions**. Spoilers in external references is okay, as long as it is evident from the extra info that the reference contains spoilers. This does not need to be explicit; saying *"the ending is resolved in the movie Show 2: Electric Boogaloo"* is sufficient.
1. **Check that the show doesn't already exist in the database.** If submitting a PR against `data.json`, use a linter like jshint that will pick up duplicate object keys.
1. **Verify first- or second-hand that the information you submit is correct.** Having watched the show yourself and knowing it ends on a cliffhanger is sufficient. News articles or forum posts where the major concensus is that the show ended on a cliffhanger is sufficient. You do not need to cite your sources (since they can be original) unless you are submitting extra info. Wikipedia usually has cancellation status for TV shows, but rarely the status of cliffhangers. A good strategy to quickly find out if a show has a cliffhanger is simply searching it on the web - "does `show` end on a cliffhanger" usually yields the answer within the first page of results.

### Viable show inclusions
If a show fulfills any of these criteria, you can request it to be included:
- It was officially cancelled at *any point* during its run<br />*Example:* Futurama &mdash; Cancelled numerous times throughout its run, but has a non-cliffhanger ending
    - If a show is listed because of this, and has both cancelled and cliffhanger statuses set to false, then an explanation is required in `extraInfo`.

- It ends on a cliffhanger (while being officially ended, cancelled or on extended hiatus)<br />*Example:* My Name is Earl &mdash; cancelled and ends on a cliffhanger

- It ends on a cliffhanger that is resolved in a movie or other secondary work<br />*Example:* Revolution &mdash; Ended on a cliffhanger, but a comic book was released to wrap up the story
    - A reference to the secondary work is required in `extraInfo` in this case.

- It was ended without a cliffhanger, but more show content exists outside the show itself<br />Example: Seinfeld &mdash; Had a fictional reunion episode on Curb Your Enthusiasm
    - A reference to the secondary content is required in `extraInfo`.

## Shows *not* viable for inclusion
Please don't request any shows that:

- Ran from beginning to end normally and didn't end on a cliffhanger
- Is currently running with none of the above criteria fulfilled
- Non-fiction shows (news shows, magazines, etc.)

The point of the site is to list shows that have, or have had, trouble wrapping up their storylines, or have more content wrapping it up outside the show itself.

## `data.json` format
*This section is subject to change in the future if the data set grows too large.*

The data is currently presented in a JS object contained in [`data.json`](https://github.com/xdpirate/isitcutshort.com/blob/main/data.json).

The basic layout of each key within the object is as follows:

    "Show Name (2007)": {
        "imdbID": "1234567",
        "isCutShort": 1,
        "hasCliffhanger": 1,
        "extraInfo": {
            "content": "Ending was wrapped in the movie Show Name 2: Electric Boogaloo.",
            "source": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Show_Name_2"
        }
    }

The sub-key `extraInfo` is optional, so an entry can be as simple as:

    "Show Name (2007)": {
        "imdbID": "1234567",
        "isCutShort": 1,
        "hasCliffhanger": 0
    }

- The object key should have the name and starting year of the show, including any articles in the title (the, a, an) at the start. The data will be sorted ignoring the articles by the page script.

- `imdbID` (required) - The IMDb ID for the show. You can find this in the IMDB URL. Do not include the `tt` at the start of the ID.

- `isCutShort` (required) - Whether the TV show was cut short (permanently cancelled). Takes `0` (false) and `1` (true) as values .

- `hasCliffhanger` (required) - Whether the show ended on a cliffhanger. This can be subjective, so if opinion is divided, go with the majority concensus. Takes `0` (false) and `1` (true) as values. You can also use **-1**, meaning no data available. Only use **-1** if the show is confirmed to be cancelled, but no data can be found on whether it ends with a cliffhanger, or the show has yet to finish airing.

- `extraInfo` (optional)
    - `content` (required if `extraInfo` included) - The content of the extra info you are including. Be concise and spoiler-free. Only include content pertaining to the cancellation or cliffhanger status of the show, such as if the story is concluded in a secondary work.
    - `source` (required if `extraInfo` included) - The name of the source of the extra info you are including.
    - `url` (required if `extraInfo` included) - The URL to the source of the extra info you are including.

## Working with the data
I've included some tools in the repo that will make working with the data faster and easier. To use these tools, clone the repo locally and refer to the following files:

* In [`.vscode/snippets.code-snippets`](https://github.com/xdpirate/isitcutshort.com/blob/main/.vscode/snippets.code-snippets) you'll find some snippets for VSCode/VSCodium which will be automatically loaded if you clone the repo and open it in VSC. These snippets help you:
    
    * insert a suitable timestamp for the top of `scripts.js` whenever `data.json` has been changed. Snippet shortcut: `timestamp`

    * insert short and long data structures for new shows into `data.json` (with or without `extraInfo`), or insert only `extraInfo`. Snippet shortcuts: `dlong`, `dshort`, `dextra`

* In [`tools/transform_imdb_url.sh`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/transform_imdb_url.sh), you'll find a helpful Bash script that will monitor your clipboard for an IMDb URL. When it finds an IMDb URL, it will truncate it to only contain the ID, suitable for pasting into `data.json`. Suggested use is to run the script in the background: When you've found the right show on IMDb, either right-click to copy the link to the show page, or press Alt+D > Ctrl+C on the keyboard to copy the URL - now you can Alt+Tab directly into your editor and paste the IMDb ID directly without having to manually extract it from the URL. Press Ctrl+C in the terminal to exit the script. The script requires `xclip`, and is only tested on Linux with Xorg.

* In [`tools/JSONify.html`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/JSONify.html), you'll find a helpful JS tool that will convert a newline-separated list of show names into the correct data structures used by IICS.

* In [`tools/Multisearch.html`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/Multisearch.html), you'll find a helpful JS tool that will let you provide a newline-separated list of show names and open a bunch of new tabs to search for those shows on both Wikipedia and IMDb to verify details.

## License for data.json
The data file (data.json) is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## License for the web app
>IsItCutShort.com - Find out if a TV show was cut short
>
>Copyright &copy; 2022 xdpirate
>
>This program is free software: you can redistribute it and/or modify
>it under the terms of the GNU General Public License as published by
>the Free Software Foundation, either version 3 of the License, or
>(at your option) any later version.
>
>This program is distributed in the hope that it will be useful,
>but WITHOUT ANY WARRANTY; without even the implied warranty of
>MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
>GNU General Public License for more details.
>
>You should have received a copy of the GNU General Public License
>along with this program.  If not, see <https://www.gnu.org/licenses/>.
