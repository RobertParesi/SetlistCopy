// ==UserScript==
// @name         Setlist Copy Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy Setlist from Setlist
// @author       Robert
// @match        https://www.setlist.fm/setlist/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=setlist.fm
// @grant        none
// ==/UserScript==

var Init = false;
var CRLF = String.fromCharCode(13,10);
let FullString = "";
let TheDate = "";
let TheBand = "";
let TheVenue = "";
let section = "";

function GetValue(InTag) {

    let result = "";
    let li = document.querySelector(InTag);
    if(li != null) { result = li.innerText.trim() };
    return result;
}

function GetHeader() {

    let count = 0;

    let mm = GetValue('.month');
    let dd = GetValue('.day');
    let yy = GetValue('.year');
    TheDate = dd + "-" + mm + "-" + yy;

    let li = document.querySelector(".setlistHeadline");
    let myArray = li.textContent.split("\n",4);
    TheBand = myArray[2];
    TheVenue = myArray[3];
    TheBand = TheBand.replace(" Setlist", "");
    TheVenue = TheVenue.replace("at ", "");
    TheVenue = TheVenue.replace(", USA", "");
    TheBand = TheBand.trim();
    TheVenue = TheVenue.trim();
}

function GetDetail(WithSets) {

    let count = 0;
    section = "";

    let lis=document.querySelectorAll('li.setlistParts');
    lis.forEach((li)=> {

        let classDesc = li.className;
        if(classDesc.includes("section") == true || classDesc.includes("encore") == true ) {
            section = li.innerText.replace(":","");
            if(WithSets == 1) {
                if(count > 0) {
                    FullString = FullString + CRLF;
                }
                FullString = FullString + section + ":" + CRLF;
                count+=1;
            }
        }
        if(classDesc.includes("song") == true ) {
            let nindex = li.innerText.indexOf("\n");
            let SongName = li.innerText.slice(0,nindex);
            if(WithSets == 1) {
                FullString = FullString + " • " + SongName + CRLF;
                count+=1;
            } else {
                FullString = FullString + TheDate + "," + TheBand + "," + TheVenue + "," + SongName + "," + section + CRLF;
                count+=1;
            }
        }
    });
}

function CustomSetClipboard(WithSets,inDesc) {

    FullString = "";

    GetHeader();
    GetDetail(WithSets);
    navigator.clipboard.writeText(FullString);
    alert(inDesc + ' copied to clipboard!');
}

(function() {
    setInterval(() => {
        'use strict';
        if(Init==false){
            Init = true;
            let c_button=document.querySelector('span.share');
            let buttonStyle = "background-color: #6a8c38; border-color: #6a8c38; color: white; text-align: center; display: inline-block;font-size: 12px;";
            if(c_button) {
                const newButton = document.createElement('button');
                newButton.textContent = 'Song Copy';
                newButton.style = buttonStyle;

                c_button.after(newButton);
                newButton.addEventListener('click', () => {
                    CustomSetClipboard(0,'Songs');
                });
                const newButton2 = document.createElement('button');
                newButton2.textContent = ' Set Copy ';
                newButton2.style = buttonStyle + "padding-left: 10px; padding-right: 8px;"
                c_button.after(newButton2);
                newButton2.addEventListener('click', () => {
                    CustomSetClipboard(1,'Sets');
                });
            }
        }
    },250);
}());
