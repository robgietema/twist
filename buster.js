exports["twist tests"] = {
    environment: "node",
    tests: ["test/**/*-test.js"],
    extensions: [
        require('buster-lint')
    ],
    "buster-lint": {
        linter: 'jshint',
        linterOptions: {
            strict: false
        }
    }
};
