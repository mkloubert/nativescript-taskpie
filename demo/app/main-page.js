"use strict";
var createViewModel = require("./main-view-model").createViewModel;
function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = createViewModel(page.getViewById('mjk-test-taskpie'));
}
exports.onNavigatingTo = onNavigatingTo;
//# sourceMappingURL=main-page.js.map