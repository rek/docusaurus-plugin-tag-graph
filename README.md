# Docusaurus Plugin Tag Graph

Easily create a graph of all the docs and tags.

## Usage

Add this into your `docusaurus.config.js` file plugins array:
```
    [
      require.resolve("docusaurus-plugin-tag-graph"),
      {
        colours: {
          text: "#333",
          background: "#1fa588",
        },
      },
    ],
```
