# Gist Browser

A single page web application built with Vue.js 3 for browsing GitHub gists.

## Installation
1. Make sure you have the latest nodejs version installed. Read installation instructions [here](https://nodejs.org/en/download/). 
2. Clone the repository: `git clone https://github.com/atiberius/gist-browser.git`
3. Install dependencies: `npm install`
4. Start the development server: `vite`
5. (optional) create a .env file in the root folder and add the following line: `VITE_GITHUB_TOKEN=your_token_here`. This will allow you to make more requests to the GitHub API. Read more about GitHub API tokens [here](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token).

## Build
1. Build the app: `vite build`

## Features
The app opens with a search field where you can type a GitHub username and click on the 'Search' button or press Enter on the keyboard.
If the user is found, his name, picture and optional bio are displayed. If the user is not found, an error message is displayed.

If the user is found, a list of his public gists is displayed in an accordion. Each gist item has:
- a title, replaced with the description if the title is empty or [No title] if both title and description are missing
- creation date as time elapsed, with the exact date displayed as tooltip
- a list of GitHub users that forked it (avatar and username)
- a list of files included in the gist.

All gists accordion items are expanded by default. For each file contained in the gist there is a foldable accordion item, with the name and the programming language badge displayed on the right hand side. Clicking on it will trigger an asynchroneous request to the GitHub API to fetch the file content and display it in a code highlight component.
In the future, an additional button to copy the code in the clipboard might prove useful here.

## External Components
- [javascript-time-ago](https://www.npmjs.com/package/javascript-time-ago) is used to display the gists' creation date as elapsed time to present
- [highlight.js](https://highlightjs.org/) and its [Vue.js plugin](https://github.com/highlightjs/vue-plugin) are used to highlight the source code inside gists
- [vue3-rich-accordion](https://www.npmjs.com/package/vue3-rich-accordion) is used to display the list of gists in a browse-friendly layout
- [Axios](https://axios-http.com/) was used for all external API calls

## Notes
- Because the API calls to GitHub are made from the browser, if you are not using a github token (step 5 above), the user is limited to 60 requests per hour. This is a limitation of the GitHub API and not the app itself. 
- The forks for each gist are loaded by creating multiple threads to fetch the forks for each gist. This might pose an issue if GitHub API decides to limit the number of concurrent requests in the future.
- To avoid contents overflow, some lists have autoscrolling: the list of gists has vertical auto scrolling and the list of forks for each gist has horizontal auto scrolling.
- For performance reasons, the file contents for each gist are not loaded until the user clicks on the gist's title. The result is cached, to avoid making repeated requests to the GitHub API endpoint. In the future, a separate 'Refresh' button can be added to trigger refreshing the file contents.
- The app is not responsive. It was tested on a 1920x1080 screen and it looks good. It might not look good on smaller screens.

## Issues
If you find any issues with the app, please open an issue on the [GitHub repository](https://github.com/atiberius/gist-browser.git)

## License
This project is licensed under the terms of the MIT license.
