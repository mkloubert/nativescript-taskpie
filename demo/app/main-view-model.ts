import Color = require('color');
import Observable = require("data/observable");
import ObservableArray = require("data/observable-array");
import TaskPie = require('nativescript-taskpie');
import Timer = require('timer');

export function createViewModel(pie: TaskPie.TaskPie) {
    var viewModel = new Observable.Observable();
    viewModel.set('pie', pie);
    viewModel.set('pieSize', 540);
    viewModel.set('daysLeft', 79);

    var catNotStarted = pie.getCategory(0);
    var catLate = pie.getCategory(1);
    var catInProgress = pie.getCategory(2);
    var catCompleted = pie.getCategory(3);

    var resetIfAllDone = function() {
        if (pie.totalLeft > 0) {
            return;
        }

        catNotStarted.count = 11;
        catLate.count = 4;
        catInProgress.count = 1;
        catCompleted.count = 11;
    };

    resetIfAllDone();

    Timer.setTimeout(() => {
        // not started
        Timer.setInterval(() => {
            if (catNotStarted.count < 1) {
                resetIfAllDone();
                return;
            }

            --catNotStarted.count;
            ++catInProgress.count;
        }, 1000);

        // in progress
        Timer.setInterval(() => {
            if (catInProgress.count < 1) {
                resetIfAllDone();
                return;
            }

            --catInProgress.count;
            ++catCompleted.count;
        }, 2000);

        // late
        Timer.setInterval(() => {
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
