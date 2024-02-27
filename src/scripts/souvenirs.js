/*
 * Souvenirs - Converts HTML links into various template-based formats
 * Version 1.0
 * Copyright 2024 Cristian Cezar Botez. All rights reserved.
 * 
 * This file is part of Souvenirs.
 * 
 * Souvenirs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * Souvenirs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with Souvenirs. If not, see <https://www.gnu.org/licenses/>.
 * 
 * https://github.com/cx2b/souvenirs
 */

/*
 * input container
 * type: textarea
 * available actions: type, paste and drag and drop (text and file)
 */
const inputTextArea = document.getElementById("inputTextArea");
inputTextArea.addEventListener("dragenter", dragEnterInput);
inputTextArea.addEventListener("dragover",  dragOverInput);
inputTextArea.addEventListener("drop", dropInput);

/*
 * clears input container
 * type: button
 */
const inputClearButton = document.getElementById("inputClearButton");
inputClearButton.addEventListener("click", clearText);

/*
 * shows current output format
 * type: div
 */
const dropdownSelectedFormat = document.getElementsByClassName("button-dropdown")[0];

/*
 * menu items to select output format (loads template for some formats)
 * type: div
 */
const dropdownMenu = document.getElementsByClassName("dropdown-format")[0];
dropdownMenu.addEventListener("click", selectTemplate);

/*
 * element used to load template files
 * type: input
 */
const templateFileInput = document.createElement("input");
templateFileInput.type = "file";
templateFileInput.accept = "text/plain";
templateFileInput.addEventListener("change", loadTemplateFile);

/*
 * parses input
 * type: button
 */
const inputParseButton = document.getElementById("inputParseButton");
inputParseButton.addEventListener("click", parseInputText);

/*
 * output container
 * type: textarea
 */
const outputTextArea = document.getElementById("outputTextArea");

/*
 * copies output to system clipboard
 * type: button
 */
const outputCopyButton = document.getElementById("outputCopyButton");
outputCopyButton.addEventListener("click", copyText);

/*
 * saves output to file
 * type: button
 */
const outputSaveButton = document.getElementById("outputSaveButton");
outputSaveButton.addEventListener("click", saveText);

/*
 * clears output container
 * type: button
 */
const outputClearButton = document.getElementById("outputClearButton");
outputClearButton.addEventListener("click", clearText);

/*
 * feedback
 * type: div
 */
const feedbackContainer = document.getElementById("feedbackContainer");

/*
 * opens about dialog box
 * type: a
 */
const aboutDialogBoxAnchor = document.getElementById("aboutDialogBoxAnchor");
aboutDialogBoxAnchor.addEventListener("click", openAboutDialogBox);

/*
 * About dialog box
 * type: div
 */
const aboutDialogBox = document.getElementById("aboutDialogBox");

/*
 * closes about dialog box
 * type: button
 */
const aboutButtonClose = document.getElementById("aboutButtonClose");
aboutButtonClose.addEventListener("click", closeAboutDialogBox);

/*----------------------------------------------------------------------*/


/* drag and drop for input container (text and file) */

function dragEnterInput(e) {
    // nothing much to do here except
    // stop propagation of the event and
    // prevent the default action from occurring
    e.stopPropagation();
    e.preventDefault();
}

function dragOverInput(e) {
    // nothing much to do here except
    // stop propagation of the event and
    // prevent the default action from occurring
    e.stopPropagation();
    e.preventDefault();
}

function dropInput(e) {
    // stop propagation of the event
    // and prevent the default action from occurring
    e.stopPropagation();
    e.preventDefault();

    // begin transfer
    const recipient = e.target;
    const data = e.dataTransfer;
    for (const t of data.types) {
        switch (t) {
            case "text/plain":
                recipient.value = data.getData("text");
                break;
            case "Files":
                var files = data.files;
                if (files.length > 0) {
                    const file = files[0];
                    const reader = new FileReader();
                    reader.addEventListener("load", (e) => {
                        recipient.value = e.target.result;
                    }, { once: true });
                    reader.readAsText(file, "utf-8");
                }
                break;
        }
    }
}


/* buttons to clear input and output containers */

function clearText(e) {
    switch (e.target.id) {
        case "inputClearButton":
            inputTextArea.value = "";
            break;
        case "outputClearButton":
            outputTextArea.value = "";
            break;
    }
}


/* mechanism to load template files */

const Template = {
    // contruction to match `data-*` attributes in the dropdown menu
    // for example, for markdown format
    //      data-title="Markdown"
    //      data-value="md"
    //      data-extension=".md">
    dataset: {
        title: null,
        value: null,
        extension: null
    },
    // content, as defined in the template file associated
    content: null,
    // always set dataset and content together to keep them in sync
    set: function(dataset, content) {
        this.dataset = dataset;
        this.content = content;
    }
}

const templateSelectedFormat = Object.create(Template);
const templatePreviousFormat = Object.create(Template);
const templateTrailingFormat = Object.create(Template); // transient format data

