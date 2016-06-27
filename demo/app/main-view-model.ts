import Color = require('color');
import Observable = require("data/observable");
import ObservableArray = require("data/observable-array");
import TaskPie = require('nativescript-taskpie');
import Timer = require('timer');

export function createViewModel(pie: any) {
    var viewModel: any = new Observable.Observable();
    viewModel.set('pie', pie);
    viewModel.set('pieSize', 480);

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

        viewModel.set('taskCounts', [11, 4, 1, 11]);

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

            if (pie.counts.getItem(0) < 1) {
                Timer.clearInterval(intervalNotStarted);
                resetIfAllDone();

                return;
            }

            pie.decrease(0)
               .increase(2);
        }, 1000);

        // in progress
        intervalInProgress = Timer.setInterval(() => {
            updateDaysLeft();

            if (pie.counts.getItem(2) < 1) {
                Timer.clearInterval(intervalInProgress);
                resetIfAllDone();

                return;
            }

            viewModel.set('taskCounts',
                          [, , --catInProgress.count, ++catCompleted.count]);
        }, 2000);

        // late
        intervalLate = Timer.setInterval(() => {
            updateDaysLeft();

            if (pie.counts.getItem(1) < 1) {
                Timer.clearInterval(intervalLate);
                resetIfAllDone();

                return;
            }

            viewModel.set('taskCounts',
                          [, --catLate.count, , ++catCompleted.count]);
        }, 3000);
    }, 3000);

    viewModel.taskCountChanged = (category, newValue, oldValue, pie) => {
        console.log("Value of category '" + category.name + "' changed from '" + oldValue + "' to '" + newValue + "'.");
    };

    return viewModel;
}
