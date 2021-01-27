The App

- Run something like 'jsbook serve'
- This should start a server on localhost:4005
- User will write code into an editor
- Bundle in the browser
- Execute the users code in iframe

Components

- CodeCell component - this will show the CodeEditor and Preview components
- CodeEditor component - user writes code in here - sends it to CodeCell
- Preview component - receives code from CodeCell and executes/displays code

Challenges

- Code will be provided to Preview as a string; how to execute it safely? Does it have any errors in the code? Any security issues with doing that?
- This code might have advanced JS syntax in it (like JSX) that the browser can’t execute
- The code might have import statements for other JS files or CSS. Have to deal with those import statements before executing the code. Which module system to use? AMD, common js, or ES Modules?

Solution for Transpiling

- Solution 1: Transpiler for advanced syntax (Babel); takes code that might not be supported and turns it into equivalent JS code (codepen.io & babeljs.io). Have the app take the users code, send to a backend remote API server where we run babel, transpile the users code and send back an immediate response with the transpiled code.
- Solution 2: take code and put into the in-Browser transpiler, return transpiled result. Esbuild-wasm - see below.

Solutions for import statements

- Bundler for single files containing both modules linked together in some way. This will make sure the values we want to share get communicated over to the other module; import and export.
- Bundler steps: Read the contents of the entry file (index.js)
- Automatically found all the different require/import/export statements
- Automatically found all the modules on the hard drive; instead of this I need the bundler to automatically find all the modules the user has imported from NPM.
- Could use the NpmInstallWebpackPlugin for this instead of webpack throwing an error like it would usually
- Or write custom plugin for the app to make a request itself to the NPM registry, return it and pass back to webpack top continue bundling; this way we don’t actively save the dependency on to the local machine, we would just reach out every time someone needs the code (cache the result)
- Or implement webpack processing directly into the react app rather than the backend making requests to the API (slowing the process down). It would then be the users machine downloading the files as opposed to the requests being made from my server. Although, webpack doesn’t work in the browser… can use ESBuild instead, it can transpile + bundle the code in the browser and is much quicker than webpack and other options (https://esbuild.github.io/api/#simple-options) - written in Go code, esbuild-wasm NPM module passes commands along to a JS wrapper which passes it along again to the Go executable which does the transpiling and bundling (WebAssembly binary code)
- Linked these files together into a single output file with all values being correctly communicated around
- Problem: for ESBuild to transpile and bundle code it needs access to a file system to look for it, browser has no access to any file system to do this. Don't want ESBuild to look at dependencies - so back to the other solution of writing a plugin to fetch individual files from NPM. Whenever ESBuild tries finding a path for a dependency I hijack this and fetch it myself from the NPM registry - take the URL that NPM gives and provide it to ESBuild to get the source code for the dependency
- Because of a CORS error when fetching for NPM can't reach out to NPM directly; can use UNPKG to gain access to NPM registry instead, redirects to current version of the package and gives us the main file for that package to hand to ESBuild. Need to generate paths using URL constructor in case of different scenarios where NPM is imported or required in a different way (the required path points to a secondary path/relative path that has a ./ or ../)
- Caching layer to stop so many requests and improve performance. Local storage? IndexedDB for more storage? Localforage library to help working with IndexedDB and uses local storage as a fallback option in case no IndexedDB or WebSQL support
- Can't bundle CSS into a seperate grouping of CSS files with esbuild. need to take CSS, wrap inside of JS and use JS to append into the DOM

Solutions/considerations for code to be provided to preview as a string

- User-provided code might throw erros and casue app to crash (especially if eval is used)
- User-provided code might mutate the DOM, causing app to crash
- User might accidentally run code provided by another malicious user; security
- Check to see if user writes infinite loop?
- Wrap users code in iframe element? Need to only allow direct access between frames when ceratin scenarios fulfilled - sandbox property, fetch parent HTML doc and frame HTML doc from the same: domain, port or protocol (http vs https). Need to disable direct communication when executing users code in the iframe to solve malicious user potential problems, need to disallow access to the cookie as well
- Do we need to serve up the react app form a domain, then serve up contents of the iframe from a second domain like codepen? Because this will be a stand alone dev environment, there are no credentials that can be stolen and no authentication mechanism - no malicious code that anyone will run inside of our users browsers that will cause serious problems for the app; don't need two domains then as we don't have the same security concerns as codepen, but if app is scaled and we end up allowing users to host code examples/notes online, implement authentication mecanism to get access to other users code/notes then it needs to be scalable. Instead of adding a second domain - change the iframe sandbox property to create the added security, but users will not be able to access local storage or cookies in the code they write; trade off with this but the app has less infrastructure and runs very quickly.
- Need to be careful of what is added to srcDoc inside iframe as some browsers might restrict the code that is added as an attribute, need to also run unescaped code.
- Need to set up indirect communication between frames to solve above issue - addEventListeners could be used to listen to events coming from the parent. It won't communicate via attributes so solves that problem, and because it will be shared through a string it will help the code run unescaped
- After code runs, before running it again I need to reset the HTML document

Displaying code editor

- Open source editor?
- CodeMirror: easy to use, doesn't have as many out-of-the-box features
- Ace Editor: moderately easy to use, widely used
- Monaco Editor: hardest to set up, gives an almost perfect editing experience immediately; same editor as VSC, can use react component to take care of the setup
- Use react-resizer for the draggable code editor and preview window resizing component

Creating markdown editor component

- react-md-editor component npm pakcage to show mardown editor and preview window
- Need to fix a couple of styling bits: drag element, span for divider. Some of the text formatting needs fixing also

Redux store

- Action creators: updateCell(synchronous), deleteCell(synchronous), insertCellBefore/After(in between existing cells - synchronous), moveCell(synchronous), fetchCells(asynchronous)
- Two reducers: cells and bundles
- Cells: data(object with cell ID and cell type - code or text), loading(Boolean whether fetching data), error(related to saving cells), order(order of cells array of strings, each string is id of each cell)
- bundles: data(bundle for each cell)

Additional features ideas

- Additional language support

Pros for each approach
Remote

- Can cache downloaded NPM modules to bundle code faster
- Will work better for users with slow devices or limited internet connections

  Local

- Removes an extra request to the API server; faster code execution
- We don’t have to maintain an API server
- Less complexity - no moving code back and forth
