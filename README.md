# UI5Lab-browser
A browser to display custom libraries and controls for display on the UI5Lab homepage and testing during development

## Concenpt

The browser is a draft for displaying libraries and its content based on metadata that is located inside the library projects (see TODO section for improvment ideas). As such, the logic is similar for both use cases:
* Displaying a library during library development at design time
 * Developing Samples and Tests
 * High-Level library and control documentation
 * Testing the appearance of the library and its content on the UI5Lab homepage
* Listing a library on the UI5Lab homepage so that it can be easily found by app developers at run time
  * Search and find community controls or artifacts at the UI5Lab homepage
  * Browse samples, high-level documentation, and test pages for all artifacts
  * Link the project repository to contribute or report issues

## TODOs
* Replace global libraries.json with a simple (nodejs) discovery service that finds all libraries and samples currently available and returns a json with all relevant information in json format
* Alternative: read metadata vom library.js, package.json, and bower.json or wait for UI5 tooling to do this for us

## Getting started

1. Install node.js (get it from [nodejs.org](http://nodejs.org/)).
 * If working behind a proxy, you need to configure it properly (HTTP_PROXY / HTTPS_PROXY / NO_PROXY environment variables)

2. Clone the repository and navigate into it
```sh
git clone https://github.com/openui5/UI5Lab-browser
cd UI5Lab-browser
```
3. Install all npm dependencies (also installs all bower dependencies)
```sh
npm install
```

4. Run npm start to lint, build and run a local server (have a look into `Gruntfile.js` to see all the tasks).
```sh
npm start
```

5. Open a test page in your browser: [http://localhost:8080/test-resources/ui5lab/browser/index.html](http://localhost:8080/test-resources/ui5lab/browser/index.html)

### Directions

[Browser](http://localhost:8080/test-resources/ui5lab/browser/index.html) A sample browser showcasing artifacts from one or more libraries

### Contributing

Instructions how to connect to the community and contribute to the UI5lab project can be found in the [main repository](https://github.com/openui5/UI5Lab/)!
