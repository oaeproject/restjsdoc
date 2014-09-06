#!/bin/bash
read -p "Github username: " uname
stty -echo
read -p "Github password: " passw; echo
stty echo
read -p "Release type (major, minor or patch): " release

GITHUB_USERNAME="$uname" GITHUB_PASSWORD="$passw" grunt "release:$release"
