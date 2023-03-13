#!/bin/bash
echo "Waiting for IMDb link to be copied, press Ctrl+C to exit..."

while :
do
    clipboard=$(xclip -o -sel clip)
    
    if [[ "$clipboard" = https://www.imdb.com/title/* ]] ; then
        echo "IMDb link found, transforming..."
        OUT=$(xclip -o -sel clip | grep -oi -E "[0-9]{5,10}" --color=none | tr -d '\n')
        echo -n "$OUT" | xclip -i -sel clip
        echo "ID: $OUT"
    fi
    
    sleep 1
done
