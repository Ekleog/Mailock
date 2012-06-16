#!/bin/sh

function grep_peers {
   grep 11370 | grep -v Recon | sed -e 's/ .*//' -e 's/<tr><td>//'
}

function serv_peers {
   curl --max-time 2 "$1:11371/pks/lookup?op=stats" 2> /dev/null | grep_peers
}

function isup {
   curl --max-time 2 "$1:11371/pks/lookup?op=stats" > /dev/null 2>&1
}

tmp=`mktemp -d`

function all_peers {
   touch "$tmp/$1"
   serv_peers "$1" | while read serv
   do
      if [ ! -e "$tmp/$serv" ]
      then
         if isup "$serv"
         then
            echo "$serv" >&2
            echo "$serv"
            all_peers "$serv"
         fi
      fi
   done
   wait
}

file=`mktemp`
all_peers "pgp.mit.edu" > $file

gen="pgp-utils-generated.js"

if [ -e "$gen" ]
then
   mv "$gen" "$gen.bak"
fi

echo "exports.keyservers = [" > $gen
cat "$file" | sort -u | sed -e 's/.*/"\0",/' >> $gen
echo "];" >> $gen
