var createViewModel = require("./main-view-model").createViewModel;

export function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = createViewModel(page.getViewById('mjk-test-taskpie'));
}
