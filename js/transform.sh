#!/bin/bash

PROG=$(command -v node)
if [ $? = 0 ]; then
    echo Using node: $PROG
else
    echo node: program not found
    exit 1    
fi

$PROG .
