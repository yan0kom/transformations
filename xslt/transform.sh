#!/bin/bash

PROG=$(command -v xsltproc)
if [ $? = 0 ]; then
    echo Using xsltproc: $PROG
else
    echo xsltproc: program not found
    exit 1    
fi

function transform() {
    local in=$1
    local tr=$2
    local out=$3
    echo "apply $tr on $in and put output to $out"
    $PROG --output $out $tr $in
}

for i in {2..3}; do
    transform input-1-1.xml transform-1-$i.xsl output-1-$i.xml
done
