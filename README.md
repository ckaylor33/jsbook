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
- Solution 2: take code and put into the in-Browser transpiler, return transpiled result.

Solutions for import statements

- Bundler for single files containing both modules linked together in some way. This will make sure the values we want to share get communicated over to the other module; import and export.
- Bundler steps: Read the contents of the entry file (index.js)
- Automatically found all the different require/import/export statements
- Automatically found all the modules on the hard drive; instead of this I need the bundler to automatically find all the modules the user has imported from NPM.
- Could use the NpmInstallWebpackPlugin for this instead of webpack throwing an error like it would usually
- Or write custom plugin for the app to make a request itself to the NPM registry, return it and pass back to webpack top continue bundling; this way we don’t actively save the dependency on to the local machine, we would just reach out every time someone needs the code (cache the result)
- Or implement webpack processing directly into the react app rather than the backend making requests to the API (slowing the process down). It would then be the users machine downloading the files as opposed to the requests being made from my server. Although, webpack doesn’t work in the browser… can use ESBuild instead, it can transpile + bundle the code in the browser and is much quicker than webpack and other options (https://esbuild.github.io/api/#simple-options)
- Linked these files together into a single output file with all values being correctly communicated around

Pros for each approach
Remote

- Can cache downloaded NPM modules to bundle code faster
- Will work better for users with slow devices or limited internet connections

  Local

- Removes an extra request to the API server; faster code execution
- We don’t have to maintain an API server
- Less complexity - no moving code back and forth
