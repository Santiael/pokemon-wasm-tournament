#!/usr/bin/env sh

verifyFlag() {
  for flag in $FLAGS; do
    for allowed in $@; do
      if [ $flag == $1 ]; then
        echo true
        break
      fi
    done
  done
}
