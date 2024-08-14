console.log("sw-omnibox.js");

chrome.runtime.onInstalled.addListener(( {reason }) => {
    if (reason === "install") {
        console.log("This is a first install!");
        chrome.storage.local.set({
            apiSuggestions: ['tabs', 'storage', 'scriptiong']
        });
    }
});
