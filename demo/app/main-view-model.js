"use strict";
var Observable = require("data/observable");
var Timer = require('timer');
function createViewModel(pie) {
    var viewModel = new Observable.Observable();
    viewModel.set('pie', pie);
    viewModel.set('pieSize', 540);
    viewModel.set('daysLeft', 79);
    var catNotStarted = pie.getCategory(0);
    var catLate = pie.getCategory(1);
    var catInProgress = pie.getCategory(2);
    var catCompleted = pie.getCategory(3);
    var resetIfAllDone = function () {
        if (pie.totalLeft > 0) {
            return;
        }
        catNotStarted.count = 11;
        catLate.count = 4;
        catInProgress.count = 1;
        catCompleted.count = 11;
    };
    resetIfAllDone();
    Timer.setTimeout(function () {
        // not started
        Timer.setInterval(function () {
            if (catNotStarted.count < 1) {
                resetIfAllDone();
                return;
            }
            --catNotStarted.count;
            ++catInProgress.count;
        }, 1000);
        // in progress
        Timer.setInterval(function () {
            if (catInProgress.count < 1) {
                resetIfAllDone();
                return;
            }
            --catInProgress.count;
            ++catCompleted.count;
        }, 2000);
        // late
        Timer.setInterval(function () {
            if (catLate.count < 1) {
                resetIfAllDone();
                return;
            }
            --catLate.count;
            ++catCompleted.count;
        }, 3000);
    }, 5000);
    return viewModel;
}
exports.createViewModel = createViewModel;
//# sourceMappingURL=main-view-model.js.map