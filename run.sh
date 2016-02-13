#!/bin/bash
GOPATH=$PWD/gopath/ go run -ldflags "-X main.g_version $(git describe)" frontend.go
