import Color = require('color');
import Observable = require("data/observable");
import ObservableArray = require("data/observable-array");
import TaskPie = require('nativescript-taskpie');
import Timer = require('timer');

export function createViewModel(pie: TaskPie.TaskPie) {
    var viewModel = new Observable.Observable();
    viewModel.set('pie', pie);
    viewModel.set('pieSize', 720);

    var catNotStarted = pie.getCategory(0);
    var catLate = pie.getCategory(1);
    var catInProgress = pie.getCategory(2);
    var catCompleted = pie.getCategory(3);

    var intervalNotStarted;
    var intervalInProgress;
    var intervalLate;

    var resetIfAllDone = function() {
        if (pie.totalLeft > 0) {
            return;
        }

        catNotStarted.count = 11;
        catLate.count = 4;
        catInProgress.count = 1;
        catCompleted.count = 11;

        viewModel.set('daysLeft', 79);
    };

    var updateDaysLeft = function() {
        var daysLeft: number = viewModel.get('daysLeft');

        viewModel.set('daysLeft', --daysLeft);
    };

    resetIfAllDone();

    Timer.setTimeout(() => {
        // not started
        intervalNotStarted = Timer.setInterval(() => {
            updateDaysLeft();

            if (catNotStarted.count < 1) {
                Timer.clearInterval(intervalNotStarted);
                resetIfAllDone();

                return;
            }

            --catNotStarted.count;
            ++catInProgress.count;
        }, 1000);

        // in progress
        intervalInProgress = Timer.setInterval(() => {
            updateDaysLeft();

            if (catInProgress.count < 1) {
                Timer.clearInterval(intervalInProgress);
                resetIfAllDone();

                return;
            }

            --catInProgress.count;
            ++catCompleted.count;
        }, 2000);

        // late
        intervalLate = Timer.setInterval(() => {
            updateDaysLeft();

            if (catLate.count < 1) {
                Timer.clearInterval(intervalLate);
                resetIfAllDone();

                return;
            }

            --catLate.count;
            ++catCompleted.count;
        }, 3000);
    }, 3000);

    return viewModel;
}
