
# Abstract

_[Souvenirs](https://github.com/cx2b/souvenirs "Souvenirs on GitHub")_ is a simple web application that collects anchor tag elements (hyperlinks) from any properly formed HTML document and converts the result into various template-based formats. The HTML document may be any web page source, bookmarks file or HTML fragment.

The _Souvenirs template language_ aims to provide support for bulding template-based files upon which hyperlinks can be presented in a personal fashion. It offers the framework for you to apply various forms of styling according to the format you need.

The _Souvenirs_ template is just a plain text file interspersed with _Souvenirs template language_ commands in a manner that reflects your vision of the final document.

For the lack of a better name, "_Souvenirs template language_" will be used to identify the language.


# Specifications

The language consists of commands, fields and comments.

In order to build the template you need first to create a text document that looks the same way you would expect it to be after the conversion. Identify where the hyperlinks go and substitute the repeating text with a single `:repeat` block, indicating where hyperlinks will be inserted by means of field names.

Insert comments at will where reasoning or clarification is required.

_Souvenirs_ will repeat the text inside the `:repeat` block for each hyperlink found.

Fell free to study the templates included with the program for more specific applications.


## Commands

Commands are to be placed at the beginning of the line.

Commands are case sensitive.

**`:repeat`** ... **`:end`**

`:repeat` marks the beginning of a block.

Each `:repeat` command must be paired with an `:end` command to mark where the block starts and where it ends.

It is only inside the `:repeat` block where hyperlinks can be placed.

There can be more than one `:repeat` block, but all will refer to the same hyperlink.

The `:repeat` block may contain comments, fields and free range text. Here is where hyperlinks can be styled to your taste.

`:repeat` blocks cannot be nested.


## Fields

**`${title}`**  
**`${url}`**

Each of these fields is optional and will be replaced with the actual value that defines the hyperlink.


## Comments

Lines that start with **`:!`** are considered comments and will be ignored.

Comments may be placed after a command, like in this example:
`:repeat  :! this block cannot be nested`.

Double the colon character ("`::`") to indicate that the line is not a comment and is to be included as is (less the first colon).


# Example

This is an example of how a bookmarks file template can be built and used.

Assume you have an HTML fragment that looks like in the example below and you only need the links to import into your bookmark manager. Because the information included creates so much noise around, it would be difficult to extract just the links you need.

```
    Lorem ipsum dolor sit amet, <span style="font-weight: italic; color: green;">consectetur adipiscing elit</span>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <p><a href="https://en.wikipedia.org/wiki/Main_Page">Wikipedia, the free encyclopedia</a></p>
    Ut enim ad minim veniam, quis nostrud exercitation ullamco <span style="color: brown;">laboris</span> nisi ut aliquip ex ea commodo consequat.
    <p><a href="https://openlibrary.org/">Welcome to Open Library | Open Library</a></p>
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum <span style="color: cyan;">dolore</span> eu fugiat nulla pariatur.
    <p><a href="Licenses - GNU Project - Free Software Foundation">https://www.gnu.org/licenses/licenses.html</a></p>
```

The following template represents the skeleton of a bookmarks file. The `:repeat` block marks the place where the hyperlinks will be inserted.

```
    <!DOCTYPE NETSCAPE-Bookmark-file-1>

    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
    <TITLE>Bookmarks</TITLE>
    <H1>Bookmarks Menu</H1>

    <DL><p>
    :repeat
        <DT><A HREF="${url}">${title}</A>
    :end
    </DL><p>
```

Running _Souvenirs_ with the template file above wlll offer you the following results. Significantly cleaner indeed, and this can be safely imported into your boomark manager like any other bookmarks file.

```
    <!DOCTYPE NETSCAPE-Bookmark-file-1>

    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
    <TITLE>Bookmarks</TITLE>
    <H1>Bookmarks Menu</H1>

    <DL><p>
        <DT><A HREF="https://en.wikipedia.org/wiki/Main_Page">Wikipedia, the free encyclopedia</A>
        <DT><A HREF="https://openlibrary.org/">Welcome to Open Library | Open Library</A>
        <DT><A HREF="Licenses - GNU Project - Free Software Foundation">https://www.gnu.org/licenses/licenses.html</A>
    </DL><p>
```

<br>

----------------------------------------------------------------------

This file is part of _Souvenirs_ and under the _GNU All-Permissive License_.

Copyright 2024 Cristian Cezar Botez. All rights reserved.

Copying and distribution of this file, with or without modification, are permitted in any medium without royalty provided the copyright notice and this notice are preserved.  This file is offered as-is, without any warranty.
