# Description

This version of Scrabble contains more features, a chat, a store, a friend list... were added.
An Android version is also created.
-   mobile: Using **Flutter**
-   client : Using the framework **Angular**.
-   server : Dynamic server using **Express**.

# Commands

`npm` commands shall be executed in folders  `web` and `server`. 
`Flutter` commands shall be executed in the folder `mobile`

## Environment setup

1. Install Node v-16.3.2

2. Run `npm install` on both `web` and `server` folders

3. Install Flutter dev packages

## Other important scripts can be found in `package.json`


## Docker

A dockerfile was added in `web` and `server` folders, allowing to dockerize the web app.

- Run `docker build -t <ImageName>:16.13.2 .` to create an image 