function selectTemplate(e) {
    const dataset = e.target.dataset;
    // use case to break the program at this point:
    //      a) click one menu item,
    //      b) drag the mouse over the menu and immediately
    //      b) select another menu item
    //      => the dataset value returns `undefined`
    // as such, no change to the current format is required
    if (dataset.value === undefined) {
        return;
    }
    // mechanism to backup and restore previously selected format
    if (e.target.previousElementSibling === null) {
        // this is the first menu item (no siblings)
        // as currently designed, this menu item doesn't have
        // a template file associated, as such you need to provide
        // some content (for different design, update code accordingly)
        templatePreviousFormat.set(templateSelectedFormat.dataset,
                                   templateSelectedFormat.content);
        templateSelectedFormat.set(dataset,
                                   "\n:repeat\n${url} : ${title}\n:end\n");
        dropdownSelectedFormat.textContent = templateSelectedFormat.dataset.title;
    } else {
        // care to be taken not to alter the currently selected format
        // until the process is finished (partial backup)
        templateTrailingFormat.dataset = dataset;
        // load template file
        // all formats (less the first one in the menu) must have
        // a template file associated
        templateFileInput.click();
    }
}

function loadTemplateFile(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            // unix-like newline format
            const content = e.target.result.replace("/\r/g", "");
            templatePreviousFormat.set(templateSelectedFormat.dataset,
                                       templateSelectedFormat.content);
            templateSelectedFormat.set(templateTrailingFormat.dataset,
                                       content);
            dropdownSelectedFormat.textContent = templateSelectedFormat.dataset.title;
        }, { once: true });
        reader.readAsText(file, "utf-8");
    } else {
        // nothing to do here (file selection dialog box was cancelled)
    }
}


/* button to parse and format text */

function formatBookmarks(bookmarks) {
    var s = "";
    var inrepeat = false;
    var repeatcontent = [];
    const lines = templateSelectedFormat.content.split("\n");
    for (var line of lines) {
        if (inrepeat) {
            if (line.startsWith(":end")) {
                // process `repeatcontent`
                for (const b of bookmarks) {
                    for (var r of repeatcontent) {
                        if (r.startsWith(":!")) {
                            // ignore comments (:!)
                        } else {
                            if (r.startsWith("::")) {
                                // regular text after the first ":" (::)
                                r = r.slice(1);
                            }
                            const href = b[0];
                            // decode HTML characters
                            const t = document.createElement("textarea");
                            t.innerHTML = b[1];
                            const text = t.value;
                            //
                            const p = r.replace("${title}", text).replace("${url}", href);
                            s += (p + "\n");
                        }
                    }
                }
                inrepeat = false;
            } else  {
                repeatcontent.push(line);
            }
        } else {
            if (line.startsWith(":repeat")) {
                inrepeat = true;
                repeatcontent = [];
            } else {
                if (line.startsWith(":!")) {
                    // ignore comments (:!)
                } else {
                    if (line.startsWith("::")) {
                        // regular text after the first ":" (::)
                        line = line.slice(1);
                    }
                    s += (line + "\n");
                }
            }
        }
    }
    return s;
}

function parseInputText() {
    // validate selection
    if (templateSelectedFormat.dataset.value === null) {
        feedback.show("Please select the format to parse the document.");
        return;
    }
    const source = inputTextArea.value;
    // parsing executed here
    const result = new DOMParser().parseFromString(source, "text/html");
    // nodes as live collection (preferred here) or choice of
    // using `Array.from(nodes)` to use nodes as array
    const nodes = result.body.getElementsByTagName("a");
    const value = templateSelectedFormat.dataset.value;
    // step 1: collect hyperlinks
    // bookmarks must not be declared globally
    var bookmarks = [];
    for (const node of nodes) {
        const href = node.getAttribute("href");
        // ignore empty hyperlinks
        if (href !== "") {
            const text = node.text.trim();
            var h = href, t = text.length === 0 ? "-" : text;
            // safeguard special characters according to the current format
            // add formats as necessary
            // the following characters that have special meanings in
            // _JavaScript RegExp_:
            // ^ [ a-z A-Z 0-9 ! @ # \ $ % \ ^ \ & * \ ) \ ( + = . _ - ] + $
            switch (value) {
                case "tex":
                    // characters with special meanings in _LaTex_:
                    // & % $ # _ { } ~ ^ \
                    // \ must be the first character to escape
                    var list = {
                        "\\\\" : "\\\\",
                        "&" : "\\&", "%" : "\\%", "\\$" : "\\$",
                        "#" : "\\#", "_" : "\\_",
                        "{" : "\\{", "}" : "\\}",
                        "~" : "\\~",
                        "\\^" : "\\^", 
                    }
                    for (const c in list) {
                        h = h.replace(new RegExp(c, "g"), list[c]);
                        t = t.replace(new RegExp(c, "g"), list[c]);
                    }
                    break;
                case "csv":
                    // characters with special meanings in _CSV_:
                    // "
                    // " is not a valid character for a web address
                    t = t.replace(/\"/g, '""');
                    break;
            }
            bookmarks.push([h, t]);
        }
    }
    // step 2: format hyperlinks
    outputTextArea.value = formatBookmarks(bookmarks);
    outputTextArea.focus();
}


/* buttons to copy and save formatted text */

function copyText() {
    navigator.clipboard.writeText(outputTextArea.value);
}

function saveText() {
    const text = outputTextArea.value;
    const extension = templateSelectedFormat.dataset.extension;
    const filename = "souvenirs" + extension;
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


/* feedback (notifications, errors) */

const feedback = {
    show(message) {
        feedbackContainer.textContent = message;
        feedbackContainer.style.visibility = "visible";
        setTimeout(() => { this.hide(); }, 3000);
    },
    hide() {
        feedbackContainer.style.visibility = "hidden";
        feedbackContainer.textContent = "";
    }
};


/* About dialog box */

function openAboutDialogBox() {
    aboutDialogBox.style.display = "block";
}

function closeAboutDialogBox() {
    aboutDialogBox.style.display = "none";
}
