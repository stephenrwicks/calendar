Building something cool with a kind of "constrained writing" to make things interesting

Working calendar where you can schedule events, etc., like in google calendar or microsoft teams, etc. built in a script only

Rules / basic premise:

HTML and CSS are banned except for the bare minimum to get a script on the page.

All DOM nodes and styles have to be created in the script. Avoid anything like HTML strings, etc. Adding a style tag with JS is banned.

DOM queries are banned (querySelector, etc.)

No libraries (React, Vue etc) obviously

I'm still creating HTML and styling stuff, it just has to be done in TS/JS

Using native date inputs (input type="date") is also banned just in the spirit of the exercise

--

Interesting stuff I've encountered so far that I will forget unless I write it out:

I used the Date object. This would be cool to write with the new Temporal API but it's not widely available yet, October-November 2025. The Date API's months are zero-indexed, but days aren't. That's pretty annoying.

Since I banned myself from making a stylesheet, I accidentally "invented" a theming pattern. I originally was setting all color properties, like el.style.color = 'blue'. Then I started using saved properties from an object, like el.style.color = theme.blue. Then I made it so there is a setTheme function that takes the theme object and loops over its key/values and injects each property into the calendar's top level DOM object as a CSS variable, and I made all the individual elements inside just consume the CSS variables instead of JS variables. It is basically a native CSS stylesheet, it just exists in the parent element as CSS variables. Once you rerun setTheme, you change the theme at the parent node, so the child elements all react natively without rerendering. An interesting thing about this pattern is that you could easily override the theme with a different theme in any child node by simply injecting it at a lower level, and the cascade just works.

Without a stylesheet, CSS pseudoclasses like :hover are impossible (I think) so I had to handle everything like focusin, focusout, etc with JS events, which is tricky.

I ended up making "Controller" and "UI" layers that operate independently.

The controller encapsulates all the date logic so the calendar logic itself (pretty much) doesn't have to worry about it. Some simple considerations of a calendar took some thought: How many days are in a given month? How do you figure out which day of the week a month starts on? If you advance an hour, what day is it? If a scheduled event starts on day A and ends on day B, how many days should it display on? Etc.

UI object makes returns styled components and handles theming. I could one day expand it and make a full UI library for these script-only projects.

I used Promise.withResolvers() to return an html form and a promise that resolves to the result of the submitted form at the same time: return { form, getResult: promise }; - withResolvers is pretty new so I hadn't used this pattern before. This is basically the same as returning a callback though.

I lined up scheduled events to the correct time of day by displaying a CSS grid with 96 columns (15 minute increments) and then using grid-column-start and -end.

I used CustomEvent bubbling to validate the two date pickers against each other when they change (make sure start is before end).

At first I stored all scheduled events in an array, and then for any given date I would loop through the entire array and check the entire range of days for each event and check if any of those days was the given date. That was some bad nested looping so I fixed that to use Map and Set for faster lookup. (Even though for a project like this it doesn't really matter.)

I used CSS color-mix() for the first time which was not hard to figure out and seems useful.

In CSS the native dialog element has a ::backdrop pseudo-element. I can't use that without regular CSS. But it's super easy to replicate with a giant box-shadow with no blur or offset (only spread, the 4th value). Assign a color with .5 alpha value and it's translucent. I used max(100vw, 100vh) to make the shadow take up the whole screen but I found out there is also 100vmax.

Having the Enter key on a button open the native dialog element that uses a form with a submit button can be a pitfall because it can focus-trap the form and immediately submit it, which makes the form invisible (and appear to not work at all) if the form was valid with its prepopulated values. But e.preventDefault() fixes this.

