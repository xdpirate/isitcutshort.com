# Is it cut short?
[Is it cut short?](https://www.isitcutshort.com/) (IsItCutShort.com / IICS) was a website that tracked TV shows that were cut short (ended prematurely or cancelled), and/or ends on a cliffhanger ending.

It shut down on April 7th, 2024 due to lack of interest and rising costs of webhosting. The repository and database will stay online for posterity and in case someone else wants to use the data. Remember to adhere to the GPL if you do - attribution and sharing under the same license is required. Thanks for all contributions.

Most of the text below is thus moot, but also preserved for posterity.

## Contributing
### How to contribute
Feel free to contribute shows! You can:
- post a pull request (see [data.json](https://github.com/xdpirate/isitcutshort.com/blob/main/data.json) for the data structure used, and add your show to that file)
- [post an issue](https://github.com/xdpirate/isitcutshort.com/issues/new?assignees=&labels=show+suggestion&template=show-request.md&title=Show+suggestion) with the show's name for review
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
Please don't request the following types of shows:

- Shows that ran from beginning to end normally and didn't end on a cliffhanger
- Shows currently running with none of the above criteria fulfilled
- Non-fiction shows (news shows, magazines, game shows, etc.)
- Anthological shows with no coherent story from one episode to another (sketch shows, shows like Black Mirror, The Twilight Zone)

The point of the site is to list shows that have, or have had, trouble wrapping up their storylines, or have more content wrapping it up outside the show itself.

## `data.json` format
The data is stored in a series of JS objects contained in [`data.json`](https://github.com/xdpirate/isitcutshort.com/blob/main/data.json), which is LZMA-compressed on the server and decompressed on the client. This results in significantly less bandwith spent (compresssion ratio 15-20%), and thus quicker loading times for the end user.

The layout of each object is as follows:

    "Show Name (2007)": {
        "imdbID": "1234567",
        "isCutShort": "1",
        "hasCliffhanger": "1",
        "extraInfo": {
            "content": "Ending was wrapped in the movie Show Name 2: Electric Boogaloo.",
            "source": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Show_Name_2"
        }
    }

The sub-object `extraInfo` is optional, so an entry can be as simple as:

    "Show Name (2007)": {
        "imdbID": "1234567",
        "isCutShort": "1",
        "hasCliffhanger": "0"
    }

- The object key should have the name and starting year of the show, including any articles in the title (the, a, an) at the start. The data will be sorted ignoring the articles by the page script.

- `imdbID` (required) - The IMDb ID for the show. You can find this in the IMDb URL. Do not include the `tt` at the start of the ID. There are a couple of tools provided to extract this more efficiently, see the *"Working with the data"* section.

- `isCutShort` (required) - Whether the TV show was cut short (permanently cancelled). Takes `0` (false) and `1` (true) as values .

- `hasCliffhanger` (required) - Whether the show ended on a cliffhanger. This can be subjective, so if opinion is divided, go with the majority concensus. Takes `0` (false) and `1` (true) as values. You can also use `-1` (no data available). Only use `-1` if the show is confirmed to be cancelled, but no data can be found on whether it ends with a cliffhanger, or the show has yet to finish airing.

- `extraInfo` (optional)
    - `content` (required if `extraInfo` included) - The content of the extra info you are including. Be concise and spoiler-free. Only include content pertaining to the cancellation or cliffhanger status of the show, such as if the story is concluded in a secondary work.
    - `source` (required if `extraInfo` included) - The name of the source of the extra info you are including.
    - `url` (required if `extraInfo` included) - The URL to the source of the extra info you are including.

## Working with the data
I've included some tools in the repo that will make working with the data faster and easier. To use these tools, clone the repo locally and refer to the following files:

* In [`.vscode/snippets.code-snippets`](https://github.com/xdpirate/isitcutshort.com/blob/main/.vscode/snippets.code-snippets) you'll find some snippets for VSCode/VSCodium which will be automatically loaded if you clone the repo and open it in VSC. These snippets help you:
    
    * insert a suitable timestamp for the top of `scripts.js` whenever `data.json` has been changed. Snippet prefix/shortcut: `timestamp`

    * insert short and long data structures for new shows into `data.json` (with or without `extraInfo`), or insert only `extraInfo`. Snippet prefixes/shortcuts: `dlong`, `dshort`, `dextra`

* In [`tools/transform_imdb_url.sh`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/transform_imdb_url.sh), you'll find a helpful Bash script that will monitor your clipboard for an IMDb URL. When it finds an IMDb URL, it will truncate it to only contain the ID, suitable for pasting into `data.json`. Suggested use is to run the script in the background: When you've found the right show on IMDb, either right-click to copy the link to the show page, or press Alt+D > Ctrl+C on the keyboard to copy the URL - now you can Alt+Tab directly into your editor and paste the IMDb ID directly without having to manually extract it from the URL. Press Ctrl+C in the terminal to exit the script. The script requires `xclip`, and is only tested on Linux with Xorg.

* In [`tools/JSONify.html`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/JSONify.html), you'll find a helpful JS tool that will convert a newline-separated list of show names into the correct data structures used by IICS.

* In [`tools/Quicksearch.html`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/Quicksearch.html), you'll find a helpful JS tool that will let you provide a newline-separated list of show names and open a bunch of new tabs to search for those shows on Wikipedia to verify details.

* In [`tools/Wikipedia_EZ_IMDb_ID.user.js`](https://github.com/xdpirate/isitcutshort.com/blob/main/tools/Wikipedia_EZ_IMDb_ID.user.js), you'll find a browser userscript that puts any found IMDb IDs on the top of the Wikipedia article, right below the title of the page, for easy copying. Use it with [Tampermonkey](https://tampermonkey.net/).

## Compression
Since 2023-03-17, IICS uses LZMA compression on the data file to reduce loading times and bandwidth usage. If you wish to replicate the compression in your fork, use the following pre-commit hook:

    #!/bin/bash
    < data.json lzma -9 > data.json.lzma
    git add data.json.lzma

The `lzma` command is provided by the `xz-utils` package, and is available on most distros.

## License for data.json
The data file (data.json) is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). In short, this means you're allowed to reuse the data elsewhere, as long as you attribute this project, don't use it in a commercial capacity, and share it under the same license.

## License for the web app
The web app is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).

>IsItCutShort.com - Find out if a TV show was cut short
>
>Copyright &copy; 2022-2023 xdpirate
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

The license is replicated in full in [LICENSE.md](https://github.com/xdpirate/isitcutshort.com/blob/main/LICENSE.md).

## Third-party licenses
IsItCutShort.com uses [LZMA.JS](https://github.com/LZMA-JS/LZMA-JS), which is licensed under the MIT license:

>© 2016 Nathan Rugg <nmrugg@gmail.com>
>
>Permission is hereby granted, free of charge, to any person obtaining
>a copy of this software and associated documentation files (the
>"Software"), to deal in the Software without restriction, including
>without limitation the rights to use, copy, modify, merge, publish,
>distribute, sublicense, and/or sell copies of the Software, and to
>permit persons to whom the Software is furnished to do so, subject to
>the following conditions:
>
>The above copyright notice and this permission notice shall be
>included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
>EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
>MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
>NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
>LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
>OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
>WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
