// ==UserScript==
// @name         Setlist FM Clipboard
// @namespace    http://tampermonkey.net/
// @version      2025-02-13
// @description  Put Setlist Information to Clipboard
// @author       Jerry Garcia
// @match        https://www.setlist.fm/setlist/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=setlist.fm
// @grant        none
// ==/UserScript==

var Init = false;
var CRLF = String.fromCharCode(13,10);
let FullString = "",TheDate = "",TheDate2 = "";
let TheBand = "",TheVenue = "",section = "";

function GetValue(InTag) {

    let li = document.querySelector(InTag);
    if(li != null) { return li.innerText.trim() };
    return '';
}

function GetHeader() {

    let count = 0;
    let mm = GetValue('.month')
    let dd = GetValue('.day'), yy = GetValue('.year');
    let li = document.querySelector(".setlistHeadline");
    let myArray = li.textContent.split("\n",4);

    TheDate = dd + "-" + mm + "-" + yy;TheDate2 = yy + '-' + mm + '-' + dd;
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

    if(WithSets == 1) { FullString = TheDate2 + " " + TheBand + CRLF + TheVenue + CRLF + CRLF;}

    let lis=document.querySelectorAll('li.setlistParts');
    if(lis == null) {
        alert('Could not find setlistParts!');
    } else {
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
                let InfoPart = li.innerText.slice(nindex);
                InfoPart = InfoPart.replaceAll("Play Video","");
                InfoPart = ImportantParts(InfoPart);
                if(WithSets == 1) {
                    FullString = FullString + " • " + SongName.trim() + " " + InfoPart.trim() + CRLF;
                    count+=1;
                } else {
                    FullString = FullString + TheDate + ',' + TheBand + ',' + TheVenue + ',"' + SongName + '",' + section + CRLF;
                    count+=1;
                }
            }
        });
    }
}

function ImportantParts(InPart) {

    let WorkString = "";
    let FinalString = "";
    let active = false;

    for (let i = 0; i < InPart.length; i++) {
        if(InPart[i] = '(') { active = true };
        if(active == true) {
            WorkString = WorkString + InPart[i];
            if(InPart[i] == ')') {
                WorkString = WorkString.trim();
                if(WorkString == "(>)") { WorkString = " >"};
                let CheckString = WorkString.toLowerCase();
                if (CheckString.includes("cover") == false) {
                    FinalString = FinalString + WorkString + " ";
                }
                WorkString = "";
                active = false;
            }
        }
    }
    return FinalString;
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
                newButton2.textContent = 'Set Copy';
                newButton2.style = buttonStyle + "padding-left: 10px; padding-right: 8px;"
                c_button.after(newButton2);
                newButton2.addEventListener('click', () => {
                    CustomSetClipboard(1,'Sets');
                });
            }
        }
    },250);
}());
